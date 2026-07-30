# 🏗️ System Design Document

## Executive Summary

GPA Tracker is a **production-grade microservices system** designed to provide immutable evidence of contribution in group projects. The architecture prioritizes **reliability, auditability, and scalability**.

---

## Architecture Overview

### High-Level Design
```
┌──────────────────────────────────────────────────────┐
│                   React Frontend                      │
│           (React 19 + React Query + Vite)            │
└────────────────┬─────────────────────────────────────┘
                 │
         ┌───────┴────────┬──────────┬──────────┐
         │                │          │          │
    ┌────▼────┐    ┌─────▼────┐ ┌──▼────┐ ┌──▼─────┐
    │   Auth  │    │ Project  │ │ Task  │ │Shared  │
    │ Service │    │ Service  │ │Service│ │Module  │
    │ :4001   │    │  :4002   │ │:4003  │ │(Events)│
    └────┬────┘    └────┬─────┘ └───┬──┘ └────────┘
         │              │           │
         └──────────────┴───────────┘
                   │
           PostgreSQL Database
           (Centralized Schema)
```

---

## Component Details

### 1. Frontend (React 19 + Vite)

**Responsibilities:**
- User interface rendering
- Client-side routing
- Form validation
- Local state management (UI only)
- Caching and data synchronization

**Key Technologies:**
- **React 19**: Latest features, improved performance
- **React Query**: Server state management (5-min cache)
- **Vite**: Instant hot module replacement
- **React Router**: Client-side routing

**Performance Optimizations:**
```javascript
// Code splitting with lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Smart caching
const { data: projects } = useProjects(); // Auto-cached for 5 min

// Retry logic
retry: 3,
retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000)
```

### 2. Backend Microservices

#### Auth Service (Port 4001)
- User registration with bcrypt hashing
- JWT token generation and validation
- Session management
- Password reset (future)

**Security:**
```javascript
// Password hashing: 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);

// JWT signing: 7-day expiration
jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
```

#### Project Service (Port 4002)
- Project creation and management
- Team membership management
- Member role assignment (OWNER, MEMBER)
- Project metadata

#### Task Service (Port 4003)
- Task creation and lifecycle management
- Status transitions (CREATED → IN_PROGRESS → DONE → APPROVED)
- Task approval workflow
- Evidence recording for all actions

**Task Lifecycle:**
```
┌─────────┐     ┌──────────────┐     ┌──────┐     ┌──────────┐
│ CREATED │────→│ IN_PROGRESS  │────→│ DONE │────→│ APPROVED │
└─────────┘     └──────────────┘     └──────┘     └──────────┘
  (assigned)     (work started)    (work done)  (owner verified)
```

#### Shared Module
- Event recording (immutable audit trail)
- Database connection pooling
- Shared error types
- Logging utilities

---

## Database Design

### Entity Relationship Diagram
```sql
users (1) ────┐
              ├─── project_members (N)
projects (1)─┘
    │
    ├──┬─ (1) tasks (N)
    │  │       ├─ Evidence events (immutable)
    │  │       └─ Deadline tracking
    │  │
    │  └─ (1) evidence_events (append-only)
    │         ├─ Type: TASK_CREATED
    │         ├─ Type: TASK_STATUS_CHANGED
    │         └─ Type: TASK_APPROVED
```

### Key Tables

**users**
- UUID primary key (distributed scalability)
- Email unique index
- Hashed password (bcrypt)
- Role: STUDENT, FACULTY

**projects**
- UUID primary key
- Owner FK to users
- Timestamps: createdAt

**project_members**
- Composite PK: (projectId, userId)
- Role: OWNER or MEMBER
- Prevents duplicate memberships

**tasks**
- UUID primary key
- Status enum: CREATED, IN_PROGRESS, DONE, APPROVED, CANCELLED
- Owner FK (assigned to)
- Project FK (belongs to)
- Deadline: optional timestamp

**evidence_events** (Immutable)
- UUID event ID
- Append-only (no UPDATE, no DELETE)
- Server-generated timestamp (non-alterable)
- JSONB metadata for flexibility
- Types: TASK_CREATED, TASK_STATUS_CHANGED, TASK_APPROVED

---

## State Management

### Server State (React Query)
```javascript
// Automatic caching
const { data: projects, isLoading, error } = useProjects();

// Smart invalidation
queryClient.invalidateQueries({ queryKey: ['projects'] });

// Optimistic updates
updateTaskMutation.mutate({ taskId, status });
```

**Caching Strategy:**
- **staleTime**: 5 minutes (data stays "fresh")
- **gcTime**: 10 minutes (keep in cache)
- **refetchOnWindowFocus**: Refetch when user returns
- **retryDelay**: Exponential backoff (1s, 2s, 4s, 8s...)

### Local UI State
- Form inputs (showCreateForm, newTaskTitle)
- Active tab (TASKS, MEMBERS, SCORES)
- Modal visibility

---

## Error Handling Architecture

### Error Types
```javascript
// Custom error classes
- AppError (base, 500)
- ValidationError (400)
- AuthenticationError (401)
- AuthorizationError (403)
- NotFoundError (404)
- ConflictError (409)
- RateLimitError (429)
- ServiceUnavailableError (503)
```

### Error Flow
```
API Error
    ↓
Caught by React Query
    ↓
Parsed by errorHandler()
    ↓
User-friendly message in Toast
    ↓
Error logged to console/monitoring
```

### Resilience Patterns

**Circuit Breaker:**
```javascript
const breaker = new CircuitBreaker('database', dbQuery, {
  failureThreshold: 5,
  timeout: 60000
});

// States: CLOSED → OPEN → HALF_OPEN → CLOSED
```

**Automatic Retry:**
```javascript
retry: 3,
retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000)

// Attempt 1: 1s, Attempt 2: 2s, Attempt 3: 4s
```

---

## Security Architecture

### Authentication Flow
```
User Login
    ↓
Credentials → Auth Service
    ↓
Password validation (bcrypt.compare)
    ↓
JWT token generation (7-day expiry)
    ↓
Token stored in localStorage
    ↓
Authorization header: "Bearer <token>"
    ↓
Verify middleware checks signature
```

### Authorization
```
User makes request
    ↓
Middleware extracts userId from JWT
    ↓
Check: User owns the resource?
    ↓
If authorized: proceed
If denied: return 403 Forbidden
```

### Data Protection
- **SQL Injection**: Parameterized queries (`$1, $2`)
- **XSS**: React escaping + DomPurify (future)
- **CSRF**: JWT tokens (stateless)
- **Password**: bcrypt with 10 salt rounds
- **Data in Transit**: HTTPS (production)

---

## Audit Trail Architecture

### Immutable Event Log
```javascript
// Every action recorded
evidence_events table:
{
  event_id: UUID,
  project_id: UUID,
  user_id: UUID,
  type: "TASK_CREATED|TASK_STATUS_CHANGED|TASK_APPROVED",
  timestamp: server-generated (non-alterable),
  metadata: {
    taskId, taskTitle, from, to, ...
  }
}
```

### Compliance
- **Tamper-proof**: Server timestamps, append-only
- **Auditable**: Complete action history
- **Traceable**: Every user, every action
- **Recoverable**: Even if task deleted, events remain

---

## Scalability Considerations

### Current (Single Server)
```
1x Frontend + 3x Backend Services + 1x Database
= ~100 concurrent users
```

### Horizontal Scaling (Phase 2)
```
Load Balancer
    ↓
N x Frontend (CDN)
N x Auth Service
N x Project Service
N x Task Service
    ↓
PostgreSQL (Primary) + Replicas
    ↓
Redis Cache Layer
```

### Bottlenecks & Solutions
| Bottleneck | Cause | Solution |
|-----------|-------|----------|
| Database | Many queries | Connection pooling, Redis cache |
| API | Concurrent requests | Load balancing, caching |
| Frontend | Large bundles | Code splitting, lazy loading |
| Network | Latency | CDN, compression, HTTP/2 |

---

## Monitoring & Observability

### Logging
```javascript
// Structured JSON logs
{
  timestamp: "2024-01-01T12:00:00Z",
  level: "INFO|WARN|ERROR",
  service: "TaskService",
  message: "Task created",
  userId: "uuid",
  taskId: "uuid"
}
```

### Health Checks
```javascript
// /health endpoint
GET /health
→ { status: "ok", uptime: 3600, memory: "45MB" }
```

### Key Metrics
- Response time (p50, p95, p99)
- Error rate by type
- Cache hit rate
- Active users
- Database connections

---

## Technology Choices & Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | React 19 + Vite | Fast, modern, ecosystem |
| **State Mgmt** | React Query | Server state, caching, sync |
| **Backend** | Node.js + Express | JavaScript, event-driven |
| **Database** | PostgreSQL | ACID, JSON, relational |
| **Auth** | JWT + bcrypt | Stateless, scalable, secure |
| **Caching** | In-memory (React Query) | Simple, effective, no infra |

---

## Future Enhancements

### Phase 2
- [ ] WebSocket real-time updates
- [ ] Advanced analytics dashboard
- [ ] Message queue (RabbitMQ)
- [ ] Multi-tenancy support

### Phase 3
- [ ] Mobile app (React Native)
- [ ] AI-powered fraud detection
- [ ] Email notifications
- [ ] SSO integration

---

## Deployment Architecture

### Production
```
┌─────────────────┐
│  Vercel (CDN)   │ ← Frontend (static)
└────────┬────────┘
         │ API calls
┌────────▼──────────────┐
│   Railway (PaaS)      │ ← Backend services
│   ├─ Auth Service     │
│   ├─ Project Service  │
│   └─ Task Service     │
│   ├─ PostgreSQL       │
│   └─ Redis (future)   │
└───────────────────────┘
```

### Development
```
Docker Compose:
├─ postgres:5432
├─ auth:4001
├─ project:4002
├─ task:4003
└─ frontend:5173
```

---

## Disaster Recovery

### Backups
- **Frequency**: Daily
- **Storage**: Cloud backup service
- **Retention**: 30 days
- **Recovery Time**: < 1 hour

### Failover
- Database replicas
- Multi-region deployment (future)
- Health checks with auto-restart

---

## Conclusion

GPA Tracker demonstrates:
- ✅ Full-stack microservices architecture
- ✅ Production-grade error handling
- ✅ Immutable audit trails
- ✅ Scalable database design
- ✅ Security best practices
- ✅ Modern frontend patterns (React Query)

**Ready to scale from 100 to 10,000+ users with minimal changes.**
