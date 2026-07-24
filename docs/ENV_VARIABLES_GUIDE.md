# Environment Variables - Complete Guide

Where to get each `.env` variable and what values to use.

---

## 📋 Summary Table

| Variable | Where to Get | Example | Required? |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | PostgreSQL or Neon | See below | ✅ YES |
| `JWT_SECRET` | Create yourself | `abc123xyz789` | ✅ YES |
| `JWT_EXPIRY` | Create yourself | `7d` | ✅ YES |
| `PORT` | You decide | `4001` | ✅ YES |
| `NODE_ENV` | You set | `development` or `production` | ✅ YES |
| `CORS_ORIGIN` | Your frontend URL | `http://localhost:5173` | ✅ YES |
| `RATE_LIMIT_MAX` | You decide | `120` | ⚠️ Optional |

---

## 🗄️ Getting DATABASE_URL

### Option 1: Local PostgreSQL (Free, Easy for Development)

**Step 1: Install PostgreSQL**
- **macOS**: `brew install postgresql`
- **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**Step 2: Start PostgreSQL**
```bash
# macOS
brew services start postgresql

# Ubuntu
sudo service postgresql start

# Windows - should start automatically
```

**Step 3: Create Database**
```bash
createdb gpa
```

**Step 4: Get CONNECTION STRING**
```bash
# Default local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa

# Replace 'password' with your PostgreSQL password
# If no password, use:
DATABASE_URL=postgresql://postgres@localhost:5432/gpa
```

---

### Option 2: Neon (Cloud PostgreSQL - Recommended)

**Step 1: Sign Up**
- Go to [neon.tech](https://neon.tech)
- Click "Sign Up"
- Use GitHub or email to create account

**Step 2: Create Project**
- Click "New Project"
- Give it a name (e.g., "gpa-tracker")
- Select region closest to you
- Click "Create Project"

**Step 3: Get Connection String**
- After project is created, you'll see a connection string
- It looks like:
  ```
  postgresql://neon_user:password@ep-xyz.neon.tech/gpa?sslmode=require
  ```
- Click "Copy" button or select and copy the URL

**Step 4: Use as DATABASE_URL**
```bash
DATABASE_URL=postgresql://neon_user:password@ep-xyz.neon.tech/gpa?sslmode=require
```

---

### Option 3: Other Cloud Databases

**AWS RDS**
- Sign up: [aws.amazon.com](https://aws.amazon.com)
- Create RDS instance
- Connection string in "Endpoint" section

**Railway**
- Sign up: [railway.app](https://railway.app)
- Create PostgreSQL service
- Connection string in "Variables" section

**Render**
- Sign up: [render.com](https://render.com)
- Create PostgreSQL service
- Connection string provided

---

## 🔑 Getting JWT_SECRET

**This is something YOU create.** No website needed.

**Step 1: Create a random string**

Option A: Use OpenSSL
```bash
openssl rand -base64 32
# Output: abc123xyz789kdfj4934kjsdf...
```

Option B: Use Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Option C: Just make one up
```bash
JWT_SECRET=my-super-secret-key-change-in-production-12345
```

**Step 2: Use same secret in all services**
- `auth-service/.env`: JWT_SECRET=abc123xyz789
- `project-service/.env`: JWT_SECRET=abc123xyz789
- `task-service/.env`: JWT_SECRET=abc123xyz789

**⚠️ IMPORTANT**: Keep this secret! Don't commit to GitHub. It's in `.gitignore` already.

---

## ⏱️ Getting JWT_EXPIRY

**No website needed.** This is just a time duration you decide.

Common values:
```bash
JWT_EXPIRY=7d      # 7 days (good for development)
JWT_EXPIRY=24h     # 24 hours
JWT_EXPIRY=1h      # 1 hour (very secure)
JWT_EXPIRY=30d     # 30 days (less secure)
```

Use: `7d` for development

---

## 🌐 Getting CORS_ORIGIN

**This is your frontend URL.** No website needed.

For **local development**:
```bash
CORS_ORIGIN=http://localhost:5173
```

For **production** (when deployed):
```bash
# If frontend is on example.com
CORS_ORIGIN=https://example.com

# If frontend is on subdomain
CORS_ORIGIN=https://app.example.com

# Multiple origins (separate with comma)
CORS_ORIGIN=https://example.com,https://app.example.com
```

---

## 🔌 Getting PORT

**No website needed.** Just pick a number that's not in use.

Standard ports:
```bash
# Gateway (main API entry point)
PORT=4000

# Auth Service
PORT=4001

# Project Service
PORT=4002

# Task Service
PORT=4003

# Frontend (Vite default)
PORT=5173
```

Check if port is in use:
```bash
# macOS/Linux
lsof -i :4000

# Windows
netstat -ano | findstr :4000
```

---

## 🏗️ Getting NODE_ENV

**No website needed.** Just use one of these values:

```bash
# For development (shows error details, hot reload)
NODE_ENV=development

# For production (optimized, hides errors)
NODE_ENV=production

# For testing
NODE_ENV=test
```

Use: `development` for local setup

---

## 🚦 Getting RATE_LIMIT_MAX

**No website needed.** This is just a number.

Number of requests allowed per minute:
```bash
# Development (no limit pressure)
RATE_LIMIT_MAX=1000

# Production (reasonable limit)
RATE_LIMIT_MAX=120

# Strict (limit abuse)
RATE_LIMIT_MAX=60
```

Use: `120` for development

---

## 📝 Complete .env File Templates

### backend/services/gateway/.env
```bash
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=120
```

### backend/services/auth-service/.env
```bash
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=my-super-secret-key-change-this-in-production
JWT_EXPIRY=7d
```

### backend/services/project-service/.env
```bash
PORT=4002
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=my-super-secret-key-change-this-in-production
```

### backend/services/task-service/.env
```bash
PORT=4003
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=my-super-secret-key-change-this-in-production
```

---

## 🎯 Step-by-Step Setup Example

### 1. Get DATABASE_URL from Neon

1. Go to [neon.tech](https://neon.tech)
2. Sign up
3. Create project
4. Copy connection string:
   ```
   postgresql://user:pass@host/dbname
   ```

### 2. Create JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output: abc123xyz...
```

### 3. Create .env files

**gateway/.env**
```
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=120
```

**auth-service/.env**
```
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=abc123xyz...
JWT_EXPIRY=7d
```

**project-service/.env**
```
PORT=4002
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=abc123xyz...
```

**task-service/.env**
```
PORT=4003
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=abc123xyz...
```

### 4. Ready to go!

```bash
npm install
npx ts-node init-db.ts
npm run dev
```

---

## 🔗 Quick Links to Websites

| Service | Website | What It Does |
|---------|---------|-------------|
| **Neon** | [neon.tech](https://neon.tech) | Cloud PostgreSQL (recommended) |
| **PostgreSQL** | [postgresql.org](https://www.postgresql.org) | Local database |
| **AWS RDS** | [aws.amazon.com](https://aws.amazon.com) | Cloud database |
| **Railway** | [railway.app](https://railway.app) | Cloud database |
| **Render** | [render.com](https://render.com) | Cloud database |

---

## ⚠️ Security Notes

1. **Never commit .env files to GitHub**
   - They're already in `.gitignore`
   - Check: `git status` should not show .env files

2. **Use strong JWT_SECRET in production**
   ```bash
   # Bad
   JWT_SECRET=123456
   JWT_SECRET=password
   
   # Good
   JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

3. **Change DATABASE_URL password in production**
   - Don't use default PostgreSQL password
   - Create new user with strong password

4. **Use HTTPS in production**
   - Set CORS_ORIGIN to https://your-domain.com
   - Not http://

---

## ✅ Checklist Before Starting

- [ ] DATABASE_URL set and tested (`psql $DATABASE_URL`)
- [ ] JWT_SECRET created and same across all services
- [ ] PORT numbers are all different (4000, 4001, 4002, 4003)
- [ ] NODE_ENV set to `development`
- [ ] CORS_ORIGIN set to `http://localhost:5173`
- [ ] All .env files created in correct folders
- [ ] .gitignore includes .env files
- [ ] No .env files in git: `git status`

---

## 🆘 Troubleshooting

### "DATABASE_URL is invalid"
- Check connection string format
- Test with: `psql $DATABASE_URL`
- Make sure database exists

### "JWT_SECRET too weak"
- Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Make sure it's the same in all services

### "CORS error"
- Check CORS_ORIGIN matches your frontend URL
- Frontend on 5173? Use: `http://localhost:5173`

### "Port already in use"
- Kill process: `lsof -i :4000` then `kill -9 <PID>`
- Or change PORT in .env

---

Need help? See [SETUP.md](./SETUP.md) for full setup guide.
