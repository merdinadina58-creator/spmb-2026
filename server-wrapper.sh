#!/bin/bash
trap 'echo "[$(date)] Received signal: $?" >> /tmp/server-signals.log' SIGHUP SIGINT SIGTERM SIGQUIT SIGABRT SIGUSR1 SIGUSR2 SIGPIPE SIGALRM
cd /home/z/my-project
echo "[$(date)] Server wrapper starting..." >> /tmp/server-signals.log
NODE_OPTIONS="--max-old-space-size=768" exec node node_modules/.bin/next dev -p 3000 2>&1 | tee -a /tmp/server-output.log
echo "[$(date)] Server exited with code: $?" >> /tmp/server-signals.log
