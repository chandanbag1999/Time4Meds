import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/dbConfig.js';
import medicineRoutes from './routes/medicine.routes.js';
import authRoutes from './routes/auth.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Time4Meds API');
});

// Load route files
app.use('/api/medicines', medicineRoutes);
app.use('/api/auth', authRoutes);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Server failed to start:', err);
  }); 