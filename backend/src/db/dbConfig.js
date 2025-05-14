import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use environment variable for MongoDB connection or fallback to localhost for development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/time4meds';
    
    // Set mongoose options
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    try {
      await mongoose.connect(mongoURI, options);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (err) {
      console.log('MongoDB Connection Error:', err.message);
      
      // If connection fails, create a mock implementation that allows the server to start
      // This is for demo purposes only
      console.log('Using mock database for demonstration');
      global.mockDB = {
        users: [],
        medicines: [],
        reminderLogs: []
      };
      
      // Monkey patch the mongoose model methods for demo purposes
      const originalModel = mongoose.model;
      mongoose.model = function(name) {
        const mockModel = {
          find: async () => [],
          findOne: async () => null,
          findById: async () => null,
          create: async (data) => ({ _id: Date.now().toString(), ...data }),
          save: async () => ({}),
          populate: () => mockModel
        };
        return mockModel;
      };
      
      return { connection: { host: 'mock-db' } };
    }
  } catch (error) {
    console.error(`Error in DB config: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 