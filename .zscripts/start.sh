#!/bin/sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

pids=""

cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    sleep 2
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -KILL "$pid" 2>/dev/null
        fi
    done
    echo "✅ All services stopped"
    exit 0
}

echo "🚀 Starting all services..."
echo ""

cd "$BUILD_DIR" || exit 1

# Set Neon PostgreSQL DATABASE_URL
export DATABASE_URL="postgresql://neondb_owner:npg_lJQ5pe2ayVGH@ep-bitter-salad-ao7imaxp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Start Next.js server (standalone mode)
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Starting Next.js server..."
    cd next-service-dist/ || exit 1

    export NODE_ENV=production
    export PORT="${PORT:-3000}"
    export HOSTNAME="${HOSTNAME:-0.0.0.0}"

    echo "🗄️ Using Neon PostgreSQL database"

    node server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"

    sleep 2
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Next.js server failed to start"
        exit 1
    else
        echo "✅ Next.js server started (PID: $NEXT_PID, Port: $PORT)"
    fi

    cd ../
else
    echo "❌ Next.js server.js not found in ./next-service-dist/"
    exit 1
fi

# Start mini-services
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 Starting mini-services..."
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    sleep 1
    if kill -0 "$MINI_PID" 2>/dev/null; then
        echo "✅ mini-services started (PID: $MINI_PID)"
    fi
fi

# Start Caddy
echo "🚀 Starting Caddy..."
echo ""
echo "🎉 All services started!"

exec caddy run --config Caddyfile --adapter caddyfile
