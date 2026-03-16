@echo off
REM Core Banking System - Setup Script for Windows
REM This script cleans up old dependencies and installs new ones

echo.
echo Cleaning up old dependencies...
cd ..\backend

REM Remove old node_modules and lock files
if exist node_modules (
    rmdir /s /q node_modules
    echo Removed node_modules
)

if exist package-lock.json (
    del package-lock.json
    echo Removed package-lock.json
)

if exist pnpm-lock.yaml (
    del pnpm-lock.yaml
    echo Removed pnpm-lock.yaml
)

if exist yarn.lock (
    del yarn.lock
    echo Removed yarn.lock
)

echo.
echo Installing fresh dependencies...
npm install

echo.
echo Setup complete! Dependencies installed.
echo.
echo Next steps:
echo 1. Copy .env.example to .env
echo 2. Add your Supabase credentials to .env
echo 3. Run: npm run dev
echo.
pause
