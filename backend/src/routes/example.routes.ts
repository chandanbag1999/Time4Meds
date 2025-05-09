import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/examples
 * @desc    Get all examples
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  // Example response
  res.status(200).json({
    success: true,
    data: [
      { id: 1, name: 'Example 1' },
      { id: 2, name: 'Example 2' },
      { id: 3, name: 'Example 3' },
    ]
  });
});

/**
 * @route   GET /api/examples/:id
 * @desc    Get example by ID
 * @access  Public
 */
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Check if id is valid
  if (isNaN(id)) {
    throw new AppError('Invalid ID format', 400);
  }
  
  // Example response
  res.status(200).json({
    success: true,
    data: { id, name: `Example ${id}` }
  });
});

export default router; 