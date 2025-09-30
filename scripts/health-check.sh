#!/bin/bash

# Health check script

echo "🏥 Running health checks..."
echo ""

# Check if server is running
SERVER_URL=${1:-http://localhost:5050}
WEB_URL=${2:-http://localhost:3000}

echo "Checking backend server at $SERVER_URL..."
if curl -s -f "$SERVER_URL/health" > /dev/null; then
    echo "✅ Backend server is healthy"
    curl -s "$SERVER_URL/health" | jq
else
    echo "❌ Backend server is not responding"
fi

echo ""
echo "Checking frontend at $WEB_URL..."
if curl -s -f "$WEB_URL" > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "Environment variables:"
if [ -f "apps/server/.env" ]; then
    if grep -q "GEMINI_API_KEY=your_api_key_here" apps/server/.env; then
        echo "⚠️  GEMINI_API_KEY not configured"
    else
        echo "✅ GEMINI_API_KEY is set"
    fi
else
    echo "❌ apps/server/.env not found"
fi

if [ -f "apps/web/.env.local" ]; then
    echo "✅ apps/web/.env.local exists"
else
    echo "❌ apps/web/.env.local not found"
fi