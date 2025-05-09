import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 5000;

// Define async start function to properly handle async operations
const startServer = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectDatabase();
    
    if (!connected) {
      console.error('Failed to connect to MongoDB. Server will not start.');
      process.exit(1);
    }
    
    console.log('MongoDB connected successfully');

    // Middleware
    app.use(helmet()); // Security headers
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    app.use(express.json()); // Parse JSON bodies
    app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
    app.use(morgan('dev')); // HTTP request logger

    // Health check route
    app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    // API routes
    app.use('/api', routes);

    // Error handling middleware
    app.use(errorHandler);

    // Start server
    app.listen(port, () => {
      console.log(`⚡️ Server is running at http://localhost:${port}`);
      console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(err => {
  console.error('Unhandled error starting server:', err);
  process.exit(1);
}); 