#!/bin/bash

# Lapser Dashboard - Laptop Server Startup Script
# Run this to start the dashboard server on your laptop

echo "🚀 Starting Lapser Dashboard..."
echo ""
echo "Server will run on: http://localhost:4000"
echo "Press Ctrl+C to stop"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start the server
npm start
