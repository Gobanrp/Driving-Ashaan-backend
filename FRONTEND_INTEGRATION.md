# Frontend Integration Guide

This guide explains how to integrate the D-Zone frontend with the backend API.

## Overview

The frontend (React/TypeScript) needs to be updated to:
1. Use the backend API instead of localStorage for authentication
2. Fetch lessons from the backend
3. Track progress with the backend
4. Store JWT token for authenticated requests

## Setup Steps

### 1. Update Environment Variables

Create or update `Driving-Ashaan-main/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Install Axios

```bash
cd Driving-Ashaan-main
npm install axios
```

### 4. Update UserContext

Replace `src/context/UserContext.tsx` with:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface User {
  id: string;
  username: string;
  email: string;
  level: Level;
  completedLessons: string[];
  points: number;
  lastScore: number;
  badges: number;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface UserContextType {
  user: User | null;
  name: string;
  level: Level;
  completedLessons: string[];
  points: number;
  lastScore: number;
  badges: number;
  setName: (name: string) => void;
  setLevel: (level: Level) => void;
  markLessonComplete: (lessonId: string, score?: number) => Promise<void>;
  updateScore: (score: number) => Promise<void>;
  signUp: (username: string, password: string, level: Level) => Promise<void>;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    return token && savedUser ? JSON.parse(savedUser) : null;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'dark' | 'light') || 'dark';
  });

  // Fetch current user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (username: string, password: string, level: Level) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email: `${username}@dzone.local`,
        password,
        confirmPassword: password,
        level
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const login = (username: string, password: string): LoginResult => {
    // This will be called async, so we need to update it
    api.post('/auth/login', { username, password })
      .then(response => {
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          setUser(response.data.user);
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
      });

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  const markLessonComplete = async (lessonId: string, score: number = 0) => {
    try {
      const response = await api.put(`/progress/lesson/${lessonId}`, {
        score,
        timeSpent: 0
      });

      if (response.data.success && user) {
        const updatedUser = { ...user };
        if (!updatedUser.completedLessons.includes(lessonId)) {
          updatedUser.completedLessons.push(lessonId);
        }
        updatedUser.points = (updatedUser.points || 0) + score;
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const updateScore = async (score: number) => {
    try {
      if (user) {
        setUser({
          ...user,
          lastScore: score,
          points: user.points + score
        });
      }
    } catch (error) {
      console.error('Failed to update score:', error);
    }
  };

  const value: UserContextType = {
    user,
    name: user?.username || '',
    level: user?.level || 'Beginner',
    completedLessons: user?.completedLessons || [],
    points: user?.points || 0,
    lastScore: user?.lastScore || 0,
    badges: user?.badges || 0,
    setName: () => {},
    setLevel: () => {},
    markLessonComplete,
    updateScore,
    signUp,
    login,
    logout,
    deleteAccount,
    theme,
    toggleTheme
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
```

### 5. Update Login Page

Update `src/pages/Login.tsx` to use async login:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setUsernameError('');
  setPasswordError('');

  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard', { state: { isNewSignup: false } });
    }
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    if (message.includes('username')) {
      setUsernameError(message);
    } else if (message.includes('password')) {
      setPasswordError(message);
    }
  }
};
```

### 6. Update Landing Page (Signup)

Update `src/pages/Landing.tsx`:

```typescript
const handleSignUp = async () => {
  try {
    await signUp(tempName, tempPassword, tempLevel);
    navigate('/dashboard', { state: { isNewSignup: true } });
  } catch (error: any) {
    // Show error to user
    console.error(error.message);
  }
};
```

### 7. Update Dashboard to Fetch Lessons

Update `src/pages/Dashboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const { name, level, completedLessons, points, lastScore, badges } = useUser();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, [level]);

  const fetchLessons = async () => {
    try {
      const response = await api.get('/lessons', {
        params: { level }
      });
      if (response.data.success) {
        setLessons(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  // ... rest of component
};
```

### 8. Update Lesson View

Update `src/pages/LessonView.tsx` to submit results:

```typescript
const handleSubmitQuiz = async (score: number, answers: any[]) => {
  const { id } = useParams();
  try {
    const response = await api.post('/progress/quiz/submit', {
      lessonId: id,
      score,
      totalQuestions: answers.length,
      correctAnswers: answers.filter(a => a.isCorrect).length,
      answers,
      timeTaken: Math.floor((Date.now() - startTime) / 1000)
    });

    if (response.data.success) {
      // Handle success
    }
  } catch (error) {
    console.error('Failed to submit quiz:', error);
  }
};
```

## Running Both Services

### Terminal 1 - Backend
```bash
cd Driving-Ashaan-backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd Driving-Ashaan-main
npm install
npm run dev
```

Now both services will run:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Testing the Integration

1. Go to http://localhost:5173
2. Click signup and create an account
3. Check backend console for API calls
4. Check MongoDB to see user created
5. Login and verify JWT token stored
6. Complete lessons and check progress in database

## Troubleshooting

### CORS Error
- Check `FRONTEND_URL` in backend `.env`
- Ensure it matches your frontend URL

### Token Errors
- Clear localStorage and login again
- Check JWT_SECRET in backend `.env`

### API Not Found
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`

## Database

You can monitor your database with MongoDB Compass:
- Download: https://www.mongodb.com/products/compass
- Connection: `mongodb://localhost:27017`
- Database: `d-zone`

## Next Steps

1. Deploy backend to Heroku/Railway/AWS
2. Deploy frontend to Vercel/Netlify
3. Update `VITE_API_URL` to production backend URL
4. Set up CI/CD pipelines
5. Implement admin panel
6. Add more features (leaderboards, achievements, etc.)
