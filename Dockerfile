# ============================================
# SPMB 2026 - Dockerfile untuk Production Deploy
# ============================================
# Multi-stage build untuk ukuran image minimal
# Database: Neon PostgreSQL (cloud) - tidak perlu DB lokal

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install bun
RUN npm install -g bun

# Install dependencies using bun
RUN bun install --frozen-lockfile --production=false

# Stage 2: Build aplikasi
FROM node:20-alpine AS builder
WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy dependencies dari stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable untuk build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Build aplikasi Next.js (standalone output)
RUN bun run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets dari builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch ke user non-root
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start aplikasi
CMD ["node", "server.js"]
