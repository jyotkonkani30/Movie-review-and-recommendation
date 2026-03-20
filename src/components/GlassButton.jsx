import { motion } from 'framer-motion'

/**
 * GlassButton Component
 * Premium glassmorphism button with cinematic animations
 */

const GlassButton = ({
  children,
  onClick,
  variant = 'default',
  active = false,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const variants = {
    default: 'glass-button',
    primary: 'glass-button glass-button-primary',
    gradient: 'glass-button glass-button-gradient',
    success: 'glass-button glass-button-success',
    danger: 'glass-button glass-button-danger',
    info: 'glass-button glass-button-info',
  }

  return (
    <motion.button
      className={`${variants[variant]} ${active ? 'active' : ''} ${disabled || loading ? 'disabled' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.05, y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading ? (
        <span className="glass-button-loader">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : Icon ? (
        <motion.span
          className="glass-button-icon"
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon active={active} />
        </motion.span>
      ) : null}
      <span className="glass-button-text">{children}</span>
    </motion.button>
  )
}

export default GlassButton
