import { motion } from 'framer-motion'

/**
 * CinematicLoader Component
 * Premium loading animation with film reel effect
 */

const CinematicLoader = ({ message = "Loading..." }) => {
  return (
    <div className="cinematic-loader-container">
      <motion.div
        className="loader-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Film Reel */}
        <motion.div
          className="film-reel"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="url(#loaderGradient)"
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <circle cx="40" cy="40" r="25" fill="url(#loaderGradient)" opacity="0.2" />
            <circle cx="40" cy="40" r="15" fill="url(#loaderGradient)" />
            <defs>
              <linearGradient id="loaderGradient" x1="0" y1="0" x2="80" y2="80">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Pulsing Dots */}
        <motion.div className="loader-dots">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="loader-dot"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="loader-text glow-text"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default CinematicLoader
