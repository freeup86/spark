# 🚀 Spark - Render.com Deployment Guide

This guide will walk you through deploying the Spark application to Render.com, a modern cloud platform that makes it easy to deploy full-stack applications.

## 📋 Prerequisites

- GitHub account with your Spark repository
- Render.com account (free tier available)
- Your code pushed to a GitHub repository

## 🏗️ Architecture on Render

The Spark application will be deployed as:
1. **External PostgreSQL Database** (Your existing database)
2. **Backend API Service** (NestJS application)
3. **Frontend Web Service** (Next.js application)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your External Database

1. **Database Requirements**
   - PostgreSQL 12+ (your existing database)
   - Network access from Render.com
   - SSL support enabled (recommended)

2. **Configure Database Access**
   - **For Cloud Databases** (Aiven, Neon, Supabase, etc.):
     - Allow connections from `0.0.0.0/0` or Render IP ranges
     - Ensure SSL is enabled
   - **For Self-hosted Databases**:
     - Configure firewall to allow Render IP ranges
     - Ensure database is accessible from the internet
     - Enable SSL connections

3. **Get Your Database URL**
   - Format: `postgresql://username:password@host:port/database?sslmode=require`
   - Example: `postgresql://spark_user:your_password@your-db-host.com:5432/spark?sslmode=require`

### Step 2: Deploy Backend API Service

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository containing the Spark code
   - Fill in the details:
     - **Name**: `spark-backend`
     - **Region**: Same as your database
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm ci && npx prisma generate && npm run build`
     - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
     - **Plan**: Free (for testing) or Starter ($7/month)

2. **Configure Environment Variables**
   Add these environment variables in the Render dashboard:
   
   ```
   NODE_ENV=production
   DATABASE_URL=[Your External Database URL from Step 1]
   JWT_SECRET=[Generate a secure random string - at least 32 characters]
   PORT=3000
   FRONTEND_URL=https://spark-frontend.onrender.com
   ```

   To generate environment variables:
   ```bash
   node scripts/generate-env-vars.js
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete (5-10 minutes)
   - Your backend will be available at `https://spark-backend.onrender.com`

### Step 3: Deploy Frontend Web Service

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect the same GitHub repository
   - Fill in the details:
     - **Name**: `spark-frontend`
     - **Region**: Same as backend
     - **Branch**: `main`
     - **Root Directory**: `frontend`
     - **Runtime**: `Node`
     - **Build Command**: `npm ci && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (for testing) or Starter ($7/month)

2. **Configure Environment Variables**
   Add these environment variables:
   
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://spark-backend.onrender.com
   PORT=3001
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Step 4: Update Backend CORS

After frontend deployment, update the backend environment variables:

1. Go to your backend service in Render dashboard
2. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://spark-frontend.onrender.com
   ```
3. The backend will automatically redeploy

## 🔧 Alternative: One-Click Deployment

You can also use this deploy button (after setting up the repository):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🌐 Custom Domains (Optional)

To use custom domains:

1. **For Frontend**:
   - Go to your frontend service → Settings → Custom Domains
   - Add your domain (e.g., `app.yourdomain.com`)
   - Update DNS records as instructed

2. **For Backend**:
   - Go to your backend service → Settings → Custom Domains
   - Add your API domain (e.g., `api.yourdomain.com`)
   - Update frontend environment variable `NEXT_PUBLIC_API_URL`

## 📊 Environment Variables Reference

### Backend Service
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-external-host:port/database?sslmode=require
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
PORT=3000
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Frontend Service
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
PORT=3001
```

## 🔒 Database Security Configuration

### IP Whitelisting for External Database

Since you're using an external database, you need to allow Render's IP addresses:

1. **Render IP Ranges** (as of 2024):
   ```
   3.132.201.78/32
   18.222.227.148/32
   18.191.251.175/32
   35.174.176.244/32
   3.226.148.102/32
   18.205.222.128/32
   ```

2. **Database Provider Configuration**:
   - **Aiven**: Add these IPs to "Allowed IP Addresses"
   - **Neon**: Add to "IP Allow" list in settings
   - **Supabase**: Add to "Network Restrictions"
   - **Railway**: Usually allows all connections by default
   - **Self-hosted**: Configure firewall/security groups

3. **Alternative (Less Secure)**:
   - Allow all IPs: `0.0.0.0/0`
   - Only use if your database has strong authentication

### SSL Configuration

Ensure your database URL includes SSL parameters:
```
postgresql://user:pass@host:port/db?sslmode=require
```

For additional security:
```
postgresql://user:pass@host:port/db?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem
```

## 🔄 Automatic Deployments

Render automatically deploys when you push to your connected branch:

1. **Push to GitHub**: `git push origin main`
2. **Automatic Build**: Render detects changes and rebuilds
3. **Zero-Downtime Deploy**: New version goes live automatically

## 📈 Monitoring and Logs

### View Logs
- Go to your service dashboard
- Click "Logs" tab to see real-time logs
- Use filters to search for specific events

### Health Checks
- Backend health: `https://your-backend.onrender.com/health`
- Frontend health: `https://your-frontend.onrender.com` (should load the app)

### Metrics
- View performance metrics in the service dashboard
- Monitor response times, error rates, and resource usage

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Render dashboard
   # Common fixes:
   - Ensure package.json has all dependencies
   - Check Node.js version compatibility
   - Verify build commands are correct
   ```

2. **Database Connection Issues**
   ```bash
   # Verify DATABASE_URL is correct
   # Check database service is running
   # Ensure backend and database are in same region
   ```

3. **CORS Errors**
   ```bash
   # Update FRONTEND_URL in backend environment variables
   # Ensure frontend URL is correct and accessible
   ```

4. **Environment Variable Issues**
   ```bash
   # Double-check all required environment variables
   # Ensure no trailing spaces or special characters
   # Redeploy after changing environment variables
   ```

### Free Tier Limitations

- **Free services sleep after 15 minutes of inactivity**
- **750 hours per month total across all free services**
- **500MB memory limit**
- **Cold start delays** (first request after sleep takes 30+ seconds)

For production use, consider upgrading to paid plans.

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong, unique JWT secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use strong database passwords
   - Enable SSL connections
   - Regular backups (automatic on Render)

3. **CORS Configuration**
   - Only allow your frontend domain
   - Don't use wildcard (*) in production

## 💰 Cost Estimation

### Free Tier (Testing)
- Database: Your existing database (cost depends on your provider)
- Backend: Free (750 hours/month)
- Frontend: Free (750 hours/month)
- **Render Total**: $0/month + your database costs

### Production Tier
- Database: Your existing database (cost depends on your provider)
- Backend: Starter ($7/month - 512MB RAM, no sleep)
- Frontend: Starter ($7/month - 512MB RAM, no sleep)
- **Render Total**: $14/month + your database costs

### Database Cost Examples
- **Aiven**: $19/month (Basic plan)
- **Neon**: $19/month (Scale plan)
- **Supabase**: $25/month (Pro plan)
- **Railway**: $5/month (Hobby plan)
- **Self-hosted**: $5-20/month (VPS costs)

## 🚀 Performance Optimization

1. **Enable Caching**
   - Add Redis service for session caching
   - Configure response caching

2. **Database Optimization**
   - Upgrade to larger database plan if needed
   - Monitor query performance

3. **CDN Integration**
   - Use Render's CDN for static assets
   - Optimize images and assets

## 📞 Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)

## 🎉 Success!

Once deployed, your Spark application will be live at:
- **Frontend**: `https://spark-frontend.onrender.com`
- **Backend API**: `https://spark-backend.onrender.com`
- **Health Check**: `https://spark-backend.onrender.com/health`

Your application is now ready for users! 🚀