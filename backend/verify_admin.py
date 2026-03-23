"""
Script to verify and create admin user
Run this to ensure admin user exists
"""
import sys
sys.path.insert(0, '.')

from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    # Check for existing admin
    admin = User.query.filter_by(role='admin').first()
    
    if admin:
        print(f"✅ Admin user exists:")
        print(f"   Username: {admin.username}")
        print(f"   Email: {admin.email}")
        print(f"   ID: {admin.id}")
        print(f"   Active: {admin.is_active}")
        print(f"\n📝 Login with: username='{admin.username}', password='Admin@123'")
    else:
        print("❌ No admin user found. Creating default admin...")
        admin_user = User(
            username='admin',
            email='admin@vendorverify.com',
            role='admin',
            is_active=True
        )
        admin_user.set_password('Admin@123')
        db.session.add(admin_user)
        db.session.commit()
        print("✅ Default admin user created!")
        print(f"   Username: admin")
        print(f"   Password: Admin@123")
        print(f"\n⚠️ IMPORTANT: Change the default password after login!")
    
    # List all users
    print("\n📋 All users in database:")
    users = User.query.all()
    for user in users:
        print(f"   - {user.username} ({user.email}) - Role: {user.role} - Active: {user.is_active}")
