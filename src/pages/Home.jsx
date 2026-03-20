import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import PopularMovies from '../components/PopularMovies'
import TopGrossingMovies from '../components/TopGrossingMovies'
import AwardWinningMovies from '../components/AwardWinningMovies'
import AnimatedMovies from '../components/AnimatedMovies'

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="hero-title">Welcome to Cineverse</h1>
        <p className="hero-subtitle">Your gateway to unlimited entertainment</p>
        <p className="hero-description">
          Discover millions of movies, explore trailers, and find your next favorite film.
        </p>
        
        {/* Call-to-Action for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div 
            className="home-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              marginTop: '30px',
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 32px',
                backgroundColor: 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)'
              }}
            >
              🔐 Log In
            </motion.button>
            <motion.button
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 32px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid rgba(168, 85, 247, 0.6)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✨ Join Now
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Popular Movies Carousel */}
      <PopularMovies />

      {/* Top Grossing Movies Carousel */}
      <TopGrossingMovies />

      {/* Award Winning Movies Carousel */}
      <AwardWinningMovies />

      {/* Animated Movies Carousel */}
      <AnimatedMovies />
    </div>
  )
}

export default Home
