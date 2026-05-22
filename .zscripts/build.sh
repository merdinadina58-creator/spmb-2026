#!/bin/bash

# Redirect stderr to stdout
exec 2>&1

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NEXTJS_PROJECT_DIR="/home/z/my-project"

if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Error: Next.js project directory not found: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Building Next.js application..."
cd "$NEXTJS_PROJECT_DIR" || exit 1

export NEXT_TELEMETRY_DISABLED=1
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
DATABASE_URL="$DATABASE_URL" npx prisma generate

# Build Next.js with standalone output
echo "🔨 Building Next.js application..."
DATABASE_URL="$DATABASE_URL" bun run build

# Verify build output
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Standalone build output not found!"
    exit 1
fi

# Build mini-services
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 Building mini-services..."
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️ No mini-services directory, skipping"
fi

# Collect build artifacts
echo "📦 Collecting build artifacts to $BUILD_DIR..."

# Copy standalone Next.js output
echo "  - Copying .next/standalone"
cp -r .next/standalone "$BUILD_DIR/next-service-dist/"

# Copy static files into standalone
echo "  - Copying .next/static into standalone"
cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"

# Copy public directory
if [ -d "public" ]; then
    echo "  - Copying public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Copy Prisma files (needed for runtime Prisma Client)
if [ -d "prisma" ]; then
    echo "  - Copying prisma directory"
    cp -r prisma "$BUILD_DIR/next-service-dist/"
fi

# Ensure Prisma Client is in node_modules of standalone
if [ ! -d "$BUILD_DIR/next-service-dist/node_modules/.prisma" ]; then
    echo "  - Copying Prisma Client to standalone node_modules"
    mkdir -p "$BUILD_DIR/next-service-dist/node_modules/.prisma"
    cp -r node_modules/.prisma/* "$BUILD_DIR/next-service-dist/node_modules/.prisma/" 2>/dev/null || true
    mkdir -p "$BUILD_DIR/next-service-dist/node_modules/@prisma"
    cp -r node_modules/@prisma/client "$BUILD_DIR/next-service-dist/node_modules/@prisma/" 2>/dev/null || true
fi

# Copy Caddyfile
if [ -f "Caddyfile" ]; then
    echo "  - Copying Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
fi

# Copy start.sh
echo "  - Copying start.sh"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Package everything
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Packaging build artifacts..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

echo ""
echo "✅ Build complete! Package: $PACKAGE_FILE"
echo "📊 Package size:"
ls -lh "$PACKAGE_FILE"
