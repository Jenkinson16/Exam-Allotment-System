# GitHub & Deployment Guide

## 📋 Pre-Commit Checklist

- [x] Removed AI-generated files
- [x] Cleaned up verbose comments
- [x] Verified .gitignore is complete
- [x] All code is production-ready

## 🐙 GitHub Setup

### Step 1: Initialize Git Repository

```bash
cd "C:\Users\Jenkinson\Downloads\projects\Exam Allocation System"
git init
```

### Step 2: Add All Files

```bash
git add .
```

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Exam Allocation System"
```

### Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name: `exam-allocation-system` (or your preferred name)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Step 5: Connect and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/exam-allocation-system.git
git branch -M main
git push -u origin main
```

## 🚀 Deployment

### Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `apps/client`
   - **Framework**: Next.js (auto-detected)
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL
   - `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` = `false` (or `true` for showcase)
5. Click **Deploy**

### Backend (Railway/Render)

1. Sign up at [railway.app](https://railway.app) or [render.com](https://render.com)
2. Create new project from GitHub
3. Configure:
   - **Root Directory**: `apps/server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Add PostgreSQL database
5. Set Environment Variables:
   ```
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your-password
   DB_DATABASE=elms
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1d
   REGISTRATION_TOKEN=your-secure-token
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.vercel.app
   ```

## 📝 Post-Deployment

1. Run seed script to create demo users (if needed)
2. Test login functionality
3. Verify API endpoints work
4. Test full workflow

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

