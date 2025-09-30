#!/bin/bash

# Setup script for Gemini Robotics Live

set -e

echo "🚀 Setting up Gemini Robotics Live..."

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ PNPM version: $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "apps/server/.env" ]; then
    cp apps/server/.env.example apps/server/.env
    echo "📝 Created apps/server/.env - Please add your GEMINI_API_KEY"
else
    echo "✅ apps/server/.env already exists"
fi

if [ ! -f "apps/web/.env.local" ]; then
    cp apps/web/.env.local.example apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
else
    echo "✅ apps/web/.env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Gemini API key to apps/server/.env"
echo "2. Run 'pnpm dev' to start the development servers"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Read SETUP.md for more details"