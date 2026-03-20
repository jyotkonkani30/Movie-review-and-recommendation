import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { MovieInteractionProvider } from './context/MovieInteractionContext'
import { CineverseRatingProvider } from './context/CineverseRatingContext'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Profile from './pages/Profile'
import BucketList from './pages/BucketList'
import Genres from './pages/Genres'
import MovieDetails from './pages/MovieDetails'
import Login from './pages/Login'
import Signup from './pages/Signup'

function AppContent() {
  const location = useLocation()
  
 
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app">
      {!isAuthPage && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          
          {/* Protected Routes */}
          <Route path="/browse" element={<PageTransition><ProtectedRoute><Browse /></ProtectedRoute></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
          <Route path="/bucket-list" element={<PageTransition><ProtectedRoute><BucketList /></ProtectedRoute></PageTransition>} />
          <Route path="/genres" element={<PageTransition><ProtectedRoute><Genres /></ProtectedRoute></PageTransition>} />
          <Route path="/movie/:id" element={<PageTransition><ProtectedRoute><MovieDetails /></ProtectedRoute></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MovieInteractionProvider>
          <CineverseRatingProvider>
            <AppContent />
          </CineverseRatingProvider>
        </MovieInteractionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
