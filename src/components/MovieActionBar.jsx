import { useMovieInteractions } from '../context/MovieInteractionContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import GlassButton from './GlassButton'
import { WatchedIcon, LikeIcon, BucketIcon } from './Icons'
import CineverseRating from './CineverseRating'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * MovieActionBar Component
 * 
 * Premium glassmorphism action buttons for movie interactions
 * Order: Add to Bucket List | ⭐ Rate Movie | Like
 */

function MovieActionBar({ movieId, movieTitle, moviePoster, movieGenres }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const {
    getMovieInteraction,
    toggleWatched,
    toggleLike,
    toggleBucketList
  } = useMovieInteractions()

  const interaction = getMovieInteraction(movieId)

  // Parse genres from string if needed
  const parseGenres = (genres) => {
    if (!genres) return []
    if (Array.isArray(genres)) return genres
    // Handle comma-separated string (from OMDb)
    if (typeof genres === 'string') {
      return genres.split(',').map(g => g.trim()).filter(Boolean)
    }
    return []
  }

  // Movie data to send to backend
  const movieData = {
    title: movieTitle,
    posterPath: moviePoster,
    genres: parseGenres(movieGenres)
  }

  // Require authentication before action
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return
    }
    action()
  }

  const handleWatchedClick = () => {
    requireAuth(() => toggleWatched(movieId, movieData))
  }

  const handleLikeClick = () => {
    requireAuth(() => toggleLike(movieId, movieData))
  }

  const handleBucketListClick = () => {
    requireAuth(() => toggleBucketList(movieId, movieData))
  }

  return (
    <>
      <div className="movie-action-bar">
        {/* Watched It Button */}
        <GlassButton
          variant="success"
          active={interaction.watched}
          onClick={handleWatchedClick}
          icon={WatchedIcon}
          style={{ opacity: isAuthenticated ? 1 : 0.6 }}
        >
          {interaction.watched ? 'Watched' : 'Mark as Watched'}
        </GlassButton>

        {/* Bucket List Button */}
        <GlassButton
          variant="info"
          active={interaction.bucketList}
          onClick={handleBucketListClick}
          disabled={interaction.watched}
          icon={BucketIcon}
          style={{ opacity: isAuthenticated ? 1 : 0.6 }}
        >
          {interaction.bucketList ? 'In Bucket List' : 'Add to Bucket List'}
        </GlassButton>

        {/* ⭐ Cineverse Star Rating */}
        <CineverseRating movieId={movieId} compact={true} />

        {/* Like Button */}
        <GlassButton
          variant="danger"
          active={interaction.liked}
          onClick={handleLikeClick}
          icon={LikeIcon}
          style={{ opacity: isAuthenticated ? 1 : 0.6 }}
        >
          {interaction.liked ? 'Liked' : 'Like'}
        </GlassButton>
      </div>

      {/* Login Prompt - appears when user tries to interact without auth */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(249, 115, 22, 0.95)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>📚 Please log in to rate and interact!</span>
            <motion.button
              onClick={() => navigate('/login')}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid white',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Login Now
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MovieActionBar
