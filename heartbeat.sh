#!/bin/bash
# Heartbeat: pings the Next.js server to keep it alive
cd /home/z/my-project

while true; do
  # Try to fetch a lightweight API endpoint
  if command -v curl &> /dev/null; then
    curl -s --max-time 3 http://127.0.0.1:3000/api/auth/setup > /dev/null 2>&1
  elif command -v node &> /dev/null; then
    node -e "const h=require('http');h.get('http://127.0.0.1:3000/api/auth/setup',()=>process.exit(0)).on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),3000)" 2>/dev/null
  fi
  sleep 5
done
