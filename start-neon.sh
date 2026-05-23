#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
echo "DATABASE_URL=$DATABASE_URL" > /home/z/my-project/.env
exec ./node_modules/.bin/next dev -p 3000
