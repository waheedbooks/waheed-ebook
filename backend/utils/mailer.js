const nodemailer = require("nodemailer");

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const transport = getTransporter();
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your password — The Reading Room",
    html: `
      <p>Hi,</p>
      <p>We received a request to reset the password for your account. Click the link
      below to choose a new one. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email — your password
      won't be changed.</p>
    `,
  });
}

async function sendVerificationEmail(to, verifyUrl) {
  const transport = getTransporter();
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Verify your email — The Reading Room",
    html: `
      <p>Hi,</p>
      <p>Thanks for signing up. Click the link below to verify your email address and
      activate your account. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail };