import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password' 
      });
    }

    // For mock DB testing
    if (global.mockDB) {
      // Check if user already exists in our mock DB
      const existingUser = global.mockDB.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }

      // Create a mock user
      const mockUser = {
        _id: Date.now().toString(),
        name,
        email,
        password,
        role: 'user',
        createdAt: new Date()
      };
      
      global.mockDB.users.push(mockUser);
      
      // Return success
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    }

    // Regular MongoDB flow
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Return success without sending password
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // For mock DB testing
    if (global.mockDB) {
      // Find user in our mock DB
      const mockUser = global.mockDB.users.find(u => u.email === email);
      if (!mockUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Simple password check for mock DB
      if (mockUser.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: mockUser._id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1d' }
      );

      // Return token and user data
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    }

    // Regular MongoDB flow
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return token and user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
}; 