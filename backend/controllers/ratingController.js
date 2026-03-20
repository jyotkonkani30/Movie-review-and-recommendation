import Rating from '../models/Rating.js';

/**
 * 🎬 CINEVERSE RATING CONTROLLER
 * 
 * Clean, production-ready rating system
 * Backend is single source of truth
 */

/**
 * @desc    Get global Cineverse rating for a movie
 * @route   GET /api/ratings/:movieId
 * @access  Public
 * 
 * Returns aggregated rating from ALL users
 */
export const getMovieRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    console.log('📊 [Get Movie Rating] Request for movieId:', movieId);
    
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }
    
    // Calculate global rating using aggregation
    const ratingData = await Rating.getMovieRating(movieId);

    res.status(200).json({
      success: true,
      data: {
        averageRating: ratingData.averageRating || 0,
        totalVotes: ratingData.totalVotes || 0,
        movieId: movieId
      }
    });
  } catch (error) {
    console.error('❌ [Get Movie Rating] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie rating',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's rating for a specific movie
 * @route   GET /api/ratings/:movieId/user
 * @access  Private (requires authentication)
 * 
 * Returns the logged-in user's rating for this movie
 */
export const getUserRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id; // From JWT token
    
    console.log('📊 [Get User Rating]', { userId, movieId });

    const userRating = await Rating.getUserRating(userId, movieId);

    if (userRating) {
      res.status(200).json({
        success: true,
        data: {
          stars: userRating.stars,
          createdAt: userRating.createdAt,
          updatedAt: userRating.updatedAt
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: null,
        message: 'User has not rated this movie yet'
      });
    }
  } catch (error) {
    console.error('❌ [Get User Rating] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rating',
      error: error.message
    });
  }
};

/**
 * @desc    Submit or update rating for a movie
 * @route   POST /api/ratings
 * @access  Private (requires authentication)
 * 
 * Creates new rating or updates existing one
 * User ID comes from JWT token ONLY
 */
export const submitRating = async (req, res) => {
  try {
    const { movieId, stars } = req.body;
    const userId = req.user.id; // SECURITY: From JWT only

    console.log('📝 [Submit Rating] Request:', { userId, movieId, stars });

    // Validation
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    if (!stars || !Number.isInteger(stars)) {
      return res.status(400).json({
        success: false,
        message: 'Stars rating is required and must be an integer'
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    // Submit or update rating (upsert)
    const userRating = await Rating.submitOrUpdateRating(userId, movieId, stars);

    // Get updated global rating
    const globalRating = await Rating.getMovieRating(movieId);

    console.log('✅ [Submit Rating] Success:', {
      userStars: userRating.stars,
      globalAverage: globalRating.averageRating,
      totalVotes: globalRating.totalVotes
    });

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        userRating: {
          stars: userRating.stars,
          createdAt: userRating.createdAt,
          updatedAt: userRating.updatedAt
        },
        globalRating: {
          averageRating: globalRating.averageRating,
          totalVotes: globalRating.totalVotes
        }
      }
    });
  } catch (error) {
    console.error('❌ [Submit Rating] Error:', error);
    
    // Handle duplicate key error (should not happen with upsert, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Rating already exists. Please update instead.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user's rating for a movie
 * @route   DELETE /api/ratings/:movieId
 * @access  Private (requires authentication)
 * 
 * Allows user to remove their rating
 */
export const deleteRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ [Delete Rating]', { userId, movieId });

    const result = await Rating.deleteOne({ userId, movieId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Get updated global rating
    const globalRating = await Rating.getMovieRating(movieId);

    console.log('✅ [Delete Rating] Success');

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: {
        globalRating: {
          averageRating: globalRating.averageRating,
          totalVotes: globalRating.totalVotes
        }
      }
    });
  } catch (error) {
    console.error('❌ [Delete Rating] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
};
