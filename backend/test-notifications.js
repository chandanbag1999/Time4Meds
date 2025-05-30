/**
 * Test script to verify notification system functionality
 * Run this script to test email notifications and cron job functionality
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Medicine from './src/models/medicine.model.js';
import ReminderLog from './src/models/reminderLog.model.js';
import User from './src/models/user.model.js';
import { sendEmailReminder, sendCaregiverNotification } from './src/jobs/reminderCron.js';

dotenv.config();

async function testNotificationSystem() {
  try {
    console.log('🔧 Testing Time4Meds Notification System...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Check for medicines with times
    console.log('📋 Test 1: Checking medicine data...');
    const medicines = await Medicine.find({}).populate('userId', 'name email');
    
    console.log(`Found ${medicines.length} medicines in database:`);
    medicines.forEach(med => {
      console.log(`  - ${med.name}:`);
      console.log(`    Times: ${JSON.stringify(med.times)}`);
      console.log(`    Frequency: ${med.frequency}`);
      console.log(`    User: ${med.userId?.email}`);
      console.log(`    Active: ${med.isActive}`);
      console.log('');
    });
    
    // Test 2: Check current time and find matching medicines
    console.log('⏰ Test 2: Checking current time matches...');
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    console.log(`Current time: ${currentTime}`);
    
    const matchingMedicines = medicines.filter(medicine => {
      if (!medicine.times || !Array.isArray(medicine.times)) return false;
      
      return medicine.times.some(time => {
        const [hourStr, minuteStr] = time.split(':');
        const medicineHour = parseInt(hourStr, 10);
        const medicineMinute = parseInt(minuteStr, 10);
        
        return medicineHour === parseInt(currentHour, 10) &&
               medicineMinute === parseInt(currentMinute, 10);
      });
    });
    
    console.log(`Found ${matchingMedicines.length} medicines scheduled for ${currentTime}`);
    
    // Test 3: Test email functionality with a sample medicine
    console.log('\n📧 Test 3: Testing email functionality...');
    if (medicines.length > 0) {
      const testMedicine = medicines[0];
      const testTime = testMedicine.times?.[0] || '10:55';
      
      console.log(`Testing email for: ${testMedicine.name} at ${testTime}`);
      
      if (testMedicine.userId?.email) {
        try {
          await sendEmailReminder(testMedicine.userId.email, testMedicine.name, testTime);
          console.log('✅ Email test completed successfully');
        } catch (emailError) {
          console.error('❌ Email test failed:', emailError.message);
        }
      } else {
        console.log('⚠️  No user email found for testing');
      }
    }
    
    // Test 4: Check recent reminder logs
    console.log('\n📝 Test 4: Checking recent reminder logs...');
    const recentLogs = await ReminderLog.find({})
      .populate('userId', 'name email')
      .populate('medicineId', 'name')
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`Found ${recentLogs.length} recent reminder logs:`);
    recentLogs.forEach(log => {
      console.log(`  - ${log.medicineId?.name || 'Unknown'} for ${log.userId?.email || 'Unknown'}`);
      console.log(`    Time: ${log.time}, Status: ${log.status}`);
      console.log(`    Scheduled: ${log.scheduledTime}`);
      console.log(`    Created: ${log.timestamp}`);
      console.log('');
    });
    
    // Test 5: Create a test reminder for current time + 1 minute
    console.log('🧪 Test 5: Creating test reminder for immediate testing...');
    if (medicines.length > 0) {
      const testMedicine = medicines[0];
      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + 1);
      const testTimeStr = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Update the medicine to have a time 1 minute from now
      await Medicine.findByIdAndUpdate(testMedicine._id, {
        times: [testTimeStr]
      });
      
      console.log(`✅ Updated ${testMedicine.name} to trigger at ${testTimeStr} (1 minute from now)`);
      console.log('   Watch the server logs for notification activity!');
    }
    
    // Test 6: Manual trigger test
    console.log('\n🚀 Test 6: Manual notification trigger test...');
    if (medicines.length > 0) {
      const testMedicine = medicines[0];
      const testUser = testMedicine.userId;
      
      if (testUser?.email) {
        console.log(`Sending test notification for ${testMedicine.name} to ${testUser.email}`);
        
        try {
          await sendEmailReminder(testUser.email, testMedicine.name, '10:55 PM');
          console.log('✅ Manual notification test completed');
        } catch (error) {
          console.error('❌ Manual notification test failed:', error.message);
        }
      }
    }
    
    console.log('\n🎉 Notification system test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Found ${medicines.length} medicines in database`);
    console.log(`   - Found ${matchingMedicines.length} medicines scheduled for current time`);
    console.log(`   - Found ${recentLogs.length} recent reminder logs`);
    console.log('\n💡 Tips:');
    console.log('   - Check server logs for real-time notification activity');
    console.log('   - Verify email configuration in .env file');
    console.log('   - Test with Ethereal emails if no real SMTP configured');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testNotificationSystem();
