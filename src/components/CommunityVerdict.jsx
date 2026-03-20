import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import '../styles/CommunityVerdict.css';

/**
 * 🎬 COMMUNITY VERDICT COMPONENT
 * 
 * Premium cinematic voting system
 * - One vote per user per movie
 * - Vote changing supported
 * - Animated percentages
 */

const VERDICT_OPTIONS = [
  {
    key: 'masterpiece',
    label: 'Masterpiece',
    icon: '🎨',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700, #00FF88)',
    glow: 'rgba(255, 215, 0, 0.5)'
  },
  {
    key: 'hit',
    label: 'Hit',
    icon: '🔥',
    color: '#00D4FF',
    gradient: 'linear-gradient(135deg, #00D4FF, #00FFFF)',
    glow: 'rgba(0, 212, 255, 0.5)'
  },
  {
    key: 'average',
    label: 'Average',
    icon: '😐',
    color: '#FFB800',
    gradient: 'linear-gradient(135deg, #FFB800, #FFCC00)',
    glow: 'rgba(255, 184, 0, 0.5)'
  },
  {
    key: 'flop',
    label: 'Flop',
    icon: '💀',
    color: '#FF6B8A',
    gradient: 'linear-gradient(135deg, #FF6B8A, #FF8A9B)',
    glow: 'rgba(255, 107, 138, 0.5)'
  }
];

function CommunityVerdict({ movieId }) {
  const { user, token } = useAuth();
  
  const [stats, setStats] = useState({
    totalVotes: 0,
    breakdown: {
      masterpiece: { count: 0, percentage: 0 },
      hit: { count: 0, percentage: 0 },
      average: { count: 0, percentage: 0 },
      flop: { count: 0, percentage: 0 }
    }
  });
  const [userVerdict, setUserVerdict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);

  /**
   * Fetch verdict data
   */
  const fetchVerdictData = useCallback(async () => {
    if (!movieId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch public statistics
      const statsRes = await fetch(`${API_BASE_URL}/verdict/${encodeURIComponent(movieId)}`);
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      // If logged in, fetch user's verdict
      if (user && token) {
        try {
          const userRes = await fetch(`${API_BASE_URL}/verdict/${encodeURIComponent(movieId)}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userRes.json();
          if (userData.success) {
            setUserVerdict(userData.data.userVerdict);
          }
        } catch (err) {
          console.log('No user verdict found');
        }
      }

      setTimeout(() => setAnimate(true), 100);

    } catch (err) {
      console.error('Failed to fetch verdict data:', err);
      setError('Failed to load verdicts');
    } finally {
      setLoading(false);
    }
  }, [movieId, user, token]);

  useEffect(() => {
    fetchVerdictData();
  }, [fetchVerdictData]);

  /**
   * Handle vote submission
   */
  const handleVote = async (verdict) => {
    if (!user) {
      setError('Please log in to vote');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/verdict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movieId, verdict })
      });

      const data = await response.json();

      if (data.success) {
        setUserVerdict(data.data.userVerdict);
        setStats(data.data.stats);
        setAnimate(false);
        setTimeout(() => setAnimate(true), 50);
      } else {
        setError(data.message || 'Failed to submit vote');
      }

    } catch (err) {
      console.error('Vote failed:', err);
      setError('Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Render verdict option
   */
  const renderOption = (option) => {
    const isSelected = userVerdict === option.key;
    const percentage = stats.breakdown[option.key]?.percentage || 0;
    const count = stats.breakdown[option.key]?.count || 0;
    
    return (
      <button
        key={option.key}
        className={`verdict-option ${isSelected ? 'selected' : ''} ${submitting ? 'submitting' : ''}`}
        onClick={() => handleVote(option.key)}
        disabled={submitting}
        style={{
          '--verdict-color': option.color,
          '--verdict-gradient': option.gradient,
          '--verdict-glow': option.glow
        }}
      >
        {/* Progress bar background */}
        <div 
          className="verdict-progress"
          style={{ width: animate ? `${percentage}%` : '0%' }}
        />
        
        {/* Content */}
        <div className="verdict-content">
          <span className="verdict-icon">{option.icon}</span>
          <span className="verdict-label">{option.label}</span>
          <div className="verdict-stats">
            <span className="verdict-percentage">{percentage}%</span>
            <span className="verdict-count">({count})</span>
          </div>
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <div className="verdict-check">✓</div>
        )}

        {/* Glow effect */}
        <div className="verdict-glow-effect" />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="community-verdict">
        <div className="verdict-header">
          <h3>🎬 Community Verdict</h3>
        </div>
        <div className="verdict-loading">
          <div className="verdict-spinner"></div>
          <p>Loading verdicts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-verdict">
      {/* Header */}
      <div className="verdict-header">
        <h3>🎬 Community Verdict</h3>
        <div className="verdict-total">
          <span className="total-label">Total Votes:</span>
          <span className="total-count">{stats.totalVotes}</span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="verdict-subtitle">
        {user 
          ? (userVerdict ? 'You voted! Click to change.' : 'Cast your verdict!')
          : 'Log in to vote'
        }
      </p>

      {/* Error */}
      {error && (
        <div className="verdict-error">
          ⚠️ {error}
        </div>
      )}

      {/* Options */}
      <div className="verdict-options">
        {VERDICT_OPTIONS.map(renderOption)}
      </div>

      {/* Submitting overlay */}
      {submitting && (
        <div className="verdict-overlay">
          <div className="verdict-spinner small"></div>
          <span>Submitting...</span>
        </div>
      )}
    </div>
  );
}

export default CommunityVerdict;
