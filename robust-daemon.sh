#!/bin/bash
cd /home/z/my-project

LOG=/home/z/my-project/dev.log

# Clean up
pkill -f "next dev -p 3000" 2>/dev/null
sleep 1

# Truncate log if too large
if [ -f "$LOG" ]; then
  LOGSIZE=$(wc -c < "$LOG" 2>/dev/null || echo 0)
  if [ "$LOGSIZE" -gt 524288 ]; then
    tail -50 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
  fi
fi

start_server() {
  ./node_modules/.bin/next dev -p 3000 >> "$LOG" 2>&1 &
  SERVER_PID=$!
  echo "$(date): Started server PID $SERVER_PID" >> /home/z/my-project/daemon.log
}

# Start the server
start_server

# Monitor loop
while true; do
  sleep 3
  
  # Check if the server process is still running
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "$(date): Server died, restarting..." >> /home/z/my-project/daemon.log
    start_server
    sleep 2
  fi
  
  # Check if the server is responding
  if ! curl -s --max-time 2 http://localhost:3000/api/auth/setup > /dev/null 2>&1; then
    # Server not responding but process exists - might be stuck
    echo "$(date): Server not responding, checking..." >> /home/z/my-project/daemon.log
    # Give it one more chance
    sleep 2
    if ! curl -s --max-time 2 http://localhost:3000/api/auth/setup > /dev/null 2>&1; then
      echo "$(date): Server still not responding, killing and restarting..." >> /home/z/my-project/daemon.log
      kill $SERVER_PID 2>/dev/null
      sleep 1
      start_server
    fi
  fi
done
