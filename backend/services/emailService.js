const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

class EmailService {
  static isConfigured() {
    return !!process.env.RESEND_API_KEY;
  }

  // 1. Customer books appointment - send to customer
  static async sendBookingReceived(appointment, barber) {
    if (!resend) {
      console.log('Resend not configured - skipping booking received email');
      return;
    }

    try {
      console.log('Sending booking received email to:', appointment.customerEmail);
      
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
              <span><strong>Friseur:</strong></span>
              <span>${barber?.name || 'Professioneller Friseur'}</span>
            </div>
            <div class="detail">
              <span><strong>Gesamtkosten:</strong></span>
              <span>€${appointment.totalPrice}</span>
            </div>
          </div>
          
          <p><strong>Nächste Schritte:</strong></p>
          <p>Ihr Friseur wird diese Anfrage prüfen und Ihren Termin bestätigen. Sie erhalten eine weitere E-Mail, sobald Ihre Buchung bestätigt wurde.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Friseurdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

      await resend.emails.send({
        from: `${process.env.FROM_NAME || 'Ates Barberos'} <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
        to: [appointment.customerEmail],
        subject: 'Buchungsanfrage erhalten - Warten auf Bestätigung',
        html: emailHtml,
      });
      
      console.log('Booking received email sent successfully to:', appointment.customerEmail);
    } catch (error) {
      console.error('Failed to send booking received email:', error);
      throw error;
    }
  }

  // 2. Customer books appointment - send to barber
  static async sendNewBookingToBarber(appointment, barber) {
    if (!resend || !barber?.email) {
      console.log('Resend not configured or barber email missing - skipping barber notification');
      return;
    }

    try {
      console.log('Sending new booking notification to barber:', barber.email);
      
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

      await resend.emails.send({
        from: `Ates Barberos Admin <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
        to: [barber.email],
        subject: 'Neue Buchungsanfrage - Aktion erforderlich',
        html: emailHtml,
      });
      
      console.log('Barber notification email sent successfully to:', barber.email);
    } catch (error) {
      console.error('Failed to send barber notification email:', error);
      throw error;
    }
  }

  // 3. Admin confirms booking - send to customer
  static async sendAppointmentConfirmation(appointment, barber) {
    if (!resend) return;

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
              <span><strong>Ihr Friseur:</strong></span>
              <span>${barber?.name || 'Professioneller Friseur'}</span>
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
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Friseurdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Ates Barberos'} <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [appointment.customerEmail],
      subject: 'Buchung bestätigt - Ates Barberos',
      html: emailHtml,
    });
  }

  // 4. Admin confirms booking - send to barber
  static async sendBookingConfirmedToBarber(appointment, barber) {
    if (!resend || !barber.email) return;

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

    await resend.emails.send({
      from: `Ates Barberos Admin <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [barber.email],
      subject: 'Buchung bestätigt - Ihr Terminplan wurde aktualisiert',
      html: emailHtml,
    });
  }

  // 5. 30-minute reminder - send to customer
  static async send30MinReminderToCustomer(appointment, barber) {
    if (!resend) return;

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
              <span><strong>Ihr Friseur:</strong></span>
              <span>${barber?.name || 'Professioneller Friseur'}</span>
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
          <p><strong>Ates Barberos</strong> - Professionelle Friseurdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await resend.emails.send({
      from: `Ates Barberos Erinnerungen <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [appointment.customerEmail],
      subject: 'Termin in 30 Minuten - Ates Barberos',
      html: emailHtml,
    });
  }

  // 6. 30-minute reminder - send to barber
  static async send30MinReminderToBarber(appointment, barber) {
    if (!resend || !barber.email) return;

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

    await resend.emails.send({
      from: `Ates Barberos Admin <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [barber.email],
      subject: 'Termin in 30 Minuten - Vorbereitung',
      html: emailHtml,
    });
  }

  // 7. Appointment completed - send to customer
  static async sendCompletionToCustomer(appointment, barber) {
    if (!resend) return;

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
              <span><strong>Ihr Friseur:</strong></span>
              <span>${barber?.name || 'Professioneller Friseur'}</span>
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
          <p><strong>Ates Barberos</strong> - Professionelle Friseurdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
          <p>Vielen Dank, dass Sie uns gewählt haben!</p>
        </div>
      </div>
    </body>
    </html>`;

    await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Ates Barberos'} <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [appointment.customerEmail],
      subject: 'Service abgeschlossen - Vielen Dank!',
      html: emailHtml,
    });
  }

  // 8. Appointment completed - send to barber
  static async sendCompletionToBarber(appointment, barber) {
    if (!resend || !barber.email) return;

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

    await resend.emails.send({
      from: `Ates Barberos Admin <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [barber.email],
      subject: 'Termin abgeschlossen - Gut gemacht!',
      html: emailHtml,
    });
  }

  // Rejection email
  static async sendAppointmentRejection(appointment, barber) {
    if (!resend) return;

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
          
          ${appointment.responseMessage ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;"><p style="margin: 0; color: #1e40af;"><strong>Nachricht von ${barber?.name || 'Ihrem Friseur'}:</strong> "${appointment.responseMessage}"</p></div>` : ''}
          
          <p>Wir entschuldigen uns für etwaige Unannehmlichkeiten. Bitte buchen Sie gerne einen anderen Zeitslot, der besser passt.</p>
        </div>
        <div class="footer">
          <p><strong>Ates Barberos</strong> - Professionelle Friseurdienstleistungen</p>
          <p>Bahnhofstraße 3, 6410 Telfs | https://ates-barberos.com</p>
        </div>
      </div>
    </body>
    </html>`;

    await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Ates Barberos'} <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: [appointment.customerEmail],
      subject: 'Buchungsaktualisierung - Ates Barberos',
      html: emailHtml,
    });
  }

  // Legacy method for backward compatibility
  static async sendBarberReminder(appointment, barber) {
    return this.send30MinReminderToBarber(appointment, barber);
  }
}

module.exports = EmailService;