#!/bin/bash

echo "🚀 eLINE Complete Setup Script"
echo "=============================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop:"
    echo "1. Open Docker Desktop app from Applications"
    echo "2. Wait for it to start (whale icon in menu bar)"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if container already exists
if docker ps -a | grep -q eline-postgres; then
    echo "📦 PostgreSQL container already exists"
    
    # Check if it's running
    if docker ps | grep -q eline-postgres; then
        echo "✅ PostgreSQL is already running"
    else
        echo "🔄 Starting existing PostgreSQL container..."
        docker start eline-postgres
        echo "✅ PostgreSQL started"
    fi
else
    echo "📦 Creating PostgreSQL container..."
    docker run --name eline-postgres \
      -e POSTGRES_DB=eline \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=password123 \
      -p 5432:5432 \
      -d postgres:15-alpine
    
    echo "✅ PostgreSQL container created and started"
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
fi

echo ""
echo "🔍 Verifying PostgreSQL connection..."
sleep 2

if docker exec eline-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
else
    echo "⏳ Waiting a bit more..."
    sleep 3
    if docker exec eline-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
    else
        echo "⚠️  PostgreSQL might need more time. Continuing anyway..."
    fi
fi

echo ""
echo "📦 Installing npm dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
echo "Generating Prisma Client..."
npm run db:generate

echo ""
echo "📊 Creating database tables..."
npm run db:push

echo ""
echo "🌱 Seeding database with demo data..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You're ready to start eLINE!"
echo ""
echo "To start the application, run:"
echo "  npm run dev:all"
echo ""
echo "Then open:"
echo "  Customer View: http://localhost:5173"
echo "  Admin Dashboard: http://localhost:5173/admin"
echo ""
echo "Useful Docker commands:"
echo "  docker stop eline-postgres   # Stop database"
echo "  docker start eline-postgres  # Start database"
echo "  docker logs eline-postgres   # View logs"
echo ""
