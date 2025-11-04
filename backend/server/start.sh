#!/bin/bash

# Quick Start Script for Polychain Server

set -e

echo "🚀 Polychain Server Quick Start"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and set your Neo4j password!"
    echo "   NEO4J_PASSWORD=your_actual_password"
    echo ""
    read -p "Press enter once you've updated .env..."
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📦 Installing dependencies..."
go mod download
go mod tidy
echo "✓ Dependencies installed"
echo ""

echo "🔗 Connecting to Neo4j at $NEO4J_URI..."
echo ""

echo "▶️  Starting server on port $PORT..."
echo ""
echo "Server will be available at: http://localhost:$PORT"
echo ""
echo "API Endpoints:"
echo "  • POST   /api/relationships              - Create relationship"
echo "  • POST   /api/relationships/bulk         - Bulk load"
echo "  • GET    /api/companies/{name}/relationships - Get company data"
echo "  • GET    /api/health                     - Health check"
echo ""
echo "To load seed data (in another terminal):"
echo "  make seed"
echo "  # or"
echo "  curl -X POST http://localhost:$PORT/api/relationships/bulk -H 'Content-Type: application/json' -d @seed_data.json"
echo ""
echo "================================"
echo ""

go run main.go
