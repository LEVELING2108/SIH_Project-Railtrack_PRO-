# 🚀 Deployment Guide

Complete guide to deploy the QR-Based Vendor Verification System on free hosting platforms.

---

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Docker Deployment](#docker-deployment)
3. [Railway Deployment (Recommended)](#railway-deployment)
4. [Render Deployment](#render-deployment)
5. [Alternative Free Hosting Options](#alternative-free-hosting-options)

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Run the server
python app.py
```

Backend will run at: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Start development server
npm start
```

Frontend will run at: `http://localhost:3000`

---

## 🐳 Docker Deployment

### Run with Docker Compose (All Services)

```bash
# From project root directory
docker-compose up --build
```

This starts:
- **Backend API**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`
- **PostgreSQL Database**: `localhost:5432`

### Run Individual Services

```bash
# Backend only
docker-compose up backend

# Frontend only
docker-compose up frontend

# Database only
docker-compose up db
```

### Stop Services

```bash
docker-compose down

# With volume removal (deletes database)
docker-compose down -v
```

---

## 🚂 Railway Deployment (Recommended)

Railway offers free tier with $5/month credit (sufficient for small apps).

### Step 1: Prepare Your Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect the `backend` folder

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables

In Railway dashboard, add these variables:

```
FLASK_ENV=production
SECRET_KEY=your-secure-random-key-here
CORS_ORIGINS=*
```

### Step 5: Deploy Frontend

**Option A: Deploy as separate Railway service**

1. Create a new service from the same repo
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npx serve -s build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

**Option B: Use Vercel/Netlify for frontend** (Recommended for free tier)

### Step 6: Update CORS

Once frontend is deployed, update backend's `CORS_ORIGINS` to include frontend URL:

```
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

---

## 🎨 Render Deployment

### Step 1: Create Account

Go to [render.com](https://render.com) and sign up.

### Step 2: Deploy Backend

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `vendor-verification-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Instance Type**: **Free**

### Step 3: Add Database

1. Click **"New"** → **"PostgreSQL"**
2. Choose **Free** tier
3. Note the **Internal Database URL**

### Step 4: Configure Environment Variables

In Render dashboard, add:

```
DATABASE_URL=<from PostgreSQL service>
SECRET_KEY=<generate secure key>
FLASK_ENV=production
CORS_ORIGINS=*
```

### Step 5: Deploy Frontend

1. Click **"New"** → **"Static Site"**
2. Connect your repository
3. Configure:
   - **Name**: `vendor-verification-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

### ⚠️ Note on Render Free Tier

- Web services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- PostgreSQL free tier expires after 90 days

---

## 🌐 Alternative Free Hosting Options

### Vercel (Frontend) + Railway (Backend)

**Vercel for Frontend:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel
```

Follow prompts to deploy. Set environment variable in Vercel dashboard.

### Netlify (Frontend) + Render (Backend)

**Netlify for Frontend:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### Fly.io (Full Stack)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

---

## 🔧 Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend can connect to backend
- [ ] Database is properly connected
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] QR code generation works
- [ ] QR scanner/camera access works (requires HTTPS)
- [ ] All CRUD operations work

---

## 🔒 Security Best Practices

1. **Change SECRET_KEY** to a strong random value
2. **Enable HTTPS** (automatic on most platforms)
3. **Restrict CORS** to your frontend domain only
4. **Use environment variables** for all secrets
5. **Enable database backups** if available
6. **Keep dependencies updated**

---

## 📊 Free Tier Limits

| Platform | Free Tier | Limitations |
|----------|-----------|-------------|
| Railway | $5 credit/month | ~500 hours of usage |
| Render | Free web service | Spins down after 15 min idle |
| Vercel | Free for personal | 100GB bandwidth/month |
| Netlify | Free tier | 100GB bandwidth/month |
| Fly.io | Free allowance | 3 shared-cpu-1x 256 VMs |

---

## 🆘 Troubleshooting

### Backend won't start
- Check logs in hosting dashboard
- Verify `DATABASE_URL` is correct
- Ensure all dependencies are installed

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` is correct
- Verify CORS settings on backend
- Ensure backend is running

### Database connection errors
- Check database service is running
- Verify connection string format
- Check firewall/network rules

### Camera not working in scanner
- Ensure site is served over HTTPS
- Grant camera permissions in browser
- Test in different browser

---

## 📞 Support

For issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test locally first

---

**Happy Deploying! 🎉**
