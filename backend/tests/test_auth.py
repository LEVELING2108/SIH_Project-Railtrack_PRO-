"""
Tests for authentication endpoints
"""
import pytest
from models import User


class TestAuth:
    """Test authentication endpoints"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'

    def test_user_registration(self, client):
        """Test user registration"""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Secure@123'
        })
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['username'] == 'newuser'

    def test_user_login(self, client, app):
        """Test user login"""
        # Create user first
        with app.app_context():
            user = User(
                username='testuser',
                email='test@example.com',
                role='user'
            )
            user.set_password('Test@123')
            db.session.add(user)
            db.session.commit()

        response = client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'Test@123'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert data['user']['username'] == 'testuser'

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post('/api/auth/login', json={
            'username': 'nonexistent',
            'password': 'wrongpassword'
        })
        assert response.status_code == 401

    def test_registration_missing_fields(self, client):
        """Test registration with missing fields"""
        response = client.post('/api/auth/register', json={
            'username': 'user',
            'email': 'user@example.com'
            # Missing password
        })
        assert response.status_code == 400

    def test_registration_weak_password(self, client):
        """Test registration with weak password"""
        response = client.post('/api/auth/register', json={
            'username': 'user123',
            'email': 'user123@example.com',
            'password': '123'  # Too short
        })
        assert response.status_code == 400

    def test_registration_duplicate_username(self, client, app):
        """Test registration with duplicate username"""
        from extensions import db
        with app.app_context():
            user = User(
                username='duplicate',
                email='first@example.com',
                role='user'
            )
            user.set_password('Test@123')
            db.session.add(user)
            db.session.commit()

        response = client.post('/api/auth/register', json={
            'username': 'duplicate',
            'email': 'second@example.com',
            'password': 'Test@123'
        })
        assert response.status_code == 400

    def test_get_current_user(self, auth_client):
        """Test getting current user info"""
        response = auth_client.get('/api/auth/me')
        assert response.status_code == 200
        data = response.get_json()
        assert 'user' in data

    def test_protected_route_without_token(self, client):
        """Test accessing protected route without token"""
        response = client.get('/api/vendors')
        assert response.status_code == 401

    def test_token_refresh(self, client, app):
        """Test token refresh"""
        from extensions import db
        # Create user
        with app.app_context():
            user = User(
                username='refreshtest',
                email='refresh@example.com',
                role='user'
            )
            user.set_password('Test@123')
            db.session.add(user)
            db.session.commit()

        # Login
        login_response = client.post('/api/auth/login', json={
            'username': 'refreshtest',
            'password': 'Test@123'
        })
        refresh_token = login_response.get_json()['refresh_token']

        # Refresh
        refresh_response = client.post('/api/auth/refresh',
                                       headers={'Authorization': f'Bearer {refresh_token}'})
        assert refresh_response.status_code == 200
        assert 'access_token' in refresh_response.get_json()
