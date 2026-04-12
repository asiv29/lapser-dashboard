#!/bin/bash

# Lapser Dashboard - Laptop Server Startup Script
# Run this to start the dashboard server on your laptop

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   Lapser Dashboard Server                  ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Server will run on: http://localhost:4000"
echo "Press Ctrl+C to stop"
echo ""

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies (first run)..."
  npm install
  if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    echo "Please check your internet connection and try again."
    exit 1
  fi
  echo "✅ Dependencies installed"
  echo ""
fi

# Start the server
echo "🚀 Starting server..."
echo ""
npm start
