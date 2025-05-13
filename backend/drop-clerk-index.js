import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/time4meds';

// Function to drop the index
async function dropClerkIdIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Reference to the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check existing indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Find and drop the clerkId index
    const clerkIdIndex = indexes.find(index => 
      index.name === 'clerkId_1' || 
      (index.key && index.key.clerkId)
    );

    if (clerkIdIndex) {
      console.log('Found clerkId index, dropping it now...');
      await usersCollection.dropIndex(clerkIdIndex.name);
      console.log('Successfully dropped clerkId index');
    } else {
      console.log('No clerkId index found');
    }

    // Verify the index was dropped
    const updatedIndexes = await usersCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the function
dropClerkIdIndex(); 