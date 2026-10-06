@echo off
echo 🚀 Setting up Supabase Database...
echo.
echo 📋 Project Reference: gepchsmzlzljroelinee
echo.
echo 🔗 Linking to remote Supabase project...
call npx supabase link --project-ref gepchsmzlzljroelinee
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to link. Please check your credentials.
    exit /b 1
)
echo.
echo 📤 Pushing migrations to remote database...
call npx supabase db push
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to push migrations.
    exit /b 1
)
echo.
echo 🎉 Database setup complete!
echo.
echo Next steps:
echo 1. Go to http://localhost:8080/auth
echo 2. Create an account or sign in
echo 3. Navigate to http://localhost:8080/chat
echo 4. Start chatting!
