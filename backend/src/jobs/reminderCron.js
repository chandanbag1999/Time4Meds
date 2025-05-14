import cron from 'node-cron';
import Medicine from '../models/medicine.model.js';
import ReminderLog from '../models/reminderLog.model.js';
// Import nodemailer for future email functionality
import nodemailer from 'nodemailer';
// Imports for Firebase Cloud Messaging (commented out until implementation)
// import admin from 'firebase-admin';
// Import mongoose at the top level
import mongoose from 'mongoose';

/**
 * Configure nodemailer transporter for future use
 * Currently not sending real emails, but configuration prepared for future implementation
 */
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
});

/**
 * Firebase setup - to be uncommented and configured when FCM is implemented
 */
/*
const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

// Initialize Firebase Admin SDK (uncomment when ready to use)
// admin.initializeApp(firebaseConfig);
*/

/**
 * Simulate sending an email reminder
 * Currently only logs the message that would be sent
 */
const simulateEmailReminder = (userEmail, medicineName, reminderTime) => {
  const emailSubject = `Reminder: Time to take ${medicineName}`;
  const emailBody = `It's time to take your medicine: ${medicineName} at ${reminderTime}`;
  
  // Log the email that would be sent
  console.log(`[${new Date().toISOString()}] Email to ${userEmail}: Time to take ${medicineName} at ${reminderTime}`);
  
  // Uncomment below code when ready to send real emails
  /*
  return emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@medicinereminder.com',
    to: userEmail,
    subject: emailSubject,
    text: emailBody,
    html: `<p>${emailBody}</p>`
  });
  */
};

/**
 * Simulate sending a push notification
 * Currently only logs the notification that would be sent
 * Will be replaced with actual FCM implementation later
 */
const simulatePushNotification = (userId, medicineName, reminderTime) => {
  // Log the push notification that would be sent
  console.log(`[${new Date().toISOString()}] Push notification: Reminder for ${medicineName} at ${reminderTime}`);
  
  // Uncomment below code when ready to send real push notifications via FCM
  /*
  // Create notification message
  const message = {
    notification: {
      title: 'Medicine Reminder',
      body: `Time to take ${medicineName} at ${reminderTime}`
    },
    data: {
      medicineId: String(medicineId),
      time: reminderTime,
      type: 'TIME4MEDS_REMINDER'
    },
    token: fcmToken // This should be retrieved from the user record or a dedicated FCM tokens collection
  };

  // Send message to the device corresponding to the provided token
  return admin.messaging().send(message)
    .then((response) => {
      console.log(`[${new Date().toISOString()}] Successfully sent FCM notification:`, response);
      return response;
    })
    .catch((error) => {
      console.error(`[${new Date().toISOString()}] Error sending FCM notification:`, error);
      throw error;
    });
  */
};

/**
 * Check if the application is using mock database
 */
const isUsingMockDatabase = () => {
  // Check if global.mockDB exists or if mongoose connection is not ready
  try {
    // If global.mockDB exists, we're in mock mode
    if (global.mockDB) {
      return true;
    }
    
    // If mongoose is not connected, treat as mock mode
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      console.log('[MOCK MODE] MongoDB not connected, using mock data');
      return true;
    }
    
    return false;
  } catch (err) {
    console.log('[MOCK MODE] Error checking database state, defaulting to mock mode:', err.message);
    return true;
  }
};

/**
 * Get mock medicine data when in mock mode
 */
const getMockMedicineData = () => {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  
  // Create one mock medicine for demonstration
  return [{
    _id: 'mock-med-id-' + Date.now(),
    name: 'Mock Medicine',
    dosage: '100mg',
    isActive: true,
    times: [`${currentHour}:${currentMinute}`],
    userId: {
      _id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com'
    }
  }];
};

/**
 * Mock creating a reminder log entry
 */
const createMockReminderLog = (userId, medicineId, time) => {
  // Just log that we would create this
  console.log(`[${new Date().toISOString()}] MOCK: Created reminder log for medicine ${medicineId} at ${time}`);
  return { _id: 'mock-log-' + Date.now() };
};

/**
 * Initialize and run the medicine reminder cron job
 * Checks for medicines that should be reminded at the current time
 * Creates a ReminderLog entry with status 'pending' for each match
 * Runs every minute to check for scheduled reminders
 */
const reminderCronJob = cron.schedule('* * * * *', async () => {
  const jobStartTime = new Date();
  console.log(`[${jobStartTime.toISOString()}] Medicine reminder job started`);
  
  try {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    console.log(`[${now.toISOString()}] Checking for medicine reminders at ${currentTime}`);
    
    // Check if using mock database
    const usingMockDatabase = isUsingMockDatabase();
    
    // Find all active medicines
    let medicines = [];
    
    if (usingMockDatabase) {
      console.log(`[${now.toISOString()}] Using mock medicine data for reminders`);
      medicines = getMockMedicineData();
    } else {
      medicines = await Medicine.find({
        isActive: true
      }).populate({
        path: 'userId',
        select: 'name email'
      });
    }
    
    // Filter medicines that have a reminder at the current time
    const matchingMedicines = medicines.filter(medicine => {
      return medicine.times.some(time => {
        // Parse the time string (expected format: "HH:MM")
        const [hourStr, minuteStr] = time.split(':');
        const medicineHour = parseInt(hourStr, 10);
        const medicineMinute = parseInt(minuteStr, 10);
        
        // Compare with current time
        return medicineHour === parseInt(currentHour, 10) && 
               medicineMinute === parseInt(currentMinute, 10);
      });
    });
    
    console.log(`[${now.toISOString()}] Found ${matchingMedicines.length} medicine(s) scheduled for ${currentTime}`);
    
    // Process each medicine that has a reminder at this time
    let successCount = 0;
    let errorCount = 0;
    
    for (const medicine of matchingMedicines) {
      try {
        // Find the matching time from the medicine's times array
        const matchingTime = medicine.times.find(time => {
          const [hourStr, minuteStr] = time.split(':');
          const medicineHour = parseInt(hourStr, 10);
          const medicineMinute = parseInt(minuteStr, 10);
          
          return medicineHour === parseInt(currentHour, 10) && 
                 medicineMinute === parseInt(currentMinute, 10);
        });
        
        if (!matchingTime) continue;
        
        console.log(`[${now.toISOString()}] Processing reminder for ${medicine.name} at ${matchingTime} for ${medicine.userId.email}`);
        
        // Create a new ReminderLog entry with status 'pending'
        if (usingMockDatabase) {
          createMockReminderLog(medicine.userId._id, medicine._id, matchingTime);
        } else {
          await ReminderLog.create({
            userId: medicine.userId._id,
            medicineId: medicine._id,
            time: matchingTime,
            status: 'pending',
            timestamp: now,
            notes: `Auto-generated reminder for ${medicine.name}`
          });
        }
        
        // Simulate sending an email reminder
        simulateEmailReminder(medicine.userId.email, medicine.name, matchingTime);
        
        // Simulate sending a push notification
        simulatePushNotification(medicine.userId._id, medicine.name, matchingTime);
        
        console.log(`[${now.toISOString()}] Created pending reminder log for ${medicine.name}`);
        successCount++;
      } catch (medicineError) {
        console.error(`[${now.toISOString()}] Error creating reminder log for medicine ${medicine.name}:`, medicineError);
        errorCount++;
      }
    }
    
    const jobEndTime = new Date();
    const jobDuration = jobEndTime - jobStartTime;
    console.log(`[${jobEndTime.toISOString()}] Medicine reminder job completed in ${jobDuration}ms. Success: ${successCount}, Errors: ${errorCount}`);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Critical error in medicine reminder cron job:`, error);
  }
}, {
  scheduled: false // Don't start automatically
});

/**
 * Start the reminder cron job
 */
export const startReminderCronJob = () => {
  try {
    reminderCronJob.start();
    console.log(`[${new Date().toISOString()}] Medicine reminder cron job started successfully`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to start medicine reminder cron job:`, error);
    return false;
  }
};

/**
 * Stop the reminder cron job
 */
export const stopReminderCronJob = () => {
  try {
    reminderCronJob.stop();
    console.log(`[${new Date().toISOString()}] Medicine reminder cron job stopped`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to stop medicine reminder cron job:`, error);
    return false;
  }
}; 