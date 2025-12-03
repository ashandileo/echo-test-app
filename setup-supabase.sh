#!/bin/bash

# Echo Test App - Supabase Local Development Setup Script
# This script helps setup Supabase local development environment

echo "🚀 Echo Test App - Supabase Setup"
echo "=================================="
echo ""

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if Supabase CLI is installed
echo "🔧 Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi
echo "✅ Supabase CLI is installed ($(supabase --version))"
echo ""

# Install npm dependencies
echo "📚 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Start Supabase
echo "🐳 Starting Supabase (this may take a few minutes on first run)..."
supabase start
echo ""

# Show status
echo "📊 Supabase Status:"
supabase status
echo ""

echo "✨ Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Open Supabase Studio: http://localhost:54423"
echo "  2. Start Next.js dev server: npm run dev"
echo "  3. Your app will be at: http://localhost:3000"
echo ""
echo "📚 Useful commands:"
echo "  - npm run supabase:status    # Check Supabase status"
echo "  - npm run supabase:stop      # Stop Supabase"
echo "  - npm run supabase:reset     # Reset database"
echo ""
