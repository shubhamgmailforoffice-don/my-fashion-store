@echo off
title DRIIVN Fashion Store - Quick Launcher
cd /d "%~dp0"

echo ===================================================
echo     DRIIVN FASHION STORE - ONE-CLICK LAUNCHER
echo ===================================================
echo.

:: 1. Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not detected on this computer!
    echo.
    echo Please install Node.js (Version 20 LTS or newer):
    echo Download link: https://nodejs.org/
    echo.
    echo After installing Node.js, double-click this file again.
    echo ===================================================
    pause
    exit /b 1
)

echo [✓] Node.js detected:
node -v
npm -v
echo.

:: 2. Ensure .env file exists
if not exist ".env" (
    echo [*] Creating .env file with cloud database configuration...
    (
        echo DATABASE_URL="postgresql://neondb_owner:npg_kAaPtSDdfw32@ep-soft-base-b451yb5i-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
    ) > .env
    echo [✓] .env file created successfully!
) else (
    echo [✓] .env file already exists.
)
echo.

:: 3. Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [*] First time setup: Installing npm dependencies...
    echo This may take a few minutes depending on your internet speed. Please wait...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install encountered an error. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [✓] Dependencies installed successfully!
) else (
    echo [✓] Dependencies (node_modules) found.
)
echo.

:: 4. Generate Prisma client
echo [*] Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Prisma generate had an issue. Continuing to server start...
) else (
    echo [✓] Prisma client generated successfully!
)
echo.

:: 5. Open browser and start development server
echo ===================================================
echo   Starting DRIIVN Fashion Store on http://localhost:3000
echo   Admin Panel is available at: http://localhost:3000/admin
echo   (Admin: admin@fashionstore.com / admin123)
echo ===================================================
echo.

:: Launch browser in background after 3 seconds
start "" powershell -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

:: Start Next.js
call npm run dev

pause
