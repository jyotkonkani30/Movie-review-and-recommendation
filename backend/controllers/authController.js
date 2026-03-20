import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

// Format user response with image as base64 url
const formatUserResponse = (user) => {
  const userResponse = {
    id: user._id,
    email: user.email,
    phone: user.phone,
    username: user.username,
    createdAt: user.createdAt,
    profilePic: null
  };

  // Convert image buffer to base64 if exists
  if (user.profilePic?.data) {
    try {
      const base64String = user.profilePic.data.toString('base64');
      userResponse.profilePic = `data:${user.profilePic.contentType};base64,${base64String}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      userResponse.profilePic = null;
    }
  }

  return userResponse;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, phone, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }]
    });

    if (existingUser) {
      let field = 'User';
      if (existingUser.email === email) field = 'Email';
      else if (existingUser.phone === phone) field = 'Phone number';
      else if (existingUser.username === username) field = 'Username';
      
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
      email,
      phone,
      username,
      password
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint is for consistency and can be used for logging
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * @desc    Update user profile picture
 * @route   PUT /api/auth/profile-pic
 * @access  Private
 */
export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture data is required'
      });
    }

    // Validate base64 format (should start with data:image/)
    if (!profilePic.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Must be a valid base64 image.'
      });
    }

    // Extract MIME type
    const mimeTypeMatch = profilePic.match(/data:([^;]+)/);
    const contentType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validMimeTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP'
      });
    }

    // Convert base64 to buffer
    const base64Data = profilePic.replace(/^data:image\/\w+;base64,/, '');
    
    // Validate base64 size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    const bufferSize = Buffer.byteLength(base64Data, 'base64');
    
    if (bufferSize > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: `Image size must be less than 5MB (current: ${(bufferSize / 1024 / 1024).toFixed(2)}MB)`
      });
    }

    // Convert to buffer
    let imageBuffer;
    try {
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image data format'
      });
    }

    // Update user with image data
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profilePic: {
          data: imageBuffer,
          contentType: contentType,
          uploadedAt: new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Update Profile Pic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
