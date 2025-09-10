#!/bin/bash

# Afaris Real Estate Deployment Script
# This script helps deploy the backend to Render and update frontend configuration

echo "🚀 Starting Afaris Real Estate Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "server" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Project structure verified ✓"

# Check if required files exist
if [ ! -f "server/package.json" ]; then
    print_error "Server package.json not found"
    exit 1
fi

if [ ! -f "server/prisma/schema.prisma" ]; then
    print_error "Prisma schema not found"
    exit 1
fi

print_status "Required files verified ✓"

# Build the frontend
print_status "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Frontend build successful ✓"
else
    print_error "Frontend build failed"
    exit 1
fi

# Check server dependencies
print_status "Checking server dependencies..."
cd server
npm install

if [ $? -eq 0 ]; then
    print_status "Server dependencies installed ✓"
else
    print_error "Failed to install server dependencies"
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    print_status "Prisma client generated ✓"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

cd ..

print_status "✅ Local preparation complete!"
echo ""
print_warning "Next steps for Render deployment:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Render"
echo "3. Create a new Web Service in Render"
echo "4. Configure environment variables in Render dashboard"
echo "5. Update your frontend's VITE_API_BASE_URL in Vercel"
echo ""
print_status "See RENDER_DEPLOYMENT.md for detailed instructions"

