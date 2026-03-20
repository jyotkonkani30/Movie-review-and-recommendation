import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { useMovieInteractions } from '../context/MovieInteractionContext'
import ImageCropper from '../components/ImageCropper'

const API_URL = 'http://localhost:5000/api';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

/**
 * Profile Page Component
 * 
 * Displays user's profile information and movie interaction statistics
 */

function Profile() {
  const [activeTab, setActiveTab] = useState('watched')
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const navigate = useNavigate()
  const { user, updateProfilePic } = useAuth();
  
  const {
    getWatchedMovies,
    getLikedMovies,
    toggleWatched,
    toggleLike
  } = useMovieInteractions()

  const watchedMovies = getWatchedMovies()
  const likedMovies = getLikedMovies()

  const tabs = [
    { id: 'watched', label: '🎬 Watched Movies', count: watchedMovies.length },
    { id: 'liked', label: '❤️ Liked Movies', count: likedMovies.length }
  ]

  const getMoviesForTab = () => {
    switch (activeTab) {
      case 'watched':
        return watchedMovies
      case 'liked':
        return likedMovies
      default:
        return []
    }
  }

  const handleRemoveMovie = (movie, e) => {
    e.stopPropagation()
    const { movieId, title, posterPath } = movie
    const movieData = { title, posterPath }

    switch (activeTab) {
      case 'watched':
        if (confirm(`Remove "${title || movieId}" from watched movies?`)) {
          toggleWatched(movieId, movieData)
        }
        break
      case 'liked':
        if (confirm(`Remove "${title || movieId}" from liked movies?`)) {
          toggleLike(movieId, movieData)
        }
        break
    }
  }

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file');
    }
    event.target.value = ''; // Reset input
  };

  const handleCropComplete = async (croppedImageBase64) => {
    setUploading(true);
    try {
      // Validate before sending
      if (!croppedImageBase64 || !croppedImageBase64.startsWith('data:image/')) {
        throw new Error('Invalid image format');
      }

      // Calculate size
      const sizeInBytes = croppedImageBase64.length * 0.75; // Base64 is ~33% larger
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 5) {
        throw new Error(`Image too large: ${sizeInMB.toFixed(2)}MB. Maximum size is 5MB`);
      }

      await updateProfilePic(croppedImageBase64);
      setShowCropper(false);
      setImageToCrop(null);
      alert('✅ Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert(`❌ Failed to upload profile picture:\n${error.message || 'Please try again'}`);
    } finally {
      setUploading(false);
    }
  };

  const movies = getMoviesForTab()

  return (
    <div className="profile-page">
      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && imageToCrop && (
          <ImageCropper
            imageSrc={imageToCrop}
            onCropComplete={handleCropComplete}
            onCancel={() => {
              setShowCropper(false);
              setImageToCrop(null);
            }}
          />
        )}
      </AnimatePresence>
      {/* Profile Header with User Info */}
      <motion.div
        className="profile-header-new"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-avatar-container">
          <div className="profile-avatar-large">
            {user?.profilePic ? (
              <img src={user.profilePic} alt={user?.username} className="profile-avatar-image" />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <label className="profile-pic-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              disabled={uploading}
              className="profile-pic-input"
              title="Click to change profile picture"
            />
            <span className="upload-icon">📷</span>
            {uploading && <span className="uploading-text">...</span>}
          </label>
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{user?.username}</h1>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-phone">{user?.phone}</p>
          <p className="profile-joined">
            Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </motion.div>

      {/* Profile Tabs Section */}
      <div className="profile-header">
        <h2 className="page-title">My Collection</h2>
        <p className="page-subtitle">Browse your movie library</p>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      <div className="profile-content">
        {movies.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎬</p>
            <h3>No movies yet</h3>
            <p>Start adding movies to your {tabs.find(t => t.id === activeTab)?.label.replace(/[^\w\s]/gi, '')}</p>
            <button onClick={() => navigate('/browse')} className="browse-button">
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="profile-movie-grid">
            {movies.map((movie) => {
              const { movieId, watched, liked, bucketList, title, posterPath } = movie
              const posterUrl = posterPath 
                ? (posterPath.startsWith('http') ? posterPath : TMDB_IMAGE_BASE + posterPath)
                : null
              
              return (
              <div
                key={movieId}
                className="profile-movie-card"
              >
                <div className="profile-movie-poster">
                  {posterUrl ? (
                    <img 
                      src={posterUrl} 
                      alt={title || movieId}
                      className="movie-poster-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="movie-poster-placeholder" style={{ display: posterUrl ? 'none' : 'flex' }}>
                    <span className="poster-icon">🎬</span>
                    <span className="poster-id">{title || movieId}</span>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    className="profile-remove-btn"
                    onClick={(e) => handleRemoveMovie(movie, e)}
                    title={`Remove from ${activeTab}`}
                  >
                    ✕
                  </button>

                  {/* Status Badges */}
                  <div className="status-badges">
                    {watched && <span className="status-badge watched">✓ Watched</span>}
                    {liked && <span className="status-badge liked">❤️</span>}
                  </div>
                </div>
                <div className="profile-movie-info">
                  <p className="profile-movie-title">{title || movieId}</p>
                </div>
              </div>
            )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
