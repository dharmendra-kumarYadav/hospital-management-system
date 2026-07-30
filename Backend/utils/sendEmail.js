// utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE, // e.g. "gmail"
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD, // use an app password, not your real password
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to,
    subject,
    text,
  });
};