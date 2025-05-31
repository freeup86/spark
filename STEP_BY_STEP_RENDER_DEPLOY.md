# 📋 Step-by-Step Render.com Deployment Guide

This guide will walk you through deploying the Spark application to Render.com step by step, using your existing PostgreSQL database.

## 🎯 Overview

We'll deploy:
1. **Backend API** (NestJS) - connects to your existing database
2. **Frontend App** (Next.js) - connects to the backend API

**Total Time**: ~20-30 minutes

---

## 📋 Pre-Deployment Checklist

### ✅ Step 1: Verify Prerequisites

1. **GitHub Repository**
   - [ ] Code is pushed to GitHub
   - [ ] Repository is public or you have Render connected to private repos

2. **Database Requirements**
   - [ ] PostgreSQL database is running and accessible
   - [ ] You have the database connection URL
   - [ ] Database accepts external connections
   - [ ] SSL is enabled (recommended)

3. **Render Account**
   - [ ] Create account at [render.com](https://render.com)
   - [ ] Connect your GitHub account

---

## 🔧 Step 2: Prepare Your Database

### 2.1 Get Your Database URL

Your database URL should look like this:
```
postgresql://username:password@host:port/database?sslmode=require
```

**Examples by provider:**
- **Aiven**: `postgresql://avnadmin:password@host:port/defaultdb?sslmode=require`
- **Neon**: `postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require`
- **Supabase**: `postgresql://postgres:password@host.supabase.co:5432/postgres?sslmode=require`
- **Railway**: `postgresql://postgres:password@host.railway.app:5432/railway?sslmode=require`

### 2.2 Test Database Connection

```bash
# Install pg if you haven't
npm install pg

# Test connection
node scripts/check-database-connection.js "your-database-url"
```

**Expected output:**
```
✅ Database connection successful!
✅ Query successful!
📊 PostgreSQL Version: 14.x
```

### 2.3 Configure Database Access

**Option A: Whitelist Render IPs (More Secure)**
Add these IP addresses to your database whitelist:
```
3.132.201.78/32
18.222.227.148/32
18.191.251.175/32
35.174.176.244/32
3.226.148.102/32
18.205.222.128/32
```

**Option B: Allow All IPs (Less Secure)**
Set allowed IPs to: `0.0.0.0/0`

**How to configure by provider:**
- **Aiven**: Dashboard → Service → Overview → "Allowed IP Addresses"
- **Neon**: Dashboard → Settings → "IP Allow"
- **Supabase**: Dashboard → Settings → Database → "Network Restrictions"
- **Railway**: Usually allows all connections by default

---

## 🚀 Step 3: Deploy Backend Service

### 3.1 Create Backend Service

1. **Go to Render Dashboard**
   - Navigate to [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select **"Build and deploy from a Git repository"**
   - Click **"Connect"** next to your GitHub account
   - Find and select your Spark repository
   - Click **"Connect"**

3. **Configure Backend Service**
   Fill in these fields:

   | Field | Value |
   |-------|-------|
   | **Name** | `spark-backend` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm ci && npx prisma generate && npm run build` |
   | **Start Command** | `npx prisma migrate deploy && npm run start:prod` |
   | **Plan** | `Free` (for testing) or `Starter` (for production) |

### 3.2 Generate Environment Variables

```bash
node scripts/generate-env-vars.js
```

Copy the **Backend Environment Variables** from the output.

### 3.3 Add Environment Variables

In the Render dashboard, scroll down to **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `your-actual-database-url` |
| `JWT_SECRET` | `generated-jwt-secret-from-script` |
| `PORT` | `3000` |
| `FRONTEND_URL` | `https://spark-frontend.onrender.com` |

**⚠️ Important:** Replace the placeholder values with your actual values!

### 3.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Monitor the build logs for any errors

**Success indicators:**
- Build completes without errors
- Service shows "Live" status
- Health check at `https://spark-backend.onrender.com/health` returns `{"status":"ok"}`

---

## 🎨 Step 4: Deploy Frontend Service

### 4.1 Create Frontend Service

1. **Create New Service**
   - Click **"New +"** → **"Web Service"**
   - Connect the same GitHub repository

2. **Configure Frontend Service**

   | Field | Value |
   |-------|-------|
   | **Name** | `spark-frontend` |
   | **Region** | Same as backend |
   | **Branch** | `main` |
   | **Root Directory** | `frontend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm ci && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` (for testing) or `Starter` (for production) |

### 4.2 Add Frontend Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://spark-backend.onrender.com` |
| `PORT` | `3001` |

### 4.3 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)

---

## 🔄 Step 5: Update Backend CORS

After frontend deployment, update the backend:

1. **Go to Backend Service**
   - Navigate to your `spark-backend` service
   - Go to **"Environment"** tab

2. **Update FRONTEND_URL**
   - Change `FRONTEND_URL` to: `https://spark-frontend.onrender.com`
   - Click **"Save Changes"**

3. **Wait for Redeploy**
   - Backend will automatically redeploy
   - Wait ~2-3 minutes

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Backend Health

Visit: `https://spark-backend.onrender.com/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

### 6.2 Test Frontend

Visit: `https://spark-frontend.onrender.com`

**Expected behavior:**
- ✅ Page loads without errors
- ✅ Can register/login
- ✅ Can create ideas
- ✅ Can view dashboard

### 6.3 Test Full Integration

1. **Register a new account** on the frontend
2. **Create an idea** 
3. **Check if data appears** in your database
4. **Test notifications** and real-time features

---

## 🔍 Step 7: Troubleshooting

### Backend Issues

**Build Fails:**
```bash
# Check build logs in Render dashboard
# Common fixes:
- Verify build command is correct
- Check if all dependencies are in package.json
- Ensure Node version compatibility
```

**Database Connection Fails:**
```bash
# Check these:
- Database URL is correct and accessible
- IP whitelisting includes Render IPs
- SSL is properly configured
- Database user has proper permissions
```

**Service Won't Start:**
```bash
# Check start command and logs
# Common issues:
- Missing environment variables
- Prisma migration failures
- Port conflicts
```

### Frontend Issues

**Build Fails:**
```bash
# Check:
- Next.js build command is correct
- All dependencies are installed
- No TypeScript errors
```

**API Connection Fails:**
```bash
# Verify:
- NEXT_PUBLIC_API_URL is correct
- Backend is running and accessible
- CORS is properly configured
```

### Common Error Messages

**"Database connection failed"**
- ❌ Database URL incorrect
- ❌ IP not whitelisted
- ❌ SSL configuration issue

**"Prisma migration failed"**
- ❌ Database user lacks permissions
- ❌ Database schema conflicts
- ❌ Network connectivity issue

**"CORS error"**
- ❌ FRONTEND_URL not updated in backend
- ❌ Wrong domain in environment variables

---

## 🎉 Step 8: Success!

If everything worked, you now have:

### 🌐 Live URLs
- **Frontend**: `https://spark-frontend.onrender.com`
- **Backend API**: `https://spark-backend.onrender.com`
- **Health Check**: `https://spark-backend.onrender.com/health`

### 🔄 Automatic Deployments
- Push to `main` branch → Automatic deployment
- Zero-downtime deployments
- Build logs and monitoring included

### 💰 Current Costs
- **Free Tier**: $0/month (with sleep after 15 min inactivity)
- **Paid Tier**: $14/month ($7 each for backend + frontend)
- **Plus your existing database costs**

---

## 🚀 Next Steps

### Optional Enhancements

1. **Custom Domains**
   - Add your own domain in service settings
   - Configure DNS records as instructed

2. **Environment Promotion**
   - Upgrade to paid plans for production
   - Enable persistent storage and faster builds

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Enable log aggregation

### Maintenance

**Regular Updates:**
```bash
git push origin main  # Triggers automatic deployment
```

**Monitor Services:**
- Check service dashboards for performance
- Monitor build times and error rates
- Review logs for any issues

---

## 📞 Need Help?

**If you encounter issues:**

1. **Check service logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Test database connection** with the provided script
4. **Review the troubleshooting section** above

**Additional Resources:**
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Full Deployment Guide](./RENDER_DEPLOYMENT.md)

---

## 🎊 Congratulations!

Your Spark application is now live on Render.com! 🚀

Share your live URLs:
- **App**: `https://spark-frontend.onrender.com`
- **API**: `https://spark-backend.onrender.com`