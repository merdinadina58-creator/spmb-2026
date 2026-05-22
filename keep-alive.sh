#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

while true; do
  echo "[$(date)] Starting dev server..." > /home/z/my-project/dev.log
  ./node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    sleep 1
    if curl -s -m 2 http://localhost:3000/api > /dev/null 2>&1; then
      echo "[$(date)] Server ready!" >> /home/z/my-project/dev.log
      break
    fi
  done
  
  # Keep server alive with periodic requests
  while kill -0 $SERVER_PID 2>/dev/null; do
    curl -s -m 3 http://localhost:3000/api > /dev/null 2>&1
    sleep 5
  done
  
  echo "[$(date)] Server died, restarting..." >> /home/z/my-project/dev.log
  sleep 2
done
