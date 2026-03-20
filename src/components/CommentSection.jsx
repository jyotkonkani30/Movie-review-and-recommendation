import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'
import '../styles/CommentSection.css'

// Community reviews section

function CommentSection({ movieId }) {
  const { user, token, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)


  useEffect(() => {
    if (!movieId) return
    fetchComments()
  }, [movieId])

  const fetchComments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${movieId}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setError('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim() || !user || submitting) return
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId,
          comment: newComment.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Add new comment to the top of the list
        setComments(prev => [data.data, ...prev])
        setNewComment('')
      } else {
        setError(data.message || 'Failed to post comment')
      }
    } catch (err) {
      console.error('Failed to post comment:', err)
      setError('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }


  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setComments(prev => prev.filter(c => c._id !== commentId))
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }


  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }


  const getInitials = (username) => {
    if (!username) return '?'
    return username.charAt(0).toUpperCase()
  }

  return (
    <section className="comment-section">
      {/* Section Header */}
      <div className="comment-section-header">
        <h2 className="comment-section-title">
          <span className="title-icon">💬</span>
          Community Reviews
        </h2>
        <span className="comment-count">{comments.length} {comments.length === 1 ? 'review' : 'reviews'}</span>
      </div>

      {/* Comment Form - Only for logged-in users */}
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-wrapper">
            <div className="user-avatar">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user?.username} className="user-avatar-image" />
              ) : (
                getInitials(user.username)
              )}
            </div>
            <div className="input-container">
              <textarea
                className="comment-textarea"
                placeholder="Share your thoughts on this movie..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={1000}
                rows={3}
                disabled={submitting}
              />
              <div className="textarea-footer">
                <span className="char-count">{newComment.length}/1000</span>
                <button 
                  type="submit" 
                  className={`submit-btn ${submitting ? 'submitting' : ''}`}
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <span className="btn-loading"></span>
                  ) : (
                    <>
                      <span className="btn-icon">✦</span>
                      Post Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="login-prompt-box">
          <span className="prompt-icon">🔐</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0 }}>Sign in to share your review</p>
            <small style={{ opacity: 0.7, marginTop: '4px', display: 'block' }}>Join the community discussion about this movie</small>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="login-prompt-btn"
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(168, 85, 247, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(168, 85, 247, 1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.8)'}
          >
            Login Now
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="comment-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          // Loading Skeletons
          <div className="comments-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="comment-skeleton">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line medium"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          // Empty State
          <div className="no-comments">
            <span className="empty-icon">🎬</span>
            <p>No reviews yet</p>
            <span className="empty-subtext">Be the first to share your thoughts!</span>
          </div>
        ) : (
          // Comments
          comments.map((comment, index) => (
            <article 
              key={comment._id} 
              className="comment-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="comment-avatar">
                {getInitials(comment.username)}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-username">{comment.username}</span>
                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.comment}</p>
                
                {/* Delete button for own comments */}
                {user && comment.userId === user.id && (
                  <button 
                    className="delete-comment-btn"
                    onClick={() => handleDelete(comment._id)}
                    title="Delete comment"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default CommentSection
