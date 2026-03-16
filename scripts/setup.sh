#!/bin/bash

# Core Banking System - Setup Script
# This script cleans up old dependencies and installs new ones

echo "🔄 Cleaning up old dependencies..."
cd backend

# Remove old node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock

echo "📦 Installing fresh dependencies..."
npm install

echo "✅ Setup complete! Dependencies installed."
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your Supabase credentials to .env"
echo "3. Run: npm run dev"
