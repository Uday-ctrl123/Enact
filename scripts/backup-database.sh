#!/bin/bash

# Automated Database Backup Script for Tyson Legal Assistant
# This script creates automated backups of the Supabase database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-majxoxvsrbevthtnefyg}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Tyson Legal Assistant Database Backup ===${NC}"
echo "Timestamp: $(date)"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Check if password is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${YELLOW}Warning: SUPABASE_DB_PASSWORD not set. You will be prompted for password.${NC}"
fi

# Perform backup
echo -e "${GREEN}Starting backup...${NC}"

export PGPASSWORD="$SUPABASE_DB_PASSWORD"

pg_dump \
    -h "db.${SUPABASE_PROJECT_ID}.supabase.co" \
    -U postgres \
    -d postgres \
    -F c \
    -f "${BACKUP_DIR}/${BACKUP_FILE}" \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo "Backup file: ${BACKUP_DIR}/${BACKUP_FILE}"
    
    # Get file size
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Compress backup
echo -e "${GREEN}Compressing backup...${NC}"
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Compression completed${NC}"
    COMPRESSED_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)
    echo "Compressed size: $COMPRESSED_SIZE"
else
    echo -e "${YELLOW}Warning: Compression failed, keeping uncompressed backup${NC}"
fi

# Clean up old backups
echo -e "${GREEN}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
find "$BACKUP_DIR" -name "backup_*.sql" -type f -mtime +${RETENTION_DAYS} -delete

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.sql*" -type f | wc -l)
echo "Remaining backups: $REMAINING_BACKUPS"

# Upload to cloud storage (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
    echo -e "${GREEN}Uploading to S3...${NC}"
    aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" "s3://${AWS_S3_BUCKET}/backups/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Upload to S3 completed${NC}"
    else
        echo -e "${YELLOW}Warning: S3 upload failed${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=== Backup Complete ===${NC}"
echo "Backup location: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
echo "Timestamp: $(date)"

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✓ Database backup completed successfully\n Size: $COMPRESSED_SIZE\nFile: ${BACKUP_FILE}.gz\"}"
fi

exit 0
