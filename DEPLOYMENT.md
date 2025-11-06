# Deployment Guide

This guide covers deploying your Exam Allocation System to GitHub and Vercel.

## 📋 Table of Contents

1. [GitHub Setup](#github-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

---

## 🐙 GitHub Setup

### Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to project root
cd "C:\Users\Jenkinson\Downloads\projects\Exam Allocation System"

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Exam Allocation System"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name your repository (e.g., `exam-allocation-system`)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (you already have these)
6. Click **Create repository**

### Step 3: Connect and Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify

Visit your GitHub repository URL to confirm all files are uploaded.

---

## 🚀 Vercel Deployment

Vercel is perfect for deploying your Next.js frontend. Follow these steps:

### Prerequisites

- GitHub account (repository already created)
- Vercel account ([sign up here](https://vercel.com/signup))

### Step 1: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. Click **Add New Project**
3. **Import your GitHub repository**
   - Select your repository from the list
   - Click **Import**

### Step 2: Configure Project Settings

In the project configuration:

1. **Framework Preset**: Select **Next.js** (auto-detected)
2. **Root Directory**: Set to `apps/client`
   - Click **Edit** next to Root Directory
   - Enter: `apps/client`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### Step 3: Set Environment Variables

Before deploying, add these environment variables in Vercel:

1. Click **Environment Variables** section
2. Add the following:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false
```

**Note**: 
- Set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true` if you want to show demo credentials (for showcase)
- Set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false` or omit it for production (hides demo message)

### Step 4: Deploy

1. Click **Deploy**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 🔧 Backend Deployment

Your NestJS backend needs to be deployed separately. Here are recommended options:

### Option 1: Railway (Recommended)

1. **Sign up**: [railway.app](https://railway.app)
2. **Create New Project** → **Deploy from GitHub repo**
3. **Select your repository**
4. **Configure**:
   - Root Directory: `apps/server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
5. **Add Environment Variables**:
   ```
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   DB_DATABASE=elms
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1d
   REGISTRATION_TOKEN=your-secure-registration-token
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.vercel.app
   ```
6. **Add PostgreSQL Database**:
   - Click **+ New** → **Database** → **PostgreSQL**
   - Railway will automatically provide connection variables
7. **Update CORS**: Your backend URL will be something like `https://your-app.up.railway.app`

### Option 2: Render

1. **Sign up**: [render.com](https://render.com)
2. **New** → **Web Service**
3. **Connect GitHub** and select your repo
4. **Configure**:
   - Name: `exam-allocation-backend`
   - Environment: `Node`
   - Root Directory: `apps/server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
5. **Add Environment Variables** (same as Railway)
6. **Add PostgreSQL Database**:
   - New → PostgreSQL
   - Copy connection details to environment variables

### Option 3: Vercel Serverless Functions (Advanced)

If you want everything on Vercel, you'll need to adapt your NestJS app to work with serverless functions. This requires more configuration.

---

## 🔐 Environment Variables

### Frontend (Vercel)

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.railway.app` |
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | Show demo credentials on login page | `true` (showcase) or `false` (production) |

### Backend (Railway/Render)

Add these in your hosting platform's environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `containers-us-west-xxx.railway.app` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_DATABASE` | Database name | `elms` |
| `JWT_SECRET` | Secret key for JWT | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration | `1d` |
| `REGISTRATION_TOKEN` | Token required for user registration | Generate with `openssl rand -hex 32` |
| `PORT` | Server port | `3001` (or auto-assigned) |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGIN` | Allowed frontend URL | `https://your-app.vercel.app` |

---

## 🔄 Update CORS Configuration

After deploying, update your backend CORS to allow your Vercel domain:

1. **Update `apps/server/src/main.ts`**:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

2. **Set `CORS_ORIGIN` environment variable** in your backend hosting platform to your Vercel URL.

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly (including `REGISTRATION_TOKEN`)
- [ ] CORS configured to allow Vercel domain
- [ ] Database connected and migrations run
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Create demo users via API (use seed script or manual registration)

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

- **Check**: `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- **Check**: Backend CORS allows your Vercel domain
- **Check**: Backend is running and accessible

### Build fails on Vercel

- **Check**: Root directory is set to `apps/client`
- **Check**: Build command is correct
- **Check**: All dependencies are in `package.json`

### Backend deployment issues

- **Check**: Root directory is `apps/server`
- **Check**: Build command includes `npm install`
- **Check**: Start command uses `start:prod`
- **Check**: All environment variables are set

### Database connection errors

- **Check**: Database credentials are correct
- **Check**: Database is accessible from your hosting platform
- **Check**: Database exists and is initialized

---

## 🔗 Quick Links

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 📞 Need Help?

If you encounter issues:

1. Check the build logs in Vercel/Railway/Render
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check CORS configuration matches your frontend URL

Good luck with your deployment! 🚀

