# Docker Setup Guide

Run GPA Tracker in Docker containers (optional, but recommended for production).

---

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed
- [Docker Compose](https://docs.docker.com/compose/) (usually comes with Docker Desktop)

---

## Quick Start with Docker Compose

### Step 1: Create `docker-compose.yml` in project root

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: gpa-postgres
    environment:
      POSTGRES_DB: gpa
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API Gateway
  gateway:
    build:
      context: ./backend/services/gateway
      dockerfile: Dockerfile
    container_name: gpa-gateway
    ports:
      - "4000:4000"
    environment:
      PORT: 4000
      NODE_ENV: production
      CORS_ORIGIN: http://localhost:3000
      RATE_LIMIT_MAX: 120
    depends_on:
      - auth
      - project
      - task
    networks:
      - gpa-network

  # Auth Service
  auth:
    build:
      context: ./backend/services/auth-service
      dockerfile: Dockerfile
    container_name: gpa-auth
    ports:
      - "4001:4001"
    environment:
      PORT: 4001
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/gpa
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      JWT_EXPIRY: 7d
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - gpa-network

  # Project Service
  project:
    build:
      context: ./backend/services/project-service
      dockerfile: Dockerfile
    container_name: gpa-project
    ports:
      - "4002:4002"
    environment:
      PORT: 4002
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/gpa
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - gpa-network

  # Task Service
  task:
    build:
      context: ./backend/services/task-service
      dockerfile: Dockerfile
    container_name: gpa-task
    ports:
      - "4003:4003"
    environment:
      PORT: 4003
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/gpa
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - gpa-network

  # Frontend (Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:4000/api/v1
    container_name: gpa-frontend
    ports:
      - "3000:80"
    depends_on:
      - gateway
    networks:
      - gpa-network

volumes:
  postgres_data:

networks:
  gpa-network:
    driver: bridge
```

---

## Step 2: Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Troubleshooting Docker

### Container exits immediately
```bash
docker-compose logs auth  # Check specific service logs
```

### Database connection refused
```bash
# Wait for postgres to be healthy
docker-compose up postgres
docker-compose ps
```

### Port already in use
```bash
# Change port in docker-compose.yml
# Example: "5433:5432" for postgres on 5433
```

### Clear everything and restart
```bash
docker-compose down -v
docker-compose up -d
```

---

## Production Checklist

- [ ] Use strong JWT_SECRET
- [ ] Change PostgreSQL password
- [ ] Set NODE_ENV=production
- [ ] Use reverse proxy (Nginx)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Use managed database (RDS, Neon)
- [ ] Configure backups

---

For more details, see [docker-compose.yml](../docker-compose.yml) and [SETUP.md](./SETUP.md).
