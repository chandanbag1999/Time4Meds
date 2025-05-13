import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Middleware to protect routes by verifying JWT token
 * Attaches the decoded user to req.user if token is valid
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Authorization header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token with JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id from token and exclude password
      req.user = await User.findById(decoded.id).select('-password');
      
      // If user doesn't exist anymore
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User belonging to this token no longer exists' 
        });
      }
      
      return next();
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token provided' 
    });
  }
};

/**
 * Middleware for role-based authorization
 * Must be used after the protect middleware
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be attached by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    
    next();
  };
}; 