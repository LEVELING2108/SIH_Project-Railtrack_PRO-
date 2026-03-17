# 🚀 Setup Guide - QR-Based Vendor Verification System

Complete guide to set up the enhanced vendor verification system with authentication and security.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **Git**: Latest version
- **Docker** (optional): 20.x or higher

### For Windows Users

```powershell
# Install Python (if not installed)
winget install Python.Python.3.11

# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Git
winget install Git.Git
```

### For Linux/Mac Users

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3-pip nodejs npm git

# macOS (with Homebrew)
brew install python@3.11 node git
```

---

## 💻 Local Development Setup

### Step 1: Clone Repository

```bash
cd "C:\Users\suman\Downloads\OLD_PROJECT\SIH PROJECT"
# Or navigate to your project directory
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac

# Edit .env file and set your configuration
# IMPORTANT: Change SECRET_KEY and JWT_SECRET_KEY!
```

### Step 3: Generate Secure Keys

```bash
# Generate secure secret keys
python -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

Copy these values to your `.env` file.

### Step 4: Initialize Database and Create Admin User

```bash
# Run the application (database auto-initializes)
python app.py
```

The app will create:
- SQLite database (`vendors.db`)
- Default admin user (username: `admin`, password: `Admin@123`)

**⚠️ IMPORTANT**: Change the default admin password immediately!

### Step 5: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac

# Edit .env and set API URL
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 6: Run Development Servers

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate  # Windows
python app.py
```

Backend runs at: `http://localhost:5000`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🐳 Docker Setup (Recommended for Production)

### Option 1: Development with Docker

```bash
# From project root
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

### Option 2: Production Deployment

```bash
# Copy production environment file
copy .env.prod.example .env  # Windows
# or
cp .env.prod.example .env    # Linux/Mac

# Edit .env and set ALL required variables

# Build and run production stack
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

```env
# Required
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DATABASE_URL=sqlite:///vendors.db
CORS_ORIGINS=http://localhost:3000

# Optional
FLASK_DEBUG=true
RATELIMIT_ENABLED=false
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Production Environment Variables

See `.env.prod.example` for complete list of production variables.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run tests matching pattern
pytest -k "test_login" -v
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

---

## 🔒 Security Setup

### 1. Change Default Admin Password

After first login:

```bash
# Using API (with admin token)
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "YourNewSecure@Password123"}'
```

### 2. Configure CORS for Production

In `.env`:
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Enable Rate Limiting

In `.env`:
```env
RATELIMIT_ENABLED=true
RATELIMIT_STORAGE_URL=redis://localhost:6379/0
```

### 4. Use HTTPS in Production

- Obtain SSL certificate (Let's Encrypt recommended)
- Configure Nginx with SSL (see `nginx/nginx.conf`)
- Redirect HTTP to HTTPS

---

## 📊 Database Migration

### Using Flask-Migrate

```bash
cd backend
venv\Scripts\activate

# Initialize migrations (first time only)
flask db init

# Create migration after model changes
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

---

## 🚀 Production Deployment Checklist

- [ ] Generate strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Change default admin password
- [ ] Configure CORS for your domain
- [ ] Set up PostgreSQL database
- [ ] Enable rate limiting with Redis
- [ ] Configure HTTPS/SSL
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Test all endpoints
- [ ] Review security settings
- [ ] Update frontend API URL

---

## 🆘 Troubleshooting

### Backend won't start

**Error: Module not found**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Error: Database locked**
```bash
# Delete SQLite database (development only!)
rm instance/vendors.db
python app.py
```

### Frontend won't start

**Error: Cannot find module**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Port already in use**
```bash
# Use different port
PORT=3001 npm start
```

### Docker Issues

**Error: Container won't start**
```bash
# View logs
docker-compose logs backend

# Rebuild containers
docker-compose up -d --build --force-recreate

# Clean up
docker-compose down -v
docker-compose up -d --build
```

### Authentication Issues

**Error: Token expired**
- Tokens expire after 1 hour
- Use refresh token to get new access token
- Call `/api/auth/refresh` endpoint

**Error: Invalid credentials**
- Check username/password
- Ensure user is active in database
- Check password hash is correct

---

## 📞 Support

For issues:
1. Check logs in `backend/logs/` or Docker logs
2. Review error messages carefully
3. Test endpoints with Postman/curl
4. Check database connectivity
5. Verify environment variables

---

## 🎯 Default Credentials

**After first setup:**
- **Username**: `admin`
- **Password**: `Admin@123`
- **Email**: `admin@vendorverify.com`

**⚠️ CHANGE THESE IMMEDIATELY!**

---

## 📚 Additional Documentation

- [Deployment Guide](DEPLOYMENT.md) - Cloud deployment options
- [API Documentation](backend/app.py) - API endpoint details
- [Security Best Practices](SECURITY.md) - Security guidelines

---

**Happy Coding! 🎉**
