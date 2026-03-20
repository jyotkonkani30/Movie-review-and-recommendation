import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE_URL } from '../config/api'

/**
 * 🎬 CINEVERSE RATING CONTEXT
 * 
 * Shared state for movie ratings across components
 * Ensures action bar and display are always in sync
 */

const CineverseRatingContext = createContext(null)

export const CineverseRatingProvider = ({ children }) => {
  const { user, token } = useAuth()
  
  // Store ratings by movieId
  const [ratingsCache, setRatingsCache] = useState({})
  const [loadingMovies, setLoadingMovies] = useState({})

  /**
   * Get cached rating for a movie
   */
  const getRating = useCallback((movieId) => {
    return ratingsCache[movieId] || {
      globalRating: { averageRating: 0, totalVotes: 0 },
      userRating: 0,
      loading: false
    }
  }, [ratingsCache])

  /**
   * Fetch ratings for a movie (global + user)
   */
  const fetchRatings = useCallback(async (movieId) => {
    if (!movieId) return

    setLoadingMovies(prev => ({ ...prev, [movieId]: true }))

    try {
      // Fetch global rating (public)
      const globalResponse = await fetch(`${API_BASE_URL}/ratings/${movieId}`)
      const globalData = await globalResponse.json()

      let globalRating = { averageRating: 0, totalVotes: 0 }
      if (globalData.success) {
        globalRating = {
          averageRating: globalData.data.averageRating || 0,
          totalVotes: globalData.data.totalVotes || 0
        }
      }

      // Fetch user's rating if logged in
      let userRating = 0
      if (user && token) {
        const userResponse = await fetch(
          `${API_BASE_URL}/ratings/${movieId}/user`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        const userData = await userResponse.json()
        if (userData.success && userData.data) {
          userRating = userData.data.stars
        }
      }

      // Update cache
      setRatingsCache(prev => ({
        ...prev,
        [movieId]: { globalRating, userRating, loading: false }
      }))

    } catch (error) {
      console.error('Failed to fetch ratings:', error)
    } finally {
      setLoadingMovies(prev => ({ ...prev, [movieId]: false }))
    }
  }, [user, token])

  /**
   * Submit or update user's rating
   */
  const submitRating = useCallback(async (movieId, stars) => {
    if (!user || !token || !movieId) return { success: false }

    try {
      const response = await fetch(`${API_BASE_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movieId, stars })
      })

      const data = await response.json()

      if (data.success) {
        // Update cache with new values from server
        setRatingsCache(prev => ({
          ...prev,
          [movieId]: {
            globalRating: {
              averageRating: data.data.globalRating.averageRating,
              totalVotes: data.data.globalRating.totalVotes
            },
            userRating: data.data.userRating.stars,
            loading: false
          }
        }))
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      return { success: false }
    }
  }, [user, token])

  /**
   * Check if a movie's ratings are currently loading
   */
  const isLoading = useCallback((movieId) => {
    return loadingMovies[movieId] || false
  }, [loadingMovies])

  const value = {
    getRating,
    fetchRatings,
    submitRating,
    isLoading,
    user
  }

  return (
    <CineverseRatingContext.Provider value={value}>
      {children}
    </CineverseRatingContext.Provider>
  )
}

export const useCineverseRating = () => {
  const context = useContext(CineverseRatingContext)
  if (!context) {
    throw new Error('useCineverseRating must be used within CineverseRatingProvider')
  }
  return context
}

export default CineverseRatingContext
