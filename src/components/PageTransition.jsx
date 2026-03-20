import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

/**
 * PageTransition Component
 * Cinematic page transitions with fade, slide, and blur effects
 */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // cubic-bezier
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(10px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.6, 1],
    },
  },
}

const PageTransition = ({ children }) => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
