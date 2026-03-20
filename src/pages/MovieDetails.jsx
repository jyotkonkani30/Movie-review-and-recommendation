import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config/api'
import MovieActionBar from '../components/MovieActionBar'
import CineverseRating from '../components/CineverseRating'
import CommentSection from '../components/CommentSection'
import CommunityVerdict from '../components/CommunityVerdict'

/**
 * MovieDetails Component
 * 
 * This page component:
 * 1. Handles both OMDb (IMDb) and TMDB movie sources
 * 2. Fetches movie details and trailers
 * 3. Automatically selects the best trailer using priority logic
 * 4. Autoplays the trailer using YouTube embed
 * 5. Handles loading states and errors gracefully
 */

function MovieDetails() {
  const { id } = useParams() // Get movie ID from URL
  const navigate = useNavigate()  //;
  const location = useLocation()   //;
  const tmdbMovie = location.state?.movie // TMDB movie data from PopularMovies
  
  const [movie, setMovie] = useState(null)
  const [trailers, setTrailers] = useState([])
  const [selectedTrailer, setSelectedTrailer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

  /**
   * TRAILER SELECTION LOGIC
   * Priority order:
   * 1. "Official Trailer"
   * 2. "Trailer" (any trailer)
   * 3. "Teaser"
   * 4. First available video (fallback)
   */
  const selectBestTrailer = (videos) => {
    if (!videos || videos.length === 0) return null

    // Priority 1: Official Trailer
    const officialTrailer = videos.find(v => 
      v.type?.toLowerCase() === 'trailer' && 
      v.name?.toLowerCase().includes('official')
    )
    if (officialTrailer) return officialTrailer

    // Priority 2: Any Trailer
    const trailer = videos.find(v => v.type?.toLowerCase() === 'trailer')
    if (trailer) return trailer

    // Priority 3: Teaser
    const teaser = videos.find(v => v.type?.toLowerCase() === 'teaser')
    if (teaser) return teaser

    // Priority 4: First available video
    return videos[0]
  }

  /**
   * Fetch movie details on component mount
   * Handles both OMDb (IMDb ID) and TMDB movies
   */
  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check if this is a TMDB movie
        if (id.startsWith('tmdb-') && tmdbMovie) {
          // Use TMDB movie data passed from PopularMovies
          const formattedMovie = {
            Title: tmdbMovie.title,
            Year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear().toString() : 'N/A',
            Poster: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}` : 'N/A',
            Plot: tmdbMovie.overview || 'No plot available',
            imdbRating: (tmdbMovie.vote_average / 2).toFixed(1), // Convert to 5-star scale
            Rated: 'N/A',
            Runtime: 'N/A',
            Genre: 'N/A',
            Director: 'N/A',
            Actors: 'N/A',
            Writer: 'N/A',
            imdbID: `tmdb-${tmdbMovie.id}`
          }
          
          setMovie(formattedMovie)

          // Generate mock trailers for TMDB movies
          const mockTrailers = generateMockTrailers(tmdbMovie.title, 
            tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : '')
          setTrailers(mockTrailers)
          const best = selectBestTrailer(mockTrailers)
          setSelectedTrailer(best)
        } else {
          // Fetch from OMDb for IMDb IDs
          const response = await fetch(`${OMDB_BASE_URL}?i=${id}&apikey=${OMDB_API_KEY}&plot=full`)
          const data = await response.json()

          if (data.Response === 'False') {
            throw new Error(data.Error || 'Movie not found')
          }

          setMovie(data)

          // Generate mock trailers for OMDb movies
          const mockTrailers = generateMockTrailers(data.Title, data.Year)
          setTrailers(mockTrailers)
          const best = selectBestTrailer(mockTrailers)
          setSelectedTrailer(best)
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch movie details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMovieDetails()
    }
  }, [id, tmdbMovie])

  /**
   * Mock trailer generator
   * In production, replace this with real API call to TMDB:
   * https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=YOUR_KEY
   */
  const generateMockTrailers = (title, year) => {
    const searchQuery = `${title} ${year}`
    
    return [
      {
        id: '1',
        key: `search_${encodeURIComponent(searchQuery + ' official trailer')}`,
        name: `${title} - Official Trailer`,
        type: 'Trailer',
        site: 'YouTube'
      },
      {
        id: '2',
        key: `search_${encodeURIComponent(searchQuery + ' trailer')}`,
        name: `${title} - Trailer`,
        type: 'Trailer',
        site: 'YouTube'
      }
    ]
  }

  /**
   * Open YouTube trailer in new tab
   */
  const openTrailerInNewTab = (videoKey) => {
    // Check if it's a search query or direct video ID
    const isSearch = videoKey.startsWith('search_')
    const youtubeUrl = isSearch
      ? `https://www.youtube.com/results?search_query=${videoKey.replace('search_', '')}`
      : `https://www.youtube.com/watch?v=${videoKey}`
    
    window.open(youtubeUrl, '_blank')
  }

  // Loading State
  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="movie-details-container">
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Main Content
  return (
    <div className="movie-details-container">
      <button onClick={() => navigate('/')} className="back-button-top">
        ← Back to Movies
      </button>

      <div className="movie-details-content">
        {/* Movie Info Section */}
        <div className="movie-info-section">
          <div className="movie-header">
            <img 
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'} 
              alt={movie.Title}
              className="movie-poster-large"
            />
            <div className="movie-details-info">
              <h1 className="movie-title-large">{movie.Title}</h1>
              <div className="movie-meta">
                <span className="meta-item">{movie.Year}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">{movie.Rated}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">{movie.Runtime}</span>
              </div>
              <div className="movie-genre">{movie.Genre}</div>
              {/* Movie Ratings Section */}
              <div className="movie-ratings-section">
                {/* IMDb Rating */}
                <div className="movie-rating">
                  <span className="imdb-badge">⭐ IMDb</span>
                  <span className="rating-value">{movie.imdbRating}/10</span>
                </div>
                
                {/* Cineverse Community Rating */}
                <CineverseRating movieId={movie.imdbID} />
              </div>
              
              {/* Trailer Button */}
              {selectedTrailer && (
                <button 
                  onClick={() => openTrailerInNewTab(selectedTrailer.key)}
                  className="watch-trailer-button"
                >
                  <span className="play-icon">▶</span> Watch Trailer on YouTube
                </button>
              )}
            </div>
          </div>

          {/* Movie Action Bar */}
          <MovieActionBar 
            movieId={movie.imdbID} 
            movieTitle={movie.Title} 
            moviePoster={movie.Poster}
            movieGenres={movie.Genre}
          />

          <div className="movie-description">
            <h3>Plot</h3>
            <p>{movie.Plot}</p>
          </div>

          <div className="movie-credits">
            <div className="credit-item">
              <strong>Director:</strong> {movie.Director}
            </div>
            <div className="credit-item">
              <strong>Cast:</strong> {movie.Actors}
            </div>
            <div className="credit-item">
              <strong>Writer:</strong> {movie.Writer}
            </div>
          </div>

          {/* Community Verdict Section */}
          <CommunityVerdict movieId={movie.imdbID} />

          {/* Community Reviews Section */}
          <CommentSection movieId={movie.imdbID} />
        </div>
      </div>
    </div>
  )
}

export default MovieDetails
