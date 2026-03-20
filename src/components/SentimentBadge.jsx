import '../styles/SentimentBadge.css'

// Displays sentiment analysis badge with icon and confidence score

function SentimentBadge({ sentiment = 'neutral', confidence = 0, showLabel = true, showConfidence = true }) {
  // Sentiment configuration
  const sentimentConfig = {
    positive: {
      icon: '😊',
      label: 'Positive',
      color: 'positive',
      description: 'Users loved it'
    },
    negative: {
      icon: '😡',
      label: 'Negative',
      color: 'negative',
      description: 'Users disliked it'
    },
    neutral: {
      icon: '😐',
      label: 'Neutral',
      color: 'neutral',
      description: 'Mixed opinion'
    }
  };

  const config = sentimentConfig[sentiment] || sentimentConfig.neutral;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div
      className={`sentiment-badge sentiment-${config.color}`}
      title={`${config.description} - ${confidencePercent}% confidence`}
      data-testid={`sentiment-badge-${sentiment}`}
    >
      {/* Icon */}
      <span className="sentiment-icon" aria-label={config.label}>
        {config.icon}
      </span>

      {/* Label */}
      {showLabel && (
        <span className="sentiment-label">
          {config.label}
        </span>
      )}

      {/* Confidence percentage (visible on hover) */}
      {showConfidence && (
        <span className="sentiment-confidence" title="AI Confidence">
          {confidencePercent}%
        </span>
      )}
    </div>
  );
}

export default SentimentBadge;
