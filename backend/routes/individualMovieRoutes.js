import express from 'express';
import {
  getUserSummary,
  getMovieInteraction,
  getBucketList,
  addToBucketList,
  removeFromBucketList,
  getWatchedMovies,
  markAsWatched,
  unmarkAsWatched,
  getLikedMovies,
  likeMovie,
  unlikeMovie,
  getAllUserInteractions
} from '../controllers/individualMovieController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ============================================
 * 🔒 ALL ROUTES ARE PROTECTED WITH JWT
 * ============================================
 * 
 * Every route uses protect middleware which:
 * 1. Verifies JWT token from Authorization header
 * 2. Extracts user ID from token payload
 * 3. Attaches user to req.user
 * 4. Rejects invalid/expired tokens
 * 
 * ✅ ZERO TRUST: Frontend cannot spoof userId
 */

// Apply JWT protection to ALL routes in this router
router.use(protect);

/**
 * USER SUMMARY
 * Get counts of bucket list, watched, rated, liked movies
 */
router.get('/summary', getUserSummary);

/**
 * ALL INTERACTIONS
 * Get all movie interactions for authenticated user
 */
router.get('/all', getAllUserInteractions);

/**
 * BUCKET LIST ROUTES
 */
router.get('/bucket-list', getBucketList);
router.post('/bucket-list', addToBucketList);
router.delete('/bucket-list/:movieId', removeFromBucketList);

/**
 * WATCHED MOVIES ROUTES
 */
router.get('/watched', getWatchedMovies);
router.post('/watched', markAsWatched);
router.delete('/watched/:movieId', unmarkAsWatched);

/**
 * LIKES ROUTES
 */
router.get('/likes', getLikedMovies);
router.post('/like', likeMovie);
router.delete('/like/:movieId', unlikeMovie);

/**
 * SPECIFIC MOVIE INTERACTION
 * Get interaction details for a specific movie
 */
router.get('/:movieId', getMovieInteraction);

export default router;
