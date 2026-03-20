import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import CinematicLoader from '../components/CinematicLoader';
import PageTransition from '../components/PageTransition';
import './Cinephile.css';

const Cinephile = () => {
  const [loading, setLoading] = useState(true);
  const [genreStats, setGenreStats] = useState(null);
  const [tasteSummary, setTasteSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCinephileData();
  }, []);

  const fetchCinephileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all cinephile data in parallel
      const [genreRes, tasteRes, recsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cinephile/genre-stats`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/cinephile/taste-summary`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/cinephile/recommendations`, { headers }).then(r => r.json())
      ]);

      setGenreStats(genreRes.data);
      setTasteSummary(tasteRes.data);
      setRecommendations(recsRes.data.recommendations || []);
    } catch (err) {
      console.error('Cinephile data fetch error:', err);
      setError(err.message || 'Failed to load cinephile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CinematicLoader />;
  }

  if (error) {
    return (
      <PageTransition>
        <div className="cinephile-error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="cinephile-page">
        {/* Hero Header */}
        <motion.div
          className="cinephile-hero"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="cinephile-title">
            <span className="icon">🎬</span> Cinephile
          </h1>
          <p className="cinephile-subtitle">Your movie taste decoded</p>
        </motion.div>

        <div className="cinephile-content">
          {/* Genre Statistics Section */}
          <motion.section
            className="cinephile-section genre-stats-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="section-header">
              <h2>📊 Most Watched Genres</h2>
              <p className="section-subtitle">
                {genreStats?.message || 'Your genre preferences'}
              </p>
            </div>

            {genreStats?.genreStats && genreStats.genreStats.length > 0 ? (
              <div className="genre-bars">
                {genreStats.genreStats.map((genre, index) => (
                  <motion.div
                    key={genre.genre}
                    className="genre-bar-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="genre-info">
                      <span className="genre-name">{genre.genre}</span>
                      <span className="genre-count">{genre.count} movies</span>
                    </div>
                    <div className="genre-bar-container">
                      <motion.div
                        className="genre-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${genre.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                        style={{
                          background: `linear-gradient(90deg, 
                            rgba(255, 51, 102, ${1 - index * 0.15}), 
                            rgba(138, 43, 226, ${0.8 - index * 0.1}))`
                        }}
                      />
                    </div>
                    <span className="genre-percentage">{genre.percentage}%</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>🎭 Watch some movies to see your genre preferences!</p>
              </div>
            )}

            {genreStats?.totalWatchedMovies > 0 && (
              <div className="stats-footer">
                <span className="total-movies">
                  Total watched: <strong>{genreStats.totalWatchedMovies}</strong> movies
                </span>
              </div>
            )}
          </motion.section>

          {/* Taste Summary Section */}
          <motion.section
            className="cinephile-section taste-summary-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="section-header">
              <h2>🧠 Your Taste Profile</h2>
            </div>

            {tasteSummary?.summary ? (
              <>
                <div className="taste-summary-card">
                  <p className="taste-text">{tasteSummary.summary}</p>
                </div>

                {tasteSummary.insights && tasteSummary.insights.length > 0 && (
                  <div className="taste-insights">
                    {tasteSummary.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        className="insight-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      >
                        {insight}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>🎬 Build your taste profile by watching and liking movies!</p>
              </div>
            )}
          </motion.section>

          {/* AI Recommendations Section */}
          <motion.section
            className="cinephile-section recommendations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="section-header">
              <h2>🤖 AI Picks For You</h2>
              {recommendations.length > 0 && (
                <p className="section-subtitle">
                  Based on your cinephile profile
                </p>
              )}
            </div>

            {recommendations.length > 0 ? (
              <div className="recommendations-grid">
                {recommendations.map((movie, index) => (
                  <motion.div
                    key={movie.movieId}
                    className="recommendation-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => navigate(`/movie/${movie.movieId}`)}
                  >
                    <div className="recommendation-poster">
                      {movie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                          alt={movie.title}
                        />
                      ) : (
                        <div className="poster-placeholder">🎬</div>
                      )}
                      <div className="recommendation-overlay">
                        <span className="watch-btn">Watch Now →</span>
                      </div>
                    </div>
                    <div className="recommendation-info">
                      <h3 className="recommendation-title">{movie.title}</h3>
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="recommendation-genres">
                          {movie.genres.slice(0, 2).map((genre, i) => (
                            <span key={i} className="genre-tag">{genre}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>🎯 Rate some movies to get personalized recommendations!</p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Cinephile;
