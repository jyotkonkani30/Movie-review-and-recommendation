import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config/api'

/**
 * AnimatedMovies Component
 * 
 * A Netflix-style horizontal carousel that displays animated movies.
 * Features popular animated films and cartoons.
 */

function AnimatedMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const scrollContainerRef = useRef(null)
  const navigate = useNavigate()

  // Popular animated movies (IMDb IDs)
  const ANIMATED_MOVIE_IDS = [
    'tt2380307', // Coco
    'tt0910970', // WALL-E
    'tt1049413', // Up
    'tt0317705', // The Incredibles
    'tt2948356', // Zootopia
    'tt2277860', // Inside Out
    'tt2096673', // Frozen
    'tt4633694', // Spider-Man: Into the Spider-Verse
    'tt0114709', // Toy Story
    'tt0435761', // Toy Story 3
    'tt1979376', // Toy Story 4
    'tt0198781', // Monsters, Inc.
    'tt1453405', // Monsters University
    'tt0382932', // Ratatouille
    'tt0266543', // Finding Nemo
    'tt2277860', // Finding Dory
    'tt0120737', // The Lion King (1994)
    'tt3521164', // Moana
    'tt3606756', // Incredibles 2
    'tt1623288', // Big Hero 6
  ]

  useEffect(() => {
    const fetchAnimatedMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('Fetching animated movies with API key:', OMDB_API_KEY)
        const promises = ANIMATED_MOVIE_IDS.map(async (imdbID) => {
          const url = `${OMDB_BASE_URL}?i=${imdbID}&apikey=${OMDB_API_KEY}`
          const response = await fetch(url)
          const data = await response.json()
          if (data.Response !== 'True') {
            console.log('Failed to fetch', imdbID, ':', data.Error)
          }
          return data.Response === 'True' ? data : null
        })

        const results = await Promise.all(promises)
        const validMovies = results.filter(movie => movie !== null)
        console.log('Animated movies found:', validMovies.length)
        
        if (validMovies.length === 0) {
          throw new Error('No movies found. Please check API key.')
        }

        setMovies(validMovies)
      } catch (err) {
        const errorMsg = err.message || 'Failed to fetch movies'
        setError(errorMsg)
        console.error('Error fetching animated movies:', err)
        console.error('Error details:', errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimatedMovies()
  }, [])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 0)
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10
    setShowRightArrow(!isAtEnd)
  }

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({
        left: -container.clientWidth * 0.8,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({
        left: container.clientWidth * 0.8,
        behavior: 'smooth'
      })
    }
  }

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.imdbID}`)
  }

  const getStarRating = (imdbRating) => {
    if (!imdbRating || imdbRating === 'N/A') return 'N/A'
    return (parseFloat(imdbRating) / 2).toFixed(1)
  }

  if (loading) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🎨 Animated Movies</h2>
        <div className="carousel-loading">
          <div className="spinner"></div>
          <p>Loading animated movies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🎨 Animated Movies</h2>
        <div className="carousel-error">
          <p>⚠️ {error}</p>
          <p className="error-hint">Unable to load movies</p>
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🎨 Animated Movies</h2>
        <p>No movies found</p>
      </div>
    )
  }

  return (
    <div className="popular-movies-section">
      <h2 className="section-heading">🎨 Animated Movies</h2>
      
      <div className="carousel-wrapper">
        {showLeftArrow && (
          <button 
            className="carousel-arrow carousel-arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div 
          className="carousel-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {movies.map((movie) => (
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

export default AnimatedMovies
