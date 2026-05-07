#!/bin/bash

# D-Zone Backend Startup Script

echo "🚀 D-Zone Backend Startup"
echo "=========================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Please update .env with your configuration"
    echo "📝 Edit .env file now:"
    echo "   - Set MONGODB_URI"
    echo "   - Set JWT_SECRET"
    echo "   - Set FRONTEND_URL"
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Choose environment
read -p "Run in development (d) or production (p) mode? (d/p) " -n 1 -r
echo
if [[ $REPLY =~ ^[Dd]$ ]]; then
    echo "🔄 Starting in development mode with hot-reload..."
    npm run dev
else
    echo "⚡ Starting in production mode..."
    npm start
fi
