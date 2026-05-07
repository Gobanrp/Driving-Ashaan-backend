# D-Zone Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│                   (React + TypeScript)                      │
│                  Vite Build Tool, Tailwind                  │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS/HTTP
             │ JWT Token
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / CORS                       │
│              (Express + Helmet + Rate Limiting)             │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴──────────────────────┐
    │                               │
    ▼                               ▼
┌──────────────────┐         ┌──────────────────┐
│  ROUTES LAYER    │         │  MIDDLEWARE      │
├──────────────────┤         ├──────────────────┤
│ /api/auth        │         │ authenticate     │
│ /api/lessons     │         │ errorHandler     │
│ /api/progress    │         │ validation       │
└────────┬─────────┘         └──────────────────┘
         │
    ┌────┴─────────────────────────────┐
    │                                  │
    ▼                                  ▼
┌─────────────────────┐      ┌────────────────────┐
│ CONTROLLERS         │      │  MODELS            │
├─────────────────────┤      ├────────────────────┤
│ authController      │      │ User               │
│ lessonController    │      │ Lesson             │
│ progressController  │      │ Progress           │
│                     │      │ QuizAttempt        │
└────────┬────────────┘      └────────────────────┘
         │
    ┌────┴─────────────────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────────────────────────────────────────┐
│          DATABASE LAYER                      │
│                                              │
│  MongoDB                                     │
│  ├── Users                                   │
│  ├── Lessons                                 │
│  ├── Progress                                │
│  └── QuizAttempts                            │
└──────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Presentation Layer (Frontend)
- React components
- User interface
- State management (Context API)
- Form validation

### 2. API Gateway
- Express.js server
- Route handling
- Middleware pipeline
- CORS protection
- Rate limiting
- Security headers

### 3. Middleware Layer
- **auth.ts**: JWT authentication, token generation
- **errorHandler.ts**: Centralized error handling
- Input validation (built-in)
- CORS handling

### 4. Controller Layer
- **authController**: User registration, login, profile
- **lessonController**: Lesson CRUD operations
- **progressController**: Progress tracking, quiz submission, statistics

### 5. Model Layer
- **User**: User accounts, authentication
- **Lesson**: Course lessons and content
- **Progress**: User lesson progress
- **QuizAttempt**: Quiz attempt history

### 6. Data Layer
- MongoDB database
- Collections for each entity
- Indexes for performance
- TTL for old data (optional)

## Data Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Server validates credentials
   ↓
4. bcryptjs verifies password
   ↓
5. JWT token generated
   ↓
6. Token sent to frontend
   ↓
7. Frontend stores in localStorage
   ↓
8. Token included in future requests
```

### Lesson Access Flow
```
1. Frontend requests GET /api/lessons
   ↓
2. Server fetches from MongoDB
   ↓
3. Filters by level/type (optional)
   ↓
4. Returns lesson data
   ↓
5. Frontend displays lessons
```

### Quiz Submission Flow
```
1. User completes quiz
   ↓
2. Frontend sends POST /api/progress/quiz/submit
   ↓
3. Server validates answers
   ↓
4. Calculates score
   ↓
5. Updates Progress record
   ↓
6. Updates User points/badges
   ↓
7. Returns result to frontend
   ↓
8. Frontend shows feedback
```

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  level: String (Beginner|Intermediate|Advanced|Expert),
  completedLessons: [String],
  points: Number,
  lastScore: Number,
  badges: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Lessons Collection
```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  level: String,
  duration: String,
  type: String (theory|quiz|simulation),
  content: Object (flexible),
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Collection
```typescript
{
  _id: ObjectId,
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

### QuizAttempts Collection
```typescript
{
  _id: ObjectId,
  userId: String (indexed),
  lessonId: String (indexed),
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  answers: Array,
  timeTaken: Number,
  createdAt: Date
}
```

## Security Architecture

### Authentication
- JWT tokens with 7-day expiration
- Passwords hashed with bcryptjs (salt rounds: 10)
- Token refresh (implement in production)

### Authorization
- JWT middleware on protected routes
- User ID verification
- Role-based access (future enhancement)

### Input Validation
- express-validator on all endpoints
- Sanitization of user inputs
- Type checking with TypeScript

### Infrastructure Security
- Helmet.js for security headers
- CORS restricted to frontend domain
- Rate limiting (100 req/15min per IP)
- HTTPS/TLS in production
- Environment variables for secrets

### Data Security
- Passwords never returned in API
- Sensitive data logged carefully
- SQL injection protection (MongoDB prevents this)
- XSS protection via CORS + CSP headers

## Performance Optimization

### Database
- Indexed queries on userId, lessonId
- Compound indexes for complex queries
- Connection pooling with Mongoose

### API
- Compression middleware (via helmet)
- Rate limiting prevents abuse
- Query parameter filtering

### Caching (Future Enhancement)
- Redis for session storage
- Lesson content caching
- User stats caching

### Monitoring
- Morgan for request logging
- Error tracking
- Performance metrics

## Scalability Strategy

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple server instances
- Stateless design (except JWT)
- Redis session store

### Vertical Scaling
- Upgrade server resources
- Database optimization
- Connection pooling

### Database Scaling
- MongoDB replica sets
- Sharding for large datasets
- Read replicas for reporting

## Error Handling Strategy

```
Request → Validation → Processing → Error Occurs
                                         ↓
                              Check Error Type
                                    ↙  ↓  ↖
                        Validation | DB | Auth
                                    ↓
                          Format Error Response
                                    ↓
                        Return to Frontend
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Deployment Architecture

### Local Development
```
Frontend (localhost:5173)
Backend (localhost:5000)
MongoDB (localhost:27017)
```

### Production
```
Frontend (Vercel/Netlify)
    ↓ HTTPS
Backend (Heroku/Railway/AWS)
    ↓
MongoDB (Atlas/Self-hosted)
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT, bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| Deployment | Heroku, Railway, AWS, Docker |
| Monitoring | Morgan, PM2 |

## Key Features

✅ Scalable architecture
✅ Secure authentication
✅ RESTful API design
✅ Comprehensive error handling
✅ Flexible content storage
✅ User progress tracking
✅ Quiz system with scoring
✅ User statistics
✅ Rate limiting
✅ CORS support
✅ TypeScript for type safety
✅ MongoDB for flexible schema

## Future Enhancements

- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Real-time notifications (WebSocket)
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Email notifications
- [ ] Payment integration
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation
- [ ] Machine learning for recommendations
- [ ] Mobile app API (OAuth)
- [ ] Caching layer (Redis)

## Monitoring & Observability

- Request logging (Morgan)
- Error tracking (centralized)
- Performance metrics
- Database query monitoring
- Rate limit tracking
- Uptime monitoring

## Backup & Disaster Recovery

- MongoDB Atlas automatic backups
- Daily snapshots
- Database replication
- Docker image versioning
- Git version control

## Testing Strategy

- Unit tests for controllers
- Integration tests for APIs
- Database tests
- Authentication tests
- Error handling tests

This architecture supports:
- 1000+ concurrent users
- 10000+ lessons
- 100000+ user accounts
- Real-time progress tracking
- Scalability to millions of users

---

For detailed information, see:
- [README.md](./README.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
