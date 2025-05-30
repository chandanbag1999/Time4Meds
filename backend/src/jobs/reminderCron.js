import cron from 'node-cron';
import Medicine from '../models/medicine.model.js';
import ReminderLog from '../models/reminderLog.model.js';
import User from '../models/user.model.js';
// Import nodemailer for future email functionality
import nodemailer from 'nodemailer';
// Imports for Firebase Cloud Messaging (commented out until implementation)
// import admin from 'firebase-admin';
// Import mongoose at the top level
import mongoose from 'mongoose';
// Import notification service
import { checkMissedMedications } from '../services/notificationService.js';

/**
 * Configure nodemailer transporter
 * Now properly configured to send real emails
 */
let emailTransporter = null;

const initializeEmailTransporter = async () => {
  try {
    // Check if we have email configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('Initializing email transporter with configured credentials...');
      emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify the connection
      await emailTransporter.verify();
      console.log('Email transporter initialized and verified successfully');
      return true;
    } else {
      // Fall back to Ethereal test account for development
      console.log('No email configuration found, creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      console.log('Created Ethereal test account:', testAccount.user);

      emailTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('Ethereal email transporter initialized');
      return true;
    }
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
    emailTransporter = null;
    return false;
  }
};

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
 * Send an email reminder to the user
 * Now actually sends emails instead of just simulating
 */
const sendEmailReminder = async (userEmail, medicineName, reminderTime) => {
  const emailSubject = `Reminder: Time to take ${medicineName}`;
  const emailBody = `It's time to take your medicine: ${medicineName} at ${reminderTime}`;

  // Log the email being sent
  console.log(`[${new Date().toISOString()}] Sending email to ${userEmail}: Time to take ${medicineName} at ${reminderTime}`);

  if (!emailTransporter) {
    console.error('Email transporter not initialized. Cannot send email.');
    return false;
  }

  try {
    const emailInfo = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"Time4Meds" <noreply@time4meds.com>',
      to: userEmail,
      subject: emailSubject,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Medicine Reminder</h2>
          <p style="font-size: 16px; color: #374151;">
            It's time to take your medicine: <strong>${medicineName}</strong>
          </p>
          <p style="font-size: 14px; color: #6b7280;">
            Scheduled time: ${reminderTime}
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            This is an automated reminder from Time4Meds. Please do not reply to this email.
          </p>
        </div>
      `
    });

    // Check if it's an Ethereal email and get preview URL
    if (emailInfo && emailInfo.messageId && !process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(emailInfo);
      console.log('=======================================');
      console.log('Email sent to Ethereal (test email)');
      console.log('Preview URL:', previewUrl);
      console.log('=======================================');
    } else {
      console.log(`[${new Date().toISOString()}] Email sent successfully to: ${userEmail}`);
    }

    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending email to ${userEmail}:`, error);
    return false;
  }
};

/**
 * Send an email notification to a caregiver
 * Now actually sends emails instead of just simulating
 */
const sendCaregiverNotification = async (caregiverEmail, patientName, medicineName, status, time) => {
  let emailSubject, emailBody, statusColor;

  if (status === 'missed') {
    emailSubject = `${patientName} missed a medication`;
    emailBody = `${patientName} missed their ${medicineName} dose scheduled for ${time}.`;
    statusColor = '#dc2626'; // Red
  } else if (status === 'taken') {
    emailSubject = `${patientName} took their medication`;
    emailBody = `${patientName} took their ${medicineName} dose scheduled for ${time}.`;
    statusColor = '#16a34a'; // Green
  } else if (status === 'low inventory') {
    emailSubject = `${patientName}'s medication is running low`;
    emailBody = `${patientName}'s ${medicineName} is running low with only ${time}.`;
    statusColor = '#ea580c'; // Orange
  } else {
    emailSubject = `${patientName}'s medication update`;
    emailBody = `${patientName}'s ${medicineName} dose scheduled for ${time} was marked as ${status}.`;
    statusColor = '#2563eb'; // Blue
  }

  // Log the email being sent
  console.log(`[${new Date().toISOString()}] Sending caregiver notification to ${caregiverEmail}: ${emailSubject}`);

  if (!emailTransporter) {
    console.error('Email transporter not initialized. Cannot send caregiver notification.');
    return false;
  }

  try {
    const emailInfo = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"Time4Meds" <noreply@time4meds.com>',
      to: caregiverEmail,
      subject: emailSubject,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Caregiver Notification</h2>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="font-size: 16px; color: #374151; margin: 0;">
              <strong style="color: ${statusColor};">${emailSubject}</strong>
            </p>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            ${emailBody}
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            This is an automated notification from Time4Meds. You are receiving this because you are listed as a caregiver for ${patientName}.
          </p>
        </div>
      `
    });

    // Check if it's an Ethereal email and get preview URL
    if (emailInfo && emailInfo.messageId && !process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(emailInfo);
      console.log('=======================================');
      console.log('Caregiver notification sent to Ethereal (test email)');
      console.log('Preview URL:', previewUrl);
      console.log('=======================================');
    } else {
      console.log(`[${new Date().toISOString()}] Caregiver notification sent successfully to: ${caregiverEmail}`);
    }

    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending caregiver notification to ${caregiverEmail}:`, error);
    return false;
  }
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
    inventoryCount: 10,
    dosesPerIntake: 1,
    lowInventoryThreshold: 5,
    refillReminder: true,
    userId: {
      _id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com'
    }
  }];
};

/**
 * Check for low inventory medicines and create notifications
 */
const checkLowInventory = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Checking for low inventory medicines`);

    // Skip if using mock database
    if (isUsingMockDatabase()) {
      console.log(`[${new Date().toISOString()}] Using mock database, skipping low inventory check`);
      return;
    }

    // Find all active medicines with low inventory
    const lowInventoryMedicines = await Medicine.findLowInventory();

    console.log(`[${new Date().toISOString()}] Found ${lowInventoryMedicines.length} medicines with low inventory`);

    // Process each medicine with low inventory
    for (const medicine of lowInventoryMedicines) {
      try {
        // Get the user
        const user = await User.findById(medicine.userId);

        if (!user) continue;

        // Send notification to the user if they have email notifications enabled
        if (user.preferences && user.preferences.emailNotifications !== false) {
          await sendEmailReminder(
            user.email,
            medicine.name,
            `Low inventory: ${medicine.inventoryCount} doses remaining`
          );
        }

        // Send notification to caregivers if they have permission
        if (user.caregivers && user.caregivers.length > 0) {
          for (const caregiver of user.caregivers) {
            if (caregiver.notifyOnMissed) {
              await sendCaregiverNotification(
                caregiver.email,
                user.name,
                medicine.name,
                'low inventory',
                `${medicine.inventoryCount} doses remaining`
              );
            }
          }
        }

        console.log(`[${new Date().toISOString()}] Sent low inventory notification for ${medicine.name}`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error processing low inventory for ${medicine.name}:`, error);
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking for low inventory:`, error);
  }
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
      // Check if medicine has times array
      if (!medicine.times || !Array.isArray(medicine.times)) {
        console.log(`[${now.toISOString()}] Medicine ${medicine.name} has no times array`);
        return false;
      }

      return medicine.times.some(time => {
        try {
          // Parse the time string (expected format: "HH:MM")
          if (!time || typeof time !== 'string' || !time.includes(':')) {
            console.log(`[${now.toISOString()}] Invalid time format for ${medicine.name}: ${time}`);
            return false;
          }

          const [hourStr, minuteStr] = time.split(':');
          const medicineHour = parseInt(hourStr, 10);
          const medicineMinute = parseInt(minuteStr, 10);

          // Validate parsed time
          if (isNaN(medicineHour) || isNaN(medicineMinute) ||
              medicineHour < 0 || medicineHour > 23 ||
              medicineMinute < 0 || medicineMinute > 59) {
            console.log(`[${now.toISOString()}] Invalid time values for ${medicine.name}: ${hourStr}:${minuteStr}`);
            return false;
          }

          // Compare with current time
          const matches = medicineHour === parseInt(currentHour, 10) &&
                         medicineMinute === parseInt(currentMinute, 10);

          if (matches) {
            console.log(`[${now.toISOString()}] Time match found: ${medicine.name} scheduled for ${time}`);
          }

          return matches;
        } catch (error) {
          console.error(`[${now.toISOString()}] Error parsing time for ${medicine.name}:`, error);
          return false;
        }
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
        let reminderLog;
        if (usingMockDatabase) {
          reminderLog = createMockReminderLog(medicine.userId._id, medicine._id, matchingTime);
        } else {
          // Create scheduled time from today's date and the matching time
          const [hours, minutes] = matchingTime.split(':').map(Number);
          const scheduledTime = new Date(now);
          scheduledTime.setHours(hours, minutes, 0, 0);

          reminderLog = await ReminderLog.create({
            userId: medicine.userId._id,
            medicineId: medicine._id,
            time: matchingTime,
            status: 'pending',
            timestamp: now,
            scheduledTime: scheduledTime,
            notes: `Auto-generated reminder for ${medicine.name}`
          });
        }

        // Check user preferences before sending notifications
        const user = medicine.userId;

        // Send email reminder if user has email notifications enabled
        if (user.preferences && user.preferences.emailNotifications !== false) {
          await sendEmailReminder(user.email, medicine.name, matchingTime);
        } else {
          console.log(`[${now.toISOString()}] Email notifications disabled for user ${user.email}`);
        }

        // Send push notification if user has push notifications enabled
        if (user.preferences && user.preferences.pushNotifications !== false) {
          simulatePushNotification(user._id, medicine.name, matchingTime);
        } else {
          console.log(`[${now.toISOString()}] Push notifications disabled for user ${user.email}`);
        }

        // Check if user has caregivers and notify them if needed
        if (!usingMockDatabase) {
          try {
            const user = await User.findById(medicine.userId._id);
            if (user && user.caregivers && user.caregivers.length > 0) {
              for (const caregiver of user.caregivers) {
                if (caregiver.notifyOnMissed) {
                  await sendCaregiverNotification(
                    caregiver.email,
                    user.name,
                    medicine.name,
                    'pending',
                    matchingTime
                  );
                }
              }
            }
          } catch (caregiverError) {
            console.error(`[${now.toISOString()}] Error notifying caregivers:`, caregiverError);
          }
        }

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

    // Check for low inventory medicines every hour (only at minute 0)
    if (currentMinute === '00') {
      try {
        await checkLowInventory();
      } catch (inventoryError) {
        console.error(`[${new Date().toISOString()}] Error checking inventory:`, inventoryError);
      }
    }

    // Check for missed medications every 15 minutes (at minutes 0, 15, 30, 45)
    if (currentMinute === '00' || currentMinute === '15' || currentMinute === '30' || currentMinute === '45') {
      try {
        await checkMissedMedications();
      } catch (missedError) {
        console.error(`[${new Date().toISOString()}] Error checking missed medications:`, missedError);
      }
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Critical error in medicine reminder cron job:`, error);
  }
}, {
  scheduled: false // Don't start automatically
});

/**
 * Start the reminder cron job
 */
export const startReminderCronJob = async () => {
  try {
    // Initialize email transporter first
    const emailInitialized = await initializeEmailTransporter();
    if (!emailInitialized) {
      console.warn(`[${new Date().toISOString()}] Email transporter initialization failed, but continuing with cron job`);
    }

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