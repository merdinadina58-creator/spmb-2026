#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Detach from controlling terminal
exec >> /home/z/my-project/dev.log 2>&1

while true; do
  echo "[$(date)] Starting dev server with Neon PostgreSQL..."
  ./node_modules/.bin/next dev -p 3000
  echo "[$(date)] Server exited, restarting in 1s..."
  sleep 1
done
