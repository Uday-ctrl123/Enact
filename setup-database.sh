#!/bin/bash

# Database Setup Script for Tyson Project
# This script ensures your Supabase database has all required tables and policies

echo "🚀 Setting up Supabase Database..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Get project ref from .env
PROJECT_REF="gepchsmzlzljroelinee"

echo "📋 Project Reference: $PROJECT_REF"
echo ""

# Link to remote project
echo "🔗 Linking to remote Supabase project..."
supabase link --project-ref $PROJECT_REF

if [ $? -eq 0 ]; then
    echo "✅ Successfully linked to project"
else
    echo "❌ Failed to link. Please check your credentials."
    exit 1
fi

echo ""
echo "📤 Pushing migrations to remote database..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migrations applied successfully!"
else
    echo "❌ Failed to push migrations."
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to http://localhost:8080/auth"
echo "2. Create an account or sign in"
echo "3. Navigate to http://localhost:8080/chat"
echo "4. Start chatting!"
