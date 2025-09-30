#!/bin/bash

# Railway Deployment Script for Backend
# This script helps deploy the Express server to Railway

set -e

echo "🚂 Railway Deployment Helper for Gemini Robotics Live (Backend)"
echo "=============================================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI found"
echo ""

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: This script must be run from the repository root"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Check for environment variables
if [ ! -f "apps/server/.env" ]; then
    echo "⚠️  Warning: apps/server/.env not found"
    echo "📝 Creating from template..."
    
    if [ -f "apps/server/.env.example" ]; then
        cp apps/server/.env.example apps/server/.env
        echo "✅ Created apps/server/.env"
        echo ""
        echo "⚠️  IMPORTANT: Edit apps/server/.env and set:"
        echo "   - GEMINI_API_KEY (required)"
        echo "   - WEB_ORIGIN (your Vercel frontend URL)"
        echo ""
        read -p "Press Enter to continue after editing .env..."
    else
        echo "❌ Error: apps/server/.env.example not found"
        exit 1
    fi
fi

echo "🔍 Checking environment variables..."
if grep -q "your_gemini_api_key_here" apps/server/.env; then
    echo "❌ ERROR: .env still contains placeholder GEMINI_API_KEY!"
    echo "Please update apps/server/.env with your actual Gemini API key"
    echo "Get your key from: https://aistudio.google.com/apikey"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "🏗️  Testing build locally..."
cd apps/server
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
else
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🧪 Testing compiled server..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: dist/index.js not found after build"
    exit 1
fi
echo "✅ dist/index.js exists"

echo ""
echo "🚂 Railway Deployment Options:"
echo ""
echo "1. Via Railway Dashboard (Recommended for first deployment):"
echo "   a. Go to https://railway.app/new"
echo "   b. Choose 'Deploy from GitHub repo'"
echo "   c. Select your repository"
echo "   d. In Settings → General:"
echo "      - Set Root Directory: apps/server"
echo "      - Set Build Command: pnpm install && pnpm build"
echo "      - Set Start Command: node dist/index.js"
echo "   e. In Variables tab, add:"
echo "      - GEMINI_API_KEY"
echo "      - WEB_ORIGIN (your Vercel URL)"
echo "      - PORT=5050"
echo "      - NODE_ENV=production"
echo "   f. Generate domain in Settings → Networking"
echo ""
echo "2. Via Railway CLI (For subsequent deployments):"
echo "   - Run: railway login"
echo "   - Run: railway link (to link to existing project)"
echo "   - Run: railway up (to deploy)"
echo ""

read -p "Have you already created a Railway project? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚂 Deploying to Railway via CLI..."
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo "🔐 Not logged in to Railway. Logging in..."
        railway login
    fi
    
    # Check if linked to a project
    if [ ! -f ".railway/config.json" ]; then
        echo "🔗 Project not linked. Please link to your Railway project:"
        railway link
    fi
    
    # Set environment variables from .env file
    echo "📝 Setting environment variables on Railway..."
    
    # Read .env and set variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! $key =~ ^#.*$ ]] && [[ -n $key ]]; then
            # Remove any quotes from value
            value=$(echo $value | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            echo "Setting $key..."
            railway variables set "$key=$value"
        fi
    done < apps/server/.env
    
    echo ""
    echo "🚀 Deploying..."
    cd apps/server
    railway up
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "🔍 Check deployment:"
    echo "   railway logs"
    echo "   railway open (to open in browser)"
    echo ""
else
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo ""
    echo "1. Go to https://railway.app/new"
    echo "2. Click 'Deploy from GitHub repo'"
    echo "3. Select your repository: $(git remote get-url origin 2>/dev/null || echo 'your-repo')"
    echo "4. After creation, go to Settings:"
    echo ""
    echo "   General Settings:"
    echo "   ✓ Root Directory: apps/server"
    echo "   ✓ Build Command: pnpm install && pnpm build"
    echo "   ✓ Start Command: node dist/index.js"
    echo "   ✓ Watch Paths: apps/server/**"
    echo ""
    echo "   Variables:"
    
    # Display variables from .env
    echo "   Copy these from apps/server/.env:"
    while IFS='=' read -r key value; do
        if [[ ! $key =~ ^#.*$ ]] && [[ -n $key ]]; then
            echo "   ✓ $key"
        fi
    done < apps/server/.env
    
    echo ""
    echo "5. Go to Settings → Networking"
    echo "   ✓ Click 'Generate Domain'"
    echo "   ✓ Copy the domain URL"
    echo ""
    echo "6. Update Vercel environment variables:"
    echo "   ✓ Set NEXT_PUBLIC_SERVER_URL to the Railway domain"
    echo "   ✓ Redeploy on Vercel"
    echo ""
fi

echo ""
echo "✅ Next Steps:"
echo "  1. Test backend health: curl https://your-app.railway.app/health"
echo "  2. Update frontend NEXT_PUBLIC_SERVER_URL on Vercel"
echo "  3. Update backend WEB_ORIGIN with Vercel URL"
echo "  4. Test the full application"
echo ""