@echo off
REM Lapser Dashboard - Laptop Server Startup Script (Windows)
REM Run this to start the dashboard server on your laptop

echo.
echo Starting Lapser Dashboard...
echo.
echo Server will run on: http://localhost:4000
echo Press Ctrl+C to stop
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  echo.
)

REM Start the server
call npm start
