# 🎯 QUICK FIX GUIDE - Vercel Deployment Issues

## 🔴 Problem Summary

Your Vercel app had these issues:

```
Frontend (Vercel) ❌ tries to connect to → http://localhost:5000/api
                                              ↓
                                        Doesn't exist on Vercel!
```

**Also**: Login fails because backend wasn't responding

---

## ✅ Solution: 3 Simple Steps

### STEP 1: Deploy Your Backend (5-10 minutes)

Choose ONE option:

#### 🔷 Option A: Heroku (Easiest)
```bash
# Install Heroku CLI first: https://devcenter.heroku.com/articles/install-heroku

# In your project root:
cd backend

# Create Heroku app
heroku create cineverse-api --region us

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/cineverse
heroku config:set JWT_SECRET=your-secret-key-12345
heroku config:set OMDB_API_KEY=d7f55220
heroku config:set TMDB_API_KEY=your-tmdb-key
heroku config:set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app

# Deploy
git push heroku main

# Get your URL (will show in console or run):
heroku open
# It will be something like: https://cineverse-api.herokuapp.com
```

#### 🔷 Option B: Railway (Also Easy - Better Free Tier)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret
   OMDB_API_KEY=d7f55220
   TMDB_API_KEY=...
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   PORT=5000
   NODE_ENV=production
   ```
5. Railway gives you a public URL automatically

#### 🔷 Option C: Render (Free Tier Available)
1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Build command: `cd backend && npm install`
5. Start command: `npm start`
6. Add same environment variables as above

---

### STEP 2: Get Your Backend URL ⭐ IMPORTANT

After deployment, you'll get a URL:
- **Heroku**: `https://cineverse-api.herokuapp.com`
- **Railway**: `https://cineverse-production.up.railway.app`
- **Render**: `https://cineverse-api.onrender.com`

**Keep this URL - you'll need it in Step 3**

---

### STEP 3: Update Vercel Environment Variables (5 minutes)

1. **Go to your Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click your CineVerse project

2. **Click Settings Tab**
   - Look for "Environment Variables"

3. **Add New Variable**
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.com/api`
   - Example: `https://cineverse-api.herokuapp.com/api`
   - Environment: Check "Production"
   - Click "Save"

4. **Redeploy**
   - Click "Deployments" tab
   - Find latest deployment
   - Click the 3 dots → "Redeploy"
   - Wait for it to build (2-3 minutes)

---

## 🧪 Test It Works

1. **Open your Vercel app**
   - https://your-app.vercel.app

2. **Try to Sign Up**
   - Fill in email and password
   - Click "Join Now"
   - If it works → ✅ Login is fixed!

3. **Check Console for Errors**
   - Press F12 to open Developer Tools
   - Click "Console" tab
   - If you see red errors, share them and I can help

---

## ⚠️ Common Issues & Fixes

### Issue: Still says "Failed to fetch"

**Check 1: Verify your backend URL is correct**
```bash
# In browser console, paste this:
fetch('https://your-backend-url/api/health').then(r => r.json()).then(console.log)

# You should see: {success: true, message: "Cineverse API is running"}
```

**Check 2: Backend not deployed yet**
- Go back to Step 1
- Make sure you pushed to Heroku/Railway/Render

### Issue: CORS Error

**Error message**: "Access to XMLHttpRequest ... blocked by CORS"

**Fix**: Your backend ALLOWED_ORIGINS isn't set correctly
```bash
# Redeploy backend with:
heroku config:set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
# Or update in Railway/Render dashboard
```

### Issue: Backend URL has a port number

**❌ Wrong**: `https://your-backend-url:5000/api`
**✅ Right**: `https://your-backend-url/api` (no port number needed)

---

## 📋 Checklist: Mark as you go

- [ ] Backend deployed (Heroku/Railway/Render)
- [ ] Your backend URL obtained
- [ ] `VITE_API_URL` added to Vercel environment variables
- [ ] Vercel project redeployed
- [ ] Sign up/Login tested on Vercel
- [ ] Console checked for errors

---

## 🆘 If Still Not Working

3 things to check:

1. **Copy this and run in browser console** (while on your Vercel app):
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL)
   ```
   - Should show your backend URL, not undefined

2. **Check backend is running:**
   ```bash
   curl https://your-backend-url/api/health
   ```
   - Should return JSON with `{success: true}`

3. **Look at Network tab:**
   - F12 → Network tab
   - Try signup
   - Find /auth/signup request
   - Check response for error message

---

## 📞 Need More Help?

Check the complete guide: `DEPLOYMENT_GUIDE.md` in your repo

Files that were fixed:
- ✅ `src/context/AuthContext.jsx` - Now uses env variable
- ✅ `src/context/MovieInteractionContext.jsx` - Now uses env variable
- ✅ `backend/server.js` - CORS now configurable
- ✅ `.env.production` - Added for Vercel
- ✅ `backend/.env.example` - Template for backend

---

**That's it! Your CineVerse should work on Vercel after these steps! 🚀**
