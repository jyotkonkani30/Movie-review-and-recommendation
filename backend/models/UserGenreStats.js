import mongoose from 'mongoose';

/**
 * User Genre Stats Schema
 * Tracks cumulative genre statistics for each user based on their watched and liked movies
 * 
 * ✅ User Isolation: Every document is tied to a specific user
 * ✅ Real-time Updates: Updated whenever user watches/likes a movie
 * ✅ Efficient Queries: Pre-calculated percentages for fast retrieval
 */

const genreStatSchema = new mongoose.Schema({
  genre: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    default: 0
  },
  watchedCount: {
    type: Number,
    default: 0
  },
  likedCount: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const userGenreStatsSchema = new mongoose.Schema({
  // User reference - MANDATORY for all queries
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  
  // Genre statistics array
  genres: [genreStatSchema],
  
  // Summary statistics
  totalMoviesWatched: {
    type: Number,
    default: 0
  },
  
  totalMoviesLiked: {
    type: Number,
    default: 0
  },
  
  totalGenreInteractions: {
    type: Number,
    default: 0
  },
  
  // Top genre for quick access
  topGenre: {
    type: String,
    default: null
  },
  
  // Timestamps
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
// STATIC METHODS
// ============================================

/**
 * Get or create user genre stats
 */
userGenreStatsSchema.statics.getOrCreate = async function(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }
  
  let stats = await this.findOne({ userId });
  
  if (!stats) {
    stats = await this.create({
      userId,
      genres: [],
      totalMoviesWatched: 0,
      totalMoviesLiked: 0,
      totalGenreInteractions: 0,
      topGenre: null
    });
  }
  
  return stats;
};

/**
 * Update genre stats when a movie is watched/liked
 * @param {ObjectId} userId - User's MongoDB _id
 * @param {Array} genres - Array of genre names from the movie
 * @param {String} action - 'watch', 'unwatch', 'like', or 'unlike'
 */
userGenreStatsSchema.statics.updateGenreStats = async function(userId, genres, action) {
  if (!userId || !genres || !Array.isArray(genres)) {
    return null;
  }
  
  let stats = await this.getOrCreate(userId);
  
  const increment = (action === 'watch' || action === 'like') ? 1 : -1;
  const isWatch = action === 'watch' || action === 'unwatch';
  const isLike = action === 'like' || action === 'unlike';
  
  // Update total counts
  if (isWatch) {
    stats.totalMoviesWatched = Math.max(0, stats.totalMoviesWatched + increment);
  }
  if (isLike) {
    stats.totalMoviesLiked = Math.max(0, stats.totalMoviesLiked + increment);
  }
  
  // Update each genre
  for (const genre of genres) {
    const existingGenre = stats.genres.find(g => g.genre === genre);
    
    if (existingGenre) {
      // Update existing genre
      existingGenre.count = Math.max(0, existingGenre.count + increment);
      if (isWatch) {
        existingGenre.watchedCount = Math.max(0, existingGenre.watchedCount + increment);
      }
      if (isLike) {
        existingGenre.likedCount = Math.max(0, existingGenre.likedCount + increment);
      }
      existingGenre.lastUpdated = Date.now();
    } else if (increment > 0) {
      // Add new genre only if incrementing
      stats.genres.push({
        genre,
        count: 1,
        watchedCount: isWatch ? 1 : 0,
        likedCount: isLike ? 1 : 0,
        percentage: 0,
        lastUpdated: Date.now()
      });
    }
  }
  
  // Remove genres with zero count
  stats.genres = stats.genres.filter(g => g.count > 0);
  
  // Calculate total genre interactions
  stats.totalGenreInteractions = stats.genres.reduce((sum, g) => sum + g.count, 0);
  
  // Recalculate percentages
  if (stats.totalGenreInteractions > 0) {
    for (const genre of stats.genres) {
      genre.percentage = Math.round((genre.count / stats.totalGenreInteractions) * 100);
    }
  }
  
  // Sort by count (descending) and update top genre
  stats.genres.sort((a, b) => b.count - a.count);
  stats.topGenre = stats.genres.length > 0 ? stats.genres[0].genre : null;
  
  stats.updatedAt = Date.now();
  await stats.save();
  
  return stats;
};

/**
 * Recalculate all genre stats for a user from IndividualMovieInteraction
 * Useful for syncing or fixing data
 */
userGenreStatsSchema.statics.recalculateForUser = async function(userId) {
  const IndividualMovieInteraction = mongoose.model('IndividualMovieInteraction');
  
  // Get all watched and liked movies for the user
  const interactions = await IndividualMovieInteraction.find({
    userId: new mongoose.Types.ObjectId(userId),
    $or: [
      { isWatched: true },
      { liked: true }
    ]
  });
  
  // Build genre stats from scratch
  const genreMap = new Map();
  let totalWatched = 0;
  let totalLiked = 0;
  
  for (const interaction of interactions) {
    if (interaction.isWatched) totalWatched++;
    if (interaction.liked) totalLiked++;
    
    if (interaction.genres && Array.isArray(interaction.genres)) {
      for (const genre of interaction.genres) {
        if (!genreMap.has(genre)) {
          genreMap.set(genre, {
            genre,
            count: 0,
            watchedCount: 0,
            likedCount: 0
          });
        }
        const genreStat = genreMap.get(genre);
        genreStat.count++;
        if (interaction.isWatched) genreStat.watchedCount++;
        if (interaction.liked) genreStat.likedCount++;
      }
    }
  }
  
  // Convert to array and calculate percentages
  const totalInteractions = Array.from(genreMap.values()).reduce((sum, g) => sum + g.count, 0);
  const genres = Array.from(genreMap.values()).map(g => ({
    ...g,
    percentage: totalInteractions > 0 ? Math.round((g.count / totalInteractions) * 100) : 0,
    lastUpdated: Date.now()
  })).sort((a, b) => b.count - a.count);
  
  // Update or create stats document
  const stats = await this.findOneAndUpdate(
    { userId },
    {
      userId,
      genres,
      totalMoviesWatched: totalWatched,
      totalMoviesLiked: totalLiked,
      totalGenreInteractions: totalInteractions,
      topGenre: genres.length > 0 ? genres[0].genre : null,
      updatedAt: Date.now()
    },
    { upsert: true, new: true }
  );
  
  return stats;
};

const UserGenreStats = mongoose.model('UserGenreStats', userGenreStatsSchema);

export default UserGenreStats;
