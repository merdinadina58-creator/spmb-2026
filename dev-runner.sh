#!/bin/bash
trap 'echo "RECEIVED SIGNAL: $@" >> /tmp/server-signals.log' SIGHUP SIGINT SIGTERM SIGKILL
cd /home/z/my-project
echo "$(date): Starting dev server..." >> /tmp/server-signals.log
NODE_OPTIONS="--max-old-space-size=2048" npx next dev -p 3000 2>&1
EXIT=$?
echo "$(date): Server exited with code $EXIT" >> /tmp/server-signals.log
