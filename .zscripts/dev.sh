#!/bin/bash
cd /home/z/my-project

# Override DATABASE_URL to use Neon PostgreSQL instead of SQLite
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Fix .env file (sandbox overwrites it with SQLite URL on restart)
echo "DATABASE_URL=$DATABASE_URL" > /home/z/my-project/.env

# Install dependencies
bun install

# Generate Prisma Client
DATABASE_URL="$DATABASE_URL" npx prisma generate

# Start dev server
DATABASE_URL="$DATABASE_URL" bun run dev
