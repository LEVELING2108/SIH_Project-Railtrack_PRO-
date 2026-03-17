"""
Tests for vendor CRUD operations
"""
import pytest
from models import Vendor, User
from extensions import db


class TestVendors:
    """Test vendor management endpoints"""

    def test_get_vendors_requires_auth(self, client):
        """Test that getting vendors requires authentication"""
        response = client.get('/api/vendors')
        assert response.status_code == 401

    def test_create_vendor(self, auth_client):
        """Test creating a new vendor"""
        vendor_data = {
            'id': 'VENDOR001',
            'vendor_name': 'Test Vendor Corp',
            'manufacture_date': '2024-01-15',
            'details': 'Test vendor for testing',
            'contact_person': 'John Doe',
            'contact_email': 'contact@vendor.com',
            'contact_phone': '+91 9876543210',
            'address_line1': '123 Test Street',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'postal_code': '400001',
            'country': 'India',
            'tax_id': 'ABCDE1234F',
            'bank_account': '1234567890'
        }

        response = auth_client.post('/api/vendors', json=vendor_data)
        assert response.status_code == 201
        data = response.get_json()
        assert data['vendor']['id'] == 'VENDOR001'
        assert data['vendor']['vendor_name'] == 'Test Vendor Corp'

    def test_get_vendor(self, auth_client, sample_vendor):
        """Test getting a specific vendor"""
        response = auth_client.get(f'/api/vendors/{sample_vendor.id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == sample_vendor.id
        assert 'risk_score' in data
        assert 'flags' in data

    def test_get_all_vendors(self, auth_client, sample_vendor):
        """Test getting all vendors with pagination"""
        response = auth_client.get('/api/vendors?page=1&per_page=10')
        assert response.status_code == 200
        data = response.get_json()
        assert 'vendors' in data
        assert 'total' in data
        assert 'current_page' in data

    def test_update_vendor(self, auth_client, sample_vendor):
        """Test updating a vendor"""
        update_data = {
            'vendor_name': 'Updated Vendor Name',
            'contact_email': 'updated@vendor.com'
        }

        response = auth_client.put(f'/api/vendors/{sample_vendor.id}', json=update_data)
        assert response.status_code == 200
        data = response.get_json()
        assert data['vendor']['vendor_name'] == 'Updated Vendor Name'
        assert data['vendor']['contact_email'] == 'updated@vendor.com'

    def test_delete_vendor_requires_admin(self, auth_client, sample_vendor):
        """Test that deleting requires admin role"""
        response = auth_client.delete(f'/api/vendors/{sample_vendor.id}')
        # Regular user should not be able to delete
        assert response.status_code in [401, 403]

    def test_delete_vendor_admin(self, admin_client, sample_vendor):
        """Test admin can delete vendor"""
        response = admin_client.delete(f'/api/vendors/{sample_vendor.id}')
        assert response.status_code == 200
        
        # Verify deletion
        get_response = admin_client.get(f'/api/vendors/{sample_vendor.id}')
        assert get_response.status_code == 404

    def test_create_vendor_duplicate(self, auth_client, sample_vendor):
        """Test creating duplicate vendor fails"""
        vendor_data = {
            'id': sample_vendor.id,
            'vendor_name': 'Duplicate Vendor'
        }

        response = auth_client.post('/api/vendors', json=vendor_data)
        assert response.status_code == 400

    def test_create_vendor_missing_fields(self, auth_client):
        """Test creating vendor with missing required fields"""
        vendor_data = {
            'vendor_name': 'Incomplete Vendor'
            # Missing 'id' field
        }

        response = auth_client.post('/api/vendors', json=vendor_data)
        assert response.status_code == 400

    def test_get_nonexistent_vendor(self, auth_client):
        """Test getting a vendor that doesn't exist"""
        response = auth_client.get('/api/vendors/NONEXISTENT')
        assert response.status_code == 404

    def test_vendor_risk_assessment(self, auth_client, sample_vendor):
        """Test that vendor includes risk assessment"""
        response = auth_client.get(f'/api/vendors/{sample_vendor.id}')
        assert response.status_code == 200
        data = response.get_json()
        
        assert 'risk_score' in data
        assert 'flags' in data
        assert 'recommendations' in data
        assert 'summary' in data
        assert 'keywords' in data
        assert isinstance(data['risk_score'], int)
        assert 0 <= data['risk_score'] <= 100

    def test_vendor_with_invalid_email(self, auth_client):
        """Test vendor creation with invalid email"""
        vendor_data = {
            'id': 'BAD001',
            'vendor_name': 'Bad Email Vendor',
            'contact_email': 'invalid-email'  # Invalid format
        }

        response = auth_client.post('/api/vendors', json=vendor_data)
        # Should still create but may have risk flags
        assert response.status_code == 201

    def test_vendor_with_future_date(self, auth_client):
        """Test vendor with future manufacture date"""
        vendor_data = {
            'id': 'FUTURE001',
            'vendor_name': 'Future Vendor',
            'manufacture_date': '2030-01-01'  # Future date
        }

        response = auth_client.post('/api/vendors', json=vendor_data)
        assert response.status_code == 201
        
        # Check if risk assessment flags it
        get_response = auth_client.get('/api/vendors/FUTURE001')
        data = get_response.get_json()
        assert data['risk_score'] > 0  # Should have some risk
