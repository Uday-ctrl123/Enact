#!/bin/bash

# Database Restore Script for Tyson Legal Assistant
# This script restores a database backup

set -e

# Configuration
BACKUP_FILE="${1}"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-majxoxvsrbevthtnefyg}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Tyson Legal Assistant Database Restore ===${NC}"
echo "Timestamp: $(date)"
echo ""

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 ./backups/backup_20250127_120000.sql.gz"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo "Backup file: $BACKUP_FILE"

# Check if pg_restore is available
if ! command -v pg_restore &> /dev/null; then
    echo -e "${RED}Error: pg_restore not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Check if password is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${YELLOW}Warning: SUPABASE_DB_PASSWORD not set. You will be prompted for password.${NC}"
fi

# Confirmation prompt
echo -e "${YELLOW}WARNING: This will restore the database and may overwrite existing data!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Decompress if needed
RESTORE_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${GREEN}Decompressing backup...${NC}"
    RESTORE_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$RESTORE_FILE"
fi

# Perform restore
echo -e "${GREEN}Starting restore...${NC}"

export PGPASSWORD="$SUPABASE_DB_PASSWORD"

pg_restore \
    -h "db.${SUPABASE_PROJECT_ID}.supabase.co" \
    -U postgres \
    -d postgres \
    -c \
    --if-exists \
    --verbose \
    "$RESTORE_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Restore completed successfully${NC}"
else
    echo -e "${RED}✗ Restore failed${NC}"
    exit 1
fi

# Clean up decompressed file if we created it
if [[ "$BACKUP_FILE" == *.gz ]] && [ -f "$RESTORE_FILE" ]; then
    rm "$RESTORE_FILE"
fi

echo ""
echo -e "${GREEN}=== Restore Complete ===${NC}"
echo "Timestamp: $(date)"

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✓ Database restore completed successfully\nFile: $(basename $BACKUP_FILE)\"}"
fi

exit 0
