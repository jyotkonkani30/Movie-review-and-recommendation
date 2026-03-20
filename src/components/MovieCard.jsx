import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayIcon } from './Icons'

function MovieCard({ movie }) {
  const navigate = useNavigate()
  
  const posterUrl = movie.Poster !== 'N/A' 
    ? movie.Poster 
    : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'

  const handlePosterClick = () => {
    navigate(`/movie/${movie.imdbID}`)
  }

  return (
    <motion.div 
      className="movie-card hover-lift focused-element"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div 
        className="movie-poster-container" 
        onClick={handlePosterClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handlePosterClick()
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <img 
          src={posterUrl} 
          alt={`${movie.Title} poster`}
          className="movie-poster"
        />
        <motion.div 
          className="play-overlay glass"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span 
            className="play-icon"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <PlayIcon />
          </motion.span>
        </motion.div>
      </motion.div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.Title}</h3>
        <p className="movie-year">{movie.Year}</p>
      </div>
    </motion.div>
  )
}

export default MovieCard
