@echo off
REM Lapser Dashboard - Laptop Server Startup Script (Windows)
REM Run this to start the dashboard server on your laptop

echo.
echo ╔════════════════════════════════════════════╗
echo ║   Lapser Dashboard Server                  ║
echo ╚════════════════════════════════════════════╝
echo.
echo Server will run on: http://localhost:4000
echo Press Ctrl+C to stop
echo.

REM Check if node_modules exists, if not install
if not exist "node_modules" (
  echo 📦 Installing dependencies (first run)...
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
  )
  echo ✅ Dependencies installed
  echo.
)

REM Start the server
echo 🚀 Starting server...
echo.
call npm start
