import { Link, useNavigate } from 'react-router-dom'
import { ProfileIcon, SearchIcon, BrowseIcon, BucketListIcon, GenresIcon } from './Icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  // Handle protected navigation
  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      // Auto-hide prompt after 3 seconds
      setTimeout(() => setShowLoginPrompt(false), 3000);
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="navbar glass-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <motion.div 
            className="navbar-logo"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Ring */}
              <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="2.5" opacity="1"/>
              
              {/* Film Reel Holes */}
              <circle cx="20" cy="8" r="2.5" fill="url(#logoGradient)"/>
              <circle cx="20" cy="32" r="2.5" fill="url(#logoGradient)"/>
              <circle cx="8" cy="20" r="2.5" fill="url(#logoGradient)"/>
              <circle cx="32" cy="20" r="2.5" fill="url(#logoGradient)"/>
              
              {/* Center Play Button */}
              <circle cx="20" cy="20" r="10" fill="url(#logoGradient)" opacity="0.3"/>
              <path d="M17 14l8 6-8 6V14z" fill="#ffffff" stroke="none"/>
              
              {/* Diagonal Lines (Film Strip Effect) */}
              <line x1="12" y1="12" x2="28" y2="28" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7"/>
              <line x1="28" y1="12" x2="12" y2="28" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.7"/>
              
              {/* Accent Sparkles */}
              <circle cx="28" cy="12" r="2" fill="#fbbf24">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="12" cy="28" r="2" fill="#fbbf24">
                <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#a855f7"/>
                  <stop offset="50%" stopColor="#ec4899"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <span className="navbar-title glow-text">CineVerse</span>
        </Link>
      </div>
      
      <div className="navbar-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button 
            onClick={() => handleProtectedNavigation('/browse')}
            className="navbar-link glass-link"
            style={{
              cursor: !isAuthenticated ? 'pointer' : 'pointer',
              opacity: isAuthenticated ? 1 : 0.7
            }}
          >
            <BrowseIcon className="navbar-icon-svg" />
            Browse
          </button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button 
            onClick={() => handleProtectedNavigation('/bucket-list')}
            className="navbar-link glass-link"
            style={{
              cursor: !isAuthenticated ? 'pointer' : 'pointer',
              opacity: isAuthenticated ? 1 : 0.7
            }}
          >
            <BucketListIcon className="navbar-icon-svg" />
            Bucket List
          </button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button 
            onClick={() => handleProtectedNavigation('/genres')}
            className="navbar-link glass-link"
            style={{
              cursor: !isAuthenticated ? 'pointer' : 'pointer',
              opacity: isAuthenticated ? 1 : 0.7
            }}
          >
            <GenresIcon className="navbar-icon-svg" />
            Genres
          </button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button 
            onClick={() => handleProtectedNavigation('/profile')}
            className="navbar-link glass-link"
            style={{
              cursor: !isAuthenticated ? 'pointer' : 'pointer',
              opacity: isAuthenticated ? 1 : 0.7
            }}
          >
            <ProfileIcon className="navbar-icon-svg" />
            Profile
          </button>
        </motion.div>
      </div>
      
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="user-menu" ref={dropdownRef}>
            <motion.button
              className="user-button glass-button"
              onClick={() => setShowDropdown(!showDropdown)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="user-avatar">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user?.username} className="user-avatar-image" />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="user-name">{user?.username}</span>
              <svg 
                className={`user-dropdown-icon ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  className="user-dropdown glass-card"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-email">{user?.email}</p>
                  </div>
                  
                  <div className="user-dropdown-divider"></div>
                  
                  <Link 
                    to="/profile" 
                    className="user-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <ProfileIcon className="user-dropdown-icon" />
                    <span>Profile</span>
                  </Link>
                  
                  <button 
                    className="user-dropdown-item user-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <svg className="user-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <motion.button 
              className="login-button glass-button"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 20px',
                border: '1px solid rgba(168, 85, 247, 0.5)'
              }}
            >
              Log In
            </motion.button>
            <motion.button 
              className="signup-button glass-button glass-button-primary"
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)'
              }}
            >
              Sign Up
            </motion.button>
          </div>
        )}
      </div>

      {/* Login Prompt Notification */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            className="login-prompt-notification"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(249, 115, 22, 0.95)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>📚 Please log in to access this feature!</span>
            <motion.button
              onClick={() => navigate('/login')}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid white',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Login Now
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
