"""
QR-Based Vendor Verification System - Flask Backend API
With JWT Authentication and Rate Limiting
"""
import os
import io
import base64
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
import qrcode
from PIL import Image

from extensions import db, ma, jwt, limiter
from models import Vendor, User
from insights import build_vendor_insights
from config import Config
from auth import auth_bp, role_required


def create_app(config_class=Config):
    """Application factory for creating Flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ============== Security Configurations ==============

    # CORS Configuration
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000']),
         supports_headers=True,
         supports_credentials=True)

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', app.config.get('SECRET_KEY'))
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    jwt.init_app(app)

    # Rate Limiting Configuration
    if app.config.get('RATELIMIT_ENABLED', True):
        limiter.init_app(app)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    migrate = Migrate(app, db)

    # ============== Error Handlers ==============

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": str(error)}), 404

    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify({
            "error": "Rate Limit Exceeded",
            "message": "Too many requests. Please try again later."
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal Server Error", "message": str(error)}), 500

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({
            "error": "Authorization Required",
            "message": "Missing or invalid token"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "Token Expired",
            "message": "Your token has expired. Please login again."
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "error": "Invalid Token",
            "message": "Token verification failed"
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "Revoked Token",
            "message": "Token has been revoked"
        }), 401

    # ============== Public Endpoints ==============

    @app.route('/api/health', methods=['GET'])
    @limiter.exempt
    def health_check():
        """Health check endpoint (public)"""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "QR Vendor Verification API"
        }), 200

    # Register auth blueprint
    app.register_blueprint(auth_bp)

    # ============== Vendor API Endpoints ==============

    @app.route('/api/vendors', methods=['GET'])
    @jwt_required()
    @limiter.limit("100 per hour")
    def get_vendors():
        """Get all vendors with optional pagination"""
        from flask_jwt_extended import get_jwt_identity
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        pagination = Vendor.query.paginate(page=page, per_page=per_page, error_out=False)
        vendors = pagination.items

        result = []
        for vendor in vendors:
            vendor_data = vendor.to_dict()
            insights_data = {**vendor_data, 'vendor_id': vendor_data['id']}
            del insights_data['id']
            insights = build_vendor_insights(**insights_data)
            vendor_data['risk_score'] = insights.risk_score
            vendor_data['flags'] = insights.flags
            result.append(vendor_data)

        return jsonify({
            "vendors": result,
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": page
        }), 200

    @app.route('/api/vendors/<vendor_id>', methods=['GET'])
    @jwt_required()
    @limiter.limit("100 per hour")
    def get_vendor(vendor_id):
        """Get a specific vendor by ID"""
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            raise NotFound(f"Vendor with ID {vendor_id} not found")

        vendor_data = vendor.to_dict()
        insights_data = {**vendor_data, 'vendor_id': vendor_data['id']}
        del insights_data['id']
        insights = build_vendor_insights(**insights_data)
        vendor_data.update({
            'risk_score': insights.risk_score,
            'flags': insights.flags,
            'recommendations': insights.recommendations,
            'summary': insights.summary,
            'keywords': insights.keywords
        })

        return jsonify(vendor_data), 200

    @app.route('/api/vendors', methods=['POST'])
    @jwt_required()
    @limiter.limit("30 per hour")
    def create_vendor():
        """Create a new vendor"""
        from flask_jwt_extended import get_jwt_identity
        data = request.get_json()

        if not data:
            raise BadRequest("No data provided")

        required_fields = ['id', 'vendor_name']
        for field in required_fields:
            if field not in data:
                raise BadRequest(f"Missing required field: {field}")

        # Check if vendor already exists
        existing = Vendor.query.get(data['id'])
        if existing:
            raise BadRequest(f"Vendor with ID {data['id']} already exists")

        current_user_id = get_jwt_identity()

        vendor = Vendor(
            id=data['id'],
            vendor_name=data.get('vendor_name'),
            manufacture_date=datetime.strptime(data['manufacture_date'], '%Y-%m-%d').date() if data.get('manufacture_date') else None,
            details=data.get('details'),
            contact_person=data.get('contact_person'),
            contact_email=data.get('contact_email'),
            contact_phone=data.get('contact_phone'),
            address_line1=data.get('address_line1'),
            city=data.get('city'),
            state=data.get('state'),
            postal_code=data.get('postal_code'),
            country=data.get('country', 'India'),
            tax_id=data.get('tax_id'),
            bank_account=data.get('bank_account'),
            created_by_id=current_user_id
        )

        db.session.add(vendor)
        db.session.commit()

        return jsonify({
            "message": "Vendor created successfully",
            "vendor": vendor.to_dict()
        }), 201

    @app.route('/api/vendors/<vendor_id>', methods=['PUT'])
    @jwt_required()
    @limiter.limit("30 per hour")
    def update_vendor(vendor_id):
        """Update an existing vendor"""
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            raise NotFound(f"Vendor with ID {vendor_id} not found")

        data = request.get_json()
        if not data:
            raise BadRequest("No data provided")

        updatable_fields = [
            'vendor_name', 'manufacture_date', 'details', 'contact_person',
            'contact_email', 'contact_phone', 'address_line1', 'city', 'state',
            'postal_code', 'country', 'tax_id', 'bank_account'
        ]

        for field in updatable_fields:
            if field in data:
                if field == 'manufacture_date' and data[field]:
                    setattr(vendor, field, datetime.strptime(data[field], '%Y-%m-%d').date())
                else:
                    setattr(vendor, field, data[field])

        db.session.commit()

        return jsonify({
            "message": "Vendor updated successfully",
            "vendor": vendor.to_dict()
        }), 200

    @app.route('/api/vendors/<vendor_id>', methods=['DELETE'])
    @jwt_required()
    @role_required('admin')
    @limiter.limit("10 per hour")
    def delete_vendor(vendor_id):
        """Delete a vendor (admin only)"""
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            raise NotFound(f"Vendor with ID {vendor_id} not found")

        db.session.delete(vendor)
        db.session.commit()

        return jsonify({"message": "Vendor deleted successfully"}), 200

    # ============== QR Code Endpoints ==============

    @app.route('/api/vendors/<vendor_id>/qr', methods=['GET'])
    @jwt_required()
    @limiter.limit("50 per hour")
    def generate_qr(vendor_id):
        """Generate QR code for a vendor"""
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            raise NotFound(f"Vendor with ID {vendor_id} not found")

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(vendor.id)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')

        return jsonify({
            "vendor_id": vendor_id,
            "qr_code": f"data:image/png;base64,{img_base64}"
        }), 200

    @app.route('/api/vendors/<vendor_id>/qr/download', methods=['GET'])
    @jwt_required()
    @limiter.limit("20 per hour")
    def download_qr(vendor_id):
        """Download QR code as PNG file"""
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            raise NotFound(f"Vendor with ID {vendor_id} not found")

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(vendor.id)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        return send_file(
            img_bytes,
            mimetype='image/png',
            as_attachment=True,
            download_name=f'qr_vendor_{vendor_id}.png'
        )

    # ============== QR Scanner/Verification Endpoint ==============

    @app.route('/api/scan', methods=['POST'])
    @jwt_required()
    @limiter.limit("60 per hour")
    def scan_qr():
        """Scan/verify a QR code and return vendor details with AI insights"""
        data = request.get_json()

        if not data or 'qr_data' not in data:
            raise BadRequest("No QR data provided")

        vendor_id = data['qr_data'].strip()

        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({
                "found": False,
                "message": "No vendor found for this QR code"
            }), 404

        vendor_data = vendor.to_dict()
        insights_data = {**vendor_data, 'vendor_id': vendor_data['id']}
        del insights_data['id']
        insights = build_vendor_insights(**insights_data)

        return jsonify({
            "found": True,
            "vendor": {
                **vendor_data,
                'risk_score': insights.risk_score,
                'flags': insights.flags,
                'recommendations': insights.recommendations,
                'summary': insights.summary,
                'keywords': insights.keywords
            }
        }), 200

    # ============== Analytics Endpoint ==============

    @app.route('/api/analytics', methods=['GET'])
    @jwt_required()
    @limiter.limit("30 per hour")
    def get_analytics():
        """Get vendor analytics and statistics"""
        total_vendors = Vendor.query.count()

        all_vendors = Vendor.query.all()
        risk_scores = []
        high_risk = 0
        medium_risk = 0
        low_risk = 0

        for vendor in all_vendors:
            vendor_data = vendor.to_dict()
            insights_data = {**vendor_data, 'vendor_id': vendor_data['id']}
            del insights_data['id']
            insights = build_vendor_insights(**insights_data)
            score = insights.risk_score
            risk_scores.append(score)

            if score >= 70:
                high_risk += 1
            elif score >= 40:
                medium_risk += 1
            else:
                low_risk += 1

        avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0

        return jsonify({
            "total_vendors": total_vendors,
            "risk_distribution": {
                "high": high_risk,
                "medium": medium_risk,
                "low": low_risk
            },
            "average_risk_score": round(avg_risk, 2),
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    # ============== Database Initialization ==============

    def create_default_admin():
        """Create default admin user if not exists"""
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            admin_user = User(
                username='admin',
                email='admin@vendorverify.com',
                role='admin'
            )
            admin_user.set_password('Admin@123')  # Change this immediately!
            db.session.add(admin_user)
            db.session.commit()
            print("✓ Default admin user created (username: admin, password: Admin@123)")
            print("⚠ IMPORTANT: Change the default password immediately!")

    with app.app_context():
        db.create_all()
        create_default_admin()

    return app


# Create app instance for running directly
app = create_app()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))
