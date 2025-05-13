const express = require('express');
require('dotenv').config();
const connectDB = require('./db/dbConfig');

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
const medicineRoutes = require('./routes/medicine.routes');
app.use('/api/medicines', medicineRoutes);

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