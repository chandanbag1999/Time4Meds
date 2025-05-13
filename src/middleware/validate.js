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