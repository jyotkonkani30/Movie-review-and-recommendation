import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getGenreStats,
  getGenreRecommendation,
  getGenreInsights,
  getUserGenreStats,
  recalculateGenreStats
} from '../controllers/genreController.js';

const router = express.Router();

/**
 * ============================================
 * GENRE ANALYTICS ROUTES
 * ============================================
 * 
 * All routes are protected and user-specific
 * No global data access allowed
 */

// @route   GET /api/genres/stats
// @desc    Get user's genre distribution statistics (calculated on the fly)
// @access  Private
router.get('/stats', protect, getGenreStats);

// @route   GET /api/genres/user-stats
// @desc    Get user's stored genre statistics (from UserGenreStats collection)
// @access  Private
router.get('/user-stats', protect, getUserGenreStats);

// @route   GET /api/genres/recommendation
// @desc    Get genre-based movie recommendation
// @access  Private
router.get('/recommendation', protect, getGenreRecommendation);

// @route   GET /api/genres/insights
// @desc    Get detailed genre insights
// @access  Private
router.get('/insights', protect, getGenreInsights);

// @route   POST /api/genres/recalculate
// @desc    Force recalculate user's genre statistics
// @access  Private
router.post('/recalculate', protect, recalculateGenreStats);

export default router;
