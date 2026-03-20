import mongoose from 'mongoose';

/**
 * 🎬 CINEVERSE RATING MODEL
 * 
 * Clean, IMDb-style rating system
 * Each document = ONE user's rating for ONE movie
 * 
 * DESIGN PRINCIPLES:
 * ✅ No stored averages or totals (calculated dynamically)
 * ✅ One rating per user per movie (compound unique index)
 * ✅ Stars only (1-5)
 * ✅ Backend is single source of truth
 */

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  movieId: {
    type: String,
    required: [true, 'Movie ID is required'],
    index: true,
    trim: true
  },
  stars: {
    type: Number,
    required: [true, 'Star rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Rating must be a whole number between 1 and 5'
    }
  }
}, {
  timestamps: true
});

// ============================================
// COMPOUND UNIQUE INDEX
// Ensures one rating per user per movie
// ============================================
ratingSchema.index({ movieId: 1, userId: 1 }, { unique: true });

// ============================================
// QUERY OPTIMIZATION INDEXES
// ============================================
ratingSchema.index({ movieId: 1, stars: 1 });
ratingSchema.index({ userId: 1, createdAt: -1 });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get global Cineverse rating for a movie
 * Calculates average from all user ratings
 * 
 * @param {String} movieId - Movie identifier
 * @returns {Object} { averageRating, totalVotes, _id }
 */
ratingSchema.statics.getMovieRating = async function(movieId) {
  console.log('📊 [Rating Aggregation] Calculating for movieId:', movieId);
  
  const result = await this.aggregate([
    { 
      $match: { movieId: movieId } 
    },
    {
      $group: {
        _id: '$movieId',
        averageRating: { $avg: '$stars' },
        totalVotes: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    console.log('✅ [Rating Aggregation] Result:', result[0]);
    return result[0];
  }
  
  console.log('⚠️ [Rating Aggregation] No ratings found');
  return { 
    _id: movieId,
    averageRating: 0, 
    totalVotes: 0 
  };
};

/**
 * Get user's rating for a specific movie
 * 
 * @param {ObjectId} userId - User's MongoDB ID
 * @param {String} movieId - Movie identifier
 * @returns {Object|null} Rating document or null
 */
ratingSchema.statics.getUserRating = async function(userId, movieId) {
  return await this.findOne({ userId, movieId });
};

/**
 * Submit or update user rating
 * Uses upsert to create if not exists, update if exists
 * 
 * @param {ObjectId} userId - User's MongoDB ID
 * @param {String} movieId - Movie identifier
 * @param {Number} stars - Rating value (1-5)
 * @returns {Object} Updated rating document
 */
ratingSchema.statics.submitOrUpdateRating = async function(userId, movieId, stars) {
  console.log('📝 [Submit Rating]', { userId, movieId, stars });
  
  // Validate stars
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new Error('Rating must be a whole number between 1 and 5');
  }
  
  // Upsert: Update if exists, create if not
  const rating = await this.findOneAndUpdate(
    { userId, movieId },
    { stars, updatedAt: new Date() },
    { 
      new: true, 
      upsert: true,
      runValidators: true 
    }
  );
  
  console.log('✅ [Submit Rating] Success:', rating);
  return rating;
};

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
