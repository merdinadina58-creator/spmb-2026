#!/bin/bash
cd /home/z/my-project
echo "[$(date)] Keep-alive script starting..." > /home/z/my-project/dev.log

while true; do
  echo "[$(date)] Starting next dev..." >> /home/z/my-project/dev.log
  ./node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE" >> /home/z/my-project/dev.log
  sleep 1
done
