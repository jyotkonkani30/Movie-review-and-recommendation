import IndividualMovieInteraction from '../models/IndividualMovieInteraction.js';
import UserGenreStats from '../models/UserGenreStats.js';
import { normalizePosterPath, toPosterUrl } from '../utils/poster.js';

/**
 * ============================================
 * GENRE ANALYTICS CONTROLLERS
 * ============================================
 * 
 * 🔐 SECURITY PRINCIPLES:
 * 1. NEVER trust userId from frontend
 * 2. ALWAYS extract userId from req.user.id (JWT verified)
 * 3. ALL queries MUST include userId filter
 * 4. Complete user data isolation
 * 
 * ✅ USER ISOLATION GUARANTEED
 */

/**
 * @desc    Get user's genre distribution statistics
 * @route   GET /api/genres/stats
 * @access  Private (JWT Required)
 * 
 * Analyzes watched and liked movies to calculate genre percentages
 */
export const getGenreStats = async (req, res) => {
  try {
    // SECURITY: Extract userId from JWT only
    const userId = req.user.id;
    
    // Aggregation pipeline to calculate genre distribution
    const genreAggregation = await IndividualMovieInteraction.aggregate([
      // Stage 1: Filter by userId AND (watched OR liked)
      {
        $match: {
          userId: userId,
          $or: [
            { isWatched: true },
            { liked: true }
          ]
        }
      },
      // Stage 2: Unwind genres array to create one document per genre
      {
        $unwind: {
          path: '$genres',
          preserveNullAndEmptyArrays: false
        }
      },
      // Stage 3: Group by genre and count
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 },
          // Track separate counts for watched and liked
          watchedCount: {
            $sum: { $cond: ['$isWatched', 1, 0] }
          },
          likedCount: {
            $sum: { $cond: ['$liked', 1, 0] }
          }
        }
      },
      // Stage 4: Sort by count (descending)
      {
        $sort: { count: -1 }
      }
    ]);

    // Convert ObjectId to string for userId in match
    const genreAggregationFixed = await IndividualMovieInteraction.aggregate([
      {
        $match: {
          userId: new (await import('mongoose')).default.Types.ObjectId(userId),
          $or: [
            { isWatched: true },
            { liked: true }
          ]
        }
      },
      {
        $unwind: {
          path: '$genres',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 },
          watchedCount: {
            $sum: { $cond: ['$isWatched', 1, 0] }
          },
          likedCount: {
            $sum: { $cond: ['$liked', 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate total movies for percentage
    const totalCount = genreAggregationFixed.reduce((sum, g) => sum + g.count, 0);
    
    // Format response with percentages
    const genreStats = genreAggregationFixed.map(genre => ({
      genre: genre._id,
      count: genre.count,
      watchedCount: genre.watchedCount,
      likedCount: genre.likedCount,
      percentage: totalCount > 0 ? Math.round((genre.count / totalCount) * 100) : 0
    }));

    // Get top genre
    const topGenre = genreStats.length > 0 ? genreStats[0].genre : null;

    res.status(200).json({
      success: true,
      data: {
        genres: genreStats,
        totalMovies: totalCount,
        topGenre: topGenre,
        userId // Return for confirmation
      }
    });
  } catch (error) {
    console.error('Get Genre Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genre statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get genre-based movie recommendation
 * @route   GET /api/genres/recommendation
 * @access  Private (JWT Required)
 * 
 * Recommends a movie from bucket list based on user's top genre
 */
export const getGenreRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = (await import('mongoose')).default;
    
    // Step 1: Get user's top genre from watched/liked movies
    const topGenreResult = await IndividualMovieInteraction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          $or: [
            { isWatched: true },
            { liked: true }
          ],
          genres: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    if (topGenreResult.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          genre: null,
          recommendedMovie: null,
          message: 'Not enough data to make recommendations. Watch or like more movies!'
        }
      });
    }

    const topGenre = topGenreResult[0]._id;

    // Step 2: Find movies in bucket list that match top genre and are NOT watched
    const recommendations = await IndividualMovieInteraction.find({
      userId: new mongoose.Types.ObjectId(userId),
      isInBucketList: true,
      isWatched: false,
      genres: topGenre
    }).sort({ bucketListAddedAt: -1 }).limit(5);

    // If no bucket list matches, try to find any bucket list movie
    let recommendedMovie = null;
    let fallbackMessage = null;

    if (recommendations.length > 0) {
      // Pick a random one from top 5 for variety
      const randomIndex = Math.floor(Math.random() * recommendations.length);
      recommendedMovie = recommendations[randomIndex];
    } else {
      // Fallback: Get any unwatched movie from bucket list
      const fallback = await IndividualMovieInteraction.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        isInBucketList: true,
        isWatched: false
      }).sort({ bucketListAddedAt: -1 });

      if (fallback) {
        recommendedMovie = fallback;
        fallbackMessage = `No ${topGenre} movies in your bucket list. Here's another recommendation:`;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        genre: topGenre,
        genrePercentage: topGenreResult[0].count,
        recommendedMovie: recommendedMovie ? {
          movieId: recommendedMovie.movieId,
          title: recommendedMovie.title,
          posterPath: normalizePosterPath(recommendedMovie.posterPath),
          posterUrl: toPosterUrl(recommendedMovie.posterPath),
          genres: recommendedMovie.genres
        } : null,
        message: fallbackMessage || (recommendedMovie 
          ? `Based on your love for ${topGenre} movies, you should watch:` 
          : 'Add movies to your bucket list to get personalized recommendations!')
      }
    });
  } catch (error) {
    console.error('Get Genre Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation',
      error: error.message
    });
  }
};

/**
 * @desc    Get detailed genre insights
 * @route   GET /api/genres/insights
 * @access  Private (JWT Required)
 */
export const getGenreInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = (await import('mongoose')).default;

    // Get various insights
    const [
      totalWatched,
      totalLiked,
      totalBucketList,
      recentGenres
    ] = await Promise.all([
      // Total watched count
      IndividualMovieInteraction.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        isWatched: true
      }),
      // Total liked count
      IndividualMovieInteraction.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        liked: true
      }),
      // Total bucket list count
      IndividualMovieInteraction.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        isInBucketList: true,
        isWatched: false
      }),
      // Recent genre activity (last 5 watched/liked)
      IndividualMovieInteraction.find({
        userId: new mongoose.Types.ObjectId(userId),
        $or: [{ isWatched: true }, { liked: true }],
        genres: { $exists: true, $ne: [] }
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('genres title watchedAt likedAt')
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalWatched,
          totalLiked,
          totalBucketList
        },
        recentActivity: recentGenres.map(m => ({
          title: m.title,
          genres: m.genres,
          watchedAt: m.watchedAt,
          likedAt: m.likedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get Genre Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genre insights',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's stored genre statistics (from UserGenreStats collection)
 * @route   GET /api/genres/user-stats
 * @access  Private (JWT Required)
 * 
 * Returns pre-calculated genre percentages for faster response
 */
export const getUserGenreStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get stored genre stats
    let stats = await UserGenreStats.findOne({ userId });
    
    // If no stats exist, recalculate from interactions
    if (!stats) {
      stats = await UserGenreStats.recalculateForUser(userId);
    }
    
    res.status(200).json({
      success: true,
      data: {
        genres: stats.genres,
        totalMoviesWatched: stats.totalMoviesWatched,
        totalMoviesLiked: stats.totalMoviesLiked,
        totalGenreInteractions: stats.totalGenreInteractions,
        topGenre: stats.topGenre,
        lastUpdated: stats.updatedAt
      }
    });
  } catch (error) {
    console.error('Get User Genre Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user genre statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Recalculate user's genre statistics
 * @route   POST /api/genres/recalculate
 * @access  Private (JWT Required)
 * 
 * Force recalculates genre stats from all movie interactions
 * Useful for syncing or fixing data
 */
export const recalculateGenreStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await UserGenreStats.recalculateForUser(userId);
    
    res.status(200).json({
      success: true,
      message: 'Genre statistics recalculated successfully',
      data: {
        genres: stats.genres,
        totalMoviesWatched: stats.totalMoviesWatched,
        totalMoviesLiked: stats.totalMoviesLiked,
        totalGenreInteractions: stats.totalGenreInteractions,
        topGenre: stats.topGenre
      }
    });
  } catch (error) {
    console.error('Recalculate Genre Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate genre statistics',
      error: error.message
    });
  }
};
