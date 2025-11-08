import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Check if we should send real emails
  const shouldSendRealEmails = process.env.SEND_REAL_EMAILS === 'true';

  if (!shouldSendRealEmails) {
    // Log emails to console in development
    console.log('📧 Email service running in DEVELOPMENT mode (emails logged to console)');
    return null; // We'll handle this specially
  }

  // Production SMTP configuration
  console.log('📧 Initializing REAL email transporter...');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log('✅ Email transporter ready - will send real emails');
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { to, subject, html, from, text } = options;

    // Check if we should send real emails
    const shouldSendRealEmails = process.env.SEND_REAL_EMAILS === 'true';

    // In development without real email config, just log the email
    if (!shouldSendRealEmails) {
      console.log('\n📧 ========== EMAIL (DEV MODE) ==========');
      console.log('To:', Array.isArray(to) ? to.join(', ') : to);
      console.log('From:', from || process.env.SMTP_FROM || 'aadityasinghal77@gmail.com');
      console.log('Subject:', subject);
      console.log('HTML:', html.substring(0, 200) + '...');
      console.log('========================================\n');

      // Store in a log file for testing
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'logs');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, 'emails.log');
      const logEntry = `
[${new Date().toISOString()}]
To: ${Array.isArray(to) ? to.join(', ') : to}
From: ${from || process.env.SMTP_FROM || 'aadityasinghal77@gmail.com'}
Subject: ${subject}
Body: ${html}
-------------------
`;
      
      fs.appendFileSync(logFile, logEntry);

      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    // Production: actually send the email
    const transporter = getTransporter();
    
    if (!transporter) {
      console.error('❌ Email transporter not configured. Set SMTP credentials in .env.local');
      console.error('Current SEND_REAL_EMAILS:', process.env.SEND_REAL_EMAILS);
      console.error('Current SMTP_USER:', process.env.SMTP_USER);
      // Still return success in dev mode to not break the flow
      return {
        success: true,
        messageId: `dev-fallback-${Date.now()}`,
      };
    }

    const mailOptions = {
      from: from || process.env.SMTP_FROM || process.env.SMTP_USER || 'aadityasinghal77@gmail.com',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    console.log('📤 Sending email from:', mailOptions.from, 'to:', mailOptions.to);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully! Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Test email function
export async function sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: 'Test Email from Meeting App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Email</h2>
        <p>This is a test email from your meeting automation system.</p>
        <p>If you received this, your email configuration is working correctly! ✅</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `,
  });
}
