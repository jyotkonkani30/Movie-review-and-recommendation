import MovieInteraction from '../models/MovieInteraction.js';
import {
  mapItemsWithNormalizedPoster,
  normalizeMoviePosterInput
} from '../utils/poster.js';

/**
 * @desc    Get all user movie interactions
 * @route   GET /api/movies/interactions
 * @access  Private
 */
export const getUserInteractions = async (req, res) => {
  try {
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    const interactionObject = interaction.toObject();
    
    res.status(200).json({
      success: true,
      data: {
        ...interactionObject,
        bucketList: mapItemsWithNormalizedPoster(interactionObject.bucketList),
        watchedMovies: mapItemsWithNormalizedPoster(interactionObject.watchedMovies),
        ratings: mapItemsWithNormalizedPoster(interactionObject.ratings),
        likedMovies: mapItemsWithNormalizedPoster(interactionObject.likedMovies)
      }
    });
  } catch (error) {
    console.error('Get Interactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Add movie to bucket list
 * @route   POST /api/movies/bucket-list
 * @access  Private
 */
export const addToBucketList = async (req, res) => {
  try {
    const { movieId, title } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    // Check if already in bucket list
    const exists = interaction.bucketList.some(item => item.movieId === movieId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in bucket list'
      });
    }
    
    interaction.bucketList.push({ movieId, title, posterPath });
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie added to bucket list',
      data: mapItemsWithNormalizedPoster(interaction.bucketList.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Add to Bucket List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Remove movie from bucket list
 * @route   DELETE /api/movies/bucket-list/:movieId
 * @access  Private
 */
export const removeFromBucketList = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    interaction.bucketList = interaction.bucketList.filter(
      item => item.movieId !== parseInt(movieId)
    );
    
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie removed from bucket list',
      data: mapItemsWithNormalizedPoster(interaction.bucketList.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Remove from Bucket List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Add movie to watched list
 * @route   POST /api/movies/watched
 * @access  Private
 */
export const addToWatched = async (req, res) => {
  try {
    const { movieId, title } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    // Check if already watched
    const exists = interaction.watchedMovies.some(item => item.movieId === movieId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in watched list'
      });
    }
    
    interaction.watchedMovies.push({ movieId, title, posterPath });
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie added to watched list',
      data: mapItemsWithNormalizedPoster(interaction.watchedMovies.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Add to Watched Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Remove movie from watched list
 * @route   DELETE /api/movies/watched/:movieId
 * @access  Private
 */
export const removeFromWatched = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    interaction.watchedMovies = interaction.watchedMovies.filter(
      item => item.movieId !== parseInt(movieId)
    );
    
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie removed from watched list',
      data: mapItemsWithNormalizedPoster(interaction.watchedMovies.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Remove from Watched Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Rate a movie
 * @route   POST /api/movies/rate
 * @access  Private
 */
export const rateMovie = async (req, res) => {
  try {
    const { movieId, title, rating } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    // Check if already rated, update if exists
    const existingRatingIndex = interaction.ratings.findIndex(
      item => item.movieId === movieId
    );
    
    if (existingRatingIndex !== -1) {
      interaction.ratings[existingRatingIndex].rating = rating;
      interaction.ratings[existingRatingIndex].ratedAt = new Date();
    } else {
      interaction.ratings.push({ movieId, title, posterPath, rating });
    }
    
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie rated successfully',
      data: mapItemsWithNormalizedPoster(interaction.ratings.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Rate Movie Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Remove rating from movie
 * @route   DELETE /api/movies/rate/:movieId
 * @access  Private
 */
export const removeRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    interaction.ratings = interaction.ratings.filter(
      item => item.movieId !== parseInt(movieId)
    );
    
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Rating removed',
      data: mapItemsWithNormalizedPoster(interaction.ratings.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Remove Rating Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Like a movie
 * @route   POST /api/movies/like
 * @access  Private
 */
export const likeMovie = async (req, res) => {
  try {
    const { movieId, title } = req.body;
    const posterPath = normalizeMoviePosterInput(req.body);
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    // Check if already liked
    const exists = interaction.likedMovies.some(item => item.movieId === movieId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Movie already liked'
      });
    }
    
    interaction.likedMovies.push({ movieId, title, posterPath });
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie liked',
      data: mapItemsWithNormalizedPoster(interaction.likedMovies.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Like Movie Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Unlike a movie
 * @route   DELETE /api/movies/like/:movieId
 * @access  Private
 */
export const unlikeMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const interaction = await MovieInteraction.getOrCreate(req.user.id);
    
    interaction.likedMovies = interaction.likedMovies.filter(
      item => item.movieId !== parseInt(movieId)
    );
    
    await interaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie unliked',
      data: mapItemsWithNormalizedPoster(interaction.likedMovies.map((item) => item.toObject()))
    });
  } catch (error) {
    console.error('Unlike Movie Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
