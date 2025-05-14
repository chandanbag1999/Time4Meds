import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

// Forgot password - send reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // For mock DB testing
    if (global.mockDB) {
      // Find user in our mock DB
      const mockUser = global.mockDB.users.find(u => u.email === email);
      if (!mockUser) {
        return res.status(404).json({
          success: false,
          message: 'No account with that email address exists'
        });
      }

      // Generate token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetExpires = Date.now() + 3600000; // 1 hour

      // Update mock user
      mockUser.resetPasswordToken = resetToken;
      mockUser.resetPasswordExpires = resetExpires;

      // In a real app, we would send an email here
      console.log(`Mock email sent to ${email} with reset token: ${resetToken}`);

      return res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Regular MongoDB flow
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with that email address exists'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token and expiration on user model
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL - use the resetToken directly in the URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      console.log('================================================');
      console.log('PASSWORD RESET REQUESTED FOR:', user.email);
      console.log('================================================');
      console.log('IMPORTANT: For testing purposes, use this reset URL:');
      console.log(resetUrl);
      console.log('================================================');
      
      let transporter;
      let emailInfo;
      let previewUrl;
      
      // First try using environment variables if they exist
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Attempting to use configured email provider...');
        transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        // Fall back to Ethereal test account
        console.log('No email configuration found, creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        console.log('Created Ethereal test account:', testAccount.user);
        
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      // Send the email
      try {
        emailInfo = await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Time4Meds" <noreply@time4meds.com>',
          to: user.email,
          subject: 'Time4Meds - Password Reset',
          html: `
            <h1>You requested a password reset</h1>
            <p>Please click on the following link to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          `
        });
        
        // Check if it's an Ethereal email and get preview URL
        if (emailInfo && emailInfo.messageId && !process.env.EMAIL_USER) {
          previewUrl = nodemailer.getTestMessageUrl(emailInfo);
          console.log('=======================================');
          console.log('Email sent to Ethereal (not to real inbox)');
          console.log('Preview URL:', previewUrl);
          console.log('COPY THIS URL to view the email that would be sent');
          console.log('=======================================');
        } else {
          console.log('Email sent successfully to:', user.email);
        }

        // Return success even if email might not be delivered to real inbox
        return res.status(200).json({
          success: true,
          message: 'Password reset link generated',
          // Include the token in the response for development purposes
          resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
      } catch (emailSendError) {
        console.error('Error sending email:', emailSendError);
        
        // Continue despite email send error - we'll rely on the token in the DB
        console.log('=======================================');
        console.log('EMAIL COULD NOT BE SENT BUT TOKEN IS VALID');
        console.log('Token saved in database, use the following URL:');
        console.log(resetUrl);
        console.log('=======================================');
        
        // Return success even though email failed - token is in the DB
        return res.status(200).json({
          success: true,
          message: 'Email could not be sent, but reset token was generated successfully',
          // Include the token in the response for development
          resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
      }
    } catch (error) {
      console.error('Password reset process error:', error);
      
      // Reset the token if the whole process fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Error processing password reset',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset',
      error: error.message
    });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // For mock DB testing
    if (global.mockDB) {
      const mockUser = global.mockDB.users.find(
        u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now()
      );

      if (!mockUser) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token is valid'
      });
    }

    // Regular MongoDB flow
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying reset token',
      error: error.message
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // For mock DB testing
    if (global.mockDB) {
      const mockUserIndex = global.mockDB.users.findIndex(
        u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now()
      );

      if (mockUserIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired'
        });
      }

      // Update password
      global.mockDB.users[mockUserIndex].password = password;
      global.mockDB.users[mockUserIndex].resetPasswordToken = undefined;
      global.mockDB.users[mockUserIndex].resetPasswordExpires = undefined;

      return res.status(200).json({
        success: true,
        message: 'Password has been reset'
      });
    }

    // Regular MongoDB flow
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Set new password (will be hashed by the pre-save middleware)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
}; 