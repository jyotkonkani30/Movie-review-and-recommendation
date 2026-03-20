# 🚀 CineVerse Deployment Guide

## The Problem You're Facing

When you deployed to Vercel, the frontend couldn't connect to the backend because:
1. Frontend was trying to reach `http://localhost:5000/api` (which doesn't exist on Vercel)
2. Backend wasn't deployed (so no API to connect to)
3. Environment variables weren't configured on Vercel

---

## ✅ Solution: Deploy Both Frontend & Backend

### Step 1: Deploy Backend First (IMPORTANT!)

You need to deploy your Node.js backend to a server. Choose one:

#### Option A: Deploy to Heroku (Easiest)

1. **Create Heroku Account**
   - Go to https://www.heroku.com
   - Sign up for free

2. **Install Heroku CLI**
   - Download from https://devcenter.heroku.com/articles/heroku-cli

3. **Deploy Backend**
   ```bash
   # Navigate to backend folder
   cd backend

   # Login to Heroku
   heroku login

   # Create Heroku app
   heroku create your-app-name

   # Set environment variables
   heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cineverse
   heroku config:set JWT_SECRET=your_secret_key_here
   heroku config:set OMDB_API_KEY=your_key
   heroku config:set TMDB_API_KEY=your_key

   # Deploy
   git push heroku main
   ```

4. **Get Your Backend URL**
   - Run: `heroku open` or check app settings
   - Your URL will be: `https://your-app-name.herokuapp.com`

---

#### Option B: Deploy to Railway (Free Tier)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository

3. **Configure Environment Variables**
   - In Railway settings, add:
   ```
   MONGODB_URI=your_mongodb_url
   JWT_SECRET=your_secret
   OMDB_API_KEY=your_key
   TMDB_API_KEY=your_key
   PORT=5000
   NODE_ENV=production
   ```

4. **Get Your Backend URL**
   - Railway provides a public URL automatically

---

#### Option C: Deploy to Render (Free Tier)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up

2. **Create New Web Service**
   - Connect your GitHub repo
   - Choose backend directory
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`

3. **Add Environment Variables**
   - In Render dashboard, add all required env vars

---

### Step 2: Get Your Backend URL

After deploying, you'll get a URL like:
- Heroku: `https://your-app-name.herokuapp.com`
- Railway: `https://your-railway-url.up.railway.app`
- Render: `https://your-render-app.onrender.com`

---

### Step 3: Configure Frontend on Vercel

Now that you have your backend URL, configure Vercel:

#### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Project Settings**
   - https://vercel.com/dashboard
   - Select your project
   - Click "Settings" tab
   - Click "Environment Variables"

2. **Add Production Variables**
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url/api
   Environment: Production
   ```

3. **Deploy Again**
   - Push code or click "Deploy" in Vercel
   - Vercel will rebuild with new env variables

#### Option 2: Update .env.production Locally

1. **Edit .env.production**
   ```bash
   # Replace with your actual backend URL
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Push to GitHub**
   ```bash
   git add .env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

3. **Vercel auto-deploys** when you push

---

### Step 4: Fix CORS on Backend

Make sure your backend allows requests from Vercel domain:

**File: `backend/server.js`**

```javascript
const cors = require('cors');

// Configure CORS to allow Vercel frontend
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Local development
    'http://localhost:3000',  // Alternate dev
    'https://your-vercel-app.vercel.app',  // Your Vercel URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

### Step 5: Test the Connection

1. **Go to your Vercel app**
   - https://your-app.vercel.app

2. **Try to Sign Up**
   - If it works, check browser console for errors
   - Look for network tab to see API calls

3. **Common Issues:**
   - **"Failed to fetch"**: Backend URL is wrong
   - **CORS error**: Backend doesn't allow Vercel domain
   - **404 on API**: Backend route doesn't exist

---

## 🔧 Complete Setup Example

Let's say your URLs are:
- **Backend**: `https://cineverse-api.herokuapp.com`
- **Frontend**: `https://cineverse-app.vercel.app`

### Files to Update

**1. `.env.production` (Frontend)**
```env
VITE_API_URL=https://cineverse-api.herokuapp.com/api
```

**2. `backend/server.js` (Backend)**
```javascript
const corsOptions = {
  origin: [
    'https://cineverse-app.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

**3. `backend/.env` (Backend - Already Deployed)**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cineverse
JWT_SECRET=your_super_secret_key
OMDB_API_KEY=your_key
TMDB_API_KEY=your_key
PORT=5000
NODE_ENV=production
```

---

## 📋 Deployment Checklist

- [ ] Backend deployed to Heroku/Railway/Render
- [ ] MongoDB Atlas cluster created (free tier available)
- [ ] Backend environment variables set on hosting platform
- [ ] Backend URL obtained (e.g., `https://xxx.herokuapp.com`)
- [ ] `.env.production` updated with backend URL
- [ ] Frontend redeployed on Vercel
- [ ] CORS configured on backend
- [ ] Test signup/login works
- [ ] API calls in browser console show correct URLs

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" on Login

**Solution**: Check backend URL
```bash
# In browser console, run:
fetch('https://backend-url.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
}).then(r => r.json()).then(console.log)
```

### Issue: CORS Error

**Solution**: Update backend CORS:
```javascript
app.use(cors({
  origin: 'https://your-vercel-url.vercel.app',
  credentials: true
}));
```

### Issue: Getting Production Variables

**Check what Vercel is using:**
```bash
# At build time, Vercel logs environment variables
# Check Vercel deployment logs to confirm VITE_API_URL is set
```

---

## 🔐 Security Notes

- **Never commit `.env` files** (already in .gitignore)
- **Use environment variables** for all secrets
- **Enable CORS only for your domain**
- **Keep JWT_SECRET secret** (use strong random value)
- **Use HTTPS only** for all URLs

---

## 🚀 Quick Deploy Script

Create a file `deploy.sh`:

```bash
#!/bin/bash

# Deploy Backend
cd backend
heroku login
git push heroku main
BACKEND_URL=$(heroku apps:open -s)

# Update Frontend
cd ../
echo "VITE_API_URL=$BACKEND_URL/api" > .env.production
git add .env.production
git commit -m "Update API URL: $BACKEND_URL"
git push origin main

echo "✅ Both frontend and backend deployed!"
echo "🌐 Backend: $BACKEND_URL"
echo "🎬 Frontend: Check Vercel dashboard"
```

---

## 📞 Support

If still having issues:
1. Check Vercel deployment logs
2. Check backend server logs (Heroku Dashboard)
3. Look at browser Network tab (F12 → Network)
4. Check browser Console for error messages
5. Verify MongoDB Atlas is running
6. Test API directly: `curl https://your-backend-url/api/auth/me`

---

**Your CineVerse should now work on Vercel! 🎉**
