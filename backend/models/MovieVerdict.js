import mongoose from 'mongoose';

/**
 * 🎬 MOVIE VERDICT MODEL
 * 
 * Community-driven verdict system for movies
 * Each document = ONE user's verdict for ONE movie
 * 
 * DESIGN PRINCIPLES:
 * ✅ One verdict per user per movie (compound unique index)
 * ✅ Four verdict options: masterpiece, hit, average, flop
 * ✅ Backend calculates all percentages (single source of truth)
 * ✅ Supports vote updates (change of mind)
 */

const movieVerdictSchema = new mongoose.Schema({
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
  verdict: {
    type: String,
    required: [true, 'Verdict is required'],
    enum: {
      values: ['masterpiece', 'hit', 'average', 'flop'],
      message: 'Verdict must be one of: masterpiece, hit, average, flop'
    },
    lowercase: true
  }
}, {
  timestamps: true
});

// ============================================
// COMPOUND UNIQUE INDEX
// Ensures one verdict per user per movie
// ============================================
movieVerdictSchema.index({ movieId: 1, userId: 1 }, { unique: true });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get verdict statistics for a movie
 * @param {String} movieId - The movie identifier
 * @returns {Object} Statistics with counts and percentages
 */
movieVerdictSchema.statics.getVerdictStats = async function(movieId) {
  const stats = await this.aggregate([
    { $match: { movieId: movieId } },
    {
      $group: {
        _id: '$verdict',
        count: { $sum: 1 }
      }
    }
  ]);

  // Initialize result
  const result = {
    totalVotes: 0,
    breakdown: {
      masterpiece: { count: 0, percentage: 0 },
      hit: { count: 0, percentage: 0 },
      average: { count: 0, percentage: 0 },
      flop: { count: 0, percentage: 0 }
    }
  };

  // Calculate totals
  stats.forEach(item => {
    result.totalVotes += item.count;
    if (result.breakdown[item._id]) {
      result.breakdown[item._id].count = item.count;
    }
  });

  // Calculate percentages
  if (result.totalVotes > 0) {
    Object.keys(result.breakdown).forEach(verdict => {
      const count = result.breakdown[verdict].count;
      result.breakdown[verdict].percentage = Math.round((count / result.totalVotes) * 100);
    });
  }

  return result;
};

/**
 * Get user's verdict for a specific movie
 */
movieVerdictSchema.statics.getUserVerdict = async function(movieId, userId) {
  const verdict = await this.findOne({ movieId, userId });
  return verdict ? verdict.verdict : null;
};

/**
 * Submit or update a verdict (upsert)
 */
movieVerdictSchema.statics.submitVerdict = async function(movieId, userId, verdict) {
  return await this.findOneAndUpdate(
    { movieId, userId },
    { 
      movieId, 
      userId, 
      verdict: verdict.toLowerCase()
    },
    { 
      upsert: true, 
      new: true,
      runValidators: true
    }
  );
};

const MovieVerdict = mongoose.model('MovieVerdict', movieVerdictSchema);

export default MovieVerdict;
