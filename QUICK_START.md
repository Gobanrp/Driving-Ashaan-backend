# Quick Start Guide - D-Zone Backend

## 5-Minute Setup

### Step 1: Prerequisites Check
```bash
# Check Node.js version (v16+ required)
node --version

# Check npm
npm --version

# Install MongoDB locally or use MongoDB Atlas (cloud)
```

### Step 2: Environment Setup
```bash
# Navigate to backend folder
cd "Driving-Ashaan-backend"

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Required:
# - MONGODB_URI (get from MongoDB Atlas)
# - JWT_SECRET (use a strong random string)
# - FRONTEND_URL=http://localhost:5173
```

### Step 3: Install & Build
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 4: Start Server
```bash
# Development mode (recommended)
npm run dev

# OR Production mode
npm run build
npm start
```

**Server should be running at:** `http://localhost:5000`

---

## MongoDB Setup (Pick One)

### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Create database user
4. Add IP whitelist (0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/d-zone`
6. Update `MONGODB_URI` in `.env`

### Option B: MongoDB Local
```bash
# Windows - Download from https://www.mongodb.com/try/download/community
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
mongod
```

Use connection string: `mongodb://localhost:27017/d-zone`

---

## Testing the API

### 1. Check Server Health
```bash
curl http://localhost:5000/api/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "level": "Beginner"
  }'
```

**Response will include:**
- `token` - Save this!
- `user` - User object with ID

### 3. Get Lessons
```bash
curl http://localhost:5000/api/lessons
```

### 4. Use Token for Protected Routes
```bash
# Replace TOKEN with the token from step 2
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## File Structure Overview

```
Driving-Ashaan-backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript (after build)
├── .env                 # Environment variables (create from .env.example)
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

---

## Common Commands

```bash
# Development
npm run dev              # Hot-reload development server

# Build & Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server

# Utilities
npm run lint             # Check code style
npm run test             # Run tests (if configured)
```

---

## Connecting Frontend

### Update Frontend .env
```env
VITE_API_URL=http://localhost:5000/api
```

### Install API Client
```bash
cd ../Driving-Ashaan-main
npm install axios
```

### Add to Frontend
See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for complete integration steps.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Port 5000 already in use` | Change PORT in .env or kill process using port |
| `MongoDB connection failed` | Check MONGODB_URI is correct and reachable |
| `Invalid token error` | Update JWT_SECRET in .env, token becomes invalid |
| `CORS error` | Check FRONTEND_URL in .env matches your frontend |
| `npm install fails` | Try `npm cache clean --force` then `npm install` |

---

## Running Both Services

### Terminal 1 - Backend
```bash
cd Driving-Ashaan-backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd Driving-Ashaan-main
npm run dev
```

**Access app at:** http://localhost:5173

---

## API Endpoints Cheat Sheet

```
AUTHENTICATION
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login user
GET    /api/auth/me            Get current user (auth required)
PUT    /api/auth/profile       Update profile (auth required)
DELETE /api/auth/account       Delete account (auth required)

LESSONS
GET    /api/lessons            Get all lessons
GET    /api/lessons/:id        Get lesson by ID
GET    /api/lessons/level/:level  Get lessons by level
POST   /api/lessons            Create lesson (auth required)
PUT    /api/lessons/:id        Update lesson (auth required)
DELETE /api/lessons/:id        Delete lesson (auth required)

PROGRESS
GET    /api/progress           Get user progress (auth required)
GET    /api/progress/lesson/:lessonId  Get lesson progress
PUT    /api/progress/lesson/:lessonId  Mark lesson complete
POST   /api/progress/quiz/submit       Submit quiz (auth required)
GET    /api/progress/quiz/:lessonId    Get quiz attempts
GET    /api/progress/stats/user        Get user stats (auth required)
```

---

## Next Steps

1. **Set up MongoDB** - Get connection string
2. **Create .env file** - Configure environment variables
3. **Install dependencies** - `npm install`
4. **Start backend** - `npm run dev`
5. **Test endpoints** - Use curl or Postman
6. **Connect frontend** - Follow [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
7. **Deploy backend** - Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Documentation

- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Connect to frontend
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy to production
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

## Support

**Stuck?** Check:
1. Error messages in terminal
2. MongoDB connection string
3. Environment variables in `.env`
4. Backend port (default: 5000)
5. Documentation files above

**Need help?** Create an issue with:
- Error message
- Your .env settings (without secrets)
- Steps to reproduce

---

## What You Get

✅ User authentication & authorization
✅ RESTful API with 15+ endpoints
✅ MongoDB database integration
✅ JWT token-based security
✅ Progress tracking system
✅ Quiz scoring & attempts
✅ User statistics
✅ Error handling & validation
✅ CORS & rate limiting
✅ Production-ready code

---

## Development Tools

### Recommended
- **Postman** - Test APIs: https://www.postman.com
- **MongoDB Compass** - View database: https://www.mongodb.com/products/compass
- **VS Code** - Code editor: https://code.visualstudio.com
- **Git** - Version control: https://git-scm.com

### Optional
- **Insomnia** - API client alternative
- **Studio 3T** - MongoDB GUI
- **Robo 3T** - MongoDB client

---

**Ready to build? Let's go! 🚀**
