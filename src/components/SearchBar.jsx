import { useState, useEffect } from 'react'
import { SearchIcon } from './Icons'
import { motion } from 'framer-motion'

function SearchBar({ onSearch, onSearchChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm)
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Call onSearchChange for live search as user types
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  return (
    <motion.form 
      className="search-bar"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
        <SearchIcon className="search-icon" />
        <input
          type="text"
          className="search-input glass-search"
          placeholder="Search for movies... (e.g., Inception, Matrix, Dark)"
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
        />
        {searchTerm && (
          <motion.button 
            type="button" 
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear search"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        )}
      </div>
      <motion.button 
        type="submit" 
        className="search-button glass-button glass-button-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SearchIcon />
        <span>Search</span>
      </motion.button>
    </motion.form>
  )
}

export default SearchBar
