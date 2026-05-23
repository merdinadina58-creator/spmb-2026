#!/bin/bash
cd /home/z/my-project
LOG="/home/z/my-project/dev.log"

while true; do
  # Check if next-server child process is alive
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Server not running, starting..." >> $LOG
    pkill -9 -f "next dev" 2>/dev/null
    sleep 3
    NODE_OPTIONS='--max-old-space-size=1024' node node_modules/.bin/next dev -p 3000 >> $LOG 2>&1 &
    disown
    # Wait for server to be ready
    for i in $(seq 1 20); do
      sleep 2
      if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
        echo "[$(date)] Server responding" >> $LOG
        break
      fi
    done
  fi
  
  # Send a lightweight health check request to keep the server active
  curl -s -o /dev/null http://127.0.0.1:3000/api/auth/setup 2>/dev/null
  
  sleep 3
done
