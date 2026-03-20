import { useNavigate } from 'react-router-dom'
import { useMovieInteractions } from '../context/MovieInteractionContext'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

/**
 * BucketList Page Component
 * 
 * Dedicated page for managing user's bucket list (want to watch movies)
 */

function BucketList() {
  const navigate = useNavigate()
  
  const {
    getBucketListMovies,
    removeFromBucketList
  } = useMovieInteractions()

  const bucketListMovies = getBucketListMovies()

  const handleRemoveFromBucket = (movieId, e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('Removing movie:', movieId)
    removeFromBucketList(movieId)
  }

  return (
    <div className="bucket-list-page">
      <div className="bucket-list-header">
        <h1 className="page-title">📌 My Bucket List</h1>
        <p className="page-subtitle">Movies you want to watch</p>
        <div className="bucket-list-stats">
          <span className="stat-badge">
            {bucketListMovies.length} {bucketListMovies.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>
      </div>

      <div className="bucket-list-content">
        {bucketListMovies.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📋</p>
            <h3>Your bucket list is empty</h3>
            <p>Start adding movies you want to watch!</p>
            <button onClick={() => navigate('/browse')} className="browse-button">
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="bucket-list-grid">
            {bucketListMovies.map(({ movieId, rating, watched, liked, bucketList, title, posterPath }) => {
              const posterUrl = posterPath 
                ? (posterPath.startsWith('http') ? posterPath : TMDB_IMAGE_BASE + posterPath)
                : null
              
              return (
              <div
                key={movieId}
                className="bucket-list-card"
              >
                <div className="bucket-card-poster">
                  {posterUrl ? (
                    <img 
                      src={posterUrl} 
                      alt={title || movieId}
                      className="movie-poster-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="movie-poster-placeholder" style={{ display: posterUrl ? 'none' : 'flex' }}>
                    <span className="poster-icon">🎬</span>
                    <span className="poster-id">{title || movieId}</span>
                  </div>
                  
                  {/* Remove Button - Always visible on top right */}
                  <button
                    className="bucket-remove-btn"
                    onClick={(e) => handleRemoveFromBucket(movieId, e)}
                    title="Remove from bucket list"
                  >
                    ✕
                  </button>
                </div>
                <div className="bucket-card-info">
                  <p className="bucket-card-title">{title || movieId}</p>
                </div>
              </div>
            )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BucketList
