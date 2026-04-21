#!/bin/bash

echo "🔧 Fixing Admin Product Dropdown Issue"
echo "======================================"

# Navigate to admin frontend directory (we're already here)
echo "📍 Current directory: $(pwd)"

# Check current git status
echo "📋 Git status:"
git status

# Stash any local changes to avoid conflicts
echo "💾 Stashing local changes..."
git stash

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Clear node modules and reinstall
echo "🧹 Clearing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Clear any existing build
echo "🗑️ Clearing existing build..."
rm -rf build

# Build the project
echo "🏗️ Building admin frontend..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    
    # Set proper permissions
    echo "🔐 Setting proper permissions..."
    chmod -R 755 build/
    
    echo "🎉 Admin frontend rebuild completed!"
    echo "📝 The product dropdown should now be visible in the admin panel."
    
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

echo ""
echo "🔍 Next steps:"
echo "1. Copy build files to server root directory"
echo "2. Visit admin.kadin.app and log in"
echo "3. Go to Reels management"
echo "4. Click 'Add Reel' to see the product dropdown"
echo ""