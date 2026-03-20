import MovieVerdict from '../models/MovieVerdict.js';

/**
 * 🎬 VERDICT CONTROLLER
 * Backend is the single source of truth for all calculations
 */

/**
 * @desc    Submit or update user's verdict
 * @route   POST /api/verdict
 * @access  Private
 */
export const submitVerdict = async (req, res) => {
  try {
    const { movieId, verdict } = req.body;
    const userId = req.user._id; // From auth middleware

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    if (!verdict) {
      return res.status(400).json({
        success: false,
        message: 'Verdict is required'
      });
    }

    const validVerdicts = ['masterpiece', 'hit', 'average', 'flop'];
    if (!validVerdicts.includes(verdict.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verdict. Must be: masterpiece, hit, average, or flop'
      });
    }

    // Submit or update verdict
    const userVerdict = await MovieVerdict.submitVerdict(movieId, userId, verdict);

    // Get updated statistics
    const stats = await MovieVerdict.getVerdictStats(movieId);

    res.status(200).json({
      success: true,
      message: 'Verdict submitted successfully',
      data: {
        userVerdict: userVerdict.verdict,
        stats: stats
      }
    });

  } catch (error) {
    console.error('Submit Verdict Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verdict',
      error: error.message
    });
  }
};

/**
 * @desc    Get verdict statistics for a movie
 * @route   GET /api/verdict/:movieId
 * @access  Public
 */
export const getVerdictStats = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    const stats = await MovieVerdict.getVerdictStats(movieId);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get Verdict Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verdict statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's verdict for a movie
 * @route   GET /api/verdict/:movieId/user
 * @access  Private
 */
export const getUserVerdict = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }

    const userVerdict = await MovieVerdict.getUserVerdict(movieId, userId);
    const stats = await MovieVerdict.getVerdictStats(movieId);

    res.status(200).json({
      success: true,
      data: {
        userVerdict: userVerdict,
        stats: stats
      }
    });

  } catch (error) {
    console.error('Get User Verdict Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user verdict',
      error: error.message
    });
  }
};
