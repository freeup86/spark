#!/bin/bash

# Database backup script for Spark application

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [[ -f ".env.prod" ]]; then
    export $(cat .env.prod | grep -v '^#' | xargs)
else
    print_error ".env.prod file not found"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p backups

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="backups/spark-backup-$TIMESTAMP.sql"

print_status "Creating database backup..."

# Create backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
    -U $POSTGRES_USER \
    -h localhost \
    $POSTGRES_DB > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    print_status "Backup created successfully: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    print_status "Backup compressed: $BACKUP_FILE.gz"
    
    # Remove old backups (keep last 30 days)
    find backups/ -name "*.sql.gz" -mtime +30 -delete
    print_status "Old backups cleaned up"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    print_status "Backup size: $BACKUP_SIZE"
else
    print_error "Backup failed"
    exit 1
fi