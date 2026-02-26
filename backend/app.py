"""
QR-Based Vendor Verification System - Flask Backend API
"""
import os
import io
import base64
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
import qrcode
from PIL import Image

from extensions import db, ma
from models import Vendor
from insights import build_vendor_insights
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
db.init_app(app)
ma.init_app(app)
migrate = Migrate(app, db)


# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request", "message": str(error)}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": str(error)}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error", "message": str(error)}), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "QR Vendor Verification API"
    }), 200


# ============== Vendor API Endpoints ==============

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    """Get all vendors with optional pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Vendor.query.paginate(page=page, per_page=per_page, error_out=False)
    vendors = pagination.items
    
    result = []
    for vendor in vendors:
        vendor_data = vendor.to_dict()
        insights = build_vendor_insights(**vendor_data)
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
def get_vendor(vendor_id):
    """Get a specific vendor by ID"""
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        raise NotFound(f"Vendor with ID {vendor_id} not found")
    
    vendor_data = vendor.to_dict()
    insights = build_vendor_insights(**vendor_data)
    vendor_data.update({
        'risk_score': insights.risk_score,
        'flags': insights.flags,
        'recommendations': insights.recommendations,
        'summary': insights.summary,
        'keywords': insights.keywords
    })
    
    return jsonify(vendor_data), 200


@app.route('/api/vendors', methods=['POST'])
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
        bank_account=data.get('bank_account')
    )
    
    db.session.add(vendor)
    db.session.commit()
    
    return jsonify({
        "message": "Vendor created successfully",
        "vendor": vendor.to_dict()
    }), 201


@app.route('/api/vendors/<vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    """Update an existing vendor"""
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        raise NotFound(f"Vendor with ID {vendor_id} not found")
    
    data = request.get_json()
    if not data:
        raise BadRequest("No data provided")
    
    # Update fields
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
def delete_vendor(vendor_id):
    """Delete a vendor"""
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        raise NotFound(f"Vendor with ID {vendor_id} not found")
    
    db.session.delete(vendor)
    db.session.commit()
    
    return jsonify({"message": "Vendor deleted successfully"}), 200


# ============== QR Code Endpoints ==============

@app.route('/api/vendors/<vendor_id>/qr', methods=['GET'])
def generate_qr(vendor_id):
    """Generate QR code for a vendor"""
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        raise NotFound(f"Vendor with ID {vendor_id} not found")
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(vendor.id)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Return as base64 for frontend display
    img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    return jsonify({
        "vendor_id": vendor_id,
        "qr_code": f"data:image/png;base64,{img_base64}"
    }), 200


@app.route('/api/vendors/<vendor_id>/qr/download', methods=['GET'])
def download_qr(vendor_id):
    """Download QR code as PNG file"""
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        raise NotFound(f"Vendor with ID {vendor_id} not found")
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(vendor.id)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes
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
    insights = build_vendor_insights(**vendor_data)
    
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
def get_analytics():
    """Get vendor analytics and statistics"""
    total_vendors = Vendor.query.count()
    
    # Calculate risk distribution
    all_vendors = Vendor.query.all()
    risk_scores = []
    high_risk = 0
    medium_risk = 0
    low_risk = 0
    
    for vendor in all_vendors:
        insights = build_vendor_insights(**vendor.to_dict())
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


# Database initialization
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
