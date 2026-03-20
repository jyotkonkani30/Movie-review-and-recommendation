import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

/**
 * Custom hook to handle authentication requirements for features
 * Shows a login prompt when user tries to access protected features
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      // Auto-hide prompt after 3 seconds
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return false
    }
    callback?.()
    return true
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  return {
    isAuthenticated,
    showLoginPrompt,
    setShowLoginPrompt,
    requireAuth,
    handleLoginClick
  }
}
