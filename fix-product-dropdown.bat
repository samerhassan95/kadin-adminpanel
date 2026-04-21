@echo off
echo 🔧 Fixing Admin Product Dropdown Issue
echo ======================================

echo 📍 Current directory: %cd%

echo 📋 Git status:
git status

echo 💾 Stashing local changes...
git stash

echo 📥 Pulling latest changes from GitHub...
git pull origin main

echo 🧹 Clearing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📦 Installing dependencies...
npm install --legacy-peer-deps

echo 🗑️ Clearing existing build...
if exist build rmdir /s /q build

echo 🏗️ Building admin frontend...
npm run build

if exist build (
    echo ✅ Build completed successfully!
    echo 🎉 Admin frontend rebuild completed!
    echo 📝 The product dropdown should now be visible in the admin panel.
) else (
    echo ❌ Build failed! Check the error messages above.
    exit /b 1
)

echo.
echo 🔍 Next steps:
echo 1. Copy build files to server root directory
echo 2. Visit admin.kadin.app and log in
echo 3. Go to Reels management
echo 4. Click 'Add Reel' to see the product dropdown
echo.

pause