// Middleware to validate registration input
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Check required fields
  if (!name || !email || !password) {
    errors.push({ message: 'All fields are required' });
  }

  // Validate email format
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailPattern.test(email)) {
    errors.push({ message: 'Please enter a valid email' });
  }

  // Password length
  if (password && password.length < 6) {
    errors.push({ message: 'Password must be at least 6 characters' });
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // If no errors, proceed
  next();
};

// Middleware to validate login input
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Check required fields
  if (!email || !password) {
    errors.push({ message: 'Email and password are required' });
  }

  // Validate email format
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailPattern.test(email)) {
    errors.push({ message: 'Please enter a valid email' });
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // If no errors, proceed
  next();
};

// Middleware to validate medicine input
export const validateMedicine = (req, res, next) => {
  const { name, dosage, frequency, times } = req.body;
  const errors = [];

  // Check required fields
  if (!name) {
    errors.push({ message: 'Medicine name is required' });
  }

  if (!dosage) {
    errors.push({ message: 'Dosage is required' });
  }

  if (!frequency) {
    errors.push({ message: 'Frequency is required' });
  } else if (!['daily', 'weekly', 'custom'].includes(frequency)) {
    errors.push({ message: 'Frequency must be daily, weekly, or custom' });
  }

  // Check times array
  if (times) {
    if (!Array.isArray(times)) {
      errors.push({ message: 'Times must be an array' });
    } else if (times.length === 0) {
      errors.push({ message: 'At least one time is required' });
    } else {
      // Validate time format (optional)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format
      const invalidTimes = times.filter(time => !timeRegex.test(time));
      
      if (invalidTimes.length > 0) {
        errors.push({ 
          message: 'Times must be in HH:MM format (24-hour)',
          invalidTimes
        });
      }
    }
  } else {
    errors.push({ message: 'Times array is required' });
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // If no errors, proceed
  next();
};

// Middleware to validate medicine updates
export const validateMedicineUpdate = (req, res, next) => {
  const { name, dosage, frequency, times, notes, isActive } = req.body;
  const errors = [];
  const allowedFields = ['name', 'dosage', 'frequency', 'times', 'notes', 'isActive'];
  
  // Check if any disallowed fields are being updated
  const receivedFields = Object.keys(req.body);
  const disallowedFields = receivedFields.filter(field => !allowedFields.includes(field));
  
  if (disallowedFields.length > 0) {
    errors.push({ 
      message: `Cannot update the following fields: ${disallowedFields.join(', ')}`,
      disallowedFields
    });
  }

  // Validate name if provided
  if (name !== undefined && (!name || typeof name !== 'string' || name.trim() === '')) {
    errors.push({ message: 'Medicine name must be a non-empty string' });
  }

  // Validate dosage if provided
  if (dosage !== undefined && (!dosage || typeof dosage !== 'string' || dosage.trim() === '')) {
    errors.push({ message: 'Dosage must be a non-empty string' });
  }

  // Validate frequency if provided
  if (frequency !== undefined) {
    if (!['daily', 'weekly', 'custom'].includes(frequency)) {
      errors.push({ message: 'Frequency must be daily, weekly, or custom' });
    }
  }

  // Validate times array if provided
  if (times !== undefined) {
    if (!Array.isArray(times)) {
      errors.push({ message: 'Times must be an array' });
    } else if (times.length === 0) {
      errors.push({ message: 'At least one time is required' });
    } else {
      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format
      const invalidTimes = times.filter(time => !timeRegex.test(time));
      
      if (invalidTimes.length > 0) {
        errors.push({ 
          message: 'Times must be in HH:MM format (24-hour)',
          invalidTimes
        });
      }
    }
  }

  // Validate notes if provided
  if (notes !== undefined && typeof notes !== 'string') {
    errors.push({ message: 'Notes must be a string' });
  }

  // Validate isActive if provided
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    errors.push({ message: 'isActive must be a boolean' });
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // If no errors, proceed
  next();
};

// Middleware to validate reminder log creation
export const validateReminderLog = (req, res, next) => {
  const { medicineId, time, status } = req.body;
  const errors = [];
  
  // Validate medicineId
  if (!medicineId) {
    errors.push({ message: 'Medicine ID is required' });
  } else if (!medicineId.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push({ message: 'Invalid medicine ID format' });
  }
  
  // Validate time format
  if (!time) {
    errors.push({ message: 'Time is required' });
  } else {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format
    if (!timeRegex.test(time)) {
      errors.push({ message: 'Time must be in HH:MM format (24-hour)' });
    }
  }
  
  // Validate status if provided
  if (status && !['pending', 'taken', 'skipped', 'missed'].includes(status)) {
    errors.push({ message: 'Status must be pending, taken, skipped, or missed' });
  }
  
  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  // If no errors, proceed
  next();
};

// Middleware to validate status update
export const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const errors = [];
  
  // Validate status
  if (!status) {
    errors.push({ message: 'Status is required' });
  } else if (!['pending', 'taken', 'skipped', 'missed'].includes(status)) {
    errors.push({ message: 'Status must be pending, taken, skipped, or missed' });
  }
  
  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  // If no errors, proceed
  next();
};

// Middleware to validate quick reminder log
export const validateQuickLog = (req, res, next) => {
  const { medicineId } = req.body;
  const errors = [];
  
  // Only medicineId is required for quick logging
  if (!medicineId) {
    errors.push({ message: 'Medicine ID is required' });
  } else if (!medicineId.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push({ message: 'Invalid medicine ID format' });
  }
  
  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  // If no errors, proceed
  next();
};

// Middleware to validate date parameters in query
export const validateDateParams = (req, res, next) => {
  const { date, startDate, endDate } = req.query;
  
  // Regular expression for YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (date && !dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'Date must be in YYYY-MM-DD format'
    });
  }
  
  if ((startDate && !dateRegex.test(startDate)) || (endDate && !dateRegex.test(endDate))) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date must be in YYYY-MM-DD format'
    });
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date values'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }
    
    // Limit range to 90 days to prevent performance issues
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 90 days'
      });
    }
  }
  
  next();
}; 