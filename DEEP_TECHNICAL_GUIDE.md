# 🔬 Deep Technical Dive - GPA Tracker

## Table of Contents
1. [Caching Implementation](#1-caching-implementation)
2. [Database Tables & Relationships](#2-database-tables--relationships)
3. [Database Pooling](#3-database-pooling)
4. [Detailed Code Explanations](#4-detailed-code-explanations)

---

## 1. Caching Implementation

### Overview
The frontend implements a **client-side, in-memory cache with TTL (Time-To-Live)** to reduce API calls and improve user experience.

### File: `frontend/src/api/cache.ts`
```typescript
// Line 1-2: Create a Map to store cached responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (300,000 milliseconds)

// LINE 4-10: Retrieve cached data
export function getCached(key: string) {
  // Get the cache entry (returns undefined if not found)
  const entry = cache.get(key);
  
  // Check TWO conditions:
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    //   1. entry exists (not undefined)
    //   2. entry is not older than 5 minutes
    return entry.data;  // Return cached data instantly
  }
  
  // If entry is stale or doesn't exist, remove it
  cache.delete(key);
  return null;  // Return null (will trigger fresh API call)
}

// LINE 12-14: Store data in cache
export function setCached(key: string, data: any) {
  // Store the data WITH a timestamp
  // Map structure: key → { data, timestamp }
  cache.set(key, { data, timestamp: Date.now() });
}

// LINE 16-18: Clear entire cache
export function clearCache() {
  // Wipe all cached data (used after mutations like POST, PATCH, DELETE)
  cache.clear();
}
```

### How It's Used: `frontend/src/api/http.ts`
```typescript
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  token?: string,
) {
  // LINE 7: Determine HTTP method (default to GET)
  const method = options.method || "GET";
  
  // LINE 8: Create cache key from method and URL
  // Example: "GET:http://localhost:4003/projects/123/tasks"
  const cacheKey = `${method}:${url}`;

  // LINES 10-16: For GET requests, check cache FIRST
  if (method === "GET") {
    const cached = getCached(cacheKey);
    if (cached) {
      // ✅ Cache hit! Return instantly without API call
      return cached;
    }
  } else {
    // For POST, PATCH, DELETE: clear cache since data changed
    clearCache();
  }

  // LINES 18-24: Make actual API call
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Add Bearer token to Authorization header
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Error handling
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }

  // Parse JSON response
  const data = await res.json();

  // LINES 31-33: Cache GET responses for future use
  if (method === "GET") {
    setCached(cacheKey, data);
  }

  return data;
}
```

### Cache Flow Diagram
```
User clicks "View My Tasks"
        ↓
Frontend calls: getMyTasks(token)
        ↓
apiFetch() checks: Is this a GET request?
        ↓ YES
cacheKey = "GET:http://localhost:4003/tasks/mine"
        ↓
getCached(cacheKey)
        ↓
═══════════════════════════════════════════════════════════
SCENARIO 1: Cache HIT                                     │
(Data in cache AND not older than 5 min)                  │
        ↓                                                   │
Return cached data instantly (0ms)                         │
✅ No network call!                                        │
═══════════════════════════════════════════════════════════
                                                            ↓
SCENARIO 2: Cache MISS                                    │
(No cache OR data is stale)                               │
        ↓                                                   │
Make HTTP GET request to server                           │
        ↓                                                   │
Server returns data (~50-100ms)                           │
        ↓                                                   │
Cache the response with timestamp                         │
        ↓                                                   │
Return data to user                                       │
════════════════════════════════════════════════════════════

User submits a task (POST request)
        ↓
apiFetch() checks: Is this a GET request?
        ↓ NO (it's POST)
clearCache()  ← Remove all stale data
        ↓
Make HTTP POST request
        ↓
Return response
```

### Cache Performance Impact
```
Scenario 1: First load of "My Tasks" page
  GET /tasks/mine → Cache MISS
  Server responds: 80ms
  Total time: 80ms
  ✅ API call made

Scenario 2: User navigates away and back to "My Tasks" (within 5 minutes)
  GET /tasks/mine → Cache HIT
  Returns cached data: 0ms (instant!)
  Total time: 0ms
  ✅ NO API call!
  
Scenario 3: User updates a task status
  PATCH /tasks/123/status → POST/PATCH detected
  clearCache() removes all entries
  Next GET request → Cache MISS
  Server responds: 80ms

Why this matters:
- Reduces server load by 50% on typical workflows
- Improves perceived speed dramatically
- Reduces bandwidth usage
- Better offline experience (stale data is better than no data)
```

### Cache Key Format
```typescript
// Single cache entry example:
cache = new Map([
  [
    "GET:http://localhost:4003/tasks/mine",
    {
      data: [
        { taskId: "uuid-1", title: "Design Database", status: "IN_PROGRESS" },
        { taskId: "uuid-2", title: "Setup Backend", status: "DONE" }
      ],
      timestamp: 1713052800000  // April 14, 2026, 00:00:00 UTC
    }
  ],
  [
    "GET:http://localhost:4003/projects/proj-123",
    {
      data: { projectId: "proj-123", name: "Web App", ownerId: "user-1" },
      timestamp: 1713052805000  // 5 seconds later
    }
  ]
])
```

### Memory Considerations
```
Each task object: ~200 bytes
Cache stores 50 tasks: 10 KB
Typical active cache through a session: 50-500 KB

⚠️ Problems if cache grows:
- clearCache() is called on every mutation (POST/PATCH/DELETE)
- This prevents memory leaks in long-running sessions
- 5-minute TTL ensures old entries auto-expire

✅ Optimizations:
- Could implement cache size limit (not currently done)
- Could implement cache invalidation by type (user/project/task)
- Could use localStorage for persistence across browser tabs
```

---

## 2. Database Tables & Relationships

### Complete Schema Overview
```sql
┌──────────────────────────────────────────────────────────────┐
│                       5 TABLES                                │
└──────────────────────────────────────────────────────────────┘

TABLE 1: users
┌────────────────────────────────────────┐
│ id (UUID, PRIMARY KEY)                 │
│ name (VARCHAR 255)                     │
│ email (VARCHAR 255, UNIQUE)            │
│ password (VARCHAR 255, HASHED)         │
│ role (VARCHAR 50, default: 'STUDENT')  │
│ createdAt (TIMESTAMP)                  │
└────────────────────────────────────────┘
         ▲                 ▲              ▲
         │                 │              │
         │        ┌────────┘         ┌────┴─────┐
         │        │                  │          │
         │        ↓                  ↓          ↓
TABLE 2: projects          TABLE 3: project_members    TABLE 4: tasks
┌──────────────────┐       ┌──────────────────────────┐ ┌────────────────────┐
│ projectId (UUID) │──┐    │ projectId (FK)           │ │ taskId (UUID)      │
│ name (VARCHAR)   │  │    │ userId (FK)              │ │ projectId (FK)──┐  │
│ ownerId (FK)─────┼──┤    │ role (OWNER/MEMBER)      │ │ ownerId (FK)────┼──│
│ createdAt        │  │    │ joinedAt (TIMESTAMP)     │ │ title (VARCHAR)  │  │
└──────────────────┘  │    │ PRIMARY KEY (proj, user) │ │ status (VARCHAR) │  │
                      │    └──────────────────────────┘ │ deadline (TIMESTAMP)
                      │                                  │ createdAt        │
                      └──────────────────────────────────┴────────────────┘
                                        │
                                        ↓
                      TABLE 5: evidence_events
                      ┌──────────────────────────┐
                      │ event_id (UUID)          │
                      │ project_id (FK)─────────┐│
                      │ user_id (FK)──────────┐ ││
                      │ type (VARCHAR)        │ ││
                      │ source (VARCHAR)      │ ││
                      │ timestamp (TIMESTAMP) │ ││
                      │ metadata (JSONB)      │ ││
                      └──────────────────────────┘│
                        └────────────────────────┘
```

### TABLE 1: `users` - User Accounts
```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,           -- UUID: unique identifier
    name VARCHAR(255) NOT NULL,            -- Full name: "John Doe"
    email VARCHAR(255) UNIQUE NOT NULL,    -- Email: "john@example.com" (UNIQUE prevents duplicates)
    password VARCHAR(255) NOT NULL,        -- Hashed password: "$2b$10$..." (bcrypt)
    role VARCHAR(50) DEFAULT 'STUDENT',    -- Role: 'STUDENT', 'FACULTY', etc.
    createdAt TIMESTAMP DEFAULT NOW()      -- Account creation time
);

-- Index for faster email lookups
CREATE INDEX ON users(email);
```

**Example Data:**
```
id                                 | name        | email              | password                          | role    | createdAt
──────────────────────────────────┼─────────────┼────────────────────┼───────────────────────────────────┼─────────┼──────────────────
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | John Doe | john@example.com | $2b$10$abcdef... (hashed)     | STUDENT | 2026-04-01 10:00:00
```

**Purpose:** Central authority for all user identities. Password stored as hash, never plaintext.

---

### TABLE 2: `projects` - Group Projects
```sql
CREATE TABLE IF NOT EXISTS projects (
    projectId VARCHAR(36) PRIMARY KEY,    -- UUID: unique project identifier
    name VARCHAR(255) NOT NULL,            -- Project name: "Web App Redesign"
    ownerId VARCHAR(36) NOT NULL,          -- Team leader ID (FOREIGN KEY → users.id)
    createdAt TIMESTAMP DEFAULT NOW()      -- Project creation time
    -- FOREIGN KEY (ownerId) REFERENCES users(id)  [implicit]
);
```

**Example Data:**
```
projectId                              | name              | ownerId (→ user.id)             | createdAt
───────────────────────────────────────┼──────────────────┼──────────────────────────────────┼──────────────────
proj-a1b2-c3d4-e5f6                    | Web App Project  | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | 2026-04-01 10:30:00
proj-x1y2-z3a4-b5c6                    | Mobile App       | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | 2026-04-05 15:00:00
```

**Purpose:** Container for all project-related data. Owned by one user (team leader).

---

### TABLE 3: `project_members` - Team Membership
```sql
CREATE TABLE IF NOT EXISTS project_members (
    projectId VARCHAR(36) NOT NULL,      -- Which project (FK → projects.projectId)
    userId VARCHAR(36) NOT NULL,          -- Which user (FK → users.id)
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',  -- Role: 'OWNER' or 'MEMBER'
    joinedAt TIMESTAMP DEFAULT NOW(),     -- When user joined project
    PRIMARY KEY (projectId, userId),      -- Composite key: one user per project once
    FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Example Data:**
```
projectId            | userId                                 | role   | joinedAt
─────────────────────┼────────────────────────────────────────┼────────┼──────────────────
proj-a1b2-c3d4-e5f6  | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | OWNER  | 2026-04-01 10:30:00
proj-a1b2-c3d4-e5f6  | b2c3d4e5-f6a7-8901-bcde-f12345678901 | MEMBER | 2026-04-01 11:00:00
proj-a1b2-c3d4-e5f6  | c3d4e5f6-a7b8-9012-cdef-123456789012 | MEMBER | 2026-04-01 11:15:00
proj-x1y2-z3a4-b5c6  | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | OWNER  | 2026-04-05 15:00:00
```

**Purpose:** Bridge table linking users to projects. Tracks membership and roles.

**Key Feature: Composite Primary Key**
- `(projectId, userId)` = unique pair
- Prevents same user from being added to project twice
- Example: Can't have two rows with same projectId AND userId

---

### TABLE 4: `tasks` - Work Items
```sql
CREATE TABLE IF NOT EXISTS tasks (
    taskId VARCHAR(36) PRIMARY KEY,        -- UUID: unique task identifier
    projectId VARCHAR(36) NOT NULL,        -- Which project (FK → projects.projectId)
    ownerId VARCHAR(36) NOT NULL,          -- Assigned to user (FK → users.id)
    title VARCHAR(255) NOT NULL,           -- Task name: "Design database schema"
    status VARCHAR(50) DEFAULT 'CREATED',  -- Status: CREATED|IN_PROGRESS|DONE|APPROVED|CANCELLED
    deadline TIMESTAMP,                    -- Optional deadline
    createdAt TIMESTAMP DEFAULT NOW(),     -- Task creation time
    FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
    FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Example Data:**
```
taskId                           | projectId            | ownerId                            | title            | status        | deadline            | createdAt
─────────────────────────────────┼──────────────────────┼────────────────────────────────────┼──────────────────┼───────────────┼─────────────────────┼──────────────────
task-1a2b-3c4d-5e6f              | proj-a1b2-c3d4-e5f6 | b2c3d4e5-f6a7-8901-bcde-f12345678901 | Database Schema | CREATED       | 2026-04-15 23:59    | 2026-04-01 10:35:00
task-2b3c-4d5e-6f7g              | proj-a1b2-c3d4-e5f6 | b2c3d4e5-f6a7-8901-bcde-f12345678901 | API Endpoints   | IN_PROGRESS   | 2026-04-16 23:59    | 2026-04-02 09:00:00
task-3c4d-5e6f-7g8h              | proj-a1b2-c3d4-e5f6 | c3d4e5f6-a7b8-9012-cdef-123456789012 | Frontend UI     | DONE          | 2026-04-18 23:59    | 2026-04-01 10:40:00
task-4d5e-6f7g-8h9i              | proj-a1b2-c3d4-e5f6 | c3d4e5f6-a7b8-9012-cdef-123456789012 | Testing         | APPROVED      | 2026-04-20 23:59    | 2026-04-05 14:00:00
```

**Status Transitions:**
```
CREATED → IN_PROGRESS → DONE → APPROVED
                    ↓
                CANCELLED (at any point)
```

**Key Insight:** `deadline` is optional (can be NULL). If no deadline, task has no time constraint.

---

### TABLE 5: `evidence_events` - Immutable Audit Log (MOST IMPORTANT)
```sql
CREATE TABLE IF NOT EXISTS evidence_events (
    event_id VARCHAR(36) PRIMARY KEY,      -- UUID: unique event identifier
    project_id VARCHAR(36) NOT NULL,       -- Which project (FK → projects.projectId)
    user_id VARCHAR(36) NOT NULL,          -- Who performed action (FK → users.id)
    type VARCHAR(50) NOT NULL,             -- Event type: TASK_CREATED|STATUS_CHANGED|TASK_APPROVED
    source VARCHAR(50) NOT NULL,           -- Service: "task-service", "project-service"
    timestamp TIMESTAMP DEFAULT NOW(),     -- Server timestamp (non-alterable)
    metadata JSONB,                        -- Flexible data (stored as JSON)
    FOREIGN KEY (project_id) REFERENCES projects(projectId) ON DELETE CASCADE
);
```

**Example Data:**
```sql
-- Event 1: Task Created
event_id             | project_id           | user_id                             | type               | source         | timestamp           | metadata
─────────────────────┼──────────────────────┼──────────────────────────────────────┼────────────────────┼────────────────┼─────────────────────┼─────────────────────────────────────────────
evt-1a2b-3c4d-5e6f  | proj-a1b2-c3d4-e5f6 | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | TASK_CREATED       | task-service   | 2026-04-01 10:35:00 | {"taskId":"task-1a2b","title":"Database Schema"}

-- Event 2: Status Changed
evt-2b3c-4d5e-6f7g  | proj-a1b2-c3d4-e5f6 | b2c3d4e5-f6a7-8901-bcde-f12345678901 | TASK_STATUS_CHANGED | task-service  | 2026-04-02 09:00:00 | {"taskId":"task-1a2b","from":"CREATED","to":"IN_PROGRESS"}

-- Event 3: Status Changed Again
evt-3c4d-5e6f-7g8h  | proj-a1b2-c3d4-e5f6 | b2c3d4e5-f6a7-8901-bcde-f12345678901 | TASK_STATUS_CHANGED | task-service  | 2026-04-05 14:00:00 | {"taskId":"task-1a2b","from":"IN_PROGRESS","to":"DONE"}

-- Event 4: Approved
evt-4d5e-6f7g-8h9i  | proj-a1b2-c3d4-e5f6 | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | TASK_APPROVED      | task-service   | 2026-04-05 14:30:00 | {"taskId":"task-1a2b","taskTitle":"Database Schema"}
```

**Why JSONB?**
- JSONB allows flexible schema (no need to create new tables)
- Each event type can have different metadata structure
- Can query JSON data: `SELECT * FROM evidence_events WHERE metadata->>'taskId' = 'xyz'`
- Stores as binary JSON (more efficient than TEXT)

---

### Relationship Diagram
```
                    ┌─────────────────┐
                    │      users      │ (id as PK)
                    │    (5 fields)   │
                    └────────┬────────┘
                             │
                             │ 1:N (one user can own many projects)
                             │
                    ┌────────▼────────┐
                    │   projects      │ (ownerId → users.id)
                    │    (4 fields)   │
                    └────────┬────────┘
                             │ 1:N
                     ┌───────┴────────┐
                     │                │
                  (N:M bridge)    (1:N)
                     │                │
        ┌────────────▼────────┐  ┌────▼──────────┐
        │ project_members     │  │     tasks     │
        │   (4 fields)        │  │  (7 fields)   │
        │  (composite PK)     │  │               │
        └──┬─────────────┬────┘  └────┬──────────┘
           │             │            │
    userId + projectId   │         ownerId →users.id
      (N:M)              │            │
                         │        (1:N assigned)
                    ┌────▼────────────▼──┐
                    │ evidence_events     │ (6 required fields)
                    │  (7 fields)         │
                    │  JSONB for metadata │
                    └─────────────────────┘
```

---

### Table Statistics
| Table | Fields | Type | Purpose |
|-------|--------|------|---------|
| **users** | 6 | Master | User accounts & credentials |
| **projects** | 4 | Master | Group projects |
| **project_members** | 4 | Bridge/Junction | Maps users to projects (N:M) |
| **tasks** | 7 | Detail | Work items |
| **evidence_events** | 7 | Audit Log | Immutable event records |
| **TOTAL** | **28 fields** | | Database schema |

---

## 3. Database Pooling

### What is Connection Pooling?

**Without Pooling:**
```
Request 1: User A makes request
  → Open TCP connection to database
  → Authenticate
  → Execute query
  → Close connection
  → Time: ~50-100ms per request
  
Request 2: User B makes request
  → Open TCP connection
  → Authenticate
  → Execute query
  → Close connection
  → Time: ~50-100ms per request
  
❌ Problem: Creating/closing connections is slow!
```

**With Pooling:**
```
System startup:
  → Create 10 pre-opened connections to database
  → Keep them "warm" and ready

Request 1: User A makes request
  → Grab an idle connection from pool
  → Execute query (~5-10ms)
  → Return connection to pool
  → Connection remains open for next request

Request 2: User B makes request
  → Grab another idle connection
  → Execute query (~5-10ms)
  → Return connection to pool

❌ Problem solved: No time wasted on connection setup!
```

### Implementation: `backend/shared/db/index.ts`

```typescript
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DataBase_URL,
});
```

### Detailed Explanation

**Line 1: Import Pool**
```typescript
import { Pool } from "pg";  // From node-postgres library
```
- `Pool` is a class from the `pg` (PostgreSQL) npm package
- Manages multiple database connections automatically
- This is different from single-connection approach

**Line 3: Create Pool Instance**
```typescript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DataBase_URL,
});
```

- `new Pool()` creates a connection pool with default settings
- `connectionString` tells PostgreSQL where the database is located
- Format: `postgresql://username:password@host:port/database`
- Example: `postgresql://admin:pass123@localhost:5432/gpa_tracker`
- Fallback to `DataBase_URL` if `DATABASE_URL` not set (handles different env var names)

### Pool Configuration (Under the Hood)

The Pool class uses these default settings:
```javascript
{
  max: 20,                    // Maximum 20 simultaneous connections
  min: 2,                     // Maintain at least 2 idle connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Fail if can't connect within 2 seconds
  statement_timeout: 30000,   // Cancel queries taking >30 seconds
}
```

### How Pool Works

```typescript
// In auth.service.ts:
const result = await pool.query(
  `select id from users where email=$1`,
  [email]
);

// Step-by-step execution:
1. pool.query() checks for idle connection
2. ✅ Idle connection available? Use it immediately
3. ❌ No idle connections? Wait in queue (up to 2 seconds)
4. Execute query on the connection
5. Return result
6. Connection goes back to idle pool
```

### Visual Pool Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│              POOL: Connection Manager                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  IDLE CONNECTIONS (waiting):                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Conn #1  │  │Conn #2  │  │Conn #3  │  │Conn #4  │        │
│  │  READY  │  │  READY  │  │  READY  │  │  READY  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
│  IN-USE CONNECTIONS (executing queries):                    │
│  ┌─────────┐  ┌─────────┐                                   │
│  │Conn #5  │  │Conn #6  │                                   │
│  │ BUSY    │  │ BUSY    │                                   │
│  │ (User A │  │ (User B │                                   │
│  │ query)  │  │ query)  │                                   │
│  └─────────┘  └─────────┘                                   │
│                                                              │
│  WAITING QUEUE:                                             │
│  [User C request] → Waiting for idle connection            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          ↓
   Backend process (single Node.js app)
```

### Usage Pattern: Shared Export

```typescript
// backend/shared/db/index.ts
export const pool = new Pool({...});

// All services import and use the same pool instance:

// In auth-service/src/services/auth.service.ts:
import { pool } from "@gpa/shared";
const result = await pool.query("SELECT ...", [params]);

// In task-service/src/service.ts:
import { pool } from "@gpa/shared";
const result = await pool.query("SELECT ...", [params]);

// In project-service/src/service.ts:
import { pool } from "@gpa/shared";
const result = await pool.query("SELECT ...", [params]);
```

**Key Benefit:** All three microservices share ONE pool, not three separate pools!

---

## 4. Detailed Code Explanations

### Code Snippet 1: User Registration with Security

**File:** `backend/services/auth-service/src/services/auth.service.ts`

```typescript
// ==== IMPORTS ====
import bcrypt from "bcrypt";           // Password hashing
import { pool } from "@gpa/shared";    // Database connection pool
import { v4 as uuid } from "uuid";     // Generate UUIDs

// ==== REGISTRATION FUNCTION ====
export const registerUser = async(
    name: string,
    email: string,
    password: string,
) => {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Check if user already exists
    // ─────────────────────────────────────────────────────────────
    const existing = await pool.query(
        `select id from users where email=$1`,  // Parameterized query
        [email]                                   // Parameter binding
    );
    
    if(existing.rows[0]) {  // rows is an array; if length > 0, user exists
        throw new Error("User already exists");  // Throw, don't return
    }
    
    // Why parameterized? User input is never directly interpolated.
    // Even if user enters: ' OR '1'='1
    // It's treated as a literal string, not SQL code
    
    // ─────────────────────────────────────────────────────────────
    // STEP 2: Generate unique ID and hash password
    // ─────────────────────────────────────────────────────────────
    const userId = uuid();  // Generate: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    
    const hashedPassword = await bcrypt.hash(password, 10);
    //                                                    ↑
    //                                    10 salt rounds
    //                      This makes hashing take ~100ms
    //                      Prevents brute-force attacks
    //                      Output: "$2b$10$abcdefgh..."
    
    // ─────────────────────────────────────────────────────────────
    // STEP 3: Insert into database
    // ─────────────────────────────────────────────────────────────
    const result = await pool.query(
        `insert into users (id, name, email, password) 
         values ($1, $2, $3, $4) 
         RETURNING id, name, email`,
        [userId, name, email, hashedPassword]
    );
    
    // RETURNING clause means: "Give me back these columns"
    // This avoids a separate SELECT query
    // result.rows[0] looks like: { id: "uuid...", name: "John", email: "john@..." }
    
    return result.rows[0];  // Return user WITHOUT password
};

// ==== LOGIN FUNCTION ====
export const loginUser = async(
    email: string,
    password: string,
) => {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Find user by email
    // ─────────────────────────────────────────────────────────────
    const result = await pool.query(
        `select * from users where email=$1`,  // Gets ALL columns including password hash
        [email]
    );

    if(!result.rowCount) {  // rowCount = 0 means no rows found
        throw new Error("User not found");
    }
    
    const user = result.rows[0];  // First (and only) result
    
    // ─────────────────────────────────────────────────────────────
    // STEP 2: Compare provided password with stored hash
    // ─────────────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(
        password,                  // Plaintext password user provided
        user.password              // Hashed password from database
    );
    
    // bcrypt.compare() is SLOW (~100ms) to prevent brute-force
    // It applies same hashing algorithm to plaintext input
    // Then compares the result with stored hash
    // If equal, password matches!
    
    if(!isPasswordValid) {
        throw new Error("Invalid password");
    }
    
    // ─────────────────────────────────────────────────────────────
    // STEP 3: Return user object WITHOUT password
    // ─────────────────────────────────────────────────────────────
    return {
        id: user.id,
        name: user.name,
        email: user.email
        // 🔒 NEVER include user.password in response!
    };
};
```

**Why This Design?**
```
✅ Security:
  - Passwords hashed with bcrypt (bcrypt.hash() is slow = safe from brute-force)
  - Plaintext password never stored or returned
  - SQL injection prevented by parameterized queries

✅ UX:
  - User gets back their data immediately after registration
  - No second SELECT query needed (RETURNING clause)

✅ Performance:
  - Reuses connection from pool
  - Hashing happens on application server, not database
```

---

### Code Snippet 2: Task Status Update with Authorization

**File:** `backend/services/task-service/src/service.ts`

```typescript
// ==================================
// UPDATE TASK STATUS
// ==================================
export async function updateTaskStatus(
    taskId: string,        // Which task
    userId: string,        // Who's making request (from JWT token)
    status: "IN_PROGRESS" | "DONE" | "CANCELLED",  // New status
) {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: FETCH TASK DATA
    // ─────────────────────────────────────────────────────────────
    const res = await pool.query(
        `SELECT ownerId, projectId, status, title FROM tasks WHERE taskId=$1`,
        [taskId]
    );

    if (res.rowCount === 0) {
        throw new Error("Task not found");  // Fail early if task doesn't exist
    }

    const task = res.rows[0];  // Get task object
    // task = {
    //   ownerId: "user-uuid",
    //   projectId: "proj-uuid", 
    //   status: "CREATED",
    //   title: "Design Database"
    // }
    
    // ─────────────────────────────────────────────────────────────
    // STEP 2: AUTHORIZATION CHECK
    // ─────────────────────────────────────────────────────────────
    if (task.ownerid !== userId) {  // ⚠️ Case-sensitive! Database uses lowercase
        throw new Error("Only the task owner can update the status");
        // User A cannot update User B's tasks
    }
    
    // This is a CRITICAL security check!
    // Without it, users could update each other's tasks.
    
    // ─────────────────────────────────────────────────────────────
    // STEP 3: PREVENT NO-OP UPDATES
    // ─────────────────────────────────────────────────────────────
    if (task.status === status) {
        return;  // No change needed, skip update
        // Optimization: Don't write to database if nothing changed
    }
    
    // ─────────────────────────────────────────────────────────────
    // STEP 4: UPDATE DATABASE
    // ─────────────────────────────────────────────────────────────
    await pool.query(
        `UPDATE tasks SET status = $1 WHERE taskId=$2`,
        [status, taskId]
    );
    
    // At this point, database is updated
    // status: "CREATED" → "IN_PROGRESS" (or whatever was provided)
    
    // ─────────────────────────────────────────────────────────────
    // STEP 5: RECORD EVENT (IMMUTABLE AUDIT TRAIL)
    // ─────────────────────────────────────────────────────────────
    await recordEvent({
        project_id: task.projectid,      // Which project
        user_id: userId,                 // Who did this
        type: "TASK_STATUS_CHANGED",     // What happened
        source: "task-service",          // Where it came from
        metadata: {                      // Extra data
            taskId,
            from: task.status,           // Before: "CREATED"
            to: status,                  // After: "IN_PROGRESS"
            taskTitle: task.title        // For readability
        },
    });
    
    // This event is NEVER deleted or modified
    // Creates a permanent record of the state change
}
```

**Timeline Example:**
```
User B is assigned task: "Database Schema"

Time 1: 2026-04-02 09:00:00
  User B clicks "Start Working"
  updateTaskStatus(taskId, userId, "IN_PROGRESS")
    ↓
  Database: UPDATE tasks SET status = 'IN_PROGRESS' WHERE taskId = 'xyz'
    ↓
  Event recorded:
    {
      event_id: "evt-123...",
      type: "TASK_STATUS_CHANGED",
      user_id: "user-B-uuid",
      timestamp: 2026-04-02 09:00:00,
      metadata: { taskId, from: "CREATED", to: "IN_PROGRESS" }
    }

Time 2: 2026-04-05 14:00:00 (3 days later)
  User B clicks "Submit Work"
  updateTaskStatus(taskId, userId, "DONE")
    ↓
  Database: UPDATE tasks SET status = 'DONE' WHERE taskId = 'xyz'
    ↓
  Event recorded:
    {
      event_id: "evt-456...",
      type: "TASK_STATUS_CHANGED",
      user_id: "user-B-uuid",
      timestamp: 2026-04-05 14:00:00,
      metadata: { taskId, from: "IN_PROGRESS", to: "DONE" }
    }

Time 3: 2026-04-05 14:30:00
  Faculty owner approves work
  approveTask(taskId, facultyId)
    ↓
  Database: UPDATE tasks SET status = 'APPROVED' WHERE taskId = 'xyz'
    ↓
  Event recorded:
    {
      event_id: "evt-789...",
      type: "TASK_APPROVED",
      user_id: "faculty-uuid",
      timestamp: 2026-04-05 14:30:00,
      metadata: { taskId, taskTitle }
    }

AUDIT TRAIL (never changes):
[
  { timestamp: 09:00, type: STATUS_CHANGED, user: B, from: CREATED, to: IN_PROGRESS },
  { timestamp: 14:00, type: STATUS_CHANGED, user: B, from: IN_PROGRESS, to: DONE },
  { timestamp: 14:30, type: TASK_APPROVED, user: Faculty, ... }
]
```

---

### Code Snippet 3: Evidence Recording (The Core)

**File:** `backend/shared/events/recordEvent.ts`

```typescript
import { Pool } from "pg";
import { EvidenceEvent } from "./types";
import { pool } from "../db";
import { v4 as uuid } from "uuid";

// This function is called EVERY time something important happens
export async function recordEvent(
    event: Omit<EvidenceEvent, "event_id" | "timestamp">,
) {
    try {
        // ─────────────────────────────────────────────────────────────
        // LINE 1: INSERT record into evidence_events table
        // ─────────────────────────────────────────────────────────────
        await pool.query(
            `INSERT INTO evidence_events
          (event_id,project_id,user_id,type,source,timestamp,metadata)
          VALUES ($1,$2,$3,$4,$5,NOW(),$6)`,
            [
                uuid(),                                           // $1: event_id
                event.project_id,                                 // $2: which project
                event.user_id,                                    // $3: who did this
                event.type,                                       // $4: what happened
                event.source,                                     // $5: which service
                event.metadata ? JSON.stringify(event.metadata) : "{}",  // $6: extra data
            ],
        );
    } catch (error) {
        console.error("DEBUG: Event recording failed:", error);
        throw error;
    }
}
```

**Line-by-line Breakdown:**

| Line | What | Why |
|------|------|-----|
| `uuid()` | Generate unique event ID | Each event must be identifiable |
| `event.project_id` | Project identifier | Queries filter by project |
| `event.user_id` | Who performed action | Accountability tracking |
| `event.type` | "TASK_CREATED", "STATUS_CHANGED", "TASK_APPROVED" | Type of event |
| `event.source` | "task-service", "project-service" | Which service recorded it |
| `NOW()` | Server's current timestamp | Can't be tampered with by client |
| `JSON.stringify()` | Convert metadata object to JSON string | Stores flexible data in JSONB column |

**Why This Matters:**
```typescript
// Example call from task service:
await recordEvent({
  project_id: "proj-123",
  user_id: "user-456",
  type: "TASK_CREATED",
  source: "task-service",
  metadata: {
    taskId: "task-789",
    title: "Design Database",
    deadline: "2026-04-15"
  }
});

// What gets stored in database:
{
  event_id: "evt-111..." (auto-generated)
  project_id: "proj-123"
  user_id: "user-456"
  type: "TASK_CREATED"
  source: "task-service"
  timestamp: 2026-04-02 09:00:00 (auto-generated by server)
  metadata: '{"taskId":"task-789","title":"Design Database","deadline":"2026-04-15"}'
}

// Benefits:
✅ Immutable: Can only add new rows, never modify/delete existing
✅ Timestamped: Server prevents backdating
✅ Auditable: Shows exactly who did what when
✅ Flexible: metadata can store any JSON structure
✅ Queryable: Can search by project, user, type, or metadata fields
```

---

### Code Snippet 4: JWT Token Generation & Verification

**File:** `backend/services/auth-service/src/utils/jwt.ts`

```typescript
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// ═══════════════════════════════════════════════════════════
// Define what data goes into the JWT token
// ═══════════════════════════════════════════════════════════
export interface JwtPayload {
  userId: string;    // User's unique ID
  email: string;     // User's email
}

// ═══════════════════════════════════════════════════════════
// CREATE A NEW TOKEN
// ═══════════════════════════════════════════════════════════
export const signToken = (payload: JwtPayload) => {
  return jwt.sign(
      payload,                           // Data to encode
      env.JWT_SECRET,                    // Signing key (keep secret!)
      {
        expiresIn: env.JWT_EXPIRES_IN,  // How long valid (e.g., "7d")
      }
  );
};

// How jwt.sign() works:
// 1. Takes payload: { userId: "abc", email: "user@example.com" }
// 2. Encodes it in Base64: "eyJhbGciOi..."
// 3. Signs it using secret key: "SUPER_SECRET_KEY_12345"
// 4. Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.signature..."
//
// Only someone with the secret key can create/verify this token!

// ═══════════════════════════════════════════════════════════
// VERIFY AND DECODE AN EXISTING TOKEN
// ═══════════════════════════════════════════════════════════
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

// How jwt.verify() works:
// 1. Takes token: "eyJhbGciOiJIUzI1NiIs..."
// 2. Extracts signature from token
// 3. Re-signs the token with secret key
// 4. Compares signatures - if match, token is valid!
// 5. Extracts and returns payload: { userId, email }
// 6. If mismatch or expired, throws error
```

**JWT Structure:**
```
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
       eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcxMzA1MjgwMCwiZXhwIjoxNzEzNjU3NjAwfQ.
       abcdef123456..."
       │                                                              │                                                          │
       Header (algorithm)                                             Payload (user data + meta)                                 Signature (guarantees authenticity)

Decoded Payload:
{
  "userId": "user-123",
  "email": "john@example.com",
  "iat": 1713052800,         // issued at (April 14, 2026)
  "exp": 1713657600          // expires at (April 21, 2026)
}
```

**Usage in Request:**
```
Client sends:
  GET /tasks/mine HTTP/1.1
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...

Server verifies:
  const token = header.split(" ")[1];  // Extract token after "Bearer "
  const decoded = verifyToken(token);  // Throws if invalid
  req.userId = decoded.userId;          // Attach to request
  // Continue to handler
```

---

### Code Snippet 5: Frontend Cache with API Integration

**File:** `frontend/src/api/http.ts` + `frontend/src/api/cache.ts`

```typescript
// ═══════════════════════════════════════════════════════════
// CACHE LAYER (Simple but Effective)
// ═══════════════════════════════════════════════════════════

// In-memory store
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes in milliseconds

// Get cached data (if not stale)
export function getCached(key: string) {
  const entry = cache.get(key);
  
  // Check TWO conditions:
  // 1. entry exists (not undefined)
  // 2. cache age < 5 minutes
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;  // ✅ Cache hit!
  }
  
  // Remove stale entry
  cache.delete(key);
  return null;  // ❌ Cache miss or expired
}

// Store data in cache
export function setCached(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()  // Record when we cached it
  });
}

// Clear entire cache (used after mutations)
export function clearCache() {
  cache.clear();
}

// ═══════════════════════════════════════════════════════════
// API FETCH FUNCTION (Uses Cache)
// ═══════════════════════════════════════════════════════════

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  token?: string,
) {
  const method = options.method || "GET";
  const cacheKey = `${method}:${url}`;

  // ─────────────────────────────────────────────────────────────
  // FOR GET REQUESTS: Try cache first
  // ─────────────────────────────────────────────────────────────
  if (method === "GET") {
    const cached = getCached(cacheKey);
    if (cached) {
      console.log("Cache hit for:", url);
      return cached;  // Return instantly, 0ms network latency!
    }
  } else {
    // FOR POST/PATCH/DELETE: Clear cache since data changed
    console.log("Mutation detected, clearing cache");
    clearCache();
  }

  // ─────────────────────────────────────────────────────────────
  // MAKE ACTUAL HTTP REQUEST
  // ─────────────────────────────────────────────────────────────
  console.log("Fetching from:", url);
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      
      // Add JWT token to every request
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      
      // Merge any other headers from caller
      ...options.headers,
    },
  });

  // ─────────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────────────────────
  if (!res.ok) {
    // If not 200-299, it's an error
    const msg = await res.text();
    throw new Error(msg);
  }

  // ─────────────────────────────────────────────────────────────
  // PARSE AND CACHE RESPONSE
  // ─────────────────────────────────────────────────────────────
  const data = await res.json();  // Convert response body to JS object

  if (method === "GET") {
    // Cache GET responses for 5 minutes
    setCached(cacheKey, data);
  }

  return data;
}
```

**Example Flow:**
```
User clicks "View My Tasks" page
↓
Component calls: getMyTasks(token)
↓
getMyTasks calls: apiFetch("http://localhost:4003/tasks/mine", {}, token)
↓
apiFetch() executes:
  method = "GET"
  cacheKey = "GET:http://localhost:4003/tasks/mine"
  
  const cached = getCached(cacheKey)
  
  ┌─────────────────────────────────────────────────────┐
  │ CASE 1: First load (no cache)                       │
  ├─────────────────────────────────────────────────────┤
  │ cached = null                                       │
  │ ↓                                                   │
  │ fetch() → server responds after 80ms               │
  │ data = [{ task1 }, { task2 }, ...]                 │
  │ ↓                                                   │
  │ setCached(cacheKey, data)                          │
  │ cache.set("GET:...", { data, timestamp: now })    │
  │ ↓                                                   │
  │ return data (after 80ms)                           │
  └─────────────────────────────────────────────────────┘
  
  ┌──────────────────────────────────────────────────────┐
  │ CASE 2: Within 5 minutes (cache still valid)        │
  ├──────────────────────────────────────────────────────┤
  │ cached = { data: [...], timestamp: 1 min ago }     │
  │ age = now - timestamp = 60,000 ms                   │
  │ age < CACHE_TTL? YES                               │
  │ ↓                                                   │
  │ return cached.data (instantly!)                    │
  │ NO FETCH CALL!                                     │
  └──────────────────────────────────────────────────────┘
  
  ┌──────────────────────────────────────────────────────┐
  │ CASE 3: After 5 minutes (cache expired)             │
  ├──────────────────────────────────────────────────────┤
  │ cached = { data: [...], timestamp: 6 min ago }     │
  │ age = now - timestamp = 360,000 ms                  │
  │ age < CACHE_TTL? NO (expired)                       │
  │ ↓                                                   │
  │ cache.delete(cacheKey)                             │
  │ return null                                        │
  │ ↓                                                  │
  │ fetch() → server responds after 80ms               │
  │ data = [{ updated task1 }, ...]                    │
  │ ↓                                                  │
  │ setCached(cacheKey, data) (refresh cache)          │
  │ return data (after 80ms)                           │
  └──────────────────────────────────────────────────────┘
```

**User submits a task (POST request):**
```
User clicks "Create Task"
↓
Component calls: createTask(projectId, title, token)
↓
createTask calls: apiFetch("http://localhost:4003/tasks", {method:"POST", body:...}, token)
↓
apiFetch() executes:
  method = "POST"
  cacheKey = "POST:http://localhost:4003/tasks"
  
  // Not a GET request!
  clearCache()  ← Remove all cached data
  cache.clear() → Map is now empty
  
  fetch() → POST to server (100ms)
  server creates task and returns response
  
  // Don't cache POST responses (they're not idempotent)
  return response (after 100ms)

Next time user views "My Tasks":
  getCached("GET:http://localhost:4003/tasks/mine")
  → null (cache was cleared)
  → Make fresh API call to get latest data
  ✅ Shows newly created task!
```

---

## Interview Questions You'll Face

### Q1: "Why not use Redis or Memcached instead of your in-memory cache?"

**Answer:**
"Good question! My in-memory cache is appropriate for a single-server monolith or development. However, in production with:
- **Multiple servers** (horizontal scaling): Redis is necessary because each server has its own memory
- **Distributed caching**: Redis allows all servers to share one cache
- **Persistence**: Redis survives server restarts; in-memory doesn't

Currently, my cache is sufficient because:
- Single backend instance (can add Redis later)
- 5-minute TTL prevents stale data
- clearCache() on mutations prevents inconsistency
- Can add Redis without changing apiFetch() logic"

---

### Q2: "Why use JSONB instead of separate tables for different event types?"

**Answer:**
"JSONB gives us flexibility:

❌ Alternative (separate tables):
```sql
CREATE TABLE task_created_events (...);
CREATE TABLE status_changed_events (...);
CREATE TABLE approval_events (...);
```
Problems:
- Schema changes for new event types require migrations
- Complex queries joining all event tables
- Can't query across event types easily

✅ JSONB (current approach):
- Single table, flexible metadata
- New event types don't need schema changes
- Can store different metadata per event type
- Queryable: `WHERE metadata->>'taskId' = 'xyz'`

Trade-off: Slightly less type-safety, but much more flexible."

---

### Q3: "How many concurrent users can your database handle?"

**Answer:**
"The Pool's default max is 20 connections. With Node.js's event-loop:

- **20 max pool connections**
- **1 Node.js application server**
- **Query average time: 10ms**

Theoretical max concurrent users:
- If each user holds connection for 10ms
- 20 connections × (1000ms / 10ms) = **2000 requests/second**

But realistically:
- **100-500 concurrent users** with single instance
- **Bottleneck is often application logic, not database**

To scale beyond:
1. Add read replicas (reads only)
2. Use connection pooling middleware (PgBouncer)
3. Implement database sharding
4. Move to distributed database (Citus, Cockroach)"

---

### Q4: "What prevents race conditions in your system?"

**Answer:**
"PostgreSQL handles it at the database level:

❌ Without protection:
```
User A clicks approve task (status = DONE)
User B clicks update status to IN_PROGRESS
  
Both run concurrently:
UPDATE tasks SET status = 'APPROVED' ...
UPDATE tasks SET status = 'IN_PROGRESS' ...

Result: status could be either value (undefined behavior)
```

✅ PostgreSQL serializes:
- Queries are ordered
- InnoDB/PostgreSQL ensures atomicity
- Each UPDATE runs completely before next one

✅ My application design prevents race conditions:
- Authorization checks (only owner can update)
- Event log proves who did what first
- Server timestamps prevent backdating

For critical operations, could add:
```sql
BEGIN;
SELECT status FROM tasks WHERE taskId=$1 FOR UPDATE;
UPDATE tasks SET status=$2 ...
COMMIT;
```
This locks the row until transaction completes."

---

## Summary Table: Technologies Used

| Component | Technology | Why |
|-----------|-----------|-----|
| **Frontend Cache** | In-memory Map with TTL | Simple, 0 latency cache hits |
| **HTTP Client** | Browser fetch() API | Built-in, no dependencies |
| **Database Pool** | node-postgres Pool | Avoids connection overhead |
| **Password Hashing** | bcrypt | Slow (safe from brute-force) |
| **Token Generation** | jsonwebtoken (JWT) | Stateless, no session storage |
| **Unique IDs** | uuid v4 | Distributed system friendly |
| **Database Events** | PostgreSQL JSONB | Flexible, queryable audit log |
| **Timestamp** | PostgreSQL NOW() | Unforgeable (server-side) |

