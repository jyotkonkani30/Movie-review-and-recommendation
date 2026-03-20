import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

/**
 * MovieInteractionContext
 * 🔒 SECURE: Uses backend API with JWT authentication
 * ✅ USER ISOLATION: Each user has their own data in MongoDB
 */

const API_URL = 'http://localhost:5000/api'

const MovieInteractionContext = createContext()

export const useMovieInteractions = () => {
  const context = useContext(MovieInteractionContext)
  if (!context) {
    throw new Error('useMovieInteractions must be used within MovieInteractionProvider')
  }
  return context
}

export const MovieInteractionProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth()
  const [interactions, setInteractions] = useState({})
  const [loading, setLoading] = useState(false)

  // Get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })

  // Load user interactions from backend when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAllInteractions()
    } else {
      // Clear interactions when user logs out
      setInteractions({})
    }
  }, [isAuthenticated, token, user])

  // Fetch all user interactions from backend
  const fetchAllInteractions = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/movies/individual/all`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        // Convert array to object keyed by movieId
        const interactionsMap = {}
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach(item => {
            interactionsMap[item.movieId] = {
              watched: item.isWatched,
              liked: item.liked,
              bucketList: item.isInBucketList,
              watchedAt: item.watchedAt,
              likedAt: item.likedAt,
              bucketListAddedAt: item.bucketListAddedAt,
              title: item.title,
              posterPath: item.posterPath
            }
          })
        }
        setInteractions(interactionsMap)
      } else {
        console.error('Failed to fetch interactions:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch interactions:', error)
      // Don't block UI if backend is down
    } finally {
      setLoading(false)
    }
  }

  // Get interaction for a specific movie
  const getMovieInteraction = (movieId) => {
    return interactions[movieId] || {
      watched: false,
      liked: false,
      bucketList: false,
      updatedAt: null
    }
  }

  // Toggle watched status
  const toggleWatched = async (movieId, movieData = {}) => {
    if (!token) {
      alert('Please login to track watched movies')
      return
    }

    const currentState = getMovieInteraction(movieId)
    const newState = !currentState.watched

    // Optimistic update - preserve movie data
    setInteractions(prev => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        title: movieData.title || prev[movieId]?.title,
        posterPath: movieData.posterPath || prev[movieId]?.posterPath,
        watched: newState,
        bucketList: newState ? false : prev[movieId]?.bucketList,
        watchedAt: newState ? new Date().toISOString() : null,
        bucketListAddedAt: newState ? null : prev[movieId]?.bucketListAddedAt
      }
    }))

    try {
      if (newState) {
        const response = await fetch(`${API_URL}/movies/individual/watched`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            movieId,
            title: movieData.title,
            posterPath: movieData.posterPath,
            genres: movieData.genres || []
          })
        })

        if (!response.ok) {
          throw new Error('Failed to mark as watched')
        }
      } else {
        const response = await fetch(`${API_URL}/movies/individual/watched/${movieId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (!response.ok) {
          throw new Error('Failed to unmark as watched')
        }
      }
    } catch (error) {
      console.error('Failed to toggle watched:', error)
      // Revert optimistic update on error
      setInteractions(prev => ({
        ...prev,
        [movieId]: {
          ...prev[movieId],
          watched: currentState.watched,
          watchedAt: currentState.watchedAt
        }
      }))
      alert('Failed to update. Please try again.')
    }
  }

  // Toggle like status
  const toggleLike = async (movieId, movieData = {}) => {
    if (!token) {
      alert('Please login to like movies')
      return
    }

    const currentState = getMovieInteraction(movieId)
    const newState = !currentState.liked

    // Optimistic update - preserve movie data
    setInteractions(prev => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        title: movieData.title || prev[movieId]?.title,
        posterPath: movieData.posterPath || prev[movieId]?.posterPath,
        liked: newState,
        likedAt: newState ? new Date().toISOString() : null
      }
    }))

    try {
      if (newState) {
        const response = await fetch(`${API_URL}/movies/individual/like`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            movieId,
            title: movieData.title,
            posterPath: movieData.posterPath,
            genres: movieData.genres || []
          })
        })

        if (!response.ok) {
          throw new Error('Failed to like movie')
        }
      } else {
        const response = await fetch(`${API_URL}/movies/individual/like/${movieId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (!response.ok) {
          throw new Error('Failed to unlike movie')
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // Revert optimistic update on error
      setInteractions(prev => ({
        ...prev,
        [movieId]: {
          ...prev[movieId],
          liked: currentState.liked,
          likedAt: currentState.likedAt
        }
      }))
      alert('Failed to update. Please try again.')
    }
  }

  // Toggle bucket list
  const toggleBucketList = async (movieId, movieData = {}) => {
    if (!token) {
      alert('Please login to manage bucket list')
      return
    }

    const currentState = getMovieInteraction(movieId)
    
    if (currentState.watched) {
      alert('This movie is already watched! Remove it from watched to add to bucket list.')
      return
    }

    const newState = !currentState.bucketList

    // Optimistic update - preserve movie data
    setInteractions(prev => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        title: movieData.title || prev[movieId]?.title,
        posterPath: movieData.posterPath || prev[movieId]?.posterPath,
        bucketList: newState,
        bucketListAddedAt: newState ? new Date().toISOString() : null
      }
    }))

    try {
      if (newState) {
        const response = await fetch(`${API_URL}/movies/individual/bucket-list`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            movieId,
            title: movieData.title,
            posterPath: movieData.posterPath,
            genres: movieData.genres || []
          })
        })

        if (!response.ok) {
          throw new Error('Failed to add to bucket list')
        }
      } else {
        const response = await fetch(`${API_URL}/movies/individual/bucket-list/${movieId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (!response.ok) {
          throw new Error('Failed to remove from bucket list')
        }
      }
    } catch (error) {
      console.error('Failed to toggle bucket list:', error)
      // Revert optimistic update on error
      setInteractions(prev => ({
        ...prev,
        [movieId]: {
          ...prev[movieId],
          bucketList: currentState.bucketList,
          bucketListAddedAt: currentState.bucketListAddedAt
        }
      }))
      alert('Failed to update bucket list. Please try again.')
    }
  }

  // Remove from bucket list
  const removeFromBucketList = async (movieId) => {
    if (!token) {
      alert('Please login to manage your bucket list')
      return
    }

    // Store current state for rollback
    const currentState = interactions[movieId]

    // Optimistic update - remove from bucket list and reset watched state
    setInteractions(prev => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        bucketList: false,
        bucketListAddedAt: null,
        watched: false,
        watchedAt: null
      }
    }))

    try {
      const response = await fetch(`${API_URL}/movies/individual/bucket-list/${movieId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to remove from bucket list')
      }
    } catch (error) {
      console.error('Failed to remove from bucket list:', error)
      // Rollback on error
      if (currentState) {
        setInteractions(prev => ({
          ...prev,
          [movieId]: currentState
        }))
      }
      alert('Failed to remove. Please try again.')
    }
  }

  // Get all movies with specific interaction
  const getWatchedMovies = () => {
    return Object.entries(interactions)
      .filter(([_, data]) => data.watched)
      .map(([movieId, data]) => ({ movieId, ...data }))
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
  }

  const getLikedMovies = () => {
    return Object.entries(interactions)
      .filter(([_, data]) => data.liked)
      .map(([movieId, data]) => ({ movieId, ...data }))
      .sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt))
  }

  const getBucketListMovies = () => {
    return Object.entries(interactions)
      .filter(([_, data]) => data.bucketList && !data.watched)
      .map(([movieId, data]) => ({ movieId, ...data }))
      .sort((a, b) => new Date(b.bucketListAddedAt) - new Date(a.bucketListAddedAt))
  }

  const value = {
    interactions,
    loading,
    getMovieInteraction,
    toggleWatched,
    toggleLike,
    toggleBucketList,
    removeFromBucketList,
    getWatchedMovies,
    getLikedMovies,
    getBucketListMovies,
    refreshInteractions: fetchAllInteractions
  }

  return (
    <MovieInteractionContext.Provider value={value}>
      {children}
    </MovieInteractionContext.Provider>
  )
}
