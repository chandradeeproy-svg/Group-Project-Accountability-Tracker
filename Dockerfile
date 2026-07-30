# Multi-stage build for optimized image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Install dependencies
RUN npm install

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Final stage - runtime
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install production dependencies only
RUN cd backend && npm install --only=production

# Expose ports for all services
EXPOSE 4000 4001 4002 4003 5173

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start command
CMD ["npm", "run", "start:all"]
