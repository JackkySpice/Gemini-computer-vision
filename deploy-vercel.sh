#!/bin/bash

# Vercel Deployment Script for Monorepo
# This script helps deploy the Next.js app from the monorepo to Vercel

set -e

echo "🚀 Vercel Deployment Helper for Gemini Robotics Live"
echo "=================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: This script must be run from the repository root"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Check for environment variables
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  Warning: apps/web/.env.local not found"
    echo "📝 Creating from template..."
    
    if [ -f "apps/web/.env.example" ]; then
        cp apps/web/.env.example apps/web/.env.local
        echo "✅ Created apps/web/.env.local"
        echo "⚠️  IMPORTANT: Edit apps/web/.env.local and set NEXT_PUBLIC_SERVER_URL"
        echo ""
        read -p "Press Enter to continue after editing .env.local..."
    else
        echo "❌ Error: apps/web/.env.example not found"
        exit 1
    fi
fi

echo "🔍 Checking environment variables..."
if grep -q "your-backend" apps/web/.env.local; then
    echo "⚠️  WARNING: .env.local still contains placeholder values!"
    echo "Please update NEXT_PUBLIC_SERVER_URL with your actual backend URL"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "🏗️  Testing build locally..."
cd apps/web
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
else
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "⚠️  IMPORTANT: When prompted by Vercel CLI:"
echo "   1. Confirm the project settings"
echo "   2. Make sure 'Root Directory' is set to 'apps/web'"
echo "   3. Framework should be 'Next.js'"
echo ""
read -p "Ready to deploy? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Deploy from the web app directory
    # The --cwd flag ensures we're deploying from the correct directory
    vercel --cwd apps/web --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Post-Deployment Checklist:"
    echo "  1. Go to Vercel Dashboard → Settings → General"
    echo "  2. Verify Root Directory is set to 'apps/web'"
    echo "  3. Go to Settings → Environment Variables"
    echo "  4. Add NEXT_PUBLIC_SERVER_URL with your backend URL"
    echo "  5. Redeploy if you added/changed environment variables"
    echo ""
    echo "🔗 Don't forget to:"
    echo "  - Deploy the backend (apps/server) to Railway or similar"
    echo "  - Update backend WEB_ORIGIN env var with your Vercel URL"
    echo ""
else
    echo "Deployment cancelled."
    exit 0
fi