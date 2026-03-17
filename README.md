# QR-Based Vendor Verification System

A Smart India Hackathon (SIH) project for vendor management and verification using QR codes with AI-powered risk assessment.

## 📋 Overview

This system enables organizations to:
- Generate unique QR codes for registered vendors
- Scan vendor QR codes via camera to retrieve details
- Get AI-powered risk insights and recommendations for vendor verification
- Access via modern web interface (React + Flask)
- **NEW**: JWT-based authentication with role-based access control
- **NEW**: Rate limiting and input validation for security
- **NEW**: Comprehensive testing infrastructure

## 🆕 Full-Stack Web Application (ENHANCED)

This project now includes a complete full-stack web application with:
- **Backend**: Flask REST API with PostgreSQL/SQLite support
- **Frontend**: React SPA with modern UI
- **Security**: JWT authentication, rate limiting, input validation
- **Testing**: Pytest backend tests with coverage reporting
- **Deployment**: Ready for Railway, Render, Docker, and more

See [SETUP.md](SETUP.md) for setup instructions and [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides.

## 🏗️ Project Structure

```
SIH PROJECT/
├── backend/                    # Flask REST API
│   ├── app.py                  # Main Flask application
│   ├── auth.py                 # Authentication routes
│   ├── models.py               # Database models (User, Vendor)
│   ├── insights.py             # AI risk assessment
│   ├── config.py               # Configuration
│   ├── extensions.py           # Flask extensions
│   ├── validators.py           # Input validation
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── Dockerfile.prod         # Production Dockerfile
│   ├── tests/                  # Pytest tests
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_vendors.py
│   │   └── test_qr.py
│   └── .env.example            # Environment template
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── api.js              # API client
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Dashboard page
│   │   │   ├── VendorList.js   # Vendor listing
│   │   │   ├── AddVendor.js    # Add vendor form
│   │   │   ├── Scanner.js      # QR scanner
│   │   │   └── VendorDetail.js # Vendor details
│   │   └── App.css             # Styles
│   ├── package.json            # Node dependencies
│   └── public/
├── nginx/                      # Nginx configuration
│   └── nginx.conf              # Reverse proxy config
├── PythonSIH/                  # Original Python Scripts
│   ├── generate_qr.py          # Generate QR codes
│   ├── scan_qr_gui.py          # Desktop GUI scanner
│   └── vendor_insights_builder.py
├── QR_Scanner/                 # OpenCV scanner
├── docker-compose.yml          # Docker Compose config
├── docker-compose.prod.yml     # Production Docker Compose
├── railway.toml                # Railway deployment
├── render.yaml                 # Render deployment
├── .env.prod.example           # Production environment template
├── SETUP.md                    # Setup guide
├── DEPLOYMENT.md               # Deployment guide
└── SECURITY.md                 # Security best practices
```

## ✨ Features

### Web Application
- 📊 **Dashboard**: Analytics and risk distribution
- 📋 **Vendor Management**: CRUD operations for vendors
- 📱 **QR Generator**: Generate and download QR codes
- 📷 **QR Scanner**: Camera-based scanning with AI insights
- 🎨 **Modern UI**: Dark-themed responsive design
- 🔐 **User Authentication**: JWT-based login/registration
- 👥 **Role-Based Access**: Admin, User, Viewer roles

### Security Features (NEW)
- 🔒 **JWT Authentication**: Secure token-based auth
- 🛡️ **Rate Limiting**: Prevent API abuse
- ✅ **Input Validation**: Sanitize and validate all inputs
- 🚫 **CORS Protection**: Configurable origin restrictions
- 🔑 **Password Hashing**: bcrypt with salt
- 📝 **Audit Trail**: Track who created/modified vendors

### AI Risk Assessment
The system analyzes vendor data and provides:
- **Risk Score (0-100)**: Overall risk rating
- **Flags**: Issues detected (missing info, invalid formats, suspicious patterns)
- **Recommendations**: Actionable steps for verification
- **Keywords**: Auto-extracted from vendor details
- **Summary**: Concise vendor overview

### Risk Detection Heuristics
- Missing/invalid email and phone
- Incomplete address information
- Unusual Tax ID or bank account formats
- Future manufacture dates
- Suspicious keywords in details (e.g., "urgent", "wire", "crypto")

### Testing & Quality
- 🧪 **Backend Tests**: Pytest with coverage reporting
- 📊 **Test Coverage**: 80%+ target
- 🔍 **Input Validation**: Comprehensive validation utilities
- 🐳 **Docker**: Production-ready containers

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python 3.11)
- **Database**: PostgreSQL / SQLite / MySQL
- **ORM**: SQLAlchemy
- **API**: RESTful JSON API
- **QR**: qrcode, Pillow
- **Authentication**: Flask-JWT-Extended
- **Security**: Flask-Limiter (rate limiting), bcrypt
- **Validation**: Custom validators, email-validator

### Frontend
- **Framework**: React 18
- **UI**: React Bootstrap
- **QR Scanner**: html5-qrcode
- **QR Display**: qrcode.react
- **HTTP**: Axios
- **Routing**: React Router v6

### DevOps & Testing
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx
- **Testing**: Pytest, pytest-cov
- **Deployment**: Railway, Render, Vercel, Netlify
- **CI/CD**: Git-based auto-deploy

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# From project root
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**Default Credentials:**
- Username: `admin`
- Password: `Admin@123`
- ⚠️ **Change immediately after first login!**

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set SECRET_KEY, JWT_SECRET_KEY
python app.py
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
copy .env.example .env
npm start
```

For detailed setup instructions, see [SETUP.md](SETUP.md).

### Option 3: Production Deployment

```bash
# Copy production environment
copy .env.prod.example .env  # Windows
# Edit .env with your production values

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway, Render, and other platforms.

## 📦 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ✅ (refresh token) |
| POST | `/api/auth/logout` | Logout user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| PUT | `/api/auth/me` | Update profile | ✅ |

### Vendor Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/health` | Health check | ❌ | - |
| GET | `/api/vendors` | List all vendors | ✅ | All |
| GET | `/api/vendors/:id` | Get vendor details | ✅ | All |
| POST | `/api/vendors` | Create vendor | ✅ | All |
| PUT | `/api/vendors/:id` | Update vendor | ✅ | All |
| DELETE | `/api/vendors/:id` | Delete vendor | ✅ | Admin |
| GET | `/api/vendors/:id/qr` | Generate QR code | ✅ | All |
| GET | `/api/vendors/:id/qr/download` | Download QR | ✅ | All |
| POST | `/api/scan` | Scan/verify QR | ✅ | All |
| GET | `/api/analytics` | Get analytics | ✅ | All |

### User Management (Admin Only)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/auth/users` | List all users | ✅ | Admin |
| PUT | `/api/auth/users/:id` | Update user | ✅ | Admin |
| DELETE | `/api/auth/users/:id` | Delete user | ✅ | Admin |

## 📊 Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) | Unique vendor identifier |
| vendor_name | VARCHAR(255) | Vendor name |
| manufacture_date | DATE | Manufacture date |
| details | TEXT | Additional details |
| contact_person | VARCHAR(100) | Contact person |
| contact_email | VARCHAR(255) | Email |
| contact_phone | VARCHAR(20) | Phone |
| address_line1 | VARCHAR(255) | Address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State |
| postal_code | VARCHAR(20) | Postal code |
| country | VARCHAR(100) | Country |
| tax_id | VARCHAR(50) | Tax ID |
| bank_account | VARCHAR(50) | Bank account |

## 🔒 Security

- 🔐 **JWT Authentication**: Token-based authentication with refresh tokens
- 🛡️ **Rate Limiting**: Prevent API abuse (configurable limits)
- ✅ **Input Validation**: Comprehensive sanitization and validation
- 🚫 **CORS Protection**: Configurable origin restrictions
- 🔑 **Password Hashing**: bcrypt with salt rounds
- 📝 **Audit Trail**: Track user actions (who created/modified)
- 🚨 **Security Headers**: X-Frame-Options, XSS-Protection, etc.
- 🔒 **Environment Variables**: No hardcoded credentials
- 📊 **Logging**: Comprehensive audit logging
- 🧪 **Testing**: Automated tests for security-critical functions

See [SECURITY.md](SECURITY.md) for complete security guidelines.

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Example Workflow

1. **Deploy** the application (local or cloud)
2. **Register/Login** with admin account
3. **Add Vendor** via web interface
4. **Generate QR** code from vendor detail page
5. **Download/Print** QR code
6. **Scan QR** using web scanner or desktop app
7. **Review AI Insights** for risk assessment
8. **Monitor** vendor risk scores and analytics

## 📚 Documentation

- [🚀 Setup Guide](SETUP.md) - Complete setup instructions
- [🌐 Deployment Guide](DEPLOYMENT.md) - Cloud and local deployment
- [🔒 Security Best Practices](SECURITY.md) - Security guidelines
- [📖 API Documentation](backend/app.py) - API endpoint details

## 🤝 Contributing

This is an SIH project. Contributions and improvements are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

### Code Quality

```bash
# Backend linting
flake8 backend/
black backend/ --check

# Frontend linting
cd frontend
npm run lint
```

## 📄 License

Smart India Hackathon Project

---

**Built for Smart India Hackathon 2024-25** 🇮🇳

**Enhanced with:** JWT Authentication, Rate Limiting, Input Validation, Comprehensive Testing, and Production-Ready Docker Configuration 
 
 
