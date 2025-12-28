const Appointment = require('../models/Appointment');
const cron = require('node-cron');
const { getGermanToday } = require('../utils/timezoneHelper');

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🧹 Cleanup Service started - Daily cleanup at midnight German time (CET/CEST)');
    console.log('   Will delete all appointments from previous days (regardless of status)');
    
    // Run daily at midnight German time (0 0 * * *)
    cron.schedule('0 0 * * *', () => {
      this.cleanupOldAppointments();
    }, {
      timezone: 'Europe/Berlin'
    });
  }

  async cleanupOldAppointments() {
    try {
      console.log('🧹 Starting daily cleanup of old appointments at midnight German time...');
      
      // Get today's date at midnight in German timezone
      // Delete all appointments from previous days (before today)
      const today = getGermanToday();

      const result = await Appointment.deleteMany({
        date: { $lt: today } // Delete all appointments before today (any status)
      });

      console.log(`✅ Cleanup completed: ${result.deletedCount} previous day appointments deleted`);
      console.log(`   Deleted all appointments before ${today.toISOString().split('T')[0]} (German time)`);
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