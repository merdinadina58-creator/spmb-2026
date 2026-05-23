#!/bin/bash
cd /home/z/my-project
LOG="/home/z/my-project/dev.log"
echo "[$(date)] Dev keeper v3 started" >> $LOG

while true; do
  # Check if next-server child process is alive
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Server not running, starting..." >> $LOG
    # Kill any stale processes
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    pkill -9 -f "postcss" 2>/dev/null
    sleep 3
    
    # Start server with lower memory
    NODE_OPTIONS='--max-old-space-size=768' nohup node node_modules/.bin/next dev -p 3000 >> $LOG 2>&1 &
    SERVER_PID=$!
    disown $SERVER_PID
    echo "[$(date)] Started server PID=$SERVER_PID" >> $LOG
    
    # Wait for server to be ready
    for i in $(seq 1 20); do
      sleep 2
      if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
        echo "[$(date)] Server is responding" >> $LOG
        break
      fi
    done
  fi
  
  sleep 5
done
