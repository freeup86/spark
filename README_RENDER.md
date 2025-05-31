# 🚀 Deploy Spark to Render.com

## 📋 Step-by-Step Deployment

**New to Render? Start here:**
👉 **[STEP_BY_STEP_RENDER_DEPLOY.md](./STEP_BY_STEP_RENDER_DEPLOY.md)** 👈

## 🚀 Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/spark)

## 📝 Pre-Deployment Check

Run this to verify you're ready:
```bash
node scripts/pre-deploy-check.js
```

## 🔧 Manual Setup

1. **Generate Environment Variables**
   ```bash
   node scripts/generate-env-vars.js
   ```

2. **Test Database Connection**
   ```bash
   node scripts/check-database-connection.js "your-database-url"
   ```

3. **Create Services on Render.com**
   - Backend: Web Service (using your external database)
   - Frontend: Web Service

## 📚 Documentation

- **📋 [Step-by-Step Guide](./STEP_BY_STEP_RENDER_DEPLOY.md)** - Complete walkthrough
- **✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Quick reference
- **📖 [Full Documentation](./RENDER_DEPLOYMENT.md)** - Detailed guide

## Service Configuration

### Database
- **Type**: Your External PostgreSQL Database
- **Requirements**: PostgreSQL 12+, SSL support, network access

### Backend
- **Build Command**: `cd backend && npm ci && npx prisma generate && npm run build`
- **Start Command**: `cd backend && npx prisma migrate deploy && npm run start:prod`
- **Health Check**: `/health`

### Frontend
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Start Command**: `cd frontend && npm start`

## Environment Variables

Run the generator to get your environment variables:
```bash
node scripts/generate-env-vars.js
```

## Cost

- **Free Tier**: $0/month for Render services + your database costs
- **Production**: $14/month for Render services + your database costs

## Database Connection Test

Before deploying, test your database connection:
```bash
node scripts/check-database-connection.js "your-database-url"
```

## Support

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for troubleshooting and detailed instructions.