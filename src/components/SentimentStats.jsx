/**
 * 🧠 SENTIMENT STATS COMPONENT
 * Shows sentiment distribution across all comments for a movie
 * 
 * Displays:
 * - Count of positive/negative/neutral comments
 * - Overall sentiment summary
 * - Statistics bar
 */

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import '../styles/SentimentStats.css'

function SentimentStats({ movieId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!movieId) return
    fetchStats()
  }, [movieId])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${movieId}/sentiment-stats`)
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sentiment stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) return null

  const { positive, negative, neutral, total, averageConfidence } = stats
  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0
  const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0
  const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0

  return (
    <div className="sentiment-stats">
      <div className="stats-header">
        <h3>Community Sentiment</h3>
        <span className="stats-confidence">AI Confidence: {Math.round(averageConfidence * 100)}%</span>
      </div>

      {/* Stats Distribution */}
      <div className="stats-distribution">
        {/* Positive */}
        {positive > 0 && (
          <div className="stat-item positive">
            <div className="stat-icon">😊</div>
            <div className="stat-info">
              <div className="stat-count">{positive}</div>
              <div className="stat-label">Positive ({positivePercent}%)</div>
            </div>
          </div>
        )}

        {/* Neutral */}
        {neutral > 0 && (
          <div className="stat-item neutral">
            <div className="stat-icon">😐</div>
            <div className="stat-info">
              <div className="stat-count">{neutral}</div>
              <div className="stat-label">Neutral ({neutralPercent}%)</div>
            </div>
          </div>
        )}

        {/* Negative */}
        {negative > 0 && (
          <div className="stat-item negative">
            <div className="stat-icon">😡</div>
            <div className="stat-info">
              <div className="stat-count">{negative}</div>
              <div className="stat-label">Negative ({negativePercent}%)</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        {positive > 0 && (
          <div
            className="progress-bar positive"
            style={{ width: `${positivePercent}%` }}
            title={`${positivePercent}% positive`}
          />
        )}
        {neutral > 0 && (
          <div
            className="progress-bar neutral"
            style={{ width: `${neutralPercent}%` }}
            title={`${neutralPercent}% neutral`}
          />
        )}
        {negative > 0 && (
          <div
            className="progress-bar negative"
            style={{ width: `${negativePercent}%` }}
            title={`${negativePercent}% negative`}
          />
        )}
      </div>
    </div>
  )
}

export default SentimentStats
