import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config/api'

/**
 * TopGrossingMovies Component
 * 
 * A Netflix-style horizontal carousel that displays highest-earning movies.
 * Features the top box office movies of all time.
 */

function TopGrossingMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const scrollContainerRef = useRef(null)
  const navigate = useNavigate()

  // Top grossing movies (IMDb IDs) - Highest box office earnings
  const TOP_GROSSING_MOVIE_IDS = [
    'tt0499549', // Avatar
    'tt4154796', // Avengers: Endgame
    'tt2015381', // Titanic
    'tt2488496', // Star Wars: Episode VII - The Force Awakens
    'tt4154756', // Avengers: Infinity War
    'tt0103064', // Jurassic Park
    'tt0120338', // The Lion King
    'tt3501632', // Thor: Ragnarok
    'tt1825683', // Black Panther
    'tt2381249', // Mission: Impossible - Fallout
    'tt1211837', // Doctor Strange
    'tt0167260', // The Lord of the Rings: The Return of the King
    'tt1300854', // Iron Man 3
    'tt0848228', // The Avengers
    'tt1981115', // Thor: The Dark World
    'tt2395427', // Avengers: Age of Ultron
    'tt0816692', // Interstellar
    'tt0468569', // The Dark Knight
    'tt2527338', // Star Wars: Episode VIII - The Last Jedi
    'tt4633694', // Spider-Man: Into the Spider-Verse
  ]

  useEffect(() => {
    const fetchTopGrossingMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('Fetching top grossing movies with API key:', OMDB_API_KEY)
        const promises = TOP_GROSSING_MOVIE_IDS.map(async (imdbID) => {
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
        
        if (validMovies.length === 0) {
          throw new Error('No movies found')
        }

        setMovies(validMovies)
      } catch (err) {
        setError(err.message || 'Failed to fetch movies')
        console.error('Error fetching top grossing movies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopGrossingMovies()
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
        <h2 className="section-heading">💰 Top Grossing Movies</h2>
        <div className="carousel-loading">
          <div className="spinner"></div>
          <p>Loading top grossing movies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">💰 Top Grossing Movies</h2>
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
        <h2 className="section-heading">💰 Top Grossing Movies</h2>
        <p>No movies found</p>
      </div>
    )
  }

  return (
    <div className="popular-movies-section">
      <h2 className="section-heading">💰 Top Grossing Movies</h2>
      
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

export default TopGrossingMovies
