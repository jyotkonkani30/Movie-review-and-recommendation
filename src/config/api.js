/**
 * OMDb API Configuration
 * API Documentation: http://www.omdbapi.com/
 * 
 * Get your free API key at: http://www.omdbapi.com/apikey.aspx
 * Free tier: 1,000 daily requests
 * 
 * Note: If you're experiencing issues, you may need to:
 * 1. Get a new API key (free)
 * 2. Check daily limit hasn't been exceeded
 * 3. Verify internet connection
 */

// Using environment variable or fallback to hardcoded key
export const OMDB_API_KEY = 'd7f55220'
export const OMDB_BASE_URL = 'http://www.omdbapi.com/'

// Backend API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
