@echo off
REM Afaris Real Estate Deployment Script for Windows
REM This script helps deploy the backend to Render and update frontend configuration

echo 🚀 Starting Afaris Real Estate Deployment Process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory
    exit /b 1
)

if not exist "server\package.json" (
    echo [ERROR] Server package.json not found
    exit /b 1
)

echo [INFO] Project structure verified ✓

REM Build the frontend
echo [INFO] Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)

echo [INFO] Frontend build successful ✓

REM Check server dependencies
echo [INFO] Checking server dependencies...
cd server
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    exit /b 1
)

echo [INFO] Server dependencies installed ✓

REM Generate Prisma client
echo [INFO] Generating Prisma client...
call npx prisma generate

if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)

echo [INFO] Prisma client generated ✓

cd ..

echo [INFO] ✅ Local preparation complete!
echo.
echo [WARNING] Next steps for Render deployment:
echo 1. Push your code to GitHub
echo 2. Connect your repository to Render
echo 3. Create a new Web Service in Render
echo 4. Configure environment variables in Render dashboard
echo 5. Update your frontend's VITE_API_BASE_URL in Vercel
echo.
echo [INFO] See RENDER_DEPLOYMENT.md for detailed instructions

pause

