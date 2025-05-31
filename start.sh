#!/bin/bash

# Render.com start script for Spark application

set -e

echo "🚀 Starting Render service..."

# Determine which service we're starting based on environment variable
if [ "$RENDER_SERVICE_TYPE" = "backend" ] || [ -z "$RENDER_SERVICE_TYPE" ]; then
    echo "🔄 Starting backend service..."
    cd backend
    
    # Run database migrations
    echo "📊 Running database migrations..."
    npx prisma migrate deploy
    
    # Start the application
    echo "🚀 Starting NestJS application..."
    npm run start:prod
    
elif [ "$RENDER_SERVICE_TYPE" = "frontend" ]; then
    echo "🔄 Starting frontend service..."
    cd frontend
    
    # Start Next.js application
    echo "🚀 Starting Next.js application..."
    npm start
    
else
    echo "❌ Unknown service type: $RENDER_SERVICE_TYPE"
    exit 1
fi