const jwt = require('jsonwebtoken');
const User = require('../models/User');

//The middleware is to verify JWT token and authenticate users
//it will run before any protected route

const authenticate = async (req, res, next) => {
  try {
    // Getting the token from Authorization header
    // Format expected: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);
    
    // Verify token
    // This checks if the token is valid, if it has expired, if it Was signed by us
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Get user from database
    // because Token might be valid but user could be deleted/deactivated
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found or inactive.'
      });
    }
    
    // Add user to request object so other routes can access it
    // This is powerful! Now any protected route knows WHO is making the request
    req.user = user;
    req.userId = user._id;
    
    // Call next() to proceed to the actual route handler
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to check if user has specific role
// Usage: requireRole('doctor') - only doctors can access
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // This middleware assumes authenticate has already run
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // This is for Converting single role to array for consistent checking
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Middleware to validate request data
// Why? Prevents malformed requests from crashing our server
const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  validateRequest
};