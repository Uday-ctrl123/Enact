# Automated Database Backup Script for Tyson Legal Assistant (PowerShell)
# This script creates automated backups of the Supabase database

param(
    [string]$BackupDir = "./backups",
    [int]$RetentionDays = 30,
    [string]$SupabaseProjectId = "majxoxvsrbevthtnefyg",
    [string]$SupabaseDbPassword = $env:SUPABASE_DB_PASSWORD
)

$ErrorActionPreference = "Stop"

Write-Host "=== Tyson Legal Assistant Database Backup ===" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)"
Write-Host "Backup directory: $BackupDir"
Write-Host ""

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Check if pg_dump is available
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (!$pgDump) {
    Write-Host "Error: pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

# Check if password is set
if ([string]::IsNullOrEmpty($SupabaseDbPassword)) {
    Write-Host "Warning: SUPABASE_DB_PASSWORD not set. You will be prompted for password." -ForegroundColor Yellow
}

# Perform backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$timestamp.sql"
$backupPath = Join-Path $BackupDir $backupFile

Write-Host "Starting backup..." -ForegroundColor Green

$env:PGPASSWORD = $SupabaseDbPassword

try {
    & pg_dump `
        -h "db.$SupabaseProjectId.supabase.co" `
        -U postgres `
        -d postgres `
        -F c `
        -f $backupPath `
        --verbose

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backup completed successfully" -ForegroundColor Green
        Write-Host "Backup file: $backupPath"
        
        # Get file size
        $backupSize = (Get-Item $backupPath).Length / 1MB
        Write-Host "Backup size: $([math]::Round($backupSize, 2)) MB"
    } else {
        throw "Backup failed with exit code $LASTEXITCODE"
    }

    # Compress backup
    Write-Host "Compressing backup..." -ForegroundColor Green
    Compress-Archive -Path $backupPath -DestinationPath "$backupPath.zip" -Force
    
    if (Test-Path "$backupPath.zip") {
        Write-Host "✓ Compression completed" -ForegroundColor Green
        $compressedSize = (Get-Item "$backupPath.zip").Length / 1MB
        Write-Host "Compressed size: $([math]::Round($compressedSize, 2)) MB"
        
        # Remove uncompressed file
        Remove-Item $backupPath
    }

    # Clean up old backups
    Write-Host "Cleaning up old backups (older than $RetentionDays days)..." -ForegroundColor Green
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem -Path $BackupDir -Filter "backup_*.zip" | 
        Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
        Remove-Item -Force

    $remainingBackups = (Get-ChildItem -Path $BackupDir -Filter "backup_*.zip").Count
    Write-Host "Remaining backups: $remainingBackups"

    # Upload to cloud storage (optional)
    if ($env:AWS_S3_BUCKET) {
        Write-Host "Uploading to S3..." -ForegroundColor Green
        aws s3 cp "$backupPath.zip" "s3://$($env:AWS_S3_BUCKET)/backups/"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Upload to S3 completed" -ForegroundColor Green
        } else {
            Write-Host "Warning: S3 upload failed" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "=== Backup Complete ===" -ForegroundColor Green
    Write-Host "Backup location: $backupPath.zip"
    Write-Host "Timestamp: $(Get-Date)"

    # Send notification (optional)
    if ($env:SLACK_WEBHOOK_URL) {
        $body = @{
            text = "✓ Database backup completed successfully`nSize: $([math]::Round($compressedSize, 2)) MB`nFile: $backupFile.zip"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $env:SLACK_WEBHOOK_URL -Method Post -Body $body -ContentType 'application/json'
    }

} catch {
    Write-Host "✗ Backup failed: $_" -ForegroundColor Red
    exit 1
}

exit 0
