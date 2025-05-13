/**
 * Middleware to parse and validate query parameters for medicine listings
 */
export const parseMedicineQuery = (req, res, next) => {
  try {
    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Handle sorting
    let sort = { createdAt: -1 }; // Default sort by creation date (newest first)
    
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      
      // Only allow sorting on specific fields
      const allowedSortFields = ['name', 'createdAt', 'frequency'];
      
      if (allowedSortFields.includes(sortField)) {
        sort = { [sortField]: sortOrder };
      }
    }
    
    // Attach to req object
    req.pagination = { limit, skip };
    req.sorting = sort;
    
    next();
  } catch (error) {
    console.error('Error parsing query:', error);
    next(); // Continue even if there's an error with query parsing
  }
}; 