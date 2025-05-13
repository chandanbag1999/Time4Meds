/**
 * Middleware to log sensitive operations like deletion
 * This can be expanded to save logs to a database in production
 */
export const logOperation = (operation) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userId = req.user?._id || 'unknown';
    const resourceId = req.params?.id || 'unknown';
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    
    console.log(`
    [${timestamp}] OPERATION: ${operation}
    User: ${userId}
    Resource: ${resourceId}
    IP: ${ipAddress}
    Method: ${req.method}
    Path: ${req.path}
    `);
    
    next();
  };
}; 