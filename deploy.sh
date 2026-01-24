#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy to backend
echo "📁 Copying to backend..."
rm -rf backend/public
cp -r frontend/dist backend/public
cp frontend/public/logo.svg backend/public/

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Restart app
echo "🔄 Restarting application..."
pm2 restart realty-checkin

echo "✅ Deployment complete!"
