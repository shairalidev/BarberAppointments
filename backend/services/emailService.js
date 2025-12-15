const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const isConfigured = !!process.env.RESEND_API_KEY;

class EmailService {
  static isConfigured() {
    return isConfigured;
  }

  static async sendBookingReceived(appointment, barber) {
    if (!resend) {
      console.log('Email service not configured - skipping booking receipt email');
      return;
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Request Received - BarberPro</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .appointment-card { background: #f0f9ff; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✂️ BarberPro</h1>
          <p>Your appointment request was received</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${appointment.customerName}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">Thanks for booking with us. We'll review your request and confirm shortly.</p>

          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #1f2937;">Requested Appointment</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Date & Time</span>
              <span class="detail-value">${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">✂️ Services</span>
              <span class="detail-value">${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👨💼 Barber</span>
              <span class="detail-value">${barber?.name || 'Professional Barber'}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">💰 Estimated Total</span>
              <span class="detail-value">$${appointment.totalPrice}</span>
            </div>
          </div>

          <p style="color: #6b7280; line-height: 1.6;">You'll receive another email once your booking is confirmed or if we need to adjust the time.</p>
        </div>
        <div class="footer">
          <p><strong>BarberPro</strong> - Professional Barber Services</p>
          <p>We're excited to see you soon!</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      await resend.emails.send({
        from: 'BarberPro <noreply@barberpro.com>',
        to: [appointment.customerEmail],
        subject: '✂️ Booking received - pending confirmation',
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending booking receipt email:', error);
      throw error;
    }
  }

  static async sendAppointmentConfirmation(appointment, barber) {
    if (!resend) {
      console.log('Email service not configured - skipping confirmation email');
      return;
    }
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed - BarberPro</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .appointment-card { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .highlight { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✂️ BarberPro</h1>
          <p>Your appointment has been confirmed!</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${appointment.customerName}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">Great news! Your appointment has been confirmed. We're looking forward to seeing you.</p>
          
          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #1f2937;">Appointment Details</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Date & Time</span>
              <span class="detail-value">${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">✂️ Services</span>
              <span class="detail-value">${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👨💼 Barber</span>
              <span class="detail-value">${barber?.name || 'Professional Barber'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 Total Amount</span>
              <span class="detail-value highlight">$${appointment.totalPrice}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">📞 Contact</span>
              <span class="detail-value">${appointment.customerPhone}</span>
            </div>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">Please arrive 5 minutes early for your appointment. If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          ${appointment.responseMessage ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #1e40af; font-style: italic;">"${appointment.responseMessage}"</p></div>` : ''}
        </div>
        <div class="footer">
          <p><strong>BarberPro</strong> - Professional Barber Services</p>
          <p>Thank you for choosing us for your grooming needs!</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      await resend.emails.send({
        from: 'BarberPro <noreply@barberpro.com>',
        to: [appointment.customerEmail],
        subject: '✂️ Appointment Confirmed - BarberPro',
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }

  static async sendAppointmentRejection(appointment, barber) {
    if (!resend) {
      console.log('Email service not configured - skipping rejection email');
      return;
    }
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Update - BarberPro</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .appointment-card { background: #fef2f2; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #fecaca; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✂️ BarberPro</h1>
          <p>Appointment Update</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${appointment.customerName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">We regret to inform you that we cannot accommodate your appointment request at this time.</p>
          
          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #1f2937;">Requested Appointment</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Date & Time</span>
              <span class="detail-value">${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">✂️ Services</span>
              <span class="detail-value">${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">💰 Amount</span>
              <span class="detail-value">$${appointment.totalPrice}</span>
            </div>
          </div>
          
          ${appointment.responseMessage ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #1e40af; font-style: italic;">"${appointment.responseMessage}"</p></div>` : ''}
          
          <p style="color: #6b7280; line-height: 1.6;">We apologize for any inconvenience. Please feel free to contact us to discuss alternative appointment times or dates that might work better.</p>
        </div>
        <div class="footer">
          <p><strong>BarberPro</strong> - Professional Barber Services</p>
          <p>We appreciate your understanding and look forward to serving you soon.</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      await resend.emails.send({
        from: 'BarberPro <noreply@barberpro.com>',
        to: [appointment.customerEmail],
        subject: '✂️ Appointment Update - BarberPro',
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending rejection email:', error);
      throw error;
    }
  }

  static async sendBarberReminder(appointment, barber) {
    if (!resend || !barber.email) {
      console.log('Email service not configured or barber email missing - skipping reminder');
      return;
    }
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Reminder - BarberPro</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .appointment-card { background: #fffbeb; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #fde68a; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .urgent { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-weight: 700; text-align: center; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 BarberPro</h1>
          <p>Appointment Reminder</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${barber.name}!</h2>
          <div class="urgent">⏰ UPCOMING APPOINTMENT IN 10 MINUTES</div>
          
          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #1f2937;">Next Appointment</h3>
            <div class="detail-row">
              <span class="detail-label">👤 Customer</span>
              <span class="detail-value">${appointment.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Date & Time</span>
              <span class="detail-value">${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">✂️ Services</span>
              <span class="detail-value">${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏱️ Duration</span>
              <span class="detail-value">${appointment.totalDuration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📞 Customer Phone</span>
              <span class="detail-value">${appointment.customerPhone}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">💰 Amount</span>
              <span class="detail-value">$${appointment.totalPrice}</span>
            </div>
          </div>
          
          ${appointment.notes ? `<div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #0c4a6e; font-style: italic;"><strong>Customer Notes:</strong> "${appointment.notes}"</p></div>` : ''}
          
          <p style="color: #6b7280; line-height: 1.6;">Please prepare for your upcoming appointment. Make sure all tools are ready and sanitized.</p>
        </div>
        <div class="footer">
          <p><strong>BarberPro</strong> - Professional Barber Services</p>
          <p>Stay organized, stay professional!</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      await resend.emails.send({
        from: 'BarberPro Reminders <reminders@barberpro.com>',
        to: [barber.email],
        subject: '🔔 Appointment Reminder - 10 Minutes',
        html: emailHtml,
      });
      console.log(`Reminder email sent to ${barber.name} at ${barber.email}`);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }
}

module.exports = EmailService;