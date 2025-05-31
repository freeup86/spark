#!/bin/bash

# Production deployment script for Spark application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
SKIP_BACKUP=false
SKIP_MIGRATION=false

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

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENV    Target environment (default: production)"
    echo "  --skip-backup           Skip database backup"
    echo "  --skip-migration        Skip database migrations"
    echo "  -h, --help              Show this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-migration)
            SKIP_MIGRATION=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            print_error "Unknown option $1"
            usage
            ;;
    esac
done

# Check if required files exist
if [[ ! -f ".env.prod" ]]; then
    print_error ".env.prod file not found. Please create it from .env.prod.example"
    exit 1
fi

if [[ ! -f "docker-compose.prod.yml" ]]; then
    print_error "docker-compose.prod.yml file not found"
    exit 1
fi

print_status "Starting deployment to $ENVIRONMENT environment..."

# Load environment variables
export $(cat .env.prod | grep -v '^#' | xargs)

# Pull latest changes
print_status "Pulling latest changes from Git..."
git pull origin main

# Backup database (if not skipped)
if [[ "$SKIP_BACKUP" == false ]]; then
    print_status "Creating database backup..."
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "backups/$BACKUP_FILE" || {
        print_warning "Database backup failed or database not running. Continuing..."
    }
fi

# Build and deploy
print_status "Building and deploying containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 30

# Run database migrations (if not skipped)
if [[ "$SKIP_MIGRATION" == false ]]; then
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
    docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
fi

# Health check
print_status "Performing health checks..."
sleep 10

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "000")
if [[ "$BACKEND_HEALTH" == "200" ]]; then
    print_status "Backend health check passed ✓"
else
    print_error "Backend health check failed (HTTP $BACKEND_HEALTH)"
fi

# Check frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")
if [[ "$FRONTEND_HEALTH" == "200" ]]; then
    print_status "Frontend health check passed ✓"
else
    print_error "Frontend health check failed (HTTP $FRONTEND_HEALTH)"
fi

# Clean up old images
print_status "Cleaning up old Docker images..."
docker image prune -f

print_status "Deployment completed successfully! 🚀"
print_status "Application is available at: https://$DOMAIN"
print_status "API is available at: https://api.$DOMAIN"
print_status "Traefik dashboard: https://traefik.$DOMAIN"