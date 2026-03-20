import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config/api'

/**
 * AwardWinningMovies Component
 * 
 * A Netflix-style horizontal carousel that displays award-winning movies.
 * Features Oscar winners and critically acclaimed films.
 */

function AwardWinningMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const scrollContainerRef = useRef(null)
  const navigate = useNavigate()

  // Award-winning movies (IMDb IDs) - Oscar winners and nominees
  const AWARD_WINNING_MOVIE_IDS = [
    'tt1517268', // Parasite
    'tt7286456', // Joker
    'tt4154796', // Avengers: Endgame
    'tt6751668', // Parasite
    'tt8579674', // 1917
    'tt10272386', // The Father
    'tt7131622', // Once Upon a Time in Hollywood
    'tt1950186', // Ford v Ferrari
    'tt4633694', // Spider-Man: Into the Spider-Verse
    'tt2380307', // Coco
    'tt5027774', // Three Billboards Outside Ebbing, Missouri
    'tt4925292', // Lady Bird
    'tt1049413', // Up
    'tt0477348', // No Country for Old Men
    'tt0910970', // WALL-E
    'tt0405094', // The Lives of Others
    'tt0434409', // V for Vendetta
    'tt0361748', // Inglourious Basterds
    'tt1675434', // The Revenant
    'tt2582802', // Whiplash
  ]

  useEffect(() => {
    const fetchAwardWinningMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('Fetching award-winning movies with API key:', OMDB_API_KEY)
        const promises = AWARD_WINNING_MOVIE_IDS.map(async (imdbID) => {
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
        console.log('Award-winning movies found:', validMovies.length)
        
        if (validMovies.length === 0) {
          throw new Error('No movies found. Please check API key.')
        }

        setMovies(validMovies)
      } catch (err) {
        const errorMsg = err.message || 'Failed to fetch movies'
        setError(errorMsg)
        console.error('Error fetching award-winning movies:', err)
        console.error('Error details:', errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchAwardWinningMovies()
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
        <h2 className="section-heading">🏆 Award Winning Movies</h2>
        <div className="carousel-loading">
          <div className="spinner"></div>
          <p>Loading award-winning movies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="popular-movies-section">
        <h2 className="section-heading">🏆 Award Winning Movies</h2>
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
        <h2 className="section-heading">🏆 Award Winning Movies</h2>
        <p>No movies found</p>
      </div>
    )
  }

  return (
    <div className="popular-movies-section">
      <h2 className="section-heading">🏆 Award Winning Movies</h2>
      
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

export default AwardWinningMovies
