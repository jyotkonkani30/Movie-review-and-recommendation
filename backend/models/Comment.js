import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: [true, 'Movie ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  comment: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
commentSchema.index({ movieId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
