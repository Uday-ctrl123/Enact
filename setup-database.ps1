# Database Setup Script for Tyson Project (PowerShell)
# This script ensures your Supabase database has all required tables and policies

Write-Host "🚀 Setting up Supabase Database..." -ForegroundColor Cyan
Write-Host ""

# Project ID from your recent request
$PROJECT_REF = "gepchsmzlzljroelinee"

Write-Host "📋 Project Reference: $PROJECT_REF" -ForegroundColor Yellow
Write-Host ""

# Link to remote project
Write-Host "🔗 Linking to remote Supabase project..." -ForegroundColor Cyan
npx supabase link --project-ref $PROJECT_REF

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully linked to project" -ForegroundColor Green
} else {
    Write-Host "Failed to link. Please check your credentials." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📤 Pushing migrations to remote database..." -ForegroundColor Cyan
npx supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migrations applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to push migrations." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:8080/auth"
Write-Host "2. Create an account or sign in"
Write-Host "3. Navigate to http://localhost:8080/chat"
Write-Host "4. Start chatting!"
