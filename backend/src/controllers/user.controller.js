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

// Add a caregiver
export const addCaregiver = async (req, res) => {
  try {
    const { email, accessLevel, notifyOnMissed, notifyOnAdherence } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver email is required'
      });
    }

    // Validate access level
    if (accessLevel && !['view', 'manage'].includes(accessLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Access level must be either "view" or "manage"'
      });
    }

    // Find the caregiver by email
    const caregiver = await User.findOne({ email });

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    // Check if the caregiver is already added
    const currentUser = await User.findById(req.user._id);

    const existingCaregiver = currentUser.caregivers.find(
      c => c.userId.toString() === caregiver._id.toString()
    );

    if (existingCaregiver) {
      return res.status(400).json({
        success: false,
        message: 'This caregiver is already added to your account'
      });
    }

    // Add caregiver to the user's caregivers list
    currentUser.caregivers.push({
      userId: caregiver._id,
      name: caregiver.name,
      email: caregiver.email,
      notifyOnMissed: notifyOnMissed !== undefined ? notifyOnMissed : true,
      notifyOnAdherence: notifyOnAdherence !== undefined ? notifyOnAdherence : false,
      accessLevel: accessLevel || 'view',
      addedAt: new Date()
    });

    await currentUser.save();

    // Add the user to the caregiver's caregivingFor list
    caregiver.caregivingFor.push({
      userId: currentUser._id,
      name: currentUser.name,
      accessLevel: accessLevel || 'view',
      addedAt: new Date()
    });

    await caregiver.save();

    res.status(200).json({
      success: true,
      message: `${caregiver.name} has been added as your caregiver`,
      data: {
        caregiverId: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        accessLevel: accessLevel || 'view'
      }
    });
  } catch (error) {
    console.error('Error adding caregiver:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding caregiver',
      error: error.message
    });
  }
};

// Remove a caregiver
export const removeCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.params;

    if (!caregiverId) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver ID is required'
      });
    }

    // Find the current user
    const currentUser = await User.findById(req.user._id);

    // Check if the caregiver exists in the user's caregivers list
    const caregiverIndex = currentUser.caregivers.findIndex(
      c => c.userId.toString() === caregiverId
    );

    if (caregiverIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found in your caregivers list'
      });
    }

    // Get caregiver info before removing
    const caregiverInfo = currentUser.caregivers[caregiverIndex];

    // Remove caregiver from the user's caregivers list
    currentUser.caregivers.splice(caregiverIndex, 1);
    await currentUser.save();

    // Remove the user from the caregiver's caregivingFor list
    const caregiver = await User.findById(caregiverId);

    if (caregiver) {
      const caregivingForIndex = caregiver.caregivingFor.findIndex(
        c => c.userId.toString() === currentUser._id.toString()
      );

      if (caregivingForIndex !== -1) {
        caregiver.caregivingFor.splice(caregivingForIndex, 1);
        await caregiver.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Caregiver has been removed`,
      data: {
        caregiverId,
        name: caregiverInfo.name,
        email: caregiverInfo.email
      }
    });
  } catch (error) {
    console.error('Error removing caregiver:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing caregiver',
      error: error.message
    });
  }
};

// Update caregiver settings
export const updateCaregiverSettings = async (req, res) => {
  try {
    const { caregiverId } = req.params;
    const { accessLevel, notifyOnMissed, notifyOnAdherence } = req.body;

    if (!caregiverId) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver ID is required'
      });
    }

    // Validate access level if provided
    if (accessLevel && !['view', 'manage'].includes(accessLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Access level must be either "view" or "manage"'
      });
    }

    // Find the current user
    const currentUser = await User.findById(req.user._id);

    // Find the caregiver in the user's caregivers list
    const caregiver = currentUser.caregivers.find(
      c => c.userId.toString() === caregiverId
    );

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found in your caregivers list'
      });
    }

    // Update caregiver settings
    if (accessLevel !== undefined) caregiver.accessLevel = accessLevel;
    if (notifyOnMissed !== undefined) caregiver.notifyOnMissed = notifyOnMissed;
    if (notifyOnAdherence !== undefined) caregiver.notifyOnAdherence = notifyOnAdherence;

    await currentUser.save();

    // If access level is updated, also update the caregivingFor entry
    if (accessLevel !== undefined) {
      const caregiverUser = await User.findById(caregiverId);

      if (caregiverUser) {
        const caregivingForEntry = caregiverUser.caregivingFor.find(
          c => c.userId.toString() === currentUser._id.toString()
        );

        if (caregivingForEntry) {
          caregivingForEntry.accessLevel = accessLevel;
          await caregiverUser.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Caregiver settings updated successfully',
      data: caregiver
    });
  } catch (error) {
    console.error('Error updating caregiver settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating caregiver settings',
      error: error.message
    });
  }
};

// Get all caregivers for the current user
export const getCaregivers = async (req, res) => {
  try {
    // Find the current user with populated caregivers
    const user = await User.findById(req.user._id).select('caregivers');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.caregivers.length,
      data: user.caregivers
    });
  } catch (error) {
    console.error('Error fetching caregivers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching caregivers',
      error: error.message
    });
  }
};

// Get all users the current user is caregiving for
export const getCaregivingFor = async (req, res) => {
  try {
    // Find the current user with populated caregivingFor
    const user = await User.findById(req.user._id).select('caregivingFor');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.caregivingFor.length,
      data: user.caregivingFor
    });
  } catch (error) {
    console.error('Error fetching caregiving for users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching caregiving for users',
      error: error.message
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      reminderAdvanceMinutes,
      defaultView
    } = req.body;

    // Build update object with only provided fields
    const updateData = { preferences: {} };

    if (emailNotifications !== undefined) updateData.preferences.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.preferences.pushNotifications = pushNotifications;
    if (reminderAdvanceMinutes !== undefined) updateData.preferences.reminderAdvanceMinutes = reminderAdvanceMinutes;
    if (defaultView !== undefined) updateData.preferences.defaultView = defaultView;

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};