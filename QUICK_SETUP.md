# ⚡ Quick Setup (5 Minutes)

TL;DR version. For detailed setup, see [docs/SETUP.md](docs/SETUP.md).

---

## 1️⃣ Prerequisites

Check Node.js is installed:
```bash
node --version    # Need v18+
```

Install PostgreSQL:
- macOS: `brew install postgresql`
- Ubuntu: `sudo apt-get install postgresql`
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

---

## 2️⃣ Clone & Navigate

```bash
git clone https://github.com/nirvair09/Group-Project-Accountability-Tracker.git
cd Group-Project-Accountability-Tracker
```

---

## 3️⃣ Setup Database

```bash
# Create database
createdb gpa

# Your DATABASE_URL:
# postgresql://postgres:password@localhost:5432/gpa
# (Replace 'password' with your actual PostgreSQL password)
```

Or use **Neon** (cloud): [neon.tech](https://neon.tech)

---

## 4️⃣ Configure Services

Create these `.env` files:

**`backend/services/gateway/.env`**
```
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=120
```

**`backend/services/auth-service/.env`**
```
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=secret-key-123
JWT_EXPIRY=7d
```

**`backend/services/project-service/.env`**
```
PORT=4002
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=secret-key-123
```

**`backend/services/task-service/.env`**
```
PORT=4003
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa
JWT_SECRET=secret-key-123
```

---

## 5️⃣ Initialize Database

```bash
cd backend
npm install
npx ts-node init-db.ts  # or: node init-db.js
```

---

## 6️⃣ Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Wait for all services to start.

---

## 7️⃣ Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

---

## 8️⃣ Open & Register

1. Open: `http://localhost:5173`
2. Register a new account
3. Done! 🎉

---

## ✅ Verify

```bash
# Test backend
curl http://localhost:4000/health/live
```

---

## 🐛 Common Fixes

| Problem | Solution |
|---------|----------|
| Database refused | `brew services start postgresql` |
| Port in use | `lsof -i :4000` → `kill -9 <PID>` |
| Missing module | `cd backend && npm install` |
| CORS error | Check CORS_ORIGIN in gateway .env |

---

## 📚 Full Setup

Need more details? See [docs/SETUP.md](docs/SETUP.md)

---

**That's it!** Everything should be running now. 🚀
