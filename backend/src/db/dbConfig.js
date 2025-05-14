import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Check for both MONGODB_URI and MONGO_URI
    const mongoURIEnv = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    // If no URI is provided, use localhost as fallback
    const mongoURI = mongoURIEnv || 'mongodb://localhost:27017/time4meds';
    
    // Log connection attempt (with credentials masked)
    console.log('Attempting to connect to MongoDB...');
    
    // Fix common connection string issues
    let fixedMongoURI = mongoURI;
    
    // Check for common connection string issues
    if (mongoURIEnv) {
      if (mongoURIEnv.includes('@cc@')) {
        console.log('Warning: Your MongoDB URI has an unencoded @ character in the password. Attempting to fix...');
        
        // Try to fix the connection string by properly encoding the @ in the password
        const parts = mongoURIEnv.split('@');
        if (parts.length === 3) {
          // Format is likely username:password@cc@hostname
          const userPassPart = parts[0]; // username:password
          const hostPart = parts[2]; // hostname
          
          // Split username and password
          const userPassSplit = userPassPart.split(':');
          if (userPassSplit.length === 2) {
            const username = userPassSplit[0];
            const password = userPassSplit[1] + '%40cc'; // Encode @ as %40
            
            fixedMongoURI = `${username}:${password}@${hostPart}`;
            console.log('Fixed connection string. Using properly encoded password.');
          }
        }
      }
    }
    
    // Set mongoose options
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    try {
      // Try to connect with the fixed URI
      await mongoose.connect(fixedMongoURI, options);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (err) {
      console.log('MongoDB Connection Error:', err.message);
      
      // If the error is EBADNAME, try with standard connection string format instead of SRV
      if (err.code === 'EBADNAME' && fixedMongoURI.startsWith('mongodb+srv://')) {
        console.log('Trying with standard connection string format...');
        try {
          // Convert mongodb+srv:// to mongodb:// and add default port
          const standardURI = fixedMongoURI.replace('mongodb+srv://', 'mongodb://') + ':27017';
          await mongoose.connect(standardURI, options);
          console.log(`MongoDB Connected with standard URI: ${mongoose.connection.host}`);
          return mongoose.connection;
        } catch (standardErr) {
          console.log('Standard connection format also failed:', standardErr.message);
        }
      }
      
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