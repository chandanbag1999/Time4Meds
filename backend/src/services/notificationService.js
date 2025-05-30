import nodemailer from 'nodemailer';
import User from '../models/user.model.js';
import ReminderLog from '../models/reminderLog.model.js';

/**
 * Notification Service
 * Handles all notification-related functionality including missed medication alerts
 */

let emailTransporter = null;

/**
 * Initialize email transporter
 */
const initializeEmailTransporter = async () => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('Initializing notification service email transporter...');
      emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await emailTransporter.verify();
      console.log('Notification service email transporter verified successfully');
      return true;
    } else {
      console.log('No email configuration found for notification service, using Ethereal...');
      const testAccount = await nodemailer.createTestAccount();

      emailTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('Notification service using Ethereal test account:', testAccount.user);
      return true;
    }
  } catch (error) {
    console.error('Failed to initialize notification service email transporter:', error);
    emailTransporter = null;
    return false;
  }
};

/**
 * Send email notification
 */
const sendEmail = async (to, subject, htmlContent, textContent) => {
  if (!emailTransporter) {
    console.error('Email transporter not initialized');
    return false;
  }

  try {
    const emailInfo = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"Time4Meds" <noreply@time4meds.com>',
      to,
      subject,
      text: textContent,
      html: htmlContent
    });

    // Check if it's an Ethereal email and get preview URL
    if (emailInfo && emailInfo.messageId && !process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(emailInfo);
      console.log('=======================================');
      console.log('Notification email sent to Ethereal (test email)');
      console.log('Preview URL:', previewUrl);
      console.log('=======================================');
    } else {
      console.log(`Notification email sent successfully to: ${to}`);
    }

    return true;
  } catch (error) {
    console.error(`Error sending notification email to ${to}:`, error);
    return false;
  }
};

/**
 * Check for missed medications and send notifications
 */
const checkMissedMedications = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Checking for missed medications...`);

    // Find reminder logs that are overdue (status: pending, scheduledTime is in the past)
    const overdueTime = new Date();
    overdueTime.setMinutes(overdueTime.getMinutes() - 30); // 30 minutes grace period

    const missedReminders = await ReminderLog.find({
      status: 'pending',
      scheduledTime: { $lt: overdueTime }
    }).populate('userId').populate('medicineId');

    console.log(`Found ${missedReminders.length} missed medication reminders`);

    for (const reminder of missedReminders) {
      try {
        // Update the reminder status to missed
        reminder.status = 'missed';
        reminder.missedAt = new Date();
        await reminder.save();

        const user = reminder.userId;
        const medicine = reminder.medicineId;

        if (!user || !medicine) {
          console.warn(`Missing user or medicine data for reminder ${reminder._id}`);
          continue;
        }

        // Send notification to user if they have email notifications enabled
        if (user.preferences && user.preferences.emailNotifications !== false) {
          const subject = `Missed Medication: ${medicine.name}`;
          const textContent = `You missed your ${medicine.name} dose scheduled for ${reminder.scheduledTime.toLocaleString()}.`;
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Missed Medication Alert</h2>
              <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 16px 0;">
                <p style="font-size: 16px; color: #374151; margin: 0;">
                  <strong>You missed your ${medicine.name} dose</strong>
                </p>
                <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0;">
                  Scheduled time: ${reminder.scheduledTime.toLocaleString()}
                </p>
              </div>
              <p style="font-size: 14px; color: #6b7280;">
                Please take your medication as soon as possible and consult with your healthcare provider if you have concerns about missed doses.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                This is an automated notification from Time4Meds.
              </p>
            </div>
          `;

          await sendEmail(user.email, subject, htmlContent, textContent);
        }

        // Send notification to caregivers
        if (user.caregivers && user.caregivers.length > 0) {
          for (const caregiver of user.caregivers) {
            if (caregiver.notifyOnMissed) {
              const subject = `${user.name} missed a medication`;
              const textContent = `${user.name} missed their ${medicine.name} dose scheduled for ${reminder.scheduledTime.toLocaleString()}.`;
              const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Caregiver Alert</h2>
                  <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 16px 0;">
                    <p style="font-size: 16px; color: #374151; margin: 0;">
                      <strong style="color: #dc2626;">${user.name} missed their ${medicine.name} dose</strong>
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0;">
                      Scheduled time: ${reminder.scheduledTime.toLocaleString()}
                    </p>
                  </div>
                  <p style="font-size: 14px; color: #6b7280;">
                    You may want to check in with ${user.name} to ensure they take their medication.
                  </p>
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                    This is an automated caregiver notification from Time4Meds. You are receiving this because you are listed as a caregiver for ${user.name}.
                  </p>
                </div>
              `;

              await sendEmail(caregiver.email, subject, htmlContent, textContent);
            }
          }
        }

        console.log(`[${new Date().toISOString()}] Processed missed medication for ${user.name} - ${medicine.name}`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error processing missed reminder ${reminder._id}:`, error);
      }
    }

    console.log(`[${new Date().toISOString()}] Finished checking missed medications`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in checkMissedMedications:`, error);
  }
};

/**
 * Send adherence notifications to caregivers when medication is taken
 */
const sendAdherenceNotification = async (userId, medicineId, reminderLogId) => {
  try {
    const user = await User.findById(userId);
    const reminderLog = await ReminderLog.findById(reminderLogId).populate('medicineId');

    if (!user || !reminderLog || !reminderLog.medicineId) {
      console.warn('Missing data for adherence notification');
      return false;
    }

    const medicine = reminderLog.medicineId;

    // Send notification to caregivers who want adherence notifications
    if (user.caregivers && user.caregivers.length > 0) {
      for (const caregiver of user.caregivers) {
        if (caregiver.notifyOnAdherence) {
          const subject = `${user.name} took their medication`;
          const textContent = `${user.name} took their ${medicine.name} dose scheduled for ${reminderLog.scheduledTime.toLocaleString()}.`;
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Medication Adherence Update</h2>
              <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 16px 0;">
                <p style="font-size: 16px; color: #374151; margin: 0;">
                  <strong style="color: #16a34a;">${user.name} took their ${medicine.name} dose</strong>
                </p>
                <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0;">
                  Scheduled time: ${reminderLog.scheduledTime.toLocaleString()}
                </p>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">
                  Taken at: ${reminderLog.takenAt ? reminderLog.takenAt.toLocaleString() : 'Just now'}
                </p>
              </div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                This is an automated adherence notification from Time4Meds. You are receiving this because you are listed as a caregiver for ${user.name}.
              </p>
            </div>
          `;

          await sendEmail(caregiver.email, subject, htmlContent, textContent);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending adherence notification:', error);
    return false;
  }
};

export {
  initializeEmailTransporter,
  sendEmail,
  checkMissedMedications,
  sendAdherenceNotification
};
