import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import PopularMovies from '../components/PopularMovies'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config/api'

const API_URL = 'http://localhost:5000/api'

// Genre color palette
const GENRE_COLORS = {
  'Action': '#ef4444',
  'Adventure': '#f97316',
  'Animation': '#84cc16',
  'Comedy': '#fbbf24',
  'Crime': '#6b7280',
  'Documentary': '#14b8a6',
  'Drama': '#a855f7',
  'Family': '#ec4899',
  'Fantasy': '#8b5cf6',
  'History': '#78716c',
  'Horror': '#dc2626',
  'Music': '#06b6d4',
  'Mystery': '#6366f1',
  'Romance': '#f43f5e',
  'Science Fiction': '#22d3ee',
  'Sci-Fi': '#22d3ee',
  'TV Movie': '#94a3b8',
  'Thriller': '#eab308',
  'War': '#71717a',
  'Western': '#d97706',
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function getGenreColor(genre, index) {
  return GENRE_COLORS[genre] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}

function Browse() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Genre stats state
  const [genreStats, setGenreStats] = useState(null)
  const [genreLoading, setGenreLoading] = useState(false)
  
  const debounceTimer = useRef(null)

  // Fetch user's genre statistics
  useEffect(() => {
    if (token) {
      fetchGenreStats()
    }
  }, [token])

  const fetchGenreStats = async () => {
    if (!token) return
    
    setGenreLoading(true)
    try {
      const response = await fetch(`${API_URL}/genres/user-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGenreStats(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch genre stats:', err)
    } finally {
      setGenreLoading(false)
    }
  }

  const searchMovies = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setMovies([])
      setError('')
      setIsSearchActive(false)
      return
    }

    setLoading(true)
    setError('')
    setIsSearchActive(true)

    try {
      const response = await fetch(`${OMDB_BASE_URL}?s=${encodeURIComponent(searchTerm)}&apikey=${OMDB_API_KEY}`)
      const data = await response.json()

      if (data.Response === 'True') {
        setMovies(data.Search)
        setError('')
      } else {
        setMovies([])
        setError(data.Error || 'No results found')
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.')
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  // Live search as user types with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // If search is empty, reset immediately
    if (!value.trim()) {
      setIsSearchActive(false)
      setMovies([])
      setError('')
      return
    }

    // Debounce search - wait 500ms after user stops typing
    debounceTimer.current = setTimeout(() => {
      searchMovies(value)
    }, 500)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className="browse-page">
      {/* Header - Fade out when searching */}
      <div className={`browse-header ${isSearchActive ? 'fade-out' : 'fade-in'}`}>
        <h1 className="page-title">Browse Movies</h1>
        <p className="page-subtitle">Discover your next favorite film</p>
      </div>

      <SearchBar onSearch={searchMovies} onSearchChange={handleSearchChange} />

      {/* Genre Statistics Section - Show only when logged in and not searching */}
      {token && !isSearchActive && genreStats && genreStats.genres?.length > 0 && (
        <div className="genre-stats-section fade-in">
          <div className="genre-stats-header">
            <h2 className="section-heading">
              <span className="genre-icon">🎭</span>
              Your Genre Profile
            </h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/genres')}
            >
              View Details →
            </button>
          </div>
          
          <div className="genre-stats-container">
            {/* Summary Stats */}
            <div className="genre-summary">
              <div className="summary-stat">
                <span className="stat-number">{genreStats.totalMoviesWatched || 0}</span>
                <span className="stat-label">Watched</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{genreStats.totalMoviesLiked || 0}</span>
                <span className="stat-label">Liked</span>
              </div>
              {genreStats.topGenre && (
                <div className="summary-stat highlight">
                  <span className="stat-number">{genreStats.topGenre}</span>
                  <span className="stat-label">Top Genre</span>
                </div>
              )}
            </div>
            
            {/* Genre Progress Bars */}
            <div className="genre-bars">
              {genreStats.genres.slice(0, 6).map((genre, index) => (
                <div key={genre.genre} className="genre-bar-item">
                  <div className="genre-bar-header">
                    <span className="genre-name">{genre.genre}</span>
                    <span className="genre-percentage">{genre.percentage}%</span>
                  </div>
                  <div className="genre-bar-track">
                    <div 
                      className="genre-bar-fill"
                      style={{ 
                        width: `${genre.percentage}%`,
                        backgroundColor: getGenreColor(genre.genre, index),
                        boxShadow: `0 0 10px ${getGenreColor(genre.genre, index)}50`
                      }}
                    />
                  </div>
                  <div className="genre-bar-footer">
                    <span className="genre-count">{genre.count} movies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login prompt for genre stats */}
      {!token && !isSearchActive && (
        <div className="genre-login-prompt fade-in">
          <div className="prompt-content">
            <span className="prompt-icon">🎬</span>
            <h3>Track Your Movie Taste</h3>
            <p>Login to see your personalized genre statistics based on movies you've watched and liked!</p>
            <button 
              className="login-btn"
              onClick={() => navigate('/login')}
            >
              Login Now
            </button>
          </div>
        </div>
      )}

      {/* Popular Movies - Hide when searching */}
      {!isSearchActive && (
        <div className="fade-in">
          <PopularMovies />
        </div>
      )}

      {/* Search Results Section */}
      {isSearchActive && (
        <div className="search-results-section fade-in">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Searching for "{searchQuery}"...</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-message">
              <p>😕 {error}</p>
              <p className="error-suggestion">Try searching for another movie</p>
            </div>
          )}

          {!loading && !error && movies.length > 0 && (
            <>
              <div className="results-header">
                <h2 className="section-heading">
                  Found {movies.length} result{movies.length !== 1 ? 's' : ''} for "{searchQuery}"
                </h2>
              </div>
              <div className="movies-grid">
                {movies.map((movie) => {
                  return (
                    <MovieCard
                      key={movie.imdbID}
                      movie={movie}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Browse
