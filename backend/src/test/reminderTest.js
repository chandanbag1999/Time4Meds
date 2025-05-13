import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startReminderCronJob, stopReminderCronJob } from '../jobs/reminderCron.js';
import Medicine from '../models/medicine.model.js';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

// Function to create a test user and medicine for the current time
async function setupTestData() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/time4meds');
    console.log('Connected to MongoDB for testing');

    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      console.log('Created test user');
    }

    // Get current time
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Create a test medicine with the current time
    const nextMinute = new Date(now.getTime() + 60000);
    const nextMinuteHour = nextMinute.getHours().toString().padStart(2, '0');
    const nextMinuteMinute = nextMinute.getMinutes().toString().padStart(2, '0');
    const nextMinuteTime = `${nextMinuteHour}:${nextMinuteMinute}`;

    // Check if a test medicine already exists
    const existingMedicine = await Medicine.findOne({ 
      name: 'Paracetamol Test',
      userId: testUser._id
    });

    if (existingMedicine) {
      // Update the existing medicine with current times
      existingMedicine.times = [currentTime, nextMinuteTime];
      await existingMedicine.save();
      console.log(`Updated test medicine with times: ${currentTime}, ${nextMinuteTime}`);
    } else {
      // Create a new test medicine
      await Medicine.create({
        userId: testUser._id,
        name: 'Paracetamol Test',
        dosage: '500mg',
        frequency: 'daily',
        times: [currentTime, nextMinuteTime],
        notes: 'Test medicine for reminder cron job',
        isActive: true
      });
      console.log(`Created test medicine with times: ${currentTime}, ${nextMinuteTime}`);
    }

    // Start the cron job
    console.log('Starting reminder cron job...');
    startReminderCronJob();
    console.log(`Current time: ${currentTime}`);
    console.log('You should see a reminder in the next minute');
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

// Run the test
setupTestData();

// Keep the script running for a few minutes
console.log('Script will run for 5 minutes to observe reminders...');
setTimeout(() => {
  console.log('Test completed. Exiting...');
  stopReminderCronJob();
  setTimeout(() => process.exit(0), 1000);
}, 5 * 60 * 1000); 