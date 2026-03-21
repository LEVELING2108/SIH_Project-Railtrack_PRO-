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
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
import qrcode
from PIL import Image

from extensions import db, ma, jwt, limiter
from models import Vendor, User, TrackItem, Inspection
from insights import build_vendor_insights
from config import Config
from auth import auth_bp, role_required
from track_items_routes import track_items_bp


def create_app(config_class=Config):
    """Application factory for creating Flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ============== Security Configurations ==============

    # CORS Configuration
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000']),
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

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(track_items_bp)

    # ============== Vendor API Endpoints ==============

    @app.route('/api/vendors', methods=['GET'])
    @jwt_required()
    @limiter.limit("100 per hour")
    def get_vendors():
        """Get all vendors with optional pagination"""
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
        # Token subject (`get_jwt_identity()`) is stored as a string; cast for DB FK.
        current_user_id_int = int(current_user_id)

        vendor = Vendor(
            id=data['id'],
            vendor_name=data.get('vendor_name'),
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
            vendor_code=data.get('vendor_code'),
            certification_status=data.get('certification_status', 'pending'),
            performance_rating=float(data.get('performance_rating', 0.0)) if data.get('performance_rating') else 0.0,
            is_approved=data.get('is_approved', False),
            created_by_id=current_user_id_int
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

    # ============== Seed Data Endpoint ==============

    @app.route('/api/seed', methods=['POST'])
    @jwt_required()
    @limiter.limit("5 per hour")
    def seed_data():
        """Seed database with sample vendors and track items"""
        try:
            from seed_data import seed_all
            
            result = seed_all()
            
            return jsonify({
                "message": "Database seeded successfully",
                "vendors_created": len(result['vendors']),
                "track_items_created": len(result['track_items']),
                "inspections_created": len(result['inspections'])
            }), 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({
                "error": "Failed to seed data",
                "message": str(e)
            }), 500

    # ============== Vendor Performance Comparison Endpoint ==============

    @app.route('/api/vendors/performance', methods=['GET'])
    @jwt_required()
    @limiter.limit("60 per hour")
    def get_vendor_performance():
        """Get detailed performance comparison of all vendors with their track items"""
        vendors = Vendor.query.all()
        
        performance_data = []
        
        for vendor in vendors:
            vendor_data = vendor.to_dict()
            insights_data = {**vendor_data, 'vendor_id': vendor_data['id']}
            del insights_data['id']
            insights = build_vendor_insights(**insights_data)
            
            # Get track items for this vendor
            track_items = TrackItem.query.filter_by(vendor_id=vendor.id).all()
            
            items_summary = []
            total_defects = 0
            total_replacements = 0
            item_types = {}
            
            for item in track_items:
                items_summary.append({
                    'id': item.id,
                    'item_type': item.item_type,
                    'lot_number': item.lot_number,
                    'performance_status': item.performance_status,
                    'defect_count': item.defect_count,
                    'replacement_count': item.replacement_count,
                    'installation_location': item.installation_location,
                    'zone': item.zone
                })
                
                total_defects += item.defect_count
                total_replacements += item.replacement_count
                
                # Group by item type
                if item.item_type not in item_types:
                    item_types[item.item_type] = {'count': 0, 'defects': 0, 'good': 0, 'average': 0, 'poor': 0}
                item_types[item.item_type]['count'] += 1
                item_types[item.item_type]['defects'] += item.defect_count
                if item.performance_status == 'good':
                    item_types[item.item_type]['good'] += 1
                elif item.performance_status == 'average':
                    item_types[item.item_type]['average'] += 1
                else:
                    item_types[item.item_type]['poor'] += 1
            
            # Get inspection stats
            inspections = Inspection.query.join(TrackItem).filter(TrackItem.vendor_id == vendor.id).all()
            passed_inspections = sum(1 for i in inspections if i.inspection_status == 'passed')
            failed_inspections = sum(1 for i in inspections if i.inspection_status == 'failed')
            conditional_inspections = sum(1 for i in inspections if i.inspection_status == 'conditional')
            
            performance_data.append({
                'vendor': vendor_data,
                'risk_score': insights.risk_score,
                'flags': insights.flags,
                'recommendations': insights.recommendations,
                'summary': insights.summary,
                'track_items': {
                    'total': len(track_items),
                    'items': items_summary,
                    'by_type': item_types,
                    'total_defects': total_defects,
                    'total_replacements': total_replacements
                },
                'inspections': {
                    'total': len(inspections),
                    'passed': passed_inspections,
                    'failed': failed_inspections,
                    'conditional': conditional_inspections,
                    'pass_rate': round((passed_inspections / len(inspections) * 100) if inspections else 0, 2)
                }
            })
        
        # Sort by risk score (lowest first - best performers)
        performance_data.sort(key=lambda x: x['risk_score'])
        
        return jsonify({
            "vendors": performance_data,
            "total": len(performance_data),
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    # ============== Track Item Analytics Endpoint ==============

    @app.route('/api/track-items/analytics', methods=['GET'])
    @jwt_required()
    @limiter.limit("60 per hour")
    def get_track_items_analytics():
        """Get analytics for track items by type, zone, and performance"""
        # Get all track items
        all_items = TrackItem.query.all()
        
        # Overall stats
        total_items = len(all_items)
        total_defects = sum(item.defect_count for item in all_items)
        total_replacements = sum(item.replacement_count for item in all_items)
        
        # By item type
        by_type = {}
        for item in all_items:
            if item.item_type not in by_type:
                by_type[item.item_type] = {
                    'count': 0,
                    'good': 0,
                    'average': 0,
                    'poor': 0,
                    'defects': 0,
                    'replacements': 0
                }
            by_type[item.item_type]['count'] += 1
            by_type[item.item_type]['defects'] += item.defect_count
            by_type[item.item_type]['replacements'] += item.replacement_count
            if item.performance_status == 'good':
                by_type[item.item_type]['good'] += 1
            elif item.performance_status == 'average':
                by_type[item.item_type]['average'] += 1
            else:
                by_type[item.item_type]['poor'] += 1
        
        # By zone
        by_zone = {}
        for item in all_items:
            zone = item.zone or 'Unknown'
            if zone not in by_zone:
                by_zone[zone] = {
                    'count': 0,
                    'good': 0,
                    'average': 0,
                    'poor': 0,
                    'defects': 0
                }
            by_zone[zone]['count'] += 1
            by_zone[zone]['defects'] += item.defect_count
            if item.performance_status == 'good':
                by_zone[zone]['good'] += 1
            elif item.performance_status == 'average':
                by_zone[zone]['average'] += 1
            else:
                by_zone[zone]['poor'] += 1
        
        # By status
        by_status = {
            'in_stock': sum(1 for item in all_items if item.status == 'in_stock'),
            'installed': sum(1 for item in all_items if item.status == 'installed'),
            'in_service': sum(1 for item in all_items if item.status == 'in_service'),
            'defective': sum(1 for item in all_items if item.status == 'defective'),
            'replaced': sum(1 for item in all_items if item.status == 'replaced')
        }
        
        return jsonify({
            "summary": {
                "total_items": total_items,
                "total_defects": total_defects,
                "total_replacements": total_replacements,
                "average_defects_per_item": round(total_defects / total_items, 2) if total_items else 0
            },
            "by_type": by_type,
            "by_zone": by_zone,
            "by_status": by_status,
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
            # Use ASCII-only output to avoid Windows console encoding issues.
            print("Default admin user created (username: admin, password: Admin@123)")
            print("IMPORTANT: Change the default password immediately!")

    with app.app_context():
        db.create_all()
        create_default_admin()

    return app


# Create app instance for running directly
app = create_app()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))
