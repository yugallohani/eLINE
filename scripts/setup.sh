#!/bin/bash

echo "🚀 eLINE Queue Management System - Setup Script"
echo "================================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your credentials:"
    echo "   - Twilio credentials (for SMS notifications)"
    echo "   - Admin password"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
else
    echo "✅ .env file already exists"
fi
echo ""

# Check if Twilio is configured
if grep -q "your_twilio_sid" .env; then
    echo "⚠️  Twilio not configured - SMS notifications will be mocked"
    echo "   To enable real SMS, add your Twilio credentials to .env"
else
    echo "✅ Twilio configured"
fi
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p backups
echo "✅ Directories created"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi
echo "✅ Frontend built successfully"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎉 You're ready to start eLINE!"
echo ""
echo "To start the application:"
echo "  1. Start backend:  npm run server"
echo "  2. Start frontend: npm run dev"
echo ""
echo "Or run both with:"
echo "  npm run dev & npm run server"
echo ""
echo "Access points:"
echo "  - Customer View: http://localhost:5173"
echo "  - Admin Dashboard: http://localhost:5173/admin"
echo "  - API: http://localhost:3000/api"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Getting started"
echo "  - docs/DEPLOYMENT.md - Production deployment"
echo "  - docs/API.md - API reference"
echo ""
