import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Genres.css'

const API_URL = 'http://localhost:5000/api'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

/**
 * Genre color palette - Cinematic theme colors
 */
const GENRE_COLORS = {
  'Action': '#ef4444',      // Red
  'Adventure': '#f97316',   // Orange
  'Animation': '#84cc16',   // Lime
  'Comedy': '#fbbf24',      // Amber
  'Crime': '#6b7280',       // Gray
  'Documentary': '#14b8a6', // Teal
  'Drama': '#a855f7',       // Purple
  'Family': '#ec4899',      // Pink
  'Fantasy': '#8b5cf6',     // Violet
  'History': '#78716c',     // Stone
  'Horror': '#dc2626',      // Dark Red
  'Music': '#06b6d4',       // Cyan
  'Mystery': '#6366f1',     // Indigo
  'Romance': '#f43f5e',     // Rose
  'Science Fiction': '#22d3ee', // Light Cyan
  'Sci-Fi': '#22d3ee',      // Light Cyan
  'TV Movie': '#94a3b8',    // Slate
  'Thriller': '#eab308',    // Yellow
  'War': '#71717a',         // Zinc
  'Western': '#d97706',     // Amber Dark
}

// Default colors for unknown genres
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

function getGenreColor(genre, index) {
  return GENRE_COLORS[genre] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}

/**
 * Genres Page Component
 * 
 * Displays user's genre distribution pie chart and personalized recommendations
 */
function Genres() {
  const { token } = useAuth()
  const navigate = useNavigate()
  
  const [genreStats, setGenreStats] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredSlice, setHoveredSlice] = useState(null)
  
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const progressRef = useRef(0)

  // Fetch all genre data
  useEffect(() => {
    if (token) {
      fetchGenreData()
    }
  }, [token])

  const fetchGenreData = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      // Fetch all data in parallel
      const [statsRes, recommendationRes, insightsRes] = await Promise.all([
        fetch(`${API_URL}/genres/stats`, { headers }),
        fetch(`${API_URL}/genres/recommendation`, { headers }),
        fetch(`${API_URL}/genres/insights`, { headers })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setGenreStats(statsData.data)
      }

      if (recommendationRes.ok) {
        const recData = await recommendationRes.json()
        setRecommendation(recData.data)
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData.data)
      }

    } catch (err) {
      console.error('Failed to fetch genre data:', err)
      setError('Failed to load genre insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Draw animated pie chart
  useEffect(() => {
    if (!genreStats?.genres?.length || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Animation
    const animate = () => {
      progressRef.current = Math.min(progressRef.current + 0.02, 1)
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw pie slices
      let currentAngle = -Math.PI / 2 // Start from top
      
      genreStats.genres.forEach((genre, index) => {
        const sliceAngle = (genre.percentage / 100) * 2 * Math.PI * progressRef.current
        const isHovered = hoveredSlice === index
        const sliceRadius = isHovered ? radius + 10 : radius
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, sliceRadius, currentAngle, currentAngle + sliceAngle)
        ctx.closePath()
        
        // Gradient fill
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, sliceRadius
        )
        const baseColor = getGenreColor(genre.genre, index)
        gradient.addColorStop(0, baseColor + 'cc')
        gradient.addColorStop(1, baseColor)
        
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Glow effect for hovered slice
        if (isHovered) {
          ctx.shadowColor = baseColor
          ctx.shadowBlur = 20
          ctx.fill()
          ctx.shadowBlur = 0
        }
        
        // Slice border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 2
        ctx.stroke()
        
        currentAngle += sliceAngle
      })
      
      // Draw center circle (donut hole)
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(20, 20, 20, 0.95)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Center text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(genreStats.totalMovies, centerX, centerY - 10)
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#888888'
      ctx.fillText('Movies', centerX, centerY + 15)
      
      if (progressRef.current < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    progressRef.current = 0
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [genreStats, hoveredSlice])

  // Handle movie click
  const handleMovieClick = (movieId) => {
    if (movieId) {
      navigate(`/movie/${movieId}`)
    }
  }

  if (loading) {
    return (
      <div className="genres-page">
        <div className="genres-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your movie taste...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="genres-page">
        <div className="genres-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchGenreData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const hasData = genreStats?.genres?.length > 0

  return (
    <div className="genres-page">
      {/* Header */}
      <motion.div
        className="genres-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="genres-title">
          <span className="genres-icon">🎭</span>
          Genre Insights
        </h1>
        <p className="genres-subtitle">
          Discover your unique movie taste profile
        </p>
      </motion.div>

      {!hasData ? (
        /* Empty State */
        <motion.div
          className="genres-empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-illustration">
            <span>🎬</span>
          </div>
          <h2>No Genre Data Yet</h2>
          <p>Start watching and liking movies to see your genre distribution!</p>
          <button onClick={() => navigate('/browse')} className="browse-cta">
            Browse Movies
          </button>
        </motion.div>
      ) : (
        <div className="genres-content">
          {/* Stats Cards */}
          <motion.div
            className="genres-stats-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="stat-card glass-card">
              <span className="stat-icon">🎬</span>
              <span className="stat-value">{insights?.stats?.totalWatched || 0}</span>
              <span className="stat-label">Watched</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{insights?.stats?.totalLiked || 0}</span>
              <span className="stat-label">Liked</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-icon">📌</span>
              <span className="stat-value">{insights?.stats?.totalBucketList || 0}</span>
              <span className="stat-label">Bucket List</span>
            </div>
            <div className="stat-card glass-card highlight">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">{genreStats?.topGenre || 'N/A'}</span>
              <span className="stat-label">Top Genre</span>
            </div>
          </motion.div>

          <div className="genres-main">
            {/* Pie Chart Section */}
            <motion.div
              className="pie-chart-section glass-card"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="section-title">
                <span className="section-icon">🥧</span>
                Genre Distribution
              </h2>
              
              <div className="chart-container">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="pie-chart-canvas"
                />
                
                {/* Legend */}
                <div className="chart-legend">
                  {genreStats.genres.slice(0, 8).map((genre, index) => (
                    <motion.div
                      key={genre.genre}
                      className={`legend-item ${hoveredSlice === index ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredSlice(index)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <span
                        className="legend-color"
                        style={{ backgroundColor: getGenreColor(genre.genre, index) }}
                      />
                      <span className="legend-label">{genre.genre}</span>
                      <span className="legend-percentage">{genre.percentage}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Dominant Genre Insight */}
              {genreStats.topGenre && (
                <motion.div
                  className="genre-insight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p>
                    You mostly watch <strong style={{ color: getGenreColor(genreStats.topGenre, 0) }}>
                      {genreStats.topGenre}
                    </strong> movies ({genreStats.genres[0]?.percentage}%)
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Recommendation Section */}
            <motion.div
              className="recommendation-section glass-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="section-title">
                <span className="section-icon">✨</span>
                Next Watch
              </h2>
              
              {recommendation?.recommendedMovie ? (
                <div className="recommendation-card">
                  <p className="recommendation-message">
                    {recommendation.message}
                  </p>
                  
                  <motion.div
                    className="recommended-movie"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMovieClick(recommendation.recommendedMovie.movieId)}
                  >
                    <div className="movie-poster-container">
                      {recommendation.recommendedMovie.posterPath ? (
                        <img
                          src={recommendation.recommendedMovie.posterPath.startsWith('http')
                            ? recommendation.recommendedMovie.posterPath
                            : `${TMDB_IMAGE_BASE}${recommendation.recommendedMovie.posterPath}`
                          }
                          alt={recommendation.recommendedMovie.title}
                          className="movie-poster"
                        />
                      ) : (
                        <div className="poster-placeholder">
                          <span>🎬</span>
                        </div>
                      )}
                      <div className="poster-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    </div>
                    
                    <div className="movie-info">
                      <h3 className="movie-title">
                        {recommendation.recommendedMovie.title}
                      </h3>
                      {recommendation.recommendedMovie.genres?.length > 0 && (
                        <div className="movie-genres">
                          {recommendation.recommendedMovie.genres.slice(0, 3).map(g => (
                            <span key={g} className="genre-tag">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                      <button className="watch-now-btn">
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="no-recommendation">
                  <span className="no-rec-icon">📋</span>
                  <p>{recommendation?.message || 'Add movies to your bucket list to get recommendations!'}</p>
                  <button onClick={() => navigate('/browse')} className="add-movies-btn">
                    Browse Movies
                  </button>
                </div>
              )}
              
              {/* Genre Breakdown */}
              <div className="genre-breakdown">
                <h3 className="breakdown-title">Genre Breakdown</h3>
                <div className="breakdown-bars">
                  {genreStats.genres.slice(0, 5).map((genre, index) => (
                    <motion.div
                      key={genre.genre}
                      className="breakdown-item"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100%' }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="breakdown-header">
                        <span className="breakdown-genre">{genre.genre}</span>
                        <span className="breakdown-count">{genre.count} movies</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          style={{ backgroundColor: getGenreColor(genre.genre, index) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${genre.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          {insights?.recentActivity?.length > 0 && (
            <motion.div
              className="recent-activity glass-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="section-title">
                <span className="section-icon">🕐</span>
                Recent Activity
              </h2>
              <div className="activity-list">
                {insights.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <span className="activity-title">{activity.title}</span>
                    <div className="activity-genres">
                      {activity.genres?.slice(0, 2).map(g => (
                        <span
                          key={g}
                          className="mini-genre-tag"
                          style={{ borderColor: getGenreColor(g, 0) }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export default Genres
