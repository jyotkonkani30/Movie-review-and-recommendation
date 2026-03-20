import Comment from '../models/Comment.js';

export const getComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const comments = await Comment.find({ movieId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .lean();

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { movieId, comment } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!movieId || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID and comment text are required'
      });
    }

    const newComment = await Comment.create({
      movieId,
      userId,
      username,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
