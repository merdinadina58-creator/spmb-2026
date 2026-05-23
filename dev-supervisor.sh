#!/bin/bash
# Dev server supervisor - keeps Next.js running
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
export PORT=3000

while true; do
  # Check if already running
  if curl -s http://localhost:3000/api/auth/setup > /dev/null 2>&1; then
    sleep 10
    continue
  fi
  
  # Start server
  rm -rf .next
  node node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
  NEXT_PID=$!
  echo "$(date): Starting Next.js PID=$NEXT_PID" >> /home/z/my-project/supervisor.log
  
  # Wait for it to be ready
  for i in $(seq 1 20); do
    sleep 2
    if curl -s http://localhost:3000/api/auth/setup > /dev/null 2>&1; then
      echo "$(date): Server ready" >> /home/z/my-project/supervisor.log
      break
    fi
  done
  
  # Wait and monitor
  while kill -0 $NEXT_PID 2>/dev/null; do
    sleep 5
  done
  
  echo "$(date): Server died, restarting..." >> /home/z/my-project/supervisor.log
  sleep 3
done
