#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting production server..." > /home/z/my-project/dev.log
  ./node_modules/.bin/next start -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 1s..." >> /home/z/my-project/dev.log
  sleep 1
done
