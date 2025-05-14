import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import connectDB from './db/dbConfig.js';
import medicineRoutes from './routes/medicine.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import reminderLogRoutes from './routes/reminderLog.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import testRoutes from './routes/test.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startReminderCronJob, stopReminderCronJob } from './jobs/reminderCron.js';
import { protect } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://time4-meds.vercel.app',
  'https://time4meds-git-main-chandanbag1999.vercel.app',
  'https://time4-meds-git-main-chandanbag1999.vercel.app',
  process.env.FRONTEND_URL // Allow configurable frontend URL
].filter(Boolean); // Filter out undefined/null values

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list or starts with one of our allowed domains
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin)
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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

// Add a direct fallback route for /logs that redirects to /reminders/log
apiRouter.get('/logs', protect, (req, res) => {
  // Forward the request to the reminders/log endpoint
  req.url = '/reminders/log';
  apiRouter.handle(req, res);
});

app.use('/api', apiRouter);

// Keep-alive route to prevent Render free tier from sleeping
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

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

    // Keep-alive mechanism to prevent Render from putting the service to sleep
    const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
    const APP_URL = process.env.APP_URL || 'https://time4meds.onrender.com';
    
    // Only run the keep-alive in production environment
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        try {
          console.log(`[${new Date().toISOString()}] Pinging server to keep it alive...`);
          axios.get(`${APP_URL}/ping`)
            .then(response => {
              console.log(`[${new Date().toISOString()}] Keep-alive ping successful: ${response.status}`);
            })
            .catch(error => {
              console.error(`[${new Date().toISOString()}] Keep-alive ping failed:`, error.message);
            });
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error in keep-alive mechanism:`, error);
        }
      }, PING_INTERVAL);
    }
  })
  .catch(err => console.error('Server failed to start:', err));

export default app; 