import mongoose from 'mongoose';
import { normalizePosterPath } from '../utils/poster.js';

/**
 * Individual Movie Interaction Schema
 * Each document represents ONE user's interaction with ONE movie
 * This ensures complete data isolation and prevents any cross-user data access
 * 
 * ✅ User Isolation: Every query MUST filter by userId
 * ✅ No Global Access: Can't fetch all interactions for a movie
 * ✅ Secure by Design: userId extracted from JWT, never from frontend
 */

const individualMovieInteractionSchema = new mongoose.Schema({
  // User reference - MANDATORY for all queries
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Movie reference
  movieId: {
    type: String,
    required: [true, 'Movie ID is required'],
    index: true
  },
  
  // Movie details (cached for performance)
  title: {
    type: String,
    trim: true
  },
  
  posterPath: {
    type: String,
    trim: true,
    set: (value) => normalizePosterPath(value)
  },
  
  // Interaction flags
  isInBucketList: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isWatched: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Like status
  liked: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Movie genres (array of genre names)
  genres: [{
    type: String,
    trim: true
  }],
  
  // Timestamps for each action
  bucketListAddedAt: Date,
  watchedAt: Date,
  likedAt: Date,
  
  // Auto timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ============================================
// COMPOUND INDEXES FOR USER ISOLATION
// ============================================

// Primary compound index - CRITICAL for user isolation
individualMovieInteractionSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Query optimization indexes
individualMovieInteractionSchema.index({ userId: 1, isInBucketList: 1 });
individualMovieInteractionSchema.index({ userId: 1, isWatched: 1 });
individualMovieInteractionSchema.index({ userId: 1, liked: 1 });

// ============================================
// PRE-SAVE MIDDLEWARE - Update timestamps
// ============================================

individualMovieInteractionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ============================================
// STATIC METHODS - ALWAYS USER-SCOPED
// ============================================

/**
 * Get or create interaction for a specific user and movie
 * @param {ObjectId} userId - User's MongoDB _id (from JWT)
 * @param {Number} movieId - Movie's TMDB ID
 * @returns {Object} MovieInteraction document
 */
individualMovieInteractionSchema.statics.findOrCreate = async function(userId, movieId, movieData = {}) {
  // SECURITY: Always require userId
  if (!userId) {
    throw new Error('userId is required for all movie interactions');
  }
  
  let interaction = await this.findOne({ userId, movieId });
  
  if (!interaction) {
    interaction = await this.create({
      userId,
      movieId,
      title: movieData.title || '',
      posterPath: normalizePosterPath(movieData.posterPath || ''),
      genres: movieData.genres || [],
      isInBucketList: false,
      isWatched: false,
      liked: false
    });
  } else if (movieData.genres && movieData.genres.length > 0 && (!interaction.genres || interaction.genres.length === 0)) {
    // Update genres if not already set
    interaction.genres = movieData.genres;
    await interaction.save();
  }
  
  return interaction;
};

/**
 * Get all interactions for a specific user
 * CRITICAL: Only returns data for the specified userId
 */
individualMovieInteractionSchema.statics.getUserInteractions = async function(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  return await this.find({ userId }).sort({ updatedAt: -1 });
};

/**
 * Get user's bucket list
 */
individualMovieInteractionSchema.statics.getUserBucketList = async function(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  return await this.find({ 
    userId, 
    isInBucketList: true 
  }).sort({ bucketListAddedAt: -1 });
};

/**
 * Get user's watched movies
 */
individualMovieInteractionSchema.statics.getUserWatchedMovies = async function(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  return await this.find({ 
    userId, 
    isWatched: true 
  }).sort({ watchedAt: -1 });
};

/**
 * Get user's liked movies
 */
individualMovieInteractionSchema.statics.getUserLikedMovies = async function(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  return await this.find({ 
    userId, 
    liked: true 
  }).sort({ likedAt: -1 });
};

/**
 * Check if user has interacted with a movie
 */
individualMovieInteractionSchema.statics.hasInteraction = async function(userId, movieId) {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  const interaction = await this.findOne({ userId, movieId });
  return !!interaction;
};

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Add to bucket list
 */
individualMovieInteractionSchema.methods.addToBucketList = function() {
  if (!this.isInBucketList) {
    this.isInBucketList = true;
    this.bucketListAddedAt = new Date();
  }
  return this.save();
};

/**
 * Remove from bucket list
 */
individualMovieInteractionSchema.methods.removeFromBucketList = function() {
  this.isInBucketList = false;
  this.bucketListAddedAt = null;
  // Also reset watched status so movie can be marked as watched again
  this.isWatched = false;
  this.watchedAt = null;
  return this.save();
};

/**
 * Mark as watched
 */
individualMovieInteractionSchema.methods.markAsWatched = function() {
  if (!this.isWatched) {
    this.isWatched = true;
    this.watchedAt = new Date();
  }
  return this.save();
};

/**
 * Unmark as watched
 */
individualMovieInteractionSchema.methods.unmarkAsWatched = function() {
  this.isWatched = false;
  this.watchedAt = null;
  return this.save();
};

/**
 * Like movie
 */
individualMovieInteractionSchema.methods.likeMovie = function() {
  if (!this.liked) {
    this.liked = true;
    this.likedAt = new Date();
  }
  return this.save();
};

/**
 * Unlike movie
 */
individualMovieInteractionSchema.methods.unlikeMovie = function() {
  this.liked = false;
  this.likedAt = null;
  return this.save();
};

const IndividualMovieInteraction = mongoose.model('IndividualMovieInteraction', individualMovieInteractionSchema);

export default IndividualMovieInteraction;
