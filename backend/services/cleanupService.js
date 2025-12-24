const Appointment = require('../models/Appointment');
const cron = require('node-cron');

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🧹 Cleanup Service started - Daily cleanup at midnight German time');
    
    // Run daily at midnight German time (0 0 * * *)
    cron.schedule('0 0 * * *', () => {
      this.cleanupOldAppointments();
    }, {
      timezone: 'Europe/Berlin'
    });
  }

  async cleanupOldAppointments() {
    try {
      console.log('🧹 Starting daily cleanup of old appointments...');
      
      // Get yesterday's date in German timezone
      const now = new Date();
      const germanTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Berlin"}));
      const yesterday = new Date(germanTime);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const result = await Appointment.deleteMany({
        date: { $lt: yesterday }
      });

      console.log(`✅ Cleanup completed: ${result.deletedCount} old appointments deleted`);
      this.retryAttempts = 0; // Reset retry counter on success
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      this.handleCleanupError(error);
    }
  }

  async handleCleanupError(error) {
    this.retryAttempts++;
    
    if (this.retryAttempts <= this.maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000); // Exponential backoff, max 30s
      console.log(`🔄 Retrying cleanup in ${retryDelay/1000}s (attempt ${this.retryAttempts}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.cleanupOldAppointments();
      }, retryDelay);
    } else {
      console.error(`💥 Cleanup failed after ${this.maxRetries} attempts. Will retry tomorrow.`);
      this.retryAttempts = 0; // Reset for next day
    }
  }

  stop() {
    this.isRunning = false;
    console.log('🧹 Cleanup Service stopped');
  }
}

const cleanupService = new CleanupService();
module.exports = cleanupService;