#!/bin/bash

# Gemini Robotics Live - Easy Startup Script

set -e

echo "🚀 Starting Gemini Robotics Live..."
echo ""

# Check if .env exists
if [ ! -f "apps/server/.env" ]; then
    echo "❌ Error: apps/server/.env not found"
    echo "Please copy apps/server/.env.example to apps/server/.env"
    echo "and add your GEMINI_API_KEY"
    exit 1
fi

# Load API key from .env
export $(cat apps/server/.env | grep -v '^#' | xargs)

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY not set in apps/server/.env"
    exit 1
fi

echo "✅ API key loaded"
echo "✅ Starting backend on port ${PORT:-5050}..."

# Build backend if needed
if [ ! -d "apps/server/dist" ]; then
    echo "📦 Building backend..."
    cd apps/server && pnpm build && cd ../..
fi

# Start backend in background
cd apps/server
GEMINI_API_KEY=$GEMINI_API_KEY PORT=${PORT:-5050} node dist/index.js &
BACKEND_PID=$!
cd ../..

echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Check if backend is responding
if curl -s http://localhost:${PORT:-5050}/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed, but continuing..."
fi

echo ""
echo "✅ Starting frontend on port 3000..."
echo ""

# Start frontend
cd apps/web
pnpm dev

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID 2>/dev/null || true" EXIT