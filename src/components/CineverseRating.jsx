import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCineverseRating } from '../context/CineverseRatingContext'
import { AnimatePresence, motion } from 'framer-motion'
import '../styles/CineverseRating.css'

/**
 * 🎬 CINEVERSE RATING COMPONENT
 * 
 * Community-driven global rating system like IMDb
 * Uses shared context for real-time sync between action bar and display
 */

function CineverseRating({ movieId, compact = false }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { getRating, fetchRatings, submitRating, isLoading, user } = useCineverseRating()
  
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Get rating from shared context
  const ratingData = getRating(movieId)
  const globalRating = ratingData.globalRating
  const userRating = ratingData.userRating
  const loading = isLoading(movieId)

  /**
   * Fetch ratings on mount
   */
  useEffect(() => {
    if (movieId) {
      fetchRatings(movieId)
    }
  }, [movieId, fetchRatings])

  /**
   * Submit or update user's rating
   */
  const handleRatingSubmit = async (stars) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return
    }

    if (!user || submitting) return
    
    setSubmitting(true)
    
    const result = await submitRating(movieId, stars)
    
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
    
    setSubmitting(false)
  }

  /**
   * Render individual star - Molten light design with premium gradients
   */
  const renderStar = (index) => {
    const filled = hoveredStar > 0 ? index <= hoveredStar : index <= userRating
    const isInteractive = isAuthenticated && !submitting
    const uniqueId = `star-${movieId}-${index}`
    
    return (
      <button
        key={index}
        className={`cineverse-star ${filled ? 'filled' : ''} ${isInteractive ? 'interactive' : ''}`}
        onClick={() => handleRatingSubmit(index)}
        onMouseEnter={() => isInteractive && setHoveredStar(index)}
        onMouseLeave={() => setHoveredStar(0)}
        disabled={!isAuthenticated || submitting}
        aria-label={`Rate ${index} star${index > 1 ? 's' : ''}`}
        style={{ opacity: isAuthenticated ? 1 : 0.6, cursor: isAuthenticated ? 'pointer' : 'not-allowed' }}
      >
        <svg viewBox="0 0 24 24" className="star-svg">
          <defs>
            {/* Filled star gradient - Red → Orange → Gold */}
            <linearGradient id={`${uniqueId}-filled`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2E2E" />
              <stop offset="40%" stopColor="#FF9F1C" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            {/* Empty star gradient - Dark metallic */}
            <linearGradient id={`${uniqueId}-empty`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="50%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
            {/* Inner glow filter */}
            <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            fill={`url(#${uniqueId}-${filled ? 'filled' : 'empty'})`}
            filter={filled ? `url(#${uniqueId}-glow)` : 'none'}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </button>
    )
  }

  // Compact display mode (for action bar)
  if (compact) {
    return (
      <>
        <div className="cineverse-rating-compact">
          <div className="compact-stars">
            {[1, 2, 3, 4, 5].map(renderStar)}
          </div>
          {userRating > 0 && (
            <span className="your-rating-badge">{userRating}★</span>
          )}
          {showSuccess && <span className="success-flash">✓</span>}
        </div>
        
        {/* Login Prompt - appears when non-authenticated user tries to rate */}
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
              <span>⭐ Please log in to rate movies!</span>
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

  // Full display mode (for movie details) - Premium cinematic panel
  return (
    <div className="cineverse-rating-container">
      <div className="cineverse-rating-header">
        <span className="cineverse-label">CINEVERSE RATING</span>
      </div>
      
      <div className="cineverse-rating-content">
        <div className="global-rating-display">
          {loading ? (
            <div className="rating-loading">
              <div className="loading-spinner-small"></div>
            </div>
          ) : (
            <>
              <div className="rating-value-large">
                <span className="rating-number">
                  {globalRating.averageRating > 0 
                    ? globalRating.averageRating.toFixed(1) 
                    : '—'}
                </span>
                <span className="rating-max">/ 5</span>
              </div>
              <div className="vote-count">
                ({globalRating.totalVotes} {globalRating.totalVotes === 1 ? 'vote' : 'votes'})
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CineverseRating
