@echo off
REM D-Zone Backend Startup Script for Windows

echo.
echo 🚀 D-Zone Backend Startup
echo ==========================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found
    echo 📄 Creating .env from .env.example...
    copy .env.example .env
    echo ✅ Please update .env with your configuration
    echo 📝 Edit .env file now:
    echo    - Set MONGODB_URI
    echo    - Set JWT_SECRET
    echo    - Set FRONTEND_URL
    pause
)

REM Check if dist exists
if not exist "dist" (
    echo 🔨 Building TypeScript...
    call npm run build
)

REM Choose environment
echo.
set /p mode="Run in development (d) or production (p) mode? (d/p): "

if /i "%mode%"=="d" (
    echo.
    echo 🔄 Starting in development mode with hot-reload...
    call npm run dev
) else (
    echo.
    echo ⚡ Starting in production mode...
    call npm start
)
