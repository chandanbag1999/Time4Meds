import cron from 'node-cron';
import Medicine from '../models/medicine.model.js';
import ReminderLog from '../models/reminderLog.model.js';

/**
 * Initialize and run the medicine reminder cron job
 * Checks for medicines that should be reminded at the current time
 * Creates a ReminderLog entry with status 'pending' for each match
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
    
    // Find all active medicines with a reminder at the current time
    const medicines = await Medicine.find({
      isActive: true,
      times: currentTime
    }).populate({
      path: 'userId',
      select: 'name email'
    });
    
    console.log(`[${now.toISOString()}] Found ${medicines.length} medicine(s) scheduled for ${currentTime}`);
    
    // Process each medicine that has a reminder at this time
    let successCount = 0;
    let errorCount = 0;
    
    for (const medicine of medicines) {
      try {
        console.log(`[${now.toISOString()}] Processing reminder for ${medicine.name} at ${currentTime} for ${medicine.userId.email}`);
        
        // Create a new ReminderLog entry with status 'pending'
        await ReminderLog.create({
          userId: medicine.userId._id,
          medicineId: medicine._id,
          time: currentTime,
          status: 'pending',
          timestamp: now,
          notes: `Auto-generated reminder for ${medicine.name}`
        });
        
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