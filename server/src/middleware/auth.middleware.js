const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');

/**
 * Protect routes - JWT authentication middleware
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          message: 'User not found'
        });
      }
      
      // Attach user to request
      req.user = {
        id: user._id
      };
      
      next();
    } catch (error) {
      logger.error('JWT verification error:', error);
      return res.status(401).json({
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Server error in authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};