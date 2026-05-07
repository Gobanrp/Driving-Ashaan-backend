# D-Zone Driving Education Backend

A comprehensive Node.js/Express backend API for the D-Zone driving education platform.

## Features

✅ **User Authentication & Authorization**
- JWT-based authentication
- Secure password hashing with bcryptjs
- User registration and login

✅ **User Management**
- Profile management
- Account deletion
- Progress tracking

✅ **Lesson Management**
- Create, read, update, delete lessons
- Filter lessons by level and type
- Support for theory, quiz, and simulation content

✅ **Progress Tracking**
- Track lesson completion
- Store quiz attempts and scores
- Calculate user statistics
- Monitor time spent on lessons

✅ **Security Features**
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

✅ **Error Handling**
- Comprehensive error responses
- Validation error messages
- Development error details

## Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection
├── controllers/
│   ├── authController.ts    # Authentication logic
│   ├── lessonController.ts  # Lesson management
│   └── progressController.ts # Progress & stats
├── middleware/
│   ├── auth.ts              # JWT authentication
│   └── errorHandler.ts      # Error handling
├── models/
│   ├── User.ts              # User schema
│   ├── Lesson.ts            # Lesson schema
│   ├── Progress.ts          # Progress schema
│   └── QuizAttempt.ts       # Quiz schema
├── routes/
│   ├── authRoutes.ts        # Auth endpoints
│   ├── lessonRoutes.ts      # Lesson endpoints
│   └── progressRoutes.ts    # Progress endpoints
└── server.ts                # Main server file
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, Helmet, CORS, Rate Limiting
- **Validation**: express-validator

## Getting Started

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory**
```bash
cd Driving-Ashaan-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
```

4. **Update .env file**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/d-zone
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

5. **Start development server**
```bash
npm run dev
```

The server will start at `http://localhost:5000`

## Available Scripts

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm run test
```

## API Quick Start

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "driverman",
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "level": "Beginner"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "driverman",
    "password": "password123"
  }'
```

### 3. Get all lessons
```bash
curl http://localhost:5000/api/lessons
```

### 4. Get user stats (requires token)
```bash
curl -X GET http://localhost:5000/api/progress/stats/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Setup

### Local MongoDB
```bash
# If using MongoDB locally
mongod
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Frontend Integration

### Install API client
```bash
cd ../Driving-Ashaan-main
npm install axios
```

### Create API service
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Update UserContext to use API
```typescript
// Update your login function
const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.response.data.message };
  }
};
```

## API Documentation

Full API documentation available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Main Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

**Lessons**
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `GET /api/lessons/level/:level` - Get lessons by level
- `POST /api/lessons` - Create lesson (admin)
- `PUT /api/lessons/:id` - Update lesson (admin)
- `DELETE /api/lessons/:id` - Delete lesson (admin)

**Progress**
- `GET /api/progress` - Get user progress
- `GET /api/progress/lesson/:lessonId` - Get lesson progress
- `PUT /api/progress/lesson/:lessonId` - Mark lesson complete
- `POST /api/progress/quiz/submit` - Submit quiz attempt
- `GET /api/progress/quiz/:lessonId` - Get quiz attempts
- `GET /api/progress/stats/user` - Get user statistics

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Server Error

## Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- Rate limiting prevents abuse
- CORS protects against cross-origin attacks
- Input validation on all endpoints
- SQL injection prevention (using MongoDB)

## Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set FRONTEND_URL=your_frontend_url

# Deploy
git push heroku main
```

### Deploy to AWS/Google Cloud

See deployment guides in documentation.

## Troubleshooting

### MongoDB connection error
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check network connectivity

### JWT errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token is not expired
- Verify token format in Authorization header

### CORS errors
- Check `FRONTEND_URL` in `.env` matches your frontend
- Verify frontend origin is allowed

## Contributing

1. Create feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

## Future Enhancements

- [ ] Admin dashboard
- [ ] Email verification
- [ ] Password reset
- [ ] Leaderboards
- [ ] Achievements/Badges system
- [ ] WebSocket notifications
- [ ] File upload for lessons
- [ ] Analytics
- [ ] Mobile app API
- [ ] Swagger documentation

## Support

For issues or questions, please create an issue in the repository.

## License

This project is licensed under the ISC License.

## Contact

D-Zone Team - driving-education@example.com

---

**Happy Learning! 🚗📚**
