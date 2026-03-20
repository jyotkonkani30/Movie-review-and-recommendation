# 🎬 CineVerse - Movie Review & Recommendation Platform

A modern, feature-rich movie discovery and review platform built with **React**, **Node.js**, and **MongoDB**. Users can browse movies, rate them, write reviews, track watched movies, and manage their personal bucket lists.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-16%2B-brightgreen)
![React](https://img.shields.io/badge/react-18%2B-61dafb)

---

## ✨ Features

### 🏠 Home Page
- **Public Access** - No login required to browse
- Movie carousels showcasing:
  - Popular movies
  - Top-grossing films
  - Award-winning movies
  - Animated movies
- Beautiful hero section with Call-to-Action

### 🎥 Movie Discovery
- **Browse**: Comprehensive movie catalog with filters
- **Search**: Real-time search functionality
- **Genres**: Explore movies by genre
- **Trailers**: Embedded YouTube trailers with autoplay
- **Details**: Complete movie information (cast, plot, ratings, etc.)

### ⭐ Interactive Features (Authentication Required)
- **Ratings**: 5-star community rating system
- **Reviews**: Write, edit, and delete reviews
- **Watched List**: Mark movies as watched
- **Bucket List**: Add movies to your personal bucket list
- **Likes**: Like your favorite movies
- **Profile**: Manage your profile and view history

### 👤 User Authentication
- **Sign Up**: Create new account with email validation
- **Login**: Secure JWT-based authentication
- **Profile Management**: Upload profile picture, update information
- **Persistent Sessions**: Token-based session management

### 📊 Smart UX
- **Progressive Enhancement**: Browse freely, login for features
- **Login Prompts**: Friendly notifications when accessing protected features
- **Reduced Opacity**: Visual indicators for non-authenticated users
- **Smooth Animations**: Framer Motion transitions
- **Responsive Design**: Works on all screen sizes

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Frontend build tool
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Axios** - HTTP requests

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Mongoose** - ODM

### External APIs
- **OMDb API** - Movie data
- **TMDB API** - Additional movie information
- **YouTube API** - Trailer embeds

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cluster)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/jyotkonkani30/Movie-review-and-recommendation.git
cd Movie-review-and-recommendation
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the **backend** directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cineverse
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cineverse

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# APIs
OMDB_API_KEY=your_omdb_api_key
TMDB_API_KEY=your_tmdb_api_key
```

Create a `.env.local` file in the **root** directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or ensure MongoDB Atlas is accessible
```

### 6. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Site runs on http://localhost:5173
```

---

## 📁 Project Structure

```
Movie-review-and-recommendation/
├── backend/                    # Node.js backend
│   ├── config/
│   │   └── db.js             # Database configuration
│   ├── controllers/           # Route controllers
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── ratingController.js
│   │   ├── commentController.js
│   │   └── ...
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Rating.js
│   │   ├── Comment.js
│   │   └── ...
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── ...
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.js
│   ├── utils/               # Utility functions
│   ├── package.json
│   └── server.js
│
├── src/                      # React frontend
│   ├── components/           # React components
│   │   ├── Navbar.jsx
│   │   ├── MovieCard.jsx
│   │   ├── MovieActionBar.jsx
│   │   ├── CommentSection.jsx
│   │   ├── CineverseRating.jsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── MovieDetails.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── ...
│   ├── context/             # React Context
│   │   ├── AuthContext.jsx
│   │   ├── MovieInteractionContext.jsx
│   │   └── CineverseRatingContext.jsx
│   ├── styles/              # CSS files
│   ├── config/              # Configuration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/                   # Static files
├── package.json
├── vite.config.js           # Vite configuration
├── postcss.config.js        # PostCSS configuration
├── README.md                # This file
└── .gitignore

```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile-pic` - Update profile picture

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/search?q=query` - Search movies

### Ratings
- `GET /api/ratings/:movieId` - Get movie ratings
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

### Comments
- `GET /api/comments/:movieId` - Get comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### User Interactions
- `GET /api/movies/interactions/all` - Get all interactions
- `POST /api/movies/toggle-watched` - Mark as watched
- `POST /api/movies/toggle-bucket-list` - Add to bucket list
- `POST /api/movies/toggle-like` - Like movie

---

## 🔑 Environment Variables Reference

### Backend `.env`
| Variable | Example | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment |
| MONGODB_URI | mongodb://localhost:27017 | Database URL |
| JWT_SECRET | your_secret_key | JWT signing key |
| OMDB_API_KEY | your_key | OMDb API key |
| TMDB_API_KEY | your_key | TMDB API key |

### Frontend `.env.local`
| Variable | Example | Description |
|----------|---------|-------------|
| VITE_API_BASE_URL | http://localhost:5000/api | Backend API URL |

---

## 🎯 Usage Guide

### For First-Time Visitors
1. Open http://localhost:5173
2. Browse the home page - no login required
3. Click on any movie to see details, trailers, and reviews
4. Try to rate or comment → You'll see a login prompt

### Authentication Flow
1. Click **"Sign Up"** or **"Log In"** button
2. Fill in your credentials
3. After login, you can:
   - ⭐ Rate movies (1-5 stars)
   - 📝 Write reviews/comments
   - 🎬 Mark as watched
   - 🎞️ Add to bucket list
   - ❤️ Like movies

### Profile Management
1. Click on your profile picture in navbar
2. View your watched movies and reviews
3. Update your profile picture
4. Manage your bucket list

---

## 🛡️ Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt for password storage
- ✅ **User Isolation** - Each user sees only their data
- ✅ **CORS** - Protected API endpoints
- ✅ **Input Validation** - Server-side validation
- ✅ **Error Handling** - Secure error messages

---

## 🎨 UI/UX Features

- 🌟 **Glassmorphism Design** - Modern glass-effect cards
- 🎬 **Cinematic Experience** - Movie-themed animations
- 📱 **Responsive Layout** - Works on mobile, tablet, desktop
- ♿ **Accessibility** - Semantic HTML, ARIA labels
- ⚡ **Performance Optimized** - Fast load times, lazy loading
- 🎭 **Dark Theme** - Eye-friendly dark mode

---

## 🚀 Deployment

### Deploy Backend (Heroku)
1. Create Heroku account
2. Install Heroku CLI
3. ```bash
   cd backend
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_atlas_url
   git push heroku main
   ```

### Deploy Frontend (Vercel/Netlify)
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```
3. Or deploy to Netlify by connecting GitHub

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or on Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings

### CORS Error
- Check backend CORS configuration
- Verify API URL in frontend `.env.local`
- Ensure backend is running

### API Key Issues
- Verify OMDb and TMDB API keys are valid
- Check rate limits

---

## 📞 Contact & Support

- **Author**: Jyot Konkani
- **Email**: jyotkonkani30@gmail.com
- **GitHub**: [jyotkonkani30](https://github.com/jyotkonkani30)
- **Repository**: [Movie-review-and-recommendation](https://github.com/jyotkonkani30/Movie-review-and-recommendation)

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **OMDb API** - Movie data provider
- **TMDB API** - Additional movie information
- **YouTube API** - Trailer embeds
- **Framer Motion** - Animation library
- **MongoDB** - Database
- **React** - Frontend framework

---

## 📊 Statistics

- **Frontend Components**: 15+
- **API Endpoints**: 20+
- **Database Collections**: 7
- **Lines of Code**: 5000+

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Movie recommendations (ML)
- [ ] Social features (follow users)
- [ ] Watch party feature
- [ ] Discussion boards
- [ ] Movie trivia game
- [ ] Export ratings as PDF

---

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core features implemented
- Authentication system
- Rating and review system
- Movie discovery

---

Made with ❤️ by [Jyot Konkani](https://github.com/jyotkonkani30)
- The `StarRating` component handles the UI interaction and calls `onRate` callback
- Ratings persist during the session but reset on page refresh (local state only)

### Example Fetch Request
```javascript
const searchMovies = async (searchTerm) => {
  const API_KEY = 'd7f55220'
  const response = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=${API_KEY}`
  )
  const data = await response.json()
  
  if (data.Response === 'True') {
    // data.Search contains array of movies
    setMovies(data.Search)
  }
}
```

## 🎨 Component Details

### SearchBar
- Controlled input field
- Handles form submission
- Passes search term to parent via `onSearch` callback

### MovieCard
- Displays movie poster (with fallback for N/A posters)
- Shows movie title and year
- Integrates StarRating component
- Hover effects for better UX

### StarRating
- 5 clickable stars
- Hover preview before clicking
- Visual feedback with gold color for selected stars
- Displays rating text (e.g., "3/5")

## 🌐 API Information

- **API**: OMDb API (Open Movie Database)
- **Base URL**: https://www.omdbapi.com/
- **API Key**: d7f55220
- **Search Endpoint**: `?s=movieName&apikey=YOUR_KEY`
- **Response Format**: JSON with movie array in `Search` field

## 📝 Build & Deploy

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🛠️ Technologies Used

- React 18
- Vite 5
- Vanilla CSS (no external UI libraries)
- OMDb API

## 📄 License

MIT
