# 🚀 Deployment Guide

## Pre-Deployment Checklist

- [x] All tests passing
- [x] No console errors
- [x] Environment variables configured
- [x] Database migrations complete
- [x] API documentation updated
- [x] Error handling comprehensive
- [x] Loading states working
- [x] Mobile responsive tested

## Frontend Deployment (Vercel)

### Step 1: Prepare Build
```bash
cd frontend
npm run build
npm run preview  # Test production build locally
```

### Step 2: Deploy to Vercel
```bash
# Option A: Via Vercel CLI
npm install -g vercel
vercel

# Option B: Via GitHub (Recommended)
# 1. Push to GitHub
# 2. Connect repo to Vercel
# 3. Auto-deploys on every push to main
```

### Step 3: Configure Environment
Set in Vercel Dashboard:
```
VITE_API_URL=https://your-backend-url/api/v1
```

### Step 4: Verify Deployment
- ✅ Frontend loads: https://your-app.vercel.app
- ✅ API calls work: Check Network tab
- ✅ Auth flow works: Login → Dashboard
- ✅ Data persists: Create task → refresh → still there

---

## Backend Deployment (Railway / Render)

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Sign up at railway.app
   - Connect GitHub repo

2. **Create PostgreSQL Service**
   - New → Database → PostgreSQL
   - Note the DATABASE_URL

3. **Create Node.js Service**
   - New → GitHub repo (backend folder)
   - Set environment variables:
     ```
     DATABASE_URL=<from step 2>
     JWT_SECRET=<generate-strong-secret>
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway auto-deploys on push

### Option 2: Render

1. **Create Account** at render.com

2. **Create PostgreSQL**
   - New → PostgreSQL
   - Save connection string

3. **Create Web Service**
   - New → Web Service → GitHub repo
   - Build command: `cd backend && npm install`
   - Start command: `npm run prod`
   - Environment: Same as above

4. **Deploy** - Done!

---

## Database Setup

### First-Time Setup
```bash
cd backend
npx ts-node init-db.ts
```

### Running Migrations
```bash
npx ts-node scripts/migrate.ts
```

### Backing Up Database
```bash
# Local backup
pg_dump gpa > backup.sql

# Restore
psql gpa < backup.sql
```

---

## Post-Deployment Verification

### API Health Check
```bash
curl https://your-backend-url/health
# Expected: { status: "ok" }
```

### Test Auth Flow
```bash
# 1. Register
curl -X POST https://your-backend-url/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass"}'

# 2. Login
curl -X POST https://your-backend-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'

# 3. Get projects (use token from login)
curl -H "Authorization: Bearer <token>" \
  https://your-backend-url/api/v1/projects
```

### Monitor Performance
- Check Vercel Analytics dashboard
- Review Railway/Render logs for errors
- Monitor database performance

---

## Troubleshooting

### Frontend Issues

**Blank page**
- Check browser console for errors
- Verify VITE_API_URL points to correct backend
- Clear cache (Cmd+Shift+R)

**API calls failing**
- Check Network tab for response status
- Verify backend is running
- Check CORS headers

### Backend Issues

**Database connection error**
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure firewall allows connections

**Port conflicts**
- Change PORT in environment
- Check no other service on that port

---

## Scaling

### Vertical Scaling
- Increase server CPU/RAM
- Available on Railway/Render dashboard

### Horizontal Scaling (Future)
- Multiple backend instances behind load balancer
- Connection pooling for database
- Redis caching layer

---

## CI/CD Pipeline (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Security Checklist

- [x] Environment variables not in code
- [x] HTTPS enabled on all endpoints
- [x] Password hashing in place
- [x] JWT secrets strong (32+ chars)
- [x] Database backups automated
- [x] Rate limiting enabled
- [x] CORS properly configured

---

## Support

Need help? 
- Check logs in deployment dashboard
- Review error messages in console
- Open GitHub issue for bugs
