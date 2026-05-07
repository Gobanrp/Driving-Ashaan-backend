# D-Zone Backend - API Documentation

## Overview
Backend API for the D-Zone driving education platform. Built with Express.js, TypeScript, and MongoDB.

## Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)

---

## Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
cd Driving-Ashaan-backend
npm install
```

2. **Environment Configuration**
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/d-zone

# JWT
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
npm start
```

---

## Authentication

### JWT Token
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Token Expiration
- Default: 7 days
- Configured via `JWT_EXPIRE` in `.env`

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/api/auth/register`

Request Body:
```json
{
  "username": "driverman",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "level": "Beginner"
}
```

Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "driverman",
    "email": "user@example.com",
    "level": "Beginner",
    "points": 0,
    "badges": 0,
    "completedLessons": []
  }
}
```

#### 2. Login
**POST** `/api/auth/login`

Request Body:
```json
{
  "username": "driverman",
  "password": "password123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "driverman",
    "email": "user@example.com",
    "level": "Beginner",
    "points": 150,
    "lastScore": 85,
    "badges": 2,
    "completedLessons": ["1", "2", "3"]
  }
}
```

#### 3. Get Current User
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "driverman",
    "email": "user@example.com",
    "level": "Beginner",
    "points": 150,
    "lastScore": 85,
    "badges": 2,
    "completedLessons": ["1", "2", "3"]
  }
}
```

#### 4. Update Profile
**PUT** `/api/auth/profile`

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```json
{
  "level": "Intermediate"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Profile updated",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "driverman",
    "level": "Intermediate"
  }
}
```

#### 5. Delete Account
**DELETE** `/api/auth/account`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### Lesson Endpoints

#### 1. Get All Lessons
**GET** `/api/lessons`

Query Parameters (optional):
- `level`: Filter by level (Beginner, Intermediate, Advanced, Expert)
- `type`: Filter by type (theory, quiz, simulation)

Response (200):
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Road Signs Basics",
      "description": "Learn the meaning of common road signs...",
      "level": "Beginner",
      "duration": "5 min",
      "type": "theory",
      "content": { ... },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Get Lesson by ID
**GET** `/api/lessons/:id`

Response (200):
```json
{
  "success": true,
  "data": { ... }
}
```

#### 3. Get Lessons by Level
**GET** `/api/lessons/level/:level`

Example: `/api/lessons/level/Beginner`

Response (200):
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

#### 4. Create Lesson (Admin)
**POST** `/api/lessons`

Headers:
```
Authorization: Bearer <admin_token>
```

Request Body:
```json
{
  "title": "New Lesson",
  "description": "Lesson description",
  "level": "Beginner",
  "duration": "10 min",
  "type": "theory",
  "content": {
    "sections": [ ... ]
  }
}
```

Response (201):
```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": { ... }
}
```

#### 5. Update Lesson (Admin)
**PUT** `/api/lessons/:id`

Headers:
```
Authorization: Bearer <admin_token>
```

Response (200):
```json
{
  "success": true,
  "message": "Lesson updated successfully",
  "data": { ... }
}
```

#### 6. Delete Lesson (Admin)
**DELETE** `/api/lessons/:id`

Headers:
```
Authorization: Bearer <admin_token>
```

Response (200):
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

---

### Progress Endpoints

#### 1. Get User Progress
**GET** `/api/progress`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "lessonId": "507f1f77bcf86cd799439013",
      "completed": true,
      "score": 85,
      "attempts": 2,
      "timeSpent": 600,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Get Lesson Progress
**GET** `/api/progress/lesson/:lessonId`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "completed": true,
    "score": 85,
    "attempts": 2
  }
}
```

#### 3. Mark Lesson Complete
**PUT** `/api/progress/lesson/:lessonId`

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```json
{
  "score": 85,
  "timeSpent": 600
}
```

Response (200):
```json
{
  "success": true,
  "message": "Lesson marked as completed",
  "data": { ... }
}
```

#### 4. Submit Quiz Attempt
**POST** `/api/progress/quiz/submit`

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```json
{
  "lessonId": "507f1f77bcf86cd799439013",
  "score": 85,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "timeTaken": 300,
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": "a",
      "isCorrect": true
    }
  ]
}
```

Response (201):
```json
{
  "success": true,
  "message": "Quiz attempt submitted",
  "data": {
    "attempt": { ... },
    "progress": { ... },
    "passed": true
  }
}
```

#### 5. Get Quiz Attempts
**GET** `/api/progress/quiz/:lessonId`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

#### 6. Get User Stats
**GET** `/api/progress/stats/user`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "username": "driverman",
    "level": "Intermediate",
    "points": 250,
    "badges": 3,
    "lastScore": 88,
    "totalLessonsAttempted": 8,
    "completedLessons": 6,
    "quizAttempts": 15,
    "averageScore": 82.3
  }
}
```

---

## Database Schema

### User Schema
```typescript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  level: Enum ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  completedLessons: String[],
  points: Number,
  lastScore: Number,
  badges: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Lesson Schema
```typescript
{
  title: String (required),
  description: String (required),
  level: Enum ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  duration: String,
  type: Enum ['theory', 'quiz', 'simulation'],
  content: Mixed (any JSON content),
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Schema
```typescript
{
  userId: String (indexed),
  lessonId: String (indexed),
  completed: Boolean,
  score: Number,
  attempts: Number,
  timeSpent: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### QuizAttempt Schema
```typescript
{
  userId: String (indexed),
  lessonId: String (indexed),
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  answers: Array<{questionId, selectedAnswer, isCorrect}>,
  timeTaken: Number,
  createdAt: Date
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Bad Request | Missing or invalid fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate username/email |
| 500 | Internal Server Error | Server error |

---

## Integration with Frontend

Update your frontend `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

Example API call in React:
```typescript
const loginUser = async (username: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    return data.user;
  }
  
  throw new Error(data.message);
};
```

---

## Development Notes

- All passwords are hashed using bcryptjs before storage
- JWT tokens include user ID and username
- Rate limiting is enabled (100 requests per 15 minutes)
- CORS is configured to accept requests from the frontend URL
- Helmet.js is used for security headers
- MongoDB indexes are created on frequently queried fields

---

## Future Enhancements

- [ ] Admin role and permissions
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Leaderboards
- [ ] Achievement system
- [ ] Notifications
- [ ] File upload for lesson media
- [ ] Analytics dashboard
- [ ] User feedback/ratings
- [ ] Mobile app support
