import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/time4meds';

// Connect to MongoDB
export const connectDatabase = async (): Promise<boolean> => {
  try {
    // Set mongoose options to handle deprecation warnings
    mongoose.set('strictQuery', false);
    
    // Connect with proper options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('📦 Connected to MongoDB database');
    
    // Create collections if they don't exist
    const db = mongoose.connection.db;
    
    if (db) {
      // List of collections to create
      const collections = ['users', 'medicines', 'documents', 'dependents', 'reminders', 'pin-hashes'];
      
      // Get existing collections
      const existingCollections = await db.listCollections().toArray();
      const existingCollectionNames = existingCollections.map(col => col.name);
      
      // Create collections that don't exist
      for (const collection of collections) {
        if (!existingCollectionNames.includes(collection)) {
          await db.createCollection(collection);
          console.log(`Created collection: ${collection}`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Setup mongoose connection error handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectDatabase; 