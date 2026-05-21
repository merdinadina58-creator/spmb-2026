#!/bin/bash
while true; do
  npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "Server died at $(date), restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
