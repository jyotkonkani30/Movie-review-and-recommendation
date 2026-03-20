import mongoose from 'mongoose';
import { normalizePosterPath } from '../utils/poster.js';

const movieInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Bucket List - Movies user wants to watch
  bucketList: [{
    movieId: { type: String, required: true },
    title: String,
    posterPath: { type: String, set: (value) => normalizePosterPath(value) },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Watched Movies
  watchedMovies: [{
    movieId: { type: String, required: true },
    title: String,
    posterPath: { type: String, set: (value) => normalizePosterPath(value) },
    watchedAt: { type: Date, default: Date.now }
  }],
  
  // Movie Ratings (1-5 stars)
  ratings: [{
    movieId: { type: String, required: true },
    title: String,
    posterPath: { type: String, set: (value) => normalizePosterPath(value) },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    ratedAt: { type: Date, default: Date.now }
  }],
  
  // Liked Movies
  likedMovies: [{
    movieId: { type: String, required: true },
    title: String,
    posterPath: { type: String, set: (value) => normalizePosterPath(value) },
    likedAt: { type: Date, default: Date.now }
  }]
  
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
movieInteractionSchema.index({ userId: 1, 'bucketList.movieId': 1 });
movieInteractionSchema.index({ userId: 1, 'watchedMovies.movieId': 1 });
movieInteractionSchema.index({ userId: 1, 'ratings.movieId': 1 });
movieInteractionSchema.index({ userId: 1, 'likedMovies.movieId': 1 });

// Static method to get or create user interactions
movieInteractionSchema.statics.getOrCreate = async function(userId) {
  let interaction = await this.findOne({ userId });
  
  if (!interaction) {
    interaction = await this.create({ 
      userId,
      bucketList: [],
      watchedMovies: [],
      ratings: [],
      likedMovies: []
    });
  }
  
  return interaction;
};

const MovieInteraction = mongoose.model('MovieInteraction', movieInteractionSchema);

export default MovieInteraction;
