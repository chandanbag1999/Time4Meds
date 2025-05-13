import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/dbConfig.js';
import medicineRoutes from './routes/medicine.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import reminderLogRoutes from './routes/reminderLog.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import testRoutes from './routes/test.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startReminderCronJob, stopReminderCronJob } from './jobs/reminderCron.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base route
app.get('/', (req, res) => {
  res.send('Welcome to Time4Meds API - Use /api for all endpoints');
});

// API routes
const apiRouter = express.Router();
apiRouter.use('/medicines', medicineRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/reminder-logs', reminderLogRoutes);
apiRouter.use('/reminders', remindersRoutes);
apiRouter.use('/test', testRoutes);
app.use('/api', apiRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  stopReminderCronJob();
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Connect to MongoDB and start server
let server;

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startReminderCronJob() && console.log('Reminder cron job initialized');
    });
    
    // Handle termination
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', err => {
      console.error('UNCAUGHT EXCEPTION! Shutting down...');
      console.error(err);
      process.exit(1);
    });
    
    process.on('unhandledRejection', err => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err);
      server.close(() => process.exit(1));
    });
  })
  .catch(err => console.error('Server failed to start:', err));

export default app; 