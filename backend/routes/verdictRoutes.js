import express from 'express';
import { 
  submitVerdict, 
  getVerdictStats, 
  getUserVerdict
} from '../controllers/verdictController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 🎬 VERDICT ROUTES
 * 
 * POST   /api/verdict              - Submit/Update verdict (Auth)
 * GET    /api/verdict/:movieId     - Get statistics (Public)
 * GET    /api/verdict/:movieId/user - Get user's verdict (Auth)
 */

router.post('/', protect, submitVerdict);
router.get('/:movieId', getVerdictStats);
router.get('/:movieId/user', protect, getUserVerdict);

export default router;
