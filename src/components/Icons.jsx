/**
 * Custom Cinematic Icons for CineVerse
 * Premium, glassy icons with subtle glow effects
 */

export const WatchedIcon = ({ active = false, className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="url(#watchedGradient)"
      strokeWidth="2"
      fill={active ? 'url(#watchedGradient)' : 'none'}
      opacity={active ? '0.9' : '0.6'}
    />
    <path
      d="M8 12L11 15L16 9"
      stroke={active ? '#fff' : 'url(#watchedGradient)'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="watchedGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
  </svg>
)

export const LikeIcon = ({ active = false, className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={active ? 'url(#likeGradient)' : 'none'}
      stroke="url(#likeGradient)"
      strokeWidth="2"
      opacity={active ? '1' : '0.6'}
    />
    <defs>
      <linearGradient id="likeGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
    </defs>
  </svg>
)

export const StarIcon = ({ filled = false, className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? 'url(#starGradient)' : 'none'}
      stroke="url(#starGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={filled ? '1' : '0.5'}
    />
    <defs>
      <linearGradient id="starGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
)

export const BucketIcon = ({ active = false, className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
      fill={active ? 'url(#bucketGradient)' : 'none'}
      stroke="url(#bucketGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={active ? '0.9' : '0.6'}
    />
    <path
      d="M9 11l3 3 6-6"
      stroke={active ? '#fff' : 'url(#bucketGradient)'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="bucketGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
  </svg>
)

export const PlayIcon = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="url(#playGradient)"
      strokeWidth="2"
      opacity="0.6"
    />
    <path
      d="M10 8l6 4-6 4V8z"
      fill="url(#playGradient)"
    />
    <defs>
      <linearGradient id="playGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
)

export const SearchIcon = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="11"
      cy="11"
      r="8"
      stroke="url(#searchGradient)"
      strokeWidth="2"
    />
    <path
      d="M21 21l-4.35-4.35"
      stroke="url(#searchGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="searchGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
  </svg>
)

export const ProfileIcon = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="url(#profileGradient)"
      strokeWidth="2"
    />
    <path
      d="M4 20c0-4 3.5-7 8-7s8 3 8 7"
      stroke="url(#profileGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="profileGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
)

export const BrowseIcon = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="3"
      width="20"
      height="14"
      rx="2"
      stroke="url(#browseGradient)"
      strokeWidth="2"
    />
    <path
      d="M2 7h20M8 21h8"
      stroke="url(#browseGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 17v4"
      stroke="url(#browseGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 11l3 2 3-2"
      stroke="url(#browseGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="browseGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
  </svg>
)

export const GenresIcon = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Theater masks icon - classic genre symbol */}
    <path
      d="M9 3C5.5 3 3 6 3 9c0 4 4 7 6 9"
      stroke="url(#genresGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15 3c3.5 0 6 3 6 6 0 4-4 7-6 9"
      stroke="url(#genresGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Happy mask */}
    <circle cx="6" cy="8" r="1" fill="url(#genresGradient)" />
    <circle cx="10" cy="8" r="1" fill="url(#genresGradient)" />
    <path
      d="M5.5 11c.5 1 1.5 1.5 2.5 1.5s2-.5 2.5-1.5"
      stroke="url(#genresGradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Sad mask */}
    <circle cx="14" cy="8" r="1" fill="url(#genresGradient2)" />
    <circle cx="18" cy="8" r="1" fill="url(#genresGradient2)" />
    <path
      d="M13.5 12c.5-1 1.5-1.5 2.5-1.5s2 .5 2.5 1.5"
      stroke="url(#genresGradient2)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Pie chart slice indicator */}
    <path
      d="M12 17v4"
      stroke="url(#genresGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="21"
      r="1"
      fill="url(#genresGradient)"
    >
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </circle>
    <defs>
      <linearGradient id="genresGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient id="genresGradient2" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
)

export const BucketListIcon = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 2v2h6V2"
      stroke="url(#bucketListGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 6h16l-1 14H5L4 6z"
      stroke="url(#bucketListGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 11l2 2 4-4"
      stroke="url(#bucketListGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="6"
      r="1"
      fill="url(#bucketListGradient)"
    />
    <defs>
      <linearGradient id="bucketListGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
)
