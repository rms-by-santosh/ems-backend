import nodemailer from 'nodemailer';

export const sendPaymentEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.PAYMENT_SMTP_HOST,
    port: Number(process.env.PAYMENT_SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.PAYMENT_SMTP_USER,
      pass: process.env.PAYMENT_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Payment Agent" <${process.env.PAYMENT_SMTP_USER}>`, // ✅ always shows Payment Agent
    to,
    subject,
    html,
  });
};
