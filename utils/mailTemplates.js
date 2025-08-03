import { transporter } from '../config/mail.js';

export const sendApplicantStatusMail = async (applicant) => {
  if (!applicant.email) return;

  let subject = "Application Status Update";
  let text = `Hello ${applicant.name},\n\nYour application status is now: ${applicant.pstatus}.`;
  if (applicant.remarks) {
    text += `\n\nRemarks: ${applicant.remarks}`;
  }

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: applicant.email,
    subject,
    text
  });
};
