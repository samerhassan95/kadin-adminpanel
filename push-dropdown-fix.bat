@echo off
echo 🚀 Pushing Admin Product Dropdown Fix to GitHub
echo ===============================================

echo 📁 Adding new fix files...
git add fix-product-dropdown.sh
git add fix-product-dropdown.bat
git add test-product-dropdown.html
git add push-dropdown-fix.bat

echo 💾 Committing changes...
git commit -m "Add product dropdown fix scripts for admin frontend

- fix-product-dropdown.sh/bat: Rebuild admin frontend to show product dropdown
- test-product-dropdown.html: Test tool to verify dropdown functionality
- Fixes issue where product selection wasn't appearing in admin reels form
- Scripts are now in admin_frontend directory for easier deployment"

echo 📤 Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo ✅ Successfully pushed admin dropdown fix to GitHub!
    echo.
    echo 📋 Next steps:
    echo 1. SSH to your server
    echo 2. cd /www/wwwroot/admin.kadin.app
    echo 3. git pull origin main
    echo 4. bash fix-product-dropdown.sh
    echo.
) else (
    echo ❌ Failed to push to GitHub
    echo Please check your git configuration and try again
)

pause