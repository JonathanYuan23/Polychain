#!/bin/bash

# Polychain Frontend - Quick Start Script

set -e

echo "🚀 Polychain Frontend Quick Start"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp .env.example .env
  echo "✅ Created .env file"
else
  echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo ""
  echo "📦 Installing dependencies..."
  
  # Check if bun is available
  if command -v bun &> /dev/null; then
    echo "Using Bun..."
    bun install
  else
    echo "Using npm..."
    npm install
  fi
  
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed"
fi

echo ""
echo "🔍 Checking backend connectivity..."

# Check if backend is running
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
  echo "✅ Backend is running"
else
  echo "⚠️  Backend not detected at http://localhost:8080"
  echo "   Make sure to start the backend server first:"
  echo "   cd ../server && make run"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo "🎬 Starting development server..."
echo ""

# Start the dev server
if command -v bun &> /dev/null; then
  bun run dev
else
  npm run dev
fi
