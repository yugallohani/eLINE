#!/bin/bash

echo "🔄 Resetting and Setting Up eLINE Database"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will delete all existing data!"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🗑️  Dropping existing database..."
docker exec eline-postgres psql -U postgres -c "DROP DATABASE IF EXISTS eline;" 2>/dev/null

echo "📦 Creating fresh database..."
docker exec eline-postgres psql -U postgres -c "CREATE DATABASE eline;"

echo "🔧 Generating Prisma Client..."
npm run db:generate

echo "📊 Pushing schema to database..."
npm run db:push -- --accept-data-loss --skip-generate

echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the application:"
echo "   npm run dev:all"
echo ""
