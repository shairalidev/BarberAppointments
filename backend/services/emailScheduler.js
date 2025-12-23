const EmailQueue = require('../models/EmailQueue');
const Appointment = require('../models/Appointment');
const EmailService = require('./emailService');

class EmailScheduler {
  constructor() {
    this.isRunning = false;
    this.interval = null;
  }

  // Start the email scheduler
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('📧 Email Scheduler started');
    
    // Process emails every 30 seconds
    this.interval = setInterval(() => {
      this.processEmailQueue();
    }, 30000);
    
    // Process immediately on start
    this.processEmailQueue();
  }

  // Stop the email scheduler
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('📧 Email Scheduler stopped');
  }

  // Add email to queue
  async scheduleEmail(appointmentId, emailType, recipientEmail, recipientName, scheduledFor) {
    if (!EmailService.isConfigured()) {
      console.log(`Email service not configured - skipping queue for ${emailType}`);
      return null;
    }

    try {
      const emailQueue = new EmailQueue({
        appointmentId,
        emailType,
        recipientEmail,
        recipientName,
        scheduledFor
      });
      
      await emailQueue.save();
      console.log(`📅 Email scheduled: ${emailType} for ${recipientName} at ${scheduledFor}`);
      return emailQueue;
    } catch (error) {
      console.error('Error scheduling email:', error);
      throw error;
    }
  }

  // Schedule 30-minute reminders for both customer and barber
  async schedule30MinReminders(appointment) {
    try {
      if (!EmailService.isConfigured()) {
        console.log('Email service not configured - skipping reminder scheduling');
        return null;
      }

      // Calculate reminder time (30 minutes before appointment)
      const appointmentDateTime = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
      
      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        const reminders = [];
        
        // Schedule customer reminder
        if (appointment.customerEmail) {
          const customerReminder = await this.scheduleEmail(
            appointment._id,
            'customer_30min_reminder',
            appointment.customerEmail,
            appointment.customerName,
            reminderTime
          );
          reminders.push(customerReminder);
        }
        
        // Schedule barber reminder
        if (appointment.barberId?.email) {
          const barberReminder = await this.scheduleEmail(
            appointment._id,
            'barber_30min_reminder',
            appointment.barberId.email,
            appointment.barberId.name,
            reminderTime
          );
          reminders.push(barberReminder);
        }
        
        return reminders;
      }
      
      return null;
    } catch (error) {
      console.error('Error scheduling 30-minute reminders:', error);
      return null;
    }
  }

  // Process pending emails in queue
  async processEmailQueue() {
    try {
      const now = new Date();
      
      // Find emails that are due to be sent
      const pendingEmails = await EmailQueue.find({
        status: 'pending',
        scheduledFor: { $lte: now },
        attempts: { $lt: 3 } // Max 3 attempts
      }).populate({
        path: 'appointmentId',
        populate: [
          { path: 'barberId' },
          { path: 'services' }
        ]
      });

      if (pendingEmails.length === 0) return;

      console.log(`📬 Processing ${pendingEmails.length} pending emails`);

      for (const emailItem of pendingEmails) {
        await this.sendQueuedEmail(emailItem);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  // Send individual queued email
  async sendQueuedEmail(emailItem) {
    try {
      if (!EmailService.isConfigured()) {
        await EmailQueue.findByIdAndUpdate(emailItem._id, {
          status: 'failed',
          errorMessage: 'Email service not configured'
        });
        return;
      }

      // Check if appointment still exists and is valid
      if (!emailItem.appointmentId) {
        await EmailQueue.findByIdAndUpdate(emailItem._id, {
          status: 'cancelled',
          errorMessage: 'Appointment not found'
        });
        return;
      }

      const appointment = emailItem.appointmentId;
      
      // Skip if appointment is cancelled
      if (appointment.status === 'cancelled') {
        await EmailQueue.findByIdAndUpdate(emailItem._id, {
          status: 'cancelled',
          errorMessage: 'Appointment was cancelled'
        });
        return;
      }

      // Update attempt count
      await EmailQueue.findByIdAndUpdate(emailItem._id, {
        $inc: { attempts: 1 },
        lastAttempt: new Date()
      });

      // Send email based on type
      let emailSent = false;
      
      switch (emailItem.emailType) {
        case 'booking_received':
          if (appointment.customerEmail) {
            await EmailService.sendBookingReceived(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'new_booking_to_barber':
          if (appointment.barberId?.email) {
            await EmailService.sendNewBookingToBarber(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'confirmation':
          if (appointment.customerEmail) {
            await EmailService.sendAppointmentConfirmation(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'booking_confirmed_to_barber':
          if (appointment.barberId?.email) {
            await EmailService.sendBookingConfirmedToBarber(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'customer_30min_reminder':
          if (appointment.customerEmail) {
            await EmailService.send30MinReminderToCustomer(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'barber_30min_reminder':
          if (appointment.barberId?.email) {
            await EmailService.send30MinReminderToBarber(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'completion_to_customer':
          if (appointment.customerEmail) {
            await EmailService.sendCompletionToCustomer(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        case 'completion_to_barber':
          if (appointment.barberId?.email) {
            await EmailService.sendCompletionToBarber(appointment, appointment.barberId);
            emailSent = true;
          }
          break;
          
        case 'rejection':
          if (appointment.customerEmail) {
            await EmailService.sendAppointmentRejection(appointment, appointment.barberId);
            emailSent = true;
          }
          break;

        // Legacy support
        case 'reminder':
          if (appointment.barberId?.email) {
            await EmailService.sendBarberReminder(appointment, appointment.barberId);
            emailSent = true;
          }
          break;
      }

      if (emailSent) {
        // Mark as sent
        await EmailQueue.findByIdAndUpdate(emailItem._id, {
          status: 'sent',
          sentAt: new Date()
        });
        console.log(`✅ Email sent: ${emailItem.emailType} to ${emailItem.recipientName}`);
      } else {
        throw new Error('Email service not configured or recipient email missing');
      }

    } catch (error) {
      console.error(`❌ Failed to send email to ${emailItem.recipientName}:`, error.message);
      
      // Update with error
      const updateData = {
        errorMessage: error.message,
        lastAttempt: new Date()
      };
      
      // Mark as failed if max attempts reached
      if (emailItem.attempts >= emailItem.maxAttempts) {
        updateData.status = 'failed';
      }
      
      await EmailQueue.findByIdAndUpdate(emailItem._id, updateData);
    }
  }

  // Cancel scheduled emails for an appointment
  async cancelAppointmentEmails(appointmentId) {
    try {
      await EmailQueue.updateMany(
        { appointmentId, status: 'pending' },
        { status: 'cancelled', errorMessage: 'Appointment cancelled' }
      );
      console.log(`🚫 Cancelled pending emails for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error cancelling appointment emails:', error);
    }
  }

  // Legacy method for backward compatibility
  async scheduleReminderEmail(appointment) {
    return this.schedule30MinReminders(appointment);
  }

  // Get queue statistics
  async getQueueStats() {
    try {
      const stats = await EmailQueue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const result = {
        pending: 0,
        sent: 0,
        failed: 0,
        cancelled: 0
      };
      
      stats.forEach(stat => {
        result[stat._id] = stat.count;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const emailScheduler = new EmailScheduler();

module.exports = emailScheduler;