import { Router } from 'express';
import exampleRoutes from './example.routes';

const router = Router();

// Health check for API
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});

// Mount routes
router.use('/examples', exampleRoutes);

export default router; 