#!/bin/bash
cd /home/z/my-project
while true; do
  # Check if daemon is running
  if ! pgrep -f "dev-daemon.sh" > /dev/null; then
    echo "[$(date)] Daemon dead, restarting..." >> /home/z/my-project/supervisor.log
    setsid /home/z/my-project/dev-daemon.sh &
  fi
  # Check if next is running
  if ! pgrep -f "next dev -p 3000" > /dev/null; then
    echo "[$(date)] Next.js dead, daemon should restart it" >> /home/z/my-project/supervisor.log
  fi
  sleep 3
done
