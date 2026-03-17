"""
pytest configuration and fixtures for backend tests
"""
import pytest
import os
from app import create_app, db
from models import User, Vendor
from config import TestingConfig


@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app(TestingConfig())
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create CLI runner"""
    return app.test_cli_runner()


@pytest.fixture
def auth_client(client, app):
    """Create authenticated test client"""
    # Create test user
    with app.app_context():
        user = User(
            username='testuser',
            email='test@example.com',
            role='user'
        )
        user.set_password('Test@123')
        db.session.add(user)
        db.session.commit()
    
    # Login and get token
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'Test@123'
    })
    data = response.get_json()
    access_token = data['access_token']
    
    client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
    return client


@pytest.fixture
def admin_client(client, app):
    """Create admin authenticated test client"""
    # Create admin user
    with app.app_context():
        admin = User(
            username='admin',
            email='admin@example.com',
            role='admin'
        )
        admin.set_password('Admin@123')
        db.session.add(admin)
        db.session.commit()
    
    # Login and get token
    response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Admin@123'
    })
    data = response.get_json()
    access_token = data['access_token']
    
    client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
    return client


@pytest.fixture
def sample_vendor(app):
    """Create a sample vendor for testing"""
    with app.app_context():
        vendor = Vendor(
            id='TEST001',
            vendor_name='Test Vendor',
            manufacture_date='2024-01-15',
            details='Test vendor for testing purposes',
            contact_person='John Doe',
            contact_email='test@vendor.com',
            contact_phone='+91 9876543210',
            address_line1='123 Test Street',
            city='Test City',
            state='Test State',
            postal_code='123456',
            country='India',
            tax_id='ABCDE1234F',
            bank_account='1234567890'
        )
        db.session.add(vendor)
        db.session.commit()
    return vendor
