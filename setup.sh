#!/bin/bash

# Lapser Dashboard - One-Time Setup
# Run this ONCE after downloading the ZIP from GitHub
# Then you can just use ./start-laptop.sh to run the server

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   Lapser Dashboard - First-Time Setup      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found!"
  echo "   Please install from: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Initialize git repo if not already done
if [ ! -d .git ]; then
  echo "Setting up git repository..."
  git init
  git config user.email "you@example.com"
  git config user.name "Lapser User"
  git add .
  git commit -m "Initial commit from downloaded ZIP"
  git remote add origin https://github.com/asiv29/lapser-dashboard.git
  git fetch origin main
  git branch -M main
  git reset --hard origin/main
  echo "✅ Git initialized and synced with GitHub"
else
  echo "✅ Git repository already exists"
fi

echo ""

# Install/update dependencies
echo "Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ npm install failed!"
  echo "Please check your internet connection and try again."
  exit 1
fi
echo "✅ Dependencies installed"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                       ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Next: Run ./start-laptop.sh to start the server"
echo ""
