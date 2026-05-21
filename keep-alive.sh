#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    sleep 1
    if curl -s -m 2 http://localhost:3000/api/auth/setup > /dev/null 2>&1; then
      echo "Server ready!"
      break
    fi
  done
  
  # Keep server alive with periodic requests
  while kill -0 $SERVER_PID 2>/dev/null; do
    curl -s -m 3 http://localhost:3000/api/auth/setup > /dev/null 2>&1
    sleep 3
  done
  
  echo "Server died, restarting..."
  sleep 2
done
