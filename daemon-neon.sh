#!/bin/bash
# Fully detached daemon for Neon PostgreSQL dev server
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
echo "DATABASE_URL=$DATABASE_URL" > /home/z/my-project/.env

# Close all file descriptors
exec 0</dev/null
exec 1>/home/z/my-project/dev.log
exec 2>&1

# Start new session
setsid ./node_modules/.bin/next dev -p 3000 &
echo "Daemon started at $(date)"

# Keep the script running to prevent cleanup
wait
