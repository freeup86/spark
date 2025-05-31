#!/bin/bash

# Render.com build script for Spark application

set -e

echo "🚀 Starting Render build process..."

# Determine which service we're building based on environment variable
if [ "$RENDER_SERVICE_TYPE" = "backend" ] || [ -z "$RENDER_SERVICE_TYPE" ]; then
    echo "📦 Building backend service..."
    cd backend
    npm ci
    npx prisma generate
    npm run build
    echo "✅ Backend build completed"
elif [ "$RENDER_SERVICE_TYPE" = "frontend" ]; then
    echo "📦 Building frontend service..."
    cd frontend
    npm ci
    npm run build
    echo "✅ Frontend build completed"
else
    echo "❌ Unknown service type: $RENDER_SERVICE_TYPE"
    exit 1
fi

echo "🎉 Build process completed successfully!"