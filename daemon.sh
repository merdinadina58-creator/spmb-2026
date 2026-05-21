#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 2>&1 | tee -a /home/z/my-project/dev.log
  echo "Restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
