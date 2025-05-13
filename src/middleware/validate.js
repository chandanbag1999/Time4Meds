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