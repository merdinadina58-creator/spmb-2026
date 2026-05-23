#!/bin/bash
# Detach from controlling terminal
cd /home/z/my-project
exec >> /home/z/my-project/dev.log 2>&1

while true; do
  echo "[$(date)] Starting dev server..."
  ./node_modules/.bin/next dev -p 3000
  echo "[$(date)] Server exited, restarting in 1s..."
  sleep 1
done
