#!/bin/bash
cd /home/z/my-project
trap '' TERM INT HUP

while true; do
  # Truncate log periodically
  if [ -f /home/z/my-project/dev.log ]; then
    LOGSIZE=$(wc -c < /home/z/my-project/dev.log 2>/dev/null || echo 0)
    if [ "$LOGSIZE" -gt 200000 ]; then
      tail -20 /home/z/my-project/dev.log > /home/z/my-project/dev.log.tmp
      mv /home/z/my-project/dev.log.tmp /home/z/my-project/dev.log
    fi
  fi
  
  # Start server
  ./node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  sleep 0.5
done
