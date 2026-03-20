# 🚀 Quick Start Guide - Backend Setup

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-validator
- cookie-parser
- nodemon (dev dependency)

## Step 2: Environment Variables

The `.env` file is already configured with your MongoDB connection string.

**Important**: Before deploying to production, change the `JWT_SECRET` to a secure random string!

## Step 3: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## Step 4: Test the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Cineverse API is running",
  "timestamp": "2025-12-31T..."
}
```

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "1234567890",
    "username": "testuser",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-reload)

## API Endpoints

### Public Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Protected Routes (require JWT token)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/movies/interactions` - Get user movie data
- `POST /api/movies/bucket-list` - Add to bucket list
- `DELETE /api/movies/bucket-list/:movieId` - Remove from bucket list
- `POST /api/movies/watched` - Mark as watched
- `DELETE /api/movies/watched/:movieId` - Unmark as watched
- `POST /api/movies/rate` - Rate a movie
- `DELETE /api/movies/rate/:movieId` - Remove rating
- `POST /api/movies/like` - Like a movie
- `DELETE /api/movies/like/:movieId` - Unlike a movie

## Server Logs

You'll see:
```
✅ MongoDB Connected: cluster0.p7c3a.mongodb.net
🚀 Server running on port 5000
📍 Environment: development
```

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB URI is correct in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connection

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Module Not Found
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Start the backend server
2. Go back to root directory: `cd ..`
3. Start the frontend: `npm run dev`
4. Open browser: `http://localhost:5173`
5. Try signing up and logging in!

---

**Backend is ready! 🎉**

All authentication endpoints are secured with JWT.
User data is encrypted with bcrypt.
Ready for production deployment!
