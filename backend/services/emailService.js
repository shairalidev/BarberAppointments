const { Resend } = require('resend');

let resendClient = null;

class EmailService {
  static getResendClient() {
    if (!resendClient && process.env.RESEND_API_KEY) {
      resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
  }

  static isConfigured() {
    return !!process.env.RESEND_API_KEY;
  }

  static sanitizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  static isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static formatRecipient(email) {
    const sanitized = this.sanitizeEmail(email);
    if (!this.isValidEmail(sanitized)) {
      throw new Error('Invalid recipient email');
    }
    return sanitized;
  }

  static getSender(nameOverride) {
    const senderEmail = this.sanitizeEmail(process.env.FROM_EMAIL) || 'noreply@ates-barberos.com';
    const senderName = nameOverride || process.env.FROM_NAME || 'Ates Barberos';
    return `${senderName} <${senderEmail}>`;
  }

  static buildEnvelope(nameOverride) {
    const senderEmail = this.sanitizeEmail(process.env.FROM_EMAIL) || 'noreply@ates-barberos.com';
    const senderName = nameOverride || process.env.FROM_NAME || 'Ates Barberos';
    const replyTo = this.sanitizeEmail(process.env.REPLY_TO_EMAIL) || senderEmail;
    const unsubscribeEmail = this.sanitizeEmail(process.env.UNSUBSCRIBE_EMAIL) || replyTo;

    const headers = unsubscribeEmail
      ? { 'List-Unsubscribe': `<mailto:${unsubscribeEmail}>` }
      : undefined;

    return {
      from: `${senderName} <${senderEmail}>`,
      replyTo,
      headers
    };
  }

  static buildPlainText(lines = []) {
    return lines.filter(Boolean).join('\n');
  }

  static formatDateTime(date, time) {
    const dateText = new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `${dateText} um ${time}`;
  }

  static async dispatchEmail({ to, subject, html, text, nameOverride }) {
    const resend = this.getResendClient();
    if (!resend) {
      console.log('Resend not configured - skipping email:', subject);
      return;
    }

    const recipient = this.formatRecipient(to);
    const envelope = this.buildEnvelope(nameOverride);

    const payload = {
      from: envelope.from,
      to: [recipient],
      subject,
      html
    };

    if (text) payload.text = text;
    if (envelope.replyTo) payload.reply_to = envelope.replyTo;
    if (envelope.headers) payload.headers = envelope.headers;

    await resend.emails.send(payload);
  }

  // 1. Customer books appointment - send to customer
  static async sendBookingReceived(appointment, barber) {
    try {
      console.log('Sending booking received email to:', appointment.customerEmail);
      const subject = 'Buchungsanfrage erhalten - Warten auf Bestätigung';
      const text = this.buildPlainText([
        `Hallo ${appointment.customerName}!`,
        'Wir haben Ihre Buchung erhalten und prüfen sie gerade.',
        `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
        `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
        `Barber: ${barber?.name || 'Professioneller Barber'}`,
        `Gesamtkosten: €${appointment.totalPrice}`,
        'Sie erhalten eine weitere E-Mail, sobald Ihre Buchung bestätigt wurde.',
        'Adresse: Bahnhofstraße 3, 6410 Telfs'
      ]);

      const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Buchungsanfrage erhalten - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-card { background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .cancel-section { text-align: center; margin: 24px 0; padding: 20px; background: #fef2f2; border-radius: 10px; }
        .cancel-btn { display: inline-block; padding: 12px 28px; background: #ef4444; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ates Barberos</h1>
          <p>Buchungsanfrage erhalten</p>
        </div>
        <div class="content">
          <h2>Hallo ${appointment.customerName}!</h2>
          <p>Vielen Dank für Ihre Buchung bei Ates Barberos. Ihre Anfrage wurde erhalten und wartet auf Bestätigung.</p>

          <div class="booking-card">
            <h3>Ihre Buchungsanfrage</h3>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Barber:</strong></span>
              <span>${barber?.name || 'Professioneller Barber'}</span>
            </div>
            <div class="detail">
              <span><strong>Gesamtkosten:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>

          <p><strong>Nächste Schritte:</strong></p>
          <p>Ihr Barber wird diese Anfrage prüfen und Ihren Termin bestätigen. Sie erhalten eine weitere E-Mail, sobald Ihre Buchung bestätigt wurde.</p>

          <div class="cancel-section">
            <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">Möchten Sie Ihre Buchung stornieren?</p>
            <a href="${process.env.APP_URL}/api/appointments/${appointment._id}/cancel" class="cancel-btn">Buchung stornieren</a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

      await this.dispatchEmail({
        to: appointment.customerEmail,
        subject,
        html: emailHtml,
        text
      });
      
      console.log('Booking received email sent successfully to:', appointment.customerEmail);
    } catch (error) {
      console.error('Failed to send booking received email:', error);
      throw error;
    }
  }

  // 2. Customer books appointment - send to barber
  static async sendNewBookingToBarber(appointment, barber) {
    if (!barber?.email) {
      console.log('Resend not configured or barber email missing - skipping barber notification');
      return;
    }

    try {
      console.log('Sending new booking notification to barber:', barber.email);
      const subject = 'Neue Buchungsanfrage - Aktion erforderlich';
      const text = this.buildPlainText([
        `Hallo ${barber.name}!`,
        'Es gibt eine neue Buchungsanfrage.',
        `Kunde: ${appointment.customerName} (${appointment.customerPhone})`,
        `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
        `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
        appointment.notes ? `Notizen: ${appointment.notes}` : '',
        `Gesamt: €${appointment.totalPrice}`,
        'Bitte im Admin-Portal bestätigen oder ablehnen.'
      ]);
      
      const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Neue Buchungsanfrage - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-card { background: #fffbeb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #fde68a; }
        .action-btn { background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Neue Buchungsanfrage</h1>
          <p>Ates Barberos Admin</p>
        </div>
        <div class="content">
          <h2>Hallo ${barber.name}!</h2>
          <p>Sie haben eine neue Buchungsanfrage erhalten, die Ihre Genehmigung erfordert.</p>
          
          <div class="booking-card">
            <h3>Buchungsdetails</h3>
            <div class="detail">
              <span><strong>Kunde:</strong></span>
              <span>${appointment.customerName}</span>
            </div>
            <div class="detail">
              <span><strong>Telefon:</strong></span>
              <span>${appointment.customerPhone}</span>
            </div>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Gesamt:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
            ${appointment.notes ? `<div class="detail"><span><strong>Notizen:</strong></span><span>${appointment.notes}</span></div>` : ''}
          </div>
          
          <p><strong>Aktion erforderlich:</strong></p>
          <p>Bitte loggen Sie sich in Ihr Admin-Portal ein, um diese Buchungsanfrage anzunehmen oder abzulehnen.</p>
          <a href="${process.env.APP_URL}/admin" class="action-btn">Zum Admin-Portal</a>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Admin-Benachrichtigungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs</p>
        </div>
      </div>
    </body>
    </html>`;

      await this.dispatchEmail({
        to: barber.email,
        subject,
        html: emailHtml,
        text,
        nameOverride: 'Ates Barberos Admin'
      });
      
      console.log('Barber notification email sent successfully to:', barber.email);
    } catch (error) {
      console.error('Failed to send barber notification email:', error);
      throw error;
    }
  }

  // 3. Admin confirms booking - send to customer
  static async sendAppointmentConfirmation(appointment, barber) {
    const subject = 'Buchung bestätigt - Ates Barberos';
    const text = this.buildPlainText([
      `Hallo ${appointment.customerName}!`,
      'Ihre Buchung wurde bestätigt.',
      `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Barber: ${barber?.name || 'Professioneller Barber'}`,
      `Gesamtkosten: €${appointment.totalPrice}`,
      `Ihre Telefonnummer: ${appointment.customerPhone}`,
      appointment.responseMessage ? `Nachricht vom Barber: "${appointment.responseMessage}"` : '',
      'Sie erhalten 30 Minuten vor Ihrem Termin eine Erinnerung.',
      'Adresse: Bahnhofstraße 3, 6410 Telfs'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Buchung bestätigt - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-card { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #dcfce7; }
        .confirmed { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-weight: 700; text-align: center; margin: 20px 0; }
        .cancel-section { text-align: center; margin: 24px 0; padding: 20px; background: #fef2f2; border-radius: 10px; }
        .cancel-btn { display: inline-block; padding: 12px 28px; background: #ef4444; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Buchung bestätigt!</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${appointment.customerName}!</h2>
          <div class="confirmed">IHRE BUCHUNG IST BESTÄTIGT</div>
          <p>Großartige Neuigkeiten! Ihr Termin bei Ates Barberos wurde bestätigt. Wir freuen uns darauf, Sie zu sehen.</p>

          <div class="booking-card">
            <h3>Bestätigter Termin</h3>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Ihr Barber:</strong></span>
              <span>${barber?.name || 'Professioneller Barber'}</span>
            </div>
            <div class="detail">
              <span><strong>Gesamtkosten:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
            <div class="detail">
              <span><strong>Ihre Telefonnummer:</strong></span>
              <span>${appointment.customerPhone}</span>
            </div>
          </div>

          <p><strong>Wichtig:</strong> Bitte kommen Sie 5 Minuten früher. Sie erhalten 30 Minuten vor Ihrem Termin eine Erinnerung.</p>
          ${appointment.responseMessage ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;"><p style="margin: 0; color: #1e40af;"><strong>Nachricht von ${barber?.name}:</strong> "${appointment.responseMessage}"</p></div>` : ''}

          <div class="cancel-section">
            <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">Möchten Sie Ihren Termin stornieren?</p>
            <a href="${process.env.APP_URL}/api/appointments/${appointment._id}/cancel" class="cancel-btn">Termin stornieren</a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: appointment.customerEmail,
      subject,
      html: emailHtml,
      text
    });
  }

  // 4. Admin confirms booking - send to barber
  static async sendBookingConfirmedToBarber(appointment, barber) {
    if (!barber.email) return;

    const subject = 'Buchung bestätigt - Ihr Terminplan wurde aktualisiert';
    const text = this.buildPlainText([
      `Hallo ${barber.name}!`,
      'Sie haben einen Termin bestätigt.',
      `Kunde: ${appointment.customerName}`,
      `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Dauer: ${appointment.totalDuration} Minuten`,
      `Telefon des Kunden: ${appointment.customerPhone}`,
      `Gesamt: €${appointment.totalPrice}`,
      'Der Kunde wurde ebenfalls benachrichtigt.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Buchung bestätigt - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-card { background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #dbeafe; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Buchung bestätigt</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${barber.name}!</h2>
          <p>Sie haben eine Buchung bestätigt. Hier sind die Details:</p>
          
          <div class="booking-card">
            <h3>Bestätigter Termin</h3>
            <div class="detail">
              <span><strong>Kunde:</strong></span>
              <span>${appointment.customerName}</span>
            </div>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Dauer:</strong></span>
              <span>${appointment.totalDuration} Minuten</span>
            </div>
            <div class="detail">
              <span><strong>Kundentelefon:</strong></span>
              <span>${appointment.customerPhone}</span>
            </div>
            <div class="detail">
              <span><strong>Gesamt:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>
          
          <p>Der Kunde wurde benachrichtigt und erhält 30 Minuten vor dem Termin eine Erinnerung.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Admin-Benachrichtigungen</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: barber.email,
      subject,
      html: emailHtml,
      text,
      nameOverride: 'Ates Barberos Admin'
    });
  }

  // 5. 30-minute reminder - send to customer
  static async send30MinReminderToCustomer(appointment, barber) {
    const subject = 'Termin in 30 Minuten - Ates Barberos';
    const text = this.buildPlainText([
      `Hallo ${appointment.customerName}!`,
      'Ihr Termin beginnt in 30 Minuten.',
      `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Ihr Barber: ${barber?.name || 'Professioneller Barber'}`,
      'Adresse: Bahnhofstraße 3, 6410 Telfs',
      `Gesamt: €${appointment.totalPrice}`,
      'Bitte kommen Sie 5 Minuten früher.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Terminerinnerung - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .reminder-card { background: #fffbeb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #fde68a; }
        .urgent { background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; text-align: center; margin: 20px 0; font-weight: 700; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Terminerinnerung</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${appointment.customerName}!</h2>
          <div class="urgent">IHR TERMIN IST IN 30 MINUTEN</div>
          
          <div class="reminder-card">
            <h3>Termindetails</h3>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Ihr Barber:</strong></span>
              <span>${barber?.name || 'Professioneller Barber'}</span>
            </div>
            <div class="detail">
              <span><strong>Adresse:</strong></span>
              <span>Bahnhofstraße 3, 6410 Telfs</span>
            </div>
            <div class="detail">
              <span><strong>Gesamt:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>
          
          <p><strong>Bitte kommen Sie 5 Minuten früher!</strong> Wir freuen uns darauf, Sie bald zu sehen.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: appointment.customerEmail,
      subject,
      html: emailHtml,
      text,
      nameOverride: 'Ates Barberos Erinnerungen'
    });
  }

  // 6. 30-minute reminder - send to barber
  static async send30MinReminderToBarber(appointment, barber) {
    if (!barber.email) return;

    const subject = 'Termin in 30 Minuten - Vorbereitung';
    const text = this.buildPlainText([
      `Hallo ${barber.name}!`,
      'Ihr nächster Termin startet in 30 Minuten.',
      `Kunde: ${appointment.customerName}`,
      `Uhrzeit: ${appointment.time}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Dauer: ${appointment.totalDuration} Minuten`,
      `Telefon des Kunden: ${appointment.customerPhone}`,
      appointment.notes ? `Notizen: ${appointment.notes}` : '',
      'Bitte bereiten Sie den Arbeitsplatz vor.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Terminerinnerung - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .reminder-card { background: #faf5ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9d5ff; }
        .urgent { background: #e9d5ff; color: #6b21a8; padding: 12px; border-radius: 8px; text-align: center; margin: 20px 0; font-weight: 700; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Terminerinnerung</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${barber.name}!</h2>
          <div class="urgent">NÄCHSTER TERMIN IN 30 MINUTEN</div>
          
          <div class="reminder-card">
            <h3>Anstehender Termin</h3>
            <div class="detail">
              <span><strong>Kunde:</strong></span>
              <span>${appointment.customerName}</span>
            </div>
            <div class="detail">
              <span><strong>Uhrzeit:</strong></span>
              <span>${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Dauer:</strong></span>
              <span>${appointment.totalDuration} Minuten</span>
            </div>
            <div class="detail">
              <span><strong>Kundentelefon:</strong></span>
              <span>${appointment.customerPhone}</span>
            </div>
            ${appointment.notes ? `<div class="detail"><span><strong>Notizen:</strong></span><span>${appointment.notes}</span></div>` : ''}
          </div>
          
          <p>Bitte bereiten Sie Ihre Werkzeuge und den Arbeitsplatz vor. Der Kunde wurde ebenfalls benachrichtigt.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Admin-Benachrichtigungen</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: barber.email,
      subject,
      html: emailHtml,
      text,
      nameOverride: 'Ates Barberos Admin'
    });
  }

  // 7. Appointment completed - send to customer
  static async sendCompletionToCustomer(appointment, barber) {
    const subject = 'Service abgeschlossen - Vielen Dank!';
    const text = this.buildPlainText([
      `Hallo ${appointment.customerName}!`,
      'Danke für Ihren Besuch bei Ates Barberos.',
      `Datum & Uhrzeit: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Ihr Barber: ${barber?.name || 'Professioneller Barber'}`,
      `Bezahlt: €${appointment.totalPrice}`,
      'Wir freuen uns, Sie bald wiederzusehen!'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Termin abgeschlossen - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .completion-card { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #dcfce7; }
        .thank-you { background: #dcfce7; color: #166534; padding: 12px; border-radius: 8px; text-align: center; margin: 20px 0; font-weight: 700; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Service abgeschlossen!</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${appointment.customerName}!</h2>
          <div class="thank-you">VIELEN DANK FÜR IHREN BESUCH BEI ATES BARBEROS!</div>
          
          <div class="completion-card">
            <h3>Abgeschlossener Service</h3>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Ihr Barber:</strong></span>
              <span>${barber?.name || 'Professioneller Barber'}</span>
            </div>
            <div class="detail">
              <span><strong>Bezahlt:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>
          
          <p>Wir hoffen, Sie hatten eine großartige Erfahrung! Ihre Zufriedenheit ist unsere Priorität.</p>
          <p><strong>Wir würden uns freuen, Sie wiederzusehen!</strong> Buchen Sie Ihren nächsten Termin jederzeit auf unserer Website.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
          <p>Vielen Dank, dass Sie uns gewählt haben!</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: appointment.customerEmail,
      subject,
      html: emailHtml,
      text
    });
  }

  // 8. Appointment completed - send to barber
  static async sendCompletionToBarber(appointment, barber) {
    if (!barber.email) return;

    const subject = 'Termin abgeschlossen - Gut gemacht!';
    const text = this.buildPlainText([
      `Hallo ${barber.name}!`,
      'Sie haben einen Termin abgeschlossen.',
      `Kunde: ${appointment.customerName}`,
      `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Umsatz: €${appointment.totalPrice}`,
      'Der Kunde wurde über den Abschluss informiert.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Termin abgeschlossen - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .completion-card { background: #eef2ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #c7d2fe; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Service abgeschlossen</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${barber.name}!</h2>
          <p>Sie haben erfolgreich einen Termin abgeschlossen. Großartige Arbeit!</p>
          
          <div class="completion-card">
            <h3>Abgeschlossener Termin</h3>
            <div class="detail">
              <span><strong>Kunde:</strong></span>
              <span>${appointment.customerName}</span>
            </div>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Umsatz:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>
          
          <p>Der Kunde wurde über den Abschluss benachrichtigt. Machen Sie weiter so!</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Admin-Benachrichtigungen</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: barber.email,
      subject,
      html: emailHtml,
      text,
      nameOverride: 'Ates Barberos Admin'
    });
  }

  // Rejection email
  static async sendAppointmentRejection(appointment, barber) {
    const subject = 'Buchungsaktualisierung - Ates Barberos';
    const text = this.buildPlainText([
      `Hallo ${appointment.customerName},`,
      'leider können wir Ihre Terminanfrage zu diesem Zeitpunkt nicht erfüllen.',
      `Angefragter Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      appointment.responseMessage ? `Nachricht vom Barber: "${appointment.responseMessage}"` : '',
      'Bitte buchen Sie gerne einen anderen Zeitslot.',
      'Vielen Dank für Ihr Verständnis.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Buchungsaktualisierung - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .rejection-card { background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #fecaca; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Buchungsaktualisierung</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${appointment.customerName},</h2>
          <p>Es tut uns leid, Ihnen mitteilen zu müssen, dass wir Ihre Terminanfrage zu diesem Zeitpunkt nicht erfüllen können.</p>
          
          <div class="rejection-card">
            <h3>Angefragter Termin</h3>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
          </div>
          
          ${appointment.responseMessage ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;"><p style="margin: 0; color: #1e40af;"><strong>Nachricht von ${barber?.name || 'Ihrem Barber'}:</strong> "${appointment.responseMessage}"</p></div>` : ''}
          
          <p>Wir entschuldigen uns für etwaige Unannehmlichkeiten. Bitte buchen Sie gerne einen anderen Zeitslot, der besser passt.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: appointment.customerEmail,
      subject,
      html: emailHtml,
      text
    });
  }

  // Customer self-cancellation - notify barber
  static async sendCustomerCancellationToBarber(appointment, barber) {
    if (!barber?.email) return;

    const subject = 'Termin storniert vom Kunden - Ates Barberos';
    const text = this.buildPlainText([
      `Hallo ${barber.name}!`,
      'Ein Kunde hat seinen Termin selbst storniert.',
      `Kunde: ${appointment.customerName} (${appointment.customerPhone})`,
      `Termin: ${this.formatDateTime(appointment.date, appointment.time)}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      `Gesamt: €${appointment.totalPrice}`,
      'Der Zeitslot ist jetzt wieder verfügbar.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Termin storniert - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .cancel-card { background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #fecaca; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Termin storniert</h1>
          <p>Ates Barberos Admin</p>
        </div>
        <div class="content">
          <h2>Hallo ${barber.name}!</h2>
          <p>Ein Kunde hat seinen Termin selbst storniert. Der Zeitslot ist jetzt wieder verfügbar.</p>

          <div class="cancel-card">
            <h3>Stornierter Termin</h3>
            <div class="detail">
              <span><strong>Kunde:</strong></span>
              <span>${appointment.customerName}</span>
            </div>
            <div class="detail">
              <span><strong>Telefon:</strong></span>
              <span>${appointment.customerPhone}</span>
            </div>
            <div class="detail">
              <span><strong>Datum & Uhrzeit:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} um ${appointment.time}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Gesamt:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>

          <p>Sie können den Termin im Admin-Portal einsehen.</p>
          <a href="${process.env.APP_URL}/admin" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 10px 0;">Zum Admin-Portal</a>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Admin-Benachrichtigungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: barber.email,
      subject,
      html: emailHtml,
      text,
      nameOverride: 'Ates Barberos Admin'
    });
  }

  // Legacy method for backward compatibility
  static async sendBarberReminder(appointment, barber) {
    return this.send30MinReminderToBarber(appointment, barber);
  }

  // Time change notification to customer
  static async sendTimeChangeToCustomer(appointment, barber, oldTime, message) {
    if (!appointment.customerEmail) return;

    const subject = 'Terminzeit geändert - Ates Barberos';
    const text = this.buildPlainText([
      `Hallo ${appointment.customerName}!`,
      'Ihre Terminzeit wurde geändert.',
      `Alte Zeit: ${oldTime}`,
      `Neue Zeit: ${appointment.time}`,
      `Datum: ${this.formatDateTime(appointment.date, appointment.time).split(' um ')[0]}`,
      message ? `Nachricht: "${message}"` : '',
      'Bitte beachten Sie die neue Zeit für Ihren Termin.',
      'Adresse: Bahnhofstraße 3, 6410 Telfs'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Terminzeit geändert - Ates Barberos</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .change-card { background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #dbeafe; }
        .time-change { background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .old-time { text-decoration: line-through; color: #dc2626; }
        .new-time { font-weight: 700; color: #059669; font-size: 1.1em; }
        .message-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Terminzeit geändert</h1>
          <p>Ates Barberos</p>
        </div>
        <div class="content">
          <h2>Hallo ${appointment.customerName}!</h2>
          <p>Ihre Terminzeit wurde geändert. Bitte beachten Sie die neue Zeit für Ihren Termin.</p>
          
          <div class="change-card">
            <h3>Zeitänderung</h3>
            <div class="time-change">
              <div style="margin-bottom: 8px;">
                <span class="old-time">Alte Zeit: ${oldTime}</span>
              </div>
              <div>
                <span class="new-time">Neue Zeit: ${appointment.time}</span>
              </div>
            </div>
            <div class="detail">
              <span><strong>Datum:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Ihr Barber:</strong></span>
              <span>${barber?.name || 'Professioneller Barber'}</span>
            </div>
          </div>
          
          ${message ? `<div class="message-box"><p style="margin: 0; color: #166534;"><strong>Nachricht:</strong> "${message}"</p></div>` : ''}
          
          <p><strong>Wichtig:</strong> Bitte kommen Sie zur neuen Zeit. Sie erhalten 30 Minuten vor Ihrem Termin eine Erinnerung.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: appointment.customerEmail,
      subject,
      html: emailHtml,
      text
    });
  }

  // Time change notification to barber
  static async sendTimeChangeToBarber(appointment, barber, oldTime, message) {
    if (!barber?.email) return;

    const subject = 'Terminzeit geändert - Ihr Terminplan wurde aktualisiert';
    const text = this.buildPlainText([
      `Hallo ${barber.name}!`,
      'Sie haben die Terminzeit für einen Termin geändert.',
      `Kunde: ${appointment.customerName}`,
      `Alte Zeit: ${oldTime}`,
      `Neue Zeit: ${appointment.time}`,
      `Datum: ${this.formatDateTime(appointment.date, appointment.time).split(' um ')[0]}`,
      `Dienstleistungen: ${appointment.services?.map(s => s.name).join(', ')}`,
      message ? `Ihre Nachricht: "${message}"` : '',
      'Der Kunde wurde über die Änderung informiert.'
    ]);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Terminzeit geändert - Ates Barberos Admin</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .change-card { background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #dbeafe; }
        .time-change { background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .old-time { text-decoration: line-through; color: #dc2626; }
        .new-time { font-weight: 700; color: #059669; font-size: 1.1em; }
        .message-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Terminzeit geändert</h1>
          <p>Ates Barberos Admin</p>
        </div>
        <div class="content">
          <h2>Hallo ${barber.name}!</h2>
          <p>Sie haben die Terminzeit für einen Termin geändert. Der Kunde wurde über die Änderung informiert.</p>
          
          <div class="change-card">
            <h3>Zeitänderung</h3>
            <div class="time-change">
              <div style="margin-bottom: 8px;">
                <span class="old-time">Alte Zeit: ${oldTime}</span>
              </div>
              <div>
                <span class="new-time">Neue Zeit: ${appointment.time}</span>
              </div>
            </div>
            <div class="detail">
              <span><strong>Kunde:</strong></span>
              <span>${appointment.customerName}</span>
            </div>
            <div class="detail">
              <span><strong>Telefon:</strong></span>
              <span>${appointment.customerPhone}</span>
            </div>
            <div class="detail">
              <span><strong>Datum:</strong></span>
              <span>${new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail">
              <span><strong>Dienstleistungen:</strong></span>
              <span>${appointment.services?.map(s => s.name).join(', ')}</span>
            </div>
            <div class="detail">
              <span><strong>Dauer:</strong></span>
              <span>${appointment.totalDuration} Minuten</span>
            </div>
          </div>
          
          ${message ? `<div class="message-box"><p style="margin: 0; color: #166534;"><strong>Ihre Nachricht:</strong> "${message}"</p></div>` : ''}
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Barberdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await this.dispatchEmail({
      to: barber.email,
      subject,
      html: emailHtml,
      text
    });
  }
}

module.exports = EmailService;
