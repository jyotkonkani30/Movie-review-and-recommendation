import express from 'express';
import { getMovieRating, getUserRating, submitRating, deleteRating } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 🎬 CINEVERSE RATING ROUTES
 * Clean, RESTful API design
 */

// Public route - get global movie rating
router.get('/:movieId', getMovieRating);

// Protected routes - require JWT authentication
router.get('/:movieId/user', protect, getUserRating);
router.post('/', protect, submitRating);
router.delete('/:movieId', protect, deleteRating);

export default router;
