import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use both possible database URIs to ensure we find the right one
const MONGO_URIS = [
  process.env.MONGO_URI || 'mongodb://localhost:27017/medicine_reminder',
  'mongodb://localhost:27017/time4meds'
];

// Function to drop the users collection
async function dropUsersCollection() {
  for (const uri of MONGO_URIS) {
    try {
      // Connect to MongoDB
      console.log(`Connecting to MongoDB at ${uri}...`);
      await mongoose.connect(uri);
      console.log('Connected to MongoDB successfully');

      // Get the database name from the URI
      const dbName = uri.split('/').pop();
      console.log(`Working with database: ${dbName}`);

      // Drop the users collection
      try {
        await mongoose.connection.db.collection('users').drop();
        console.log('Successfully dropped users collection');
      } catch (error) {
        if (error.code === 26) {
          console.log('Collection does not exist, nothing to drop');
        } else {
          throw error;
        }
      }

      // List all collections to verify
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Remaining collections:', collections.map(c => c.name));

      console.log(`Operation completed successfully for ${dbName}`);
    } catch (error) {
      console.error(`Error with ${uri}:`, error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
  
  process.exit(0);
}

// Run the function
dropUsersCollection(); 