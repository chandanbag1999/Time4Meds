import User from '../models/user.model.js';

// Get current user profile (for any authenticated user)
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: error.message
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and role'
      });
    }
    
    // Make sure role is valid
    if (!['user', 'caregiver', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, caregiver, or admin'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
}; 