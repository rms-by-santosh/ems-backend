import nodemailer from 'nodemailer';

// Main/default transporter (for all general emails)
export const appTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Payment-specific transporter (for payment emails only)
export const paymentTransporter = nodemailer.createTransport({
  host: process.env.PAYMENT_SMTP_HOST || process.env.SMTP_HOST,
  port: process.env.PAYMENT_SMTP_PORT || process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.PAYMENT_SMTP_USER,
    pass: process.env.PAYMENT_SMTP_PASS
  }
});

// For backward compatibility (old code importing 'transporter')
export { appTransporter as transporter };
