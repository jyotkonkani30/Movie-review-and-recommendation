import IndividualMovieInteraction from '../models/IndividualMovieInteraction.js';
import UserGenreStats from '../models/UserGenreStats.js';
import {
  mapItemsWithNormalizedPoster,
  normalizeMoviePosterInput,
  withNormalizedPoster
} from '../utils/poster.js';

/**
 * ============================================
 * INDIVIDUAL MOVIE INTERACTION CONTROLLERS
 * ============================================
 * 
 * 🔐 SECURITY PRINCIPLES:
 * 1. NEVER trust userId from frontend
 * 2. ALWAYS extract userId from req.user.id (JWT verified)
 * 3. ALL queries MUST include userId filter
 * 4. NO global movie queries allowed
 * 
 * ✅ USER ISOLATION GUARANTEED
 */

/**
 * @desc    Get user's movie interaction summary
 * @route   GET /api/movies/individual/summary
 * @access  Private (JWT Required)
 */
export const getUserSummary = async (req, res) => {
  try {
    // SECURITY: Extract userId from JWT (req.user set by authMiddleware)
    const userId = req.user.id;
    
    // Get counts for each category - ALL filtered by userId
    const [bucketCount, watchedCount, likedCount] = await Promise.all([
      IndividualMovieInteraction.countDocuments({ userId, isInBucketList: true }),
      IndividualMovieInteraction.countDocuments({ userId, isWatched: true }),
      IndividualMovieInteraction.countDocuments({ userId, liked: true })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        userId, // Return for confirmation (safe - it's their own ID)
        bucketListCount: bucketCount,
        watchedCount: watchedCount,
        likedCount: likedCount
      }
    });
  } catch (error) {
    console.error('Get Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get specific movie interaction for user
 * @route   GET /api/movies/individual/:movieId
 * @access  Private
 */
export const getMovieInteraction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    // SECURITY: Query with both userId AND movieId
    const interaction = await IndividualMovieInteraction.findOne({ 
      userId, 
      movieId: movieId 
    });
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'No interaction found for this movie'
      });
    }
    
    res.status(200).json({
      success: true,
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Get Movie Interaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie interaction',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's bucket list
 * @route   GET /api/movies/individual/bucket-list
 * @access  Private
 */
export const getBucketList = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // SECURITY: Static method enforces userId requirement
    const bucketList = await IndividualMovieInteraction.getUserBucketList(userId);
    
    res.status(200).json({
      success: true,
      count: bucketList.length,
      data: mapItemsWithNormalizedPoster(bucketList.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Get Bucket List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bucket list',
      error: error.message
    });
  }
};

/**
 * @desc    Add movie to bucket list
 * @route   POST /api/movies/individual/bucket-list
 * @access  Private
 */
export const addToBucketList = async (req, res) => {
  try {
    const userId = req.user.id; // SECURITY: From JWT only
    const { movieId, title, genres } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    // Validate input
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }
    
    // Find or create interaction for THIS user and THIS movie
    const interaction = await IndividualMovieInteraction.findOrCreate(
      userId, 
      movieId, 
      { title, posterPath, genres: genres || [] }
    );
    
    // Update genres if provided and not already set
    if (genres && Array.isArray(genres) && genres.length > 0) {
      interaction.genres = genres;
      await interaction.save();
    }
    
    // Add to bucket list
    if (interaction.isInBucketList) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in your bucket list'
      });
    }
    
    await interaction.addToBucketList();
    
    res.status(200).json({
      success: true,
      message: 'Movie added to bucket list',
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Add to Bucket List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add movie to bucket list',
      error: error.message
    });
  }
};

/**
 * @desc    Remove movie from bucket list
 * @route   DELETE /api/movies/individual/bucket-list/:movieId
 * @access  Private
 */
export const removeFromBucketList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    // SECURITY: Find with both userId AND movieId
    const interaction = await IndividualMovieInteraction.findOne({ 
      userId, 
      movieId: movieId 
    });
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your bucket list'
      });
    }
    
    await interaction.removeFromBucketList();
    
    res.status(200).json({
      success: true,
      message: 'Movie removed from bucket list',
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Remove from Bucket List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove movie from bucket list',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's watched movies
 * @route   GET /api/movies/individual/watched
 * @access  Private
 */
export const getWatchedMovies = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const watchedMovies = await IndividualMovieInteraction.getUserWatchedMovies(userId);
    
    res.status(200).json({
      success: true,
      count: watchedMovies.length,
      data: mapItemsWithNormalizedPoster(watchedMovies.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Get Watched Movies Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watched movies',
      error: error.message
    });
  }
};

/**
 * @desc    Mark movie as watched
 * @route   POST /api/movies/individual/watched
 * @access  Private
 */
export const markAsWatched = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, title, genres } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }
    
    const interaction = await IndividualMovieInteraction.findOrCreate(
      userId, 
      movieId, 
      { title, posterPath, genres: genres || [] }
    );
    
    // Update genres if provided and not already set
    if (genres && Array.isArray(genres) && genres.length > 0) {
      interaction.genres = genres;
      await interaction.save();
    }
    
    if (interaction.isWatched) {
      return res.status(400).json({
        success: false,
        message: 'Movie already marked as watched'
      });
    }
    
    await interaction.markAsWatched();
    
    // Update user's genre statistics
    if (interaction.genres && interaction.genres.length > 0) {
      await UserGenreStats.updateGenreStats(userId, interaction.genres, 'watch');
    }
    
    res.status(200).json({
      success: true,
      message: 'Movie marked as watched',
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Mark as Watched Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark movie as watched',
      error: error.message
    });
  }
};

/**
 * @desc    Unmark movie as watched
 * @route   DELETE /api/movies/individual/watched/:movieId
 * @access  Private
 */
export const unmarkAsWatched = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    const interaction = await IndividualMovieInteraction.findOne({ 
      userId, 
      movieId: movieId 
    });
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your watched list'
      });
    }
    
    // Update user's genre statistics before unmarking
    if (interaction.genres && interaction.genres.length > 0) {
      await UserGenreStats.updateGenreStats(userId, interaction.genres, 'unwatch');
    }
    
    await interaction.unmarkAsWatched();
    
    res.status(200).json({
      success: true,
      message: 'Movie unmarked as watched',
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Unmark as Watched Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unmark movie as watched',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's liked movies
 * @route   GET /api/movies/individual/likes
 * @access  Private
 */
export const getLikedMovies = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const likedMovies = await IndividualMovieInteraction.getUserLikedMovies(userId);
    
    res.status(200).json({
      success: true,
      count: likedMovies.length,
      data: mapItemsWithNormalizedPoster(likedMovies.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Get Liked Movies Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liked movies',
      error: error.message
    });
  }
};

/**
 * @desc    Like a movie
 * @route   POST /api/movies/individual/like
 * @access  Private
 */
export const likeMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, title, genres } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }
    
    const interaction = await IndividualMovieInteraction.findOrCreate(
      userId, 
      movieId, 
      { title, posterPath, genres: genres || [] }
    );
    
    // Update genres if provided and not already set
    if (genres && Array.isArray(genres) && genres.length > 0) {
      interaction.genres = genres;
      await interaction.save();
    }
    
    if (interaction.liked) {
      return res.status(400).json({
        success: false,
        message: 'Movie already liked'
      });
    }
    
    await interaction.likeMovie();
    
    // Update user's genre statistics
    if (interaction.genres && interaction.genres.length > 0) {
      await UserGenreStats.updateGenreStats(userId, interaction.genres, 'like');
    }
    
    res.status(200).json({
      success: true,
      message: 'Movie liked',
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Like Movie Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like movie',
      error: error.message
    });
  }
};

/**
 * @desc    Unlike a movie
 * @route   DELETE /api/movies/individual/like/:movieId
 * @access  Private
 */
export const unlikeMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    const interaction = await IndividualMovieInteraction.findOne({ 
      userId, 
      movieId: movieId 
    });
    
    if (!interaction || !interaction.liked) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your liked list'
      });
    }
    
    // Update user's genre statistics before unliking
    if (interaction.genres && interaction.genres.length > 0) {
      await UserGenreStats.updateGenreStats(userId, interaction.genres, 'unlike');
    }
    
    await interaction.unlikeMovie();
    
    res.status(200).json({
      success: true,
      message: 'Movie unliked',
      data: withNormalizedPoster(interaction.toObject())
    });
  } catch (error) {
    console.error('Unlike Movie Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike movie',
      error: error.message
    });
  }
};

/**
 * @desc    Get all interactions for user (combined view)
 * @route   GET /api/movies/individual/all
 * @access  Private
 */
export const getAllUserInteractions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const interactions = await IndividualMovieInteraction.getUserInteractions(userId);
    
    res.status(200).json({
      success: true,
      count: interactions.length,
      data: mapItemsWithNormalizedPoster(interactions.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Get All Interactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user interactions',
      error: error.message
    });
  }
};
