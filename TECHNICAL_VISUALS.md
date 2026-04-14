# 📊 Deep Technical Summary - Visuals & Diagrams

## 1. Cache Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND CACHE SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

User Action: "View My Tasks"
    ↓
apiFetch("GET /tasks/mine")
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 1: Check Method                                         │
│ method = "GET"  ✓                                           │
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: Check Cache                                          │
│ cacheKey = "GET:/tasks/mine"                                │
│ entry = cache.get(cacheKey)                                 │
└──────────────────────────────────────────────────────────────┘
    ↓
    ├─────────────────────────┬──────────────────────────┐
    │                         │                          │
    ↓                         ↓
┌─────────────────────┘   ┌──────────────────┘
│ CACHE HIT            │   │ CACHE MISS
│ (data exists AND      │   │ (no data OR
│  age < 5 minutes)     │   │  age ≥ 5 minutes)
│                       │   │
│ ✓ Return data        │   │ ✗ Delete stale
│   instantly          │   │ ✗ Fetch from server
│   (~0ms)            │   │ ✗ setCached(newData)
│                       │   │ ✗ Return data (~80ms)
└───────────────────────┘   └──────────────────────────┘
      ↓                             ↓
   Response to user (instant)   Response to user (80ms)

───────────────────────────────────────────────────────────────

User Action: "Create Task" (POST)
    ↓
apiFetch("POST /tasks", {method: "POST", body: {...}})
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 1: Check Method                                         │
│ method = "POST"  ✓ (not GET)                               │
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: Clear Cache                                          │
│ clearCache() → cache.clear()                                │
│ All entries deleted (empty Map)                             │
└──────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Make Request                                         │
│ No cache check for POST requests                            │
│ Fetch from server (always fresh)                            │
└──────────────────────────────────────────────────────────────┘
    ↓
Response to user

───────────────────────────────────────────────────────────────

Cache Memory Layout:

Before any requests:
  cache = {}  ← Empty Map

After GET /tasks/mine (cache miss → fetch → cache):
  cache = {
    "GET:/tasks/mine": {
      data: [{ task1 }, { task2 }, ...],
      timestamp: 1713052800000
    }
  }

After GET /projects/123 (cache hit):
  cache = {
    "GET:/tasks/mine": { ... },
    "GET:/projects/123": {
      data: { projectId, name, ownerId },
      timestamp: 1713052810000
    }
  }

After POST /tasks (mutation):
  cache = {}  ← Cleared!

Next GET /tasks/mine (cache miss, needs refresh):
  Fetch from server, cache new response
```

---

## 2. Database Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│                  (Centralized Schema)                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      users           │  Master table
├──────────────────────┤
│ id (UUID, PK)        │ ──┐
│ name                 │   │
│ email (UNIQUE)       │   │
│ password (hashed)    │   │
│ role                 │   │
│ createdAt            │   │
└──────────────────────┘   │
  ▲         ▲              │
  │         │              │
  │    ┌────┴──────────────┘
  │    │
  │    ↓
  │ ┌─────────────────────┐
  │ │   projects          │  Owned by one user
  │ ├─────────────────────┤
  │ │ projectId (UUID)    │
  │ │ name                │
  │ │ ownerId (FK→users)  │ ───────┘
  │ │ createdAt           │
  │ └─────────────────────┘
  │       ▲    ▲
  │       │    └─────────────┐
  │  ┌────┴────────────────┐ │
  │  │                     │ │
  │  ↓                     ↓ ↓
  │ ┌─────────────────────────────────┐
  │ │  project_members                │  Bridge table (N:M)
  │ ├─────────────────────────────────┤
  │ │ (projectId, userId) COMPOSITE   │
  │ │ role                            │
  │ │ joinedAt                        │
  │ └─────────────────────────────────┘
  │
  └─────────────────────────┐
                            │
        ┌───────────────────┘
        ↓
    ┌──────────────────────┐
    │      tasks           │  Assigned to users
    ├──────────────────────┤
    │ taskId (UUID)        │
    │ projectId (FK)       │ ─────────────→ projects
    │ ownerId (FK)         │ ─────────────→ users.id
    │ title                │
    │ status               │ ──┐
    │ deadline             │   │
    │ createdAt            │   │
    └──────────────────────┘   │
        ▲                       │
        │                       ↓
        │ triggers         ┌─────────────────────────┐
        └─────────────────→│  evidence_events        │ ⭐ AUDIT LOG
                          ├─────────────────────────┤
                          │ event_id (UUID)         │
                          │ project_id (FK)         │
                          │ user_id (FK)            │
                          │ type (VARCHAR)          │
                          │ source (VARCHAR)        │
                          │ timestamp (NOW())       │
                          │ metadata (JSONB)        │
                          └─────────────────────────┘
                             (Append-only table)
                             (Never DELETE/UPDATE)
```

---

## 3. Query Types by Table

```
┌────────────────────────────────────────────────────────────────┐
│ Read Operations (GET)                                          │
└────────────────────────────────────────────────────────────────┘

users:
  - SELECT * FROM users WHERE email = $1       [LOGIN]
  - SELECT * FROM users WHERE id = $1          [GET USER]

projects:
  - SELECT * FROM projects WHERE projectId = $1 [GET PROJECT]
  - SELECT p.* FROM projects p 
    JOIN project_members pm ON p.projectId = pm.projectId
    WHERE pm.userId = $1                       [MY PROJECTS]

project_members:
  - SELECT u.* FROM users u
    JOIN project_members pm ON u.id = pm.userId
    WHERE pm.projectId = $1                    [TEAM MEMBERS]

tasks:
  - SELECT * FROM tasks WHERE projectId = $1   [PROJECT TASKS]
  - SELECT * FROM tasks WHERE ownerId = $1     [MY TASKS]
  - SELECT * FROM tasks WHERE taskId = $1      [GET TASK]

evidence_events:
  - SELECT * FROM evidence_events 
    WHERE project_id = $1 
    ORDER BY timestamp DESC                    [PROJECT TIMELINE]
  - SELECT * FROM evidence_events
    WHERE user_id = $1                         [USER ACTIVITY]

┌────────────────────────────────────────────────────────────────┐
│ Write Operations (POST/PATCH/DELETE)                           │
└────────────────────────────────────────────────────────────────┘

users:
  - INSERT INTO users (id, name, email, password, role, createdAt)
    VALUES ($1, $2, $3, $4, 'STUDENT', NOW()) [REGISTER]
  - UPDATE users SET ... WHERE id = $1        [RARELY USED]

projects:
  - INSERT INTO projects (projectId, name, ownerId, createdAt)
    VALUES ($1, $2, $3, NOW())                [CREATE PROJECT]

project_members:
  - INSERT INTO project_members (projectId, userId, role, joinedAt)
    VALUES ($1, $2, 'MEMBER', NOW())          [ADD MEMBER]

tasks:
  - INSERT INTO tasks (taskId, projectId, ownerId, title, status, deadline)
    VALUES ($1, $2, $3, $4, 'CREATED', $5)    [CREATE TASK]
  - UPDATE tasks SET status = $1 WHERE taskId = $2  [UPDATE STATUS]

evidence_events:
  - INSERT INTO evidence_events (event_id, project_id, user_id, type, 
    source, timestamp, metadata)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6)    [RECORD EVENT]
  ✗ Never UPDATE or DELETE!                   [IMMUTABLE]
```

---

## 4. Connection Pool Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│              NODE.JS APPLICATION                         │
└─────────────────────────────────────────────────────────┘
            │
            ↓
    ┌───────────────────────────────────────┐
    │   Pool Instance (created once)         │
    │   max: 20, min: 2, idleTimeout: 30s   │
    └───────────────────────────────────────┘
            │
    ┌───────┴────────────────────┐
    │                            │
    ↓                            ↓
IDLE CONNECTIONS            REQUEST QUEUE
(Available for use)         (Waiting for idle)

[Conn-1]━━━━━━━━━━━━━━━→ [Req-1]
[Conn-2]━━━━━━━━━━━━━━━→ [Req-2]  
[Conn-3]━━━━━━━━━━━━━━━→ [Req-3]
[Conn-4]   (busy)       [Req-4] ← waiting
[Conn-5]   (busy)       [Req-5] ← waiting
[Conn-6]   (idle)
[Conn-7]   (idle)
...
[Conn-20]  (idle)


Timeline Example (from Request 1):

T=0ms:   pool.query(sql, params)
         ↓
T=1ms:   Check for idle connection
         ✓ Conn-1 is idle → grab it
         ↓
T=2-12ms: Execute query on Conn-1
         (Typical query: ~10ms)
         ↓
T=13ms:  Return connection to idle pool
         Conn-1 back to idle state
         Ready for next request!

Result: No time wasted on connection creation/auth!


Scenario: 3 requests arrive simultaneously

T=0ms:   Request-1 → grabs Conn-1
         Request-2 → grabs Conn-2
         Request-3 → grabs Conn-3

T=0-12ms: All 3 execute in parallel!
         (Thanks to async event loop)

T=13ms:  All 3 return connections
         Pool still has 17 idle connections
```

---

## 5. Security Layers Diagram

```
┌────────────────────────────────────────────────┐
│           REQUEST ARRIVES AT SERVER             │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│ Layer 1: HTTPS/TLS                             │
│ ✓ Encrypts data in transit                     │
│ ✓ Prevents man-in-the-middle attacks          │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│ Layer 2: JWT AUTHENTICATION                    │
│ ✓ Extract token from Authorization header      │
│ ✓ Verify signature with secret key             │
│ ✓ Check expiration                             │
│ ✓ If invalid → 401 Unauthorized (STOP!)       │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│ Layer 3: REQUEST VALIDATION                    │
│ ✓ Check required fields present                │
│ ✓ Validate data types with Zod schema          │
│ ✓ If invalid → 400 Bad Request (STOP!)        │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│ Layer 4: AUTHORIZATION                         │
│ ✓ Check: req.userId === resource.ownerId?     │
│ ✓ Check: Is user a member of project?         │
│ ✓ If unauthorized → 403 Forbidden (STOP!)     │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│ Layer 5: DATABASE QUERY                        │
│ ✓ Use parameterized queries: $1, $2, ...      │
│ ✓ Prevents SQL injection                       │
│ ✓ Execute with ACID guarantees                 │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│ Layer 6: EVENT LOGGING                         │
│ ✓ Record action immutably                      │
│ ✓ Server timestamp (can't be faked)            │
│ ✓ Append-only (can't be modified)              │
└────────────────────────────────────────────────┘
    ↓
Response sent back to client
```

---

## 6. Task Lifecycle with Events

```
Task Creation Timeline:

2026-04-01 10:35:00
  Faculty creates task: "Design Database Schema"
  assignee: John (user-123)
  
  ↓ EVENT RECORDED
  
  event_id: evt-abc123
  type: TASK_CREATED
  timestamp: 2026-04-01 10:35:00
  metadata: { taskId: task-1, title: "Design Database Schema" }
  
  Database state:
    tasks.task-1: status = "CREATED"

─────────────────────────────────────────────────

2026-04-02 09:00:00 (1 day later)
  John clicks "Start Working"
  
  ↓ SERVICE CHECK
  
  if (task.ownerId !== userId) throw "Unauthorized"
  ✓ John is the owner, proceed
  
  ↓ DATABASE UPDATE
  
  UPDATE tasks SET status = "IN_PROGRESS"
  
  ↓ EVENT RECORDED
  
  event_id: evt-def456
  type: TASK_STATUS_CHANGED
  timestamp: 2026-04-02 09:00:00
  metadata: { 
    taskId: task-1,
    from: "CREATED",
    to: "IN_PROGRESS"
  }
  
  Database state:
    tasks.task-1: status = "IN_PROGRESS"

─────────────────────────────────────────────────

2026-04-05 14:00:00 (3 days later)
  John clicks "Submit Work"
  
  ↓ SERVICE CHECK
  ✓ Authorized
  
  ↓ DATABASE UPDATE
  
  UPDATE tasks SET status = "DONE"
  
  ↓ EVENT RECORDED
  
  event_id: evt-ghi789
  type: TASK_STATUS_CHANGED
  timestamp: 2026-04-05 14:00:00
  metadata: {
    taskId: task-1,
    from: "IN_PROGRESS",
    to: "DONE"
  }
  
  Database state:
    tasks.task-1: status = "DONE"

─────────────────────────────────────────────────

2026-04-05 14:30:00 (30 min later)
  Faculty reviews work and approves
  
  ↓ SERVICE CHECK
  Faculty can approve (they're the owner)
  
  ↓ DATABASE UPDATE
  
  UPDATE tasks SET status = "APPROVED"
  
  ↓ EVENT RECORDED
  
  event_id: evt-jkl012
  type: TASK_APPROVED
  timestamp: 2026-04-05 14:30:00
  metadata: {
    taskId: task-1,
    taskTitle: "Design Database Schema"
  }
  
  Database state:
    tasks.task-1: status = "APPROVED"

─────────────────────────────────────────────────

IMMUTABLE AUDIT TRAIL (evidence_events table):
[
  { event_id: evt-abc123, type: TASK_CREATED,          timestamp: 04-01 10:35:00 },
  { event_id: evt-def456, type: TASK_STATUS_CHANGED,   timestamp: 04-02 09:00:00, from: CREATED, to: IN_PROGRESS },
  { event_id: evt-ghi789, type: TASK_STATUS_CHANGED,   timestamp: 04-05 14:00:00, from: IN_PROGRESS, to: DONE },
  { event_id: evt-jkl012, type: TASK_APPROVED,         timestamp: 04-05 14:30:00 }
]

This timeline can NEVER be deleted or modified!
It's the "visible truth" proving John's work and timing.
```

---

## 7. Performance Comparison Table

```
┌─────────────────────────────────────────────────────────────┐
│              WITHOUT OPTIMIZATION                           │
├─────────────────────────────────────────────────────────────┤
│ User sends GET request                                      │
│ ↓                                                           │
│ Create new connection (50ms)                                │
│ Authenticate to database (20ms)                             │
│ Execute query (10ms)                                        │
│ Close connection (10ms)                                     │
│ ────────────────────────────────────────────────────────    │
│ Total per request: 90ms                                     │
│                                                             │
│ 100 GET requests/minute: 9000ms (9 seconds) wasted          │
└─────────────────────────────────────────────────────────────┘

                              vs

┌─────────────────────────────────────────────────────────────┐
│              WITH OUR OPTIMIZATIONS                         │
├─────────────────────────────────────────────────────────────┤
│ User sends GET request (first time)                         │
│ ↓                                                           │
│ Pool has idle connection (1ms)                              │
│ Execute query (10ms)                                        │
│ Return connection to pool (1ms)                             │
│ Cache response (1ms)                                        │
│ ────────────────────────────────────────────────────────    │
│ Total for first request: ~13ms                              │
│                                                             │
│ User sends same GET request (within 5 minutes)              │
│ ↓                                                           │
│ Check cache (1ms)                                           │
│ Return cached data (0ms network)                            │
│ ────────────────────────────────────────────────────────    │
│ Total for cached request: <1ms (INSTANT!)                   │
│                                                             │
│ 100 GET requests/minute:                                    │
│   1st request = 13ms                                        │
│   99 cached = <1ms each = <99ms                             │
│   Total: ~112ms (vs 9000ms) ← 80x FASTER!                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Password Hashing Illustration

```
REGISTRATION:
  User enters password: "MyPassword123"
  
  ↓
  
  bcrypt.hash("MyPassword123", 10 salt rounds)
  
  Step 1: Generate random salt
  Step 2: Hash password 2^10 = 1024 times
  Step 3: Combine salt + hash
  
  Result: "$2b$10$N9qo8uLOickgx2ZMRZoM.examplehashedpassword"
  
  ↓
  
  Store in database:
    users.password = "$2b$10$N9qo8uLOickgx2ZMRZoM.examplehashedpassword"
  
  ✓ Original password is lost (one-way hash)

─────────────────────────────────────────────

LOGIN:
  User enters password: "MyPassword123"
  
  ↓
  
  Retrieve stored hash from database:
    storedHash = "$2b$10$N9qo8uLOickgx2ZMRZoM.examplehashedpassword"
  
  ↓
  
  bcrypt.compare("MyPassword123", storedHash)
  
  Step 1: Extract salt from storedHash
  Step 2: Hash provided password using same salt
  Step 3: Compare hashes
  
  Result:
    ✓ Hashes match → Password correct!
    ✗ Hashes don't match → Wrong password!

─────────────────────────────────────────────

WHY IT'S SAFE:

❌ Can't reverse hash to get password
   (One-way function, mathematically impossible)

❌ Can't replace hash with another user's hash
   (Each hash is unique due to random salt)

❌ Can't brute-force (try all passwords)
   (~100ms per attempt × 10,000 years to crack)

✓ Even if database is stolen, passwords are safe!
```

---

## 9. Token Flow (JWT)

```
STEP 1: TOKEN CREATION (Login)

  User: email="john@example.com", password="xyz"
    ↓
  loginUser(email, password)
    ↓
  ✓ Password check passes (bcrypt comparison)
    ↓
  signToken({ userId: "user-123", email: "john@example.com" })
    ↓
  jwt.sign(payload, "SECRET_KEY", { expiresIn: "7d" })
    ↓
  Response: {
    user: { id: "user-123", name: "John", email: "john@example.com" },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcxMzA1MjgwMCwiZXhwIjoxNzEzNjU3NjAwfQ.signature..."
  }

───────────────────────────────────────────

STEP 2: STORE TOKEN (Frontend)

  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))

───────────────────────────────────────────

STEP 3: SEND TOKEN (API Request)

  User clicks "View My Tasks"
    ↓
  getMyTasks(token)
    ↓
  apiFetch(url, {}, token)
    ↓
  fetch(url, {
    headers: {
      Authorization: "Bearer eyJhbGciOi..."  ← Token attached!
    }
  })

───────────────────────────────────────────

STEP 4: VERIFY TOKEN (Backend)

  Server receives request with header:
    Authorization: "Bearer eyJhbGciOi..."
    ↓
  authenticate middleware:
    token = header.split(" ")[1]
    ↓
  verifyToken(token)
    ↓
  jwt.verify(token, "SECRET_KEY")
    ↓
  If valid signature: ✓ Return payload
    { userId: "user-123", email: "john@example.com" }
    ↓
  If invalid: ✗ Throw error → 401 Unauthorized
    
  req.userId = "user-123" ← Attached to request object
    ↓
  Continue to controller

───────────────────────────────────────────

STEP 5: USE USERID IN AUTHORIZATION

  updateTaskStatus(taskId, userId, newStatus)
    ↓
  if (task.ownerId !== userId) throw "Unauthorized"
    ↓
  ✓ Check passes if userId matches
  ✗ Check fails if it doesn't match
```

---

## Summary: Everything Works Together

```
                    CACHE LAYER (Frontend)
                    ├─ GET requests cached 5min
                    └─ Mutations clear cache
                            ↓
                    HTTPS/TLS ENCRYPTION
                    └─ Data encrypted in transit
                            ↓
                    JWT AUTHENTICATION
                    ├─ Verify token signature
                    ├─ Check expiration
                    └─ Extract userId
                            ↓
                    CONNECTION POOLING (20)
                    ├─ Reuse pre-opened connections
                    └─ Avoid creation overhead
                            ↓
                    PARAMETERIZED QUERIES
                    ├─ Prevent SQL injection
                    └─ Bind data separately
                            ↓
                    AUTHORIZATION CHECK
                    ├─ Only owner can update task
                    └─ Throws error if unauthorized
                            ↓
                    DATABASE TRANSACTION
                    ├─ UPDATE task status
                    └─ ACID guarantees
                            ↓
                    EVENT RECORDING
                    ├─ INSERT into evidence_events
                    ├─ Server timestamp
                    └─ Append-only (immutable)
                            ↓
                    RESPONSE TO CLIENT
                    ├─ Cache GET responses
                    └─ Clear cache on mutations
```
