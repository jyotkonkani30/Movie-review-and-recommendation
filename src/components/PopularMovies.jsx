import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config/api'

/**
 * PopularMovies Component
 * 
 * A Netflix-style horizontal carousel that displays popular movies.
 * Uses OMDb API with a curated list of popular movie titles.
 * Features:
 * - Fetches movies from OMDb API
 * - Horizontal scrolling with arrow buttons
 * - Smooth scroll animation
 * - Responsive design
 * - Click to view movie details with trailer autoplay
 */

function PopularMovies() {
  const [popularMovies, setPopularMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const scrollContainerRef = useRef(null)
  const navigate = useNavigate()

  // Curated list of popular movies (IMDb IDs)
  const POPULAR_MOVIE_IDS = [
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt0468569', // The Dark Knight
    'tt0108052', // Schindler's List
    'tt0167260', // The Lord of the Rings: The Return of the King
    'tt0110912', // Pulp Fiction
    'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
    'tt0109830', // Forrest Gump
    'tt1375666', // Inception
    'tt0137523', // Fight Club
    'tt0167261', // The Lord of the Rings: The Two Towers
    'tt0080684', // Star Wars: Episode V - The Empire Strikes Back
    'tt0133093', // The Matrix
    'tt0099685', // Goodfellas
    'tt0073486', // One Flew Over the Cuckoo\'s Nest
    'tt0816692', // Interstellar
    'tt0114369', // Se7en
    'tt0047478', // Seven Samurai
    'tt0102926', // The Silence of the Lambs
    'tt0317248', // City of God
  ]

  /**
   * Fetch popular movies from OMDb on component mount
   */
  useEffect(() => {
    const fetchPopularMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('Fetching popular movies with API key:', OMDB_API_KEY)
        console.log('API URL:', OMDB_BASE_URL)
        
        // Fetch movies in parallel
        const promises = POPULAR_MOVIE_IDS.map(async (imdbID) => {
          const url = `${OMDB_BASE_URL}?i=${imdbID}&apikey=${OMDB_API_KEY}`
          console.log('Fetching:', url)
          const response = await fetch(url)
          const data = await response.json()
          console.log('Response for', imdbID, ':', data)
          return data.Response === 'True' ? data : null
        })

        const results = await Promise.all(promises)
        const validMovies = results.filter(movie => movie !== null)
        console.log('Valid movies found:', validMovies.length)
        
        if (validMovies.length === 0) {
          throw new Error('No movies found. Please check API key.')
        }

        setPopularMovies(validMovies)
      } catch (err) {
        const errorMsg = err.message || 'Failed to fetch popular movies'
        setError(errorMsg)
        console.error('Error fetching popular movies:', err)
        console.error('Error details:', errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularMovies()
  }, [])

  /**
   * Check scroll position to show/hide arrow buttons
   */
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    // Show left arrow if not at start
    setShowLeftArrow(container.scrollLeft > 0)

    // Show right arrow if not at end
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10
    setShowRightArrow(!isAtEnd)
  }

  /**
   * Smooth scroll left
   * Scrolls by the width of the container for page-like navigation
   */
  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  /**
   * Smooth scroll right
   * Scrolls by the width of the container for page-like navigation
   */
  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  /**
   * Handle movie card click
   * Navigate to movie details page with IMDb ID
   */
  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.imdbID}`)
  }

  /**
   * Get star rating (out of 5) from IMDb rating (out of 10)
   */
  const getStarRating = (imdbRating) => {
    if (!imdbRating || imdbRating === 'N/A') return 'N/A'
    return (parseFloat(imdbRating) / 2).toFixed(1)
  }

  // Loading State
  if (loading) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🔥 Popular Movies</h2>
        <div className="carousel-loading">
          <div className="spinner"></div>
          <p>Loading popular movies...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🔥 Popular Movies</h2>
        <div className="carousel-error">
          <p>⚠️ {error}</p>
          <p className="error-hint">Unable to load popular movies</p>
        </div>
      </div>
    )
  }

  // No movies found
  if (popularMovies.length === 0) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🔥 Popular Movies</h2>
        <p>No popular movies found</p>
      </div>
    )
  }

  return (
    <div className="popular-movies-section">
      <h2 className="section-heading">🔥 Popular Movies</h2>
      
      <div className="carousel-wrapper">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button 
            className="carousel-arrow carousel-arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Scrollable Movie Container */}
        <div 
          className="carousel-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {popularMovies.map((movie) => (
            <div 
              key={movie.imdbID}
              className="carousel-card"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="carousel-card-image-wrapper">
                <img
                  src={
                    movie.Poster !== 'N/A'
                      ? movie.Poster
                      : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'
                  }
                  alt={movie.Title}
                  className="carousel-card-image"
                  loading="lazy"
                />
                <div className="carousel-card-overlay">
                  <div className="overlay-content">
                    <h3 className="overlay-title">{movie.Title}</h3>
                    <div className="overlay-rating">
                      <span className="rating-star">⭐</span>
                      <span className="rating-value">
                        {getStarRating(movie.imdbRating)}/5
                      </span>
                    </div>
                    <p className="overlay-year">{movie.Year}</p>
                    <button className="overlay-play-button">
                      <span className="play-icon">▶</span> Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
              <div className="carousel-card-info">
                <h4 className="card-title">{movie.Title}</h4>
                <p className="card-rating">
                  ⭐ {getStarRating(movie.imdbRating)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button 
            className="carousel-arrow carousel-arrow-right"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}

export default PopularMovies
