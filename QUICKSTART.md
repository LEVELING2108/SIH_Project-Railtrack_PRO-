# ⚡ Quick Start Guide

Get your enhanced Vendor Verification System running in 5 minutes!

---

## 🚀 Local Development (Fast Track)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend (new terminal)
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
# Backend - Copy and edit .env
copy .env.example .env  # Windows

# Generate secure keys
python -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY:', secrets.token_hex(32))"

# Add these to .env file
```

### Step 3: Run Application

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python app.py
# Runs at http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start
# Runs at http://localhost:3000
```

### Step 4: Login

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123`
- ⚠️ **Change this immediately!**

---

## 🐳 Docker (Easiest)

```bash
# One command to run everything
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 🧪 Run Tests

```bash
cd backend
venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Open coverage report
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac/Linux
```

---

## 🔑 API Quick Reference

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

### Create Vendor (with token)
```bash
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "VENDOR001",
    "vendor_name": "Test Vendor",
    "contact_email": "vendor@example.com"
  }'
```

### Get Vendors
```bash
curl -X GET http://localhost:5000/api/vendors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration |
| `frontend/.env` | Frontend configuration |
| `backend/app.py` | Main Flask application |
| `backend/auth.py` | Authentication routes |
| `backend/models.py` | Database models |
| `backend/validators.py` | Input validation |
| `docker-compose.yml` | Docker configuration |

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check dependencies
pip install -r requirements.txt

# Check port
netstat -ano | findstr :5000
```

### Frontend won't start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
# Reset database (development only!)
rm instance/vendors.db
python app.py
```

### Tests failing
```bash
# Reinstall test dependencies
pip install pytest pytest-flask pytest-cov
```

---

## 📊 Environment Variables

### Minimum Required (.env)

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Database
DATABASE_URL=sqlite:///vendors.db

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## 🎯 Next Steps

After getting it running:

1. ✅ **Change default password**
2. ✅ **Generate secure keys**
3. ✅ **Run tests**
4. ✅ **Read SECURITY.md**
5. ✅ **Configure CORS for your domain**

---

## 📚 Full Documentation

- [Setup Guide](SETUP.md) - Complete setup
- [Security](SECURITY.md) - Security best practices
- [Deployment](DEPLOYMENT.md) - Production deployment
- [API Docs](backend/app.py) - API endpoints

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs`
2. Review error messages
3. Test with Postman/curl
4. Read documentation
5. Check test coverage

---

**Happy Coding! 🚀**

*Last Updated: March 17, 2024*
