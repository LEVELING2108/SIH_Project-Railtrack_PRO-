"""
Database models for Vendor Verification System
"""
from datetime import datetime
from extensions import db


class Vendor(db.Model):
    """Vendor model representing vendor data table"""
    __tablename__ = 'vendor_data'
    
    id = db.Column(db.String(50), primary_key=True)
    vendor_name = db.Column(db.String(255), nullable=False)
    manufacture_date = db.Column(db.Date)
    details = db.Column(db.Text)
    contact_person = db.Column(db.String(100))
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    address_line1 = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100), default='India')
    tax_id = db.Column(db.String(50))
    bank_account = db.Column(db.String(50))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert vendor to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'vendor_name': self.vendor_name,
            'manufacture_date': self.manufacture_date.isoformat() if self.manufacture_date else None,
            'details': self.details,
            'contact_person': self.contact_person,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'address_line1': self.address_line1,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'tax_id': self.tax_id,
            'bank_account': self.bank_account,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Vendor {self.vendor_name}>'
