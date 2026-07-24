# Complete Setup Guide - GPA Tracker

This guide walks you through setting up the entire GPA Tracker project from scratch.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```

- **PostgreSQL** 13+ (Database)
  - macOS: `brew install postgresql`
  - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`
  - Windows: [Download Installer](https://www.postgresql.org/download/windows/)
  - Or use cloud: [Neon](https://neon.tech/) (recommended, free tier)

- **Git** ([Download](https://git-scm.com/))

- **npm** (comes with Node.js)

---

## 🚀 Step 1: Clone the Repository

```bash
git clone https://github.com/nirvair09/Group-Project-Accountability-Tracker.git
cd Group-Project-Accountability-Tracker
```

---

## 🗄️ Step 2: Set Up the Database

### Option A: Local PostgreSQL

1. **Create the database:**
   ```bash
   createdb gpa
   ```

2. **Get your DATABASE_URL:**
   ```bash
   # Local PostgreSQL (default)
   postgresql://postgres:password@localhost:5432/gpa
   
   # Replace 'password' with your PostgreSQL password
   ```

### Option B: Neon (Cloud, Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

---

## 🔧 Step 3: Configure Backend Environment Variables

Create `.env` files for each backend service:

**backend/services/gateway/.env**
```bash
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=120
```

**backend/services/auth-service/.env**
```bash
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d
```

**backend/services/project-service/.env**
```bash
PORT=4002
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**backend/services/task-service/.env**
```bash
PORT=4003
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## 🗄️ Step 4: Initialize the Database Schema

```bash
cd backend

# Install dependencies
npm install

# Run database initialization script
npx ts-node init-db.ts
# Or if using JavaScript:
node init-db.js
```

This creates all tables:
- `users`
- `projects`
- `project_members`
- `tasks`
- `evidence_events`

---

## 📦 Step 5: Install Dependencies

### Backend Dependencies
```bash
cd backend
npm run install:all
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

---

## ▶️ Step 6: Start the Backend Services

Open **Terminal 1**:

```bash
cd backend
npm run dev
```

This starts 4 services on ports 4000-4003. Wait for:
```
GATEWAY: Server running on port 4000
AUTH: Server running on port 4001
PROJECT: Server running on port 4002
TASK: Server running on port 4003
```

---

## ▶️ Step 7: Start the Frontend

Open **Terminal 2**:

```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

---

## ✅ Step 8: Verify the Setup

### Test Backend Health
```bash
curl http://localhost:4000/health/live
```

### Test Frontend
Open your browser to:
```
http://localhost:5173/
```

You should see the login page.

---

## 🔐 Step 9: Create Your First User

1. Go to `http://localhost:5173/register`
2. Create an account with:
   - **Email**: your-email@example.com
   - **Password**: secure-password
   - **Name**: Your Name
3. Click "Sign Up"

You should be redirected to the Dashboard.

---

## 🧪 Step 10: Run Tests (Optional)

```bash
cd backend
npm test
```

---

## 🎯 Quick Start Summary

```bash
# Terminal 1: Backend
cd backend
npm install
npx ts-node init-db.ts
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173 in your browser
```

---

## 🐛 Troubleshooting

### Database connection refused
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Ubuntu
```

### Port already in use
```bash
lsof -i :4000
kill -9 <PID>
```

### Cannot find module '@gpa/shared'
```bash
cd backend
npm install
npm run install:all
```

### CORS error
- Check CORS_ORIGIN in gateway .env is `http://localhost:5173`
- Ensure backend is running on ports 4000-4003

---

## 📁 Project Structure

```
backend/
├── services/
│   ├── gateway/          # API Gateway (port 4000)
│   ├── auth-service/     # Auth Service (port 4001)
│   ├── project-service/  # Project Service (port 4002)
│   └── task-service/     # Task Service (port 4003)
├── shared/               # Shared utilities
└── tests/                # Integration tests

frontend/
├── src/
│   ├── pages/            # React pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── api/              # API client

docs/
├── RESUME_HIGHLIGHTS.md
└── SETUP.md
```

---

## 📚 Learn More

- **Setup**: This file (SETUP.md)
- **Docker**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- **Resume**: [RESUME_HIGHLIGHTS.md](./RESUME_HIGHLIGHTS.md)
- **Architecture**: [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)

---

Good luck! 🚀
