import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/:movieId', getComments);

// Protected routes - require authentication
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
