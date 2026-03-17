# 🔒 Security Best Practices

Security guidelines for the QR-Based Vendor Verification System.

---

## ⚠️ Critical Security Actions

### Immediately After Deployment

1. **Change Default Admin Password**
   ```bash
   # Default credentials (CHANGE THESE!)
   Username: admin
   Password: Admin@123
   ```

2. **Generate New Secret Keys**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

3. **Update CORS Settings**
   - Never use `CORS_ORIGINS=*` in production
   - Specify exact domains only

---

## 🔐 Authentication Security

### Password Requirements

Enforce strong passwords:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Token Security

```python
# Recommended configuration
JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
JWT_COOKIE_SECURE = True  # HTTPS only
JWT_COOKIE_CSRF_PROTECT = True
```

### Token Storage

**Frontend:**
- Store tokens in httpOnly cookies (not localStorage)
- Enable CSRF protection
- Use Secure flag for cookies

---

## 🛡️ Input Validation

### All User Input Must Be:

1. **Validated** - Check format and type
2. **Sanitized** - Remove dangerous characters
3. **Escaped** - Prevent XSS attacks

### Example Validation

```python
from validators import validate_email, sanitize_string

# Validate email
if not validate_email(data.get('email')):
    raise BadRequest("Invalid email")

# Sanitize string
name = sanitize_string(data.get('name'), max_length=100)
```

---

## 🔒 Rate Limiting

### Default Limits

```python
# Authentication endpoints
/api/auth/login: 5 requests per minute
/api/auth/register: 3 requests per hour

# Vendor operations
/api/vendors: 30 requests per hour
/api/scan: 60 requests per hour

# General
Default: 200 per day, 50 per hour
```

### Configure Rate Limiting

```env
RATELIMIT_ENABLED=true
RATELIMIT_STORAGE_URL=redis://redis:6379/0
```

---

## 🗄️ Database Security

### Connection Security

1. **Use Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/db
   ```

2. **Never Commit Credentials**
   - Add `.env` to `.gitignore`
   - Use secrets management

3. **Use Prepared Statements**
   - SQLAlchemy prevents SQL injection
   - Never concatenate user input in queries

### Access Control

```sql
-- Create limited database user
CREATE USER vendor_app WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_data TO vendor_app;
GRANT SELECT, USAGE ON SEQUENCE vendor_data_id_seq TO vendor_app;
```

---

## 🌐 Network Security

### HTTPS Configuration

**Required for Production:**

1. Obtain SSL certificate (Let's Encrypt)
2. Configure Nginx with SSL
3. Redirect HTTP to HTTPS
4. Enable HSTS

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Redirect HTTP to HTTPS
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### CORS Configuration

```python
# Production - Specific domains only
CORS_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
]

# Development only
CORS_ORIGINS = 'http://localhost:3000'
```

---

## 📝 Logging & Monitoring

### What to Log

✅ **DO Log:**
- Authentication attempts (success/failure)
- API requests (endpoint, timestamp, IP)
- Errors and exceptions
- Rate limit violations
- Database errors

❌ **DON'T Log:**
- Passwords or secrets
- Full JWT tokens
- Credit card numbers
- Personal identifiable information (PII)

### Log Configuration

```python
# Production logging
LOG_LEVEL = INFO
LOG_FILE = /app/logs/app.log

# Rotate logs
handler = RotatingFileHandler(
    'app.log', 
    maxBytes=10000000,  # 10MB
    backupCount=5
)
```

---

## 🔐 Secrets Management

### Environment Variables

```bash
# Use .env file (never commit!)
SECRET_KEY=generated-secret-key
JWT_SECRET_KEY=generated-jwt-secret
DATABASE_URL=postgresql://user:pass@host/db

# In production, use secrets manager
# AWS Secrets Manager, Azure Key Vault, etc.
```

### Generate Secure Keys

```bash
# Flask secret key
python -c "import secrets; print(secrets.token_hex(32))"

# JWT secret
python -c "import secrets; print(secrets.token_hex(32))"

# Database password
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 👥 User Roles & Permissions

### Role-Based Access Control

```python
# Available roles
ROLE_ADMIN = 'admin'      # Full access
ROLE_USER = 'user'        # Standard access
ROLE_VIEWER = 'viewer'    # Read-only access

# Protect routes
@app.route('/api/vendors/<id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')  # Only admins can delete
def delete_vendor(id):
    # ...
```

### Permission Matrix

| Action | Admin | User | Viewer |
|--------|-------|------|--------|
| View Vendors | ✅ | ✅ | ✅ |
| Create Vendor | ✅ | ✅ | ❌ |
| Update Vendor | ✅ | ✅ | ❌ |
| Delete Vendor | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ |

---

## 🚨 Security Headers

### Required Headers

```python
SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'no-referrer-when-downgrade'
}
```

### Nginx Configuration

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000" always;
```

---

## 🧪 Security Testing

### Automated Scans

```bash
# Dependency vulnerabilities
pip install safety
safety check

# NPM vulnerabilities
npm audit

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://yourdomain.com
```

### Manual Testing Checklist

- [ ] SQL injection testing
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Authentication bypass testing
- [ ] Rate limiting testing
- [ ] Session management testing
- [ ] Input validation testing

---

## 📦 Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
pip install safety
safety check

# Update dependencies
pip install --upgrade -r requirements.txt

# NPM
npm audit fix
npm update
```

### Pin Versions

```txt
# requirements.txt - Always pin versions
Flask==3.0.0
Flask-CORS==4.0.0
bcrypt==4.1.2
```

---

## 🆘 Incident Response

### If Security Breach Detected

1. **Immediate Actions**
   - Revoke all active sessions
   - Change all passwords
   - Rotate all secret keys
   - Review logs for suspicious activity

2. **Investigation**
   - Identify breach source
   - Determine scope of compromise
   - Document findings

3. **Recovery**
   - Patch vulnerability
   - Restore from clean backup
   - Monitor for further attacks

4. **Post-Incident**
   - Review security procedures
   - Update security measures
   - Document lessons learned

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/2.3.x/security/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

---

## 🎯 Security Checklist

### Before Production Deployment

- [ ] Changed default passwords
- [ ] Generated new secret keys
- [ ] Configured CORS properly
- [ ] Enabled HTTPS/SSL
- [ ] Enabled rate limiting
- [ ] Configured logging
- [ ] Set up monitoring
- [ ] Tested input validation
- [ ] Reviewed user permissions
- [ ] Updated all dependencies
- [ ] Backed up database
- [ ] Tested backup restoration
- [ ] Documented security procedures

---

**Security is everyone's responsibility! 🛡️**
