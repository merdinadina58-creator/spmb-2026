#!/bin/bash
cd /home/z/my-project
while true; do
  # Check if the next-server child process is alive
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] next-server not running, restarting..." >> /tmp/keep-alive.log
    # Kill any stale parent processes
    pkill -f "next dev" 2>/dev/null
    sleep 3
    # Start fresh - use setsid to create new process group
    NODE_OPTIONS='--max-old-space-size=1024' setsid node node_modules/.bin/next dev -p 3000 >> /tmp/next-dev.log 2>&1 &
    # Wait for server to be ready
    for i in $(seq 1 15); do
      sleep 2
      if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
        echo "[$(date)] Server started and responding" >> /tmp/keep-alive.log
        break
      fi
    done
  fi
  sleep 5
done
