# ✅ Render.com Deployment Checklist

## Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Render account created and GitHub connected
- [ ] Database URL ready and tested
- [ ] Database whitelist configured with Render IPs

## Environment Variables Generation
- [ ] Run: `node scripts/generate-env-vars.js`
- [ ] Copy JWT secret and other values

## Backend Deployment
- [ ] Create Web Service on Render
- [ ] Repository: Your GitHub repo
- [ ] Name: `spark-backend`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm ci && npx prisma generate && npm run build`
- [ ] Start Command: `npx prisma migrate deploy && npm run start:prod`
- [ ] Environment Variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=your-database-url`
  - [ ] `JWT_SECRET=generated-secret`
  - [ ] `PORT=3000`
  - [ ] `FRONTEND_URL=https://spark-frontend.onrender.com`
- [ ] Deploy and verify health check works

## Frontend Deployment
- [ ] Create Web Service on Render
- [ ] Repository: Same GitHub repo
- [ ] Name: `spark-frontend`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm ci && npm run build`
- [ ] Start Command: `npm start`
- [ ] Environment Variables:
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_API_URL=https://spark-backend.onrender.com`
  - [ ] `PORT=3001`
- [ ] Deploy and verify app loads

## Post-Deployment
- [ ] Update backend FRONTEND_URL if needed
- [ ] Test health check: `https://spark-backend.onrender.com/health`
- [ ] Test app functionality: registration, login, create idea
- [ ] Verify database integration working

## Final URLs
- Frontend: `https://spark-frontend.onrender.com`
- Backend: `https://spark-backend.onrender.com`
- Health: `https://spark-backend.onrender.com/health`

## If Something Goes Wrong
1. Check service logs in Render dashboard
2. Verify environment variables
3. Test database connection with: `node scripts/check-database-connection.js`
4. Review troubleshooting section in deployment guide