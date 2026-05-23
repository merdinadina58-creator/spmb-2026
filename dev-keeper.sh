#!/bin/bash
cd /home/z/my-project
LOG="/home/z/my-project/dev.log"
echo "[$(date)] Dev keeper started" >> $LOG

while true; do
  # Check if server is responding
  if ! curl -s -o /dev/null -w "" http://127.0.0.1:3000/ 2>/dev/null; then
    echo "[$(date)] Server not responding, killing old processes..." >> $LOG
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    pkill -9 -f "postcss" 2>/dev/null
    sleep 3
    
    echo "[$(date)] Starting server..." >> $LOG
    NODE_OPTIONS='--max-old-space-size=1024' node node_modules/.bin/next dev -p 3000 >> $LOG 2>&1 &
    SERVER_PID=$!
    disown $SERVER_PID
    
    # Wait up to 30 seconds for server to respond
    for i in $(seq 1 15); do
      sleep 2
      if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
        echo "[$(date)] Server responding (PID $SERVER_PID)" >> $LOG
        break
      fi
    done
  fi
  sleep 8
done
