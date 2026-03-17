"""
Tests for QR code generation and scanning
"""
import pytest
from models import Vendor
from extensions import db


class TestQRCode:
    """Test QR code endpoints"""

    def test_generate_qr_requires_auth(self, client, sample_vendor):
        """Test QR generation requires authentication"""
        response = client.get(f'/api/vendors/{sample_vendor.id}/qr')
        assert response.status_code == 401

    def test_generate_qr(self, auth_client, sample_vendor):
        """Test QR code generation"""
        response = auth_client.get(f'/api/vendors/{sample_vendor.id}/qr')
        assert response.status_code == 200
        data = response.get_json()
        assert 'vendor_id' in data
        assert 'qr_code' in data
        assert data['qr_code'].startswith('data:image/png;base64,')

    def test_download_qr(self, auth_client, sample_vendor):
        """Test QR code download"""
        response = auth_client.get(f'/api/vendors/{sample_vendor.id}/qr/download')
        assert response.status_code == 200
        assert response.mimetype == 'image/png'
        assert 'qr_vendor_' in response.headers.get('Content-Disposition', '')

    def test_generate_qr_nonexistent_vendor(self, auth_client):
        """Test QR generation for non-existent vendor"""
        response = auth_client.get('/api/vendors/NONEXISTENT/qr')
        assert response.status_code == 404

    def test_scan_qr_requires_auth(self, client, sample_vendor):
        """Test QR scanning requires authentication"""
        response = client.post('/api/scan', json={'qr_data': sample_vendor.id})
        assert response.status_code == 401

    def test_scan_valid_qr(self, auth_client, sample_vendor):
        """Test scanning a valid QR code"""
        response = auth_client.post('/api/scan', json={'qr_data': sample_vendor.id})
        assert response.status_code == 200
        data = response.get_json()
        assert data['found'] is True
        assert 'vendor' in data
        assert data['vendor']['id'] == sample_vendor.id
        assert 'risk_score' in data['vendor']

    def test_scan_invalid_qr(self, auth_client):
        """Test scanning an invalid QR code"""
        response = auth_client.post('/api/scan', json={'qr_data': 'INVALID123'})
        assert response.status_code == 404
        data = response.get_json()
        assert data['found'] is False

    def test_scan_missing_data(self, auth_client):
        """Test scanning with missing QR data"""
        response = auth_client.post('/api/scan', json={})
        assert response.status_code == 400


class TestAnalytics:
    """Test analytics endpoint"""

    def test_analytics_requires_auth(self, client):
        """Test analytics requires authentication"""
        response = client.get('/api/analytics')
        assert response.status_code == 401

    def test_get_analytics(self, auth_client, sample_vendor):
        """Test getting analytics"""
        response = auth_client.get('/api/analytics')
        assert response.status_code == 200
        data = response.get_json()
        
        assert 'total_vendors' in data
        assert 'risk_distribution' in data
        assert 'average_risk_score' in data
        assert 'timestamp' in data
        
        assert data['total_vendors'] >= 1
        assert 'high' in data['risk_distribution']
        assert 'medium' in data['risk_distribution']
        assert 'low' in data['risk_distribution']
        assert isinstance(data['average_risk_score'], (int, float))
