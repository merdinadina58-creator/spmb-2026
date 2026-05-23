#!/bin/bash
cd /home/z/my-project

# Override DATABASE_URL to use Neon PostgreSQL
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Fix .env file (sandbox overwrites it with SQLite URL on restart)
echo "DATABASE_URL=$DATABASE_URL" > /home/z/my-project/.env

# Install dependencies
bun install

# NOTE: Prisma generate removed - we use @neondatabase/serverless directly

# Start dev server with auto-restart keeper
DATABASE_URL="$DATABASE_URL" bun run dev &
DEV_PID=$!

# Keep-alive loop: restart server if it crashes
while true; do
  if ! kill -0 $DEV_PID 2>/dev/null; then
    echo "[$(date)] Dev server crashed, restarting..." >> /home/z/my-project/dev.log
    DATABASE_URL="$DATABASE_URL" bun run dev &
    DEV_PID=$!
  fi
  # Send health check to keep server responsive
  curl -s -o /dev/null http://127.0.0.1:3000/api/auth/setup 2>/dev/null
  sleep 5
done
