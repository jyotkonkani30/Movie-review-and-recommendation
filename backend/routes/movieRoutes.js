import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserInteractions,
  addToBucketList,
  removeFromBucketList,
  addToWatched,
  removeFromWatched,
  rateMovie,
  removeRating,
  likeMovie,
  unlikeMovie
} from '../controllers/movieController.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Get all user interactions
router.get('/interactions', getUserInteractions);

// Bucket List routes
router.post('/bucket-list', addToBucketList);
router.delete('/bucket-list/:movieId', removeFromBucketList);

// Watched Movies routes
router.post('/watched', addToWatched);
router.delete('/watched/:movieId', removeFromWatched);

// Rating routes
router.post('/rate', rateMovie);
router.delete('/rate/:movieId', removeRating);

// Like routes
router.post('/like', likeMovie);
router.delete('/like/:movieId', unlikeMovie);

export default router;
