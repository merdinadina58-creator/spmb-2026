#!/bin/bash
cd /home/z/my-project

while true; do
  # Start the server
  setsid bun run dev >> dev.log 2>&1 &
  SRV_PID=$!
  
  # Wait for it to be ready
  sleep 3
  
  # Warm up
  curl -s http://localhost:3000/ > /dev/null 2>&1
  
  # Keep pinging until it dies
  while true; do
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
    if [ "$HTTP" != "200" ] && [ "$HTTP" != "302" ] && [ "$HTTP" != "401" ]; then
      # Check if process is really dead
      if ! ps -p $SRV_PID > /dev/null 2>&1; then
        break
      fi
      # Process alive but not responding - give it a moment
      sleep 2
      HTTP2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
      if [ "$HTTP2" != "200" ] && [ "$HTTP2" != "302" ] && [ "$HTTP2" != "401" ]; then
        kill $SRV_PID 2>/dev/null
        break
      fi
    fi
    sleep 4
  done
  
  # Truncate log if too large
  LOGSIZE=$(wc -c < /home/z/my-project/dev.log 2>/dev/null || echo 0)
  if [ "$LOGSIZE" -gt 262144 ]; then
    tail -20 /home/z/my-project/dev.log > /home/z/my-project/dev.log.tmp
    mv /home/z/my-project/dev.log.tmp /home/z/my-project/dev.log
  fi
  
  sleep 1
done
