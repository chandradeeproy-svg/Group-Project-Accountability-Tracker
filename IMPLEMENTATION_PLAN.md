# Production-Grade Microservice Architecture — Implementation Plan

## Current State Assessment

| Aspect | Current State | Gap |
|--------|--------------|-----|
| **Architecture** | 3 services (auth:4001, project:4002, task:4003) + React frontend | No API Gateway — frontend hits each service directly |
| **Shared Code** | `@gpa/shared` with DB pool + event recording | No structured logging, no health checks, no middleware library |
| **Config** | Per-service `.env` files with hardcoded secrets | No centralized config validation, secrets exposed |
| **Error Handling** | `try/catch` with `500` status + raw message | No custom error classes, no correlation IDs, inconsistent error shapes |
| **Database** | Single Neon Postgres shared by all services | OK for now, but no connection retry, no graceful shutdown |
| **Auth** | JWT with duplicated middleware across services | Works, but middleware is copy-pasted, not from shared package |
| **Observability** | `console.log` / `console.error` only | No structured logging, no request tracing, no metrics |
| **Deployment** | `npm run dev` with `concurrently` | No Docker, no container orchestration, no CI/CD |
| **Inter-Service Comms** | Direct DB writes to shared tables | No event bus, tight coupling between services |
| **Testing** | None | No unit tests, no integration tests |

---

## Phase 1 — API Gateway (Single Entry Point) [Day 1]

> **Why:** The frontend currently has 3 different base URLs. An API Gateway provides a single entry point, handles CORS centrally, and prepares for rate limiting, auth verification at the gateway level, and service discovery.

### Tasks:
1. Create `backend/services/gateway/` as a new Express service
2. Route requests by prefix:
   - `/api/v1/auth/*` → auth-service (port 4001)
   - `/api/v1/projects/*` → project-service (port 4002)
   - `/api/v1/tasks/*` → task-service (port 4003)
   - `/api/v1/activity/*` → task-service (port 4003)
   - `/api/v1/users/*` → auth-service (port 4001)
3. Use `http-proxy-middleware` for reverse proxying
4. Centralize CORS handling at the gateway (remove from individual services)
5. Add request ID generation (`X-Request-ID` header) at gateway
6. Update frontend to hit single gateway URL (`http://localhost:4000/api/v1/...`)
7. Add gateway to the `concurrently` dev script

### Expected Outcome:
- Frontend has ONE base URL
- Every request gets a unique request ID for tracing

---

## Phase 2 — Centralized Config, Structured Logging & Shared Middleware [Day 2]

> **Why:** Duplicated config/middleware across services is a maintenance nightmare. Structured logging makes production debugging possible.

### Tasks:
1. **Enhance `@gpa/shared` package:**
   - Add `config/index.js` — Zod-validated environment config loader
   - Add `logger/index.js` — Structured JSON logger with `pino`
   - Add `middleware/auth.js` — Single auth middleware used by all services
   - Add `middleware/requestId.js` — Extract/propagate `X-Request-ID`
   - Add `middleware/errorHandler.js` — Centralized async error handler
   - Add `errors/AppError.js` — Custom error classes (NotFoundError, ValidationError, UnauthorizedError, etc.)

2. **Refactor each service to:**
   - Import config, logger, auth middleware from `@gpa/shared`
   - Remove duplicated `config/env.js`, `middlewares/auth.middleware.js`
   - Use structured logger instead of `console.log`
   - Add request ID to all log entries

### Expected Outcome:
- Zero duplicated middleware code
- JSON logs with request IDs, timestamps, service name
- Validated config with clear startup errors on missing env vars

---

## Phase 3 — Health Checks & Graceful Shutdown [Day 3]

> **Why:** Production services need health endpoints for load balancer checks and need to drain connections cleanly on shutdown (container restarts, deploys).

### Tasks:
1. Add to `@gpa/shared`:
   - `health/index.js` — Health check middleware (`/health/live`, `/health/ready`)
   - `lifecycle/gracefulShutdown.js` — Signal handler that drains DB pool and HTTP connections

2. Each service registers:
   - Liveness probe (is process running?)
   - Readiness probe (is DB connected?)
   - Graceful shutdown on `SIGTERM`/`SIGINT`

3. Gateway health endpoint aggregates downstream service health

### Expected Outcome:
- `GET /health/live` → 200 always (process is running)
- `GET /health/ready` → 200 only if DB is connected
- Clean shutdown with no dropped requests

---

## Phase 4 — Robust Error Handling & Validation [Day 4]

> **Why:** Current error handling leaks internal errors to clients and doesn't distinguish between 400/401/403/404/500 properly.

### Tasks:
1. Create error class hierarchy in `@gpa/shared/errors`:
   ```
   AppError (base)
   ├── ValidationError (400)
   ├── UnauthorizedError (401)
   ├── ForbiddenError (403)
   ├── NotFoundError (404)
   └── ConflictError (409)
   ```

2. Centralized error handler middleware:
   - Catches all errors
   - Formats consistent error response: `{ error: { code, message, requestId } }`
   - Logs error with full stack trace (not exposed to client)
   - Distinguishes operational errors from programmer errors

3. Refactor controllers to throw custom errors instead of doing `res.status(...)` manually

### Expected Outcome:
- Consistent error response shape across all services
- Internal details never leaked to clients
- Proper HTTP status codes for every error scenario

---

## Phase 5 — Docker Containerization [Day 5]

> **Why:** Containers ensure "works on my machine" = "works in production". Required for any deployment platform.

### Tasks:
1. Create per-service `Dockerfile`:
   - Multi-stage build (install deps → copy source → run)
   - Non-root user
   - Health check instruction
2. Create root `docker-compose.yml`:
   - All 4 backend services (gateway + 3 microservices)
   - Frontend dev server
   - PostgreSQL container (for local dev, optional since using Neon)
   - Shared network
   - Environment variable injection
3. Create `docker-compose.override.yml` for dev-specific config (volume mounts, hot reload)
4. Add `.dockerignore` files

### Expected Outcome:
- `docker compose up` spins up entire stack
- Each service runs in isolated container
- Identical environment across all developer machines

---

## Phase 6 — Event-Driven Inter-Service Communication [Day 6]

> **Why:** Currently, the task-service writes directly to `evidence_events` (shared table). In true microservices, services should communicate via events, not shared database tables.

### Tasks:
1. Add lightweight in-process event bus to `@gpa/shared` (using Node.js `EventEmitter` or Redis Pub/Sub for cross-process)
2. Define event contracts:
   - `task.created` → project-service can react
   - `task.status.changed` → notification-service (future)
   - `member.added` → task-service can react
3. For MVP: Use Redis Pub/Sub (you already have `ioredis` in shared deps)
4. Each service subscribes to events it cares about
5. Decouple `evidence_events` writing from direct DB calls to event handlers

### Expected Outcome:
- Services communicate via events, not shared DB tables
- Adding new services doesn't require modifying existing ones
- Audit trail is event-driven

---

## Phase 7 — Production Hardening [Day 7]

> **Why:** Security, performance, and reliability for real users.

### Tasks:
1. **Rate Limiting** — Add `express-rate-limit` at gateway level
2. **Helmet** — Security headers on all services
3. **Request Validation** — Input sanitization
4. **Connection Pooling** — Tune PG pool settings (min/max/idle timeout)
5. **CORS Lockdown** — Restrict to known origins
6. **JWT Improvements** — Refresh tokens, token rotation
7. **API Versioning** — Already have `/api/v1/`, enforce it

### Expected Outcome:
- Hardened against common attacks
- Proper connection management
- Ready for production traffic

---

## Progress Tracker

| Phase | Status | Date Completed |
|-------|--------|----------------|
| Phase 1 — API Gateway | ✅ DONE | 2026-04-15 |
| Phase 2 — Config + Logging | ✅ DONE | 2026-04-15 |
| Phase 3 — Health Checks | ✅ DONE | 2026-04-15 |
| Phase 4 — Error Handling | ✅ DONE | 2026-04-15 |
| Phase 5 — Docker | ⏭️ SKIPPED | — |
| Phase 6 — Event Bus | ✅ DONE | 2026-04-16 |
| Phase 7 — Hardening | ✅ DONE | 2026-04-16 |
