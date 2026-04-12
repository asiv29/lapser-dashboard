@echo off
setlocal enabledelayedexpansion

REM Lapser Dashboard - One-Time Setup (Windows)
REM Run this ONCE after downloading the ZIP from GitHub
REM Then you can just use start-laptop.bat to run the server

cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   Lapser Dashboard - First-Time Setup      ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Node.js not found!
  echo    Please install from: https://nodejs.org/
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Initialize git repo if not already done
if not exist .git (
  echo Setting up git repository...
  git init
  git config user.email "you@example.com"
  git config user.name "Lapser User"
  git add .
  git commit -m "Initial commit from downloaded ZIP"
  git remote add origin https://github.com/asiv29/lapser-dashboard.git
  git fetch origin main
  git branch -M main
  git reset --hard origin/main
  echo ✅ Git initialized and synced with GitHub
) else (
  echo ✅ Git repository already exists
)

echo.

REM Install/update dependencies
echo Installing npm dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo ❌ npm install failed!
  echo Please try again or check your internet connection.
  pause
  exit /b 1
)
echo ✅ Dependencies installed

echo.
echo ╔════════════════════════════════════════════╗
echo ║   Setup Complete! 🎉                       ║
echo ╚════════════════════════════════════════════╝
echo.
echo Next: Run start-laptop.bat to start the server
echo.
pause
