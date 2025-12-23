require('dotenv').config();
const { Resend } = require('resend');

async function testEmail() {
  console.log('Testing email configuration...');
  
  console.log('Environment variables:');
  console.log('RESEND_API_KEY:', !!process.env.RESEND_API_KEY);
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  console.log('FROM_NAME:', process.env.FROM_NAME);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const result = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Ates Barberos'} <${process.env.FROM_EMAIL || 'noreply@ates-barberos.com'}>`,
      to: ['test@example.com'], // Change this to your test email
      subject: 'Test Email from Ates Barberos',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify the email configuration.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();