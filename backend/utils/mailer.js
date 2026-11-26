async function sendPasswordResetEmail(to, resetUrl) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "The Reading Room", email: process.env.SMTP_FROM },
      to: [{ email: to }],
      subject: "Reset your password — The Reading Room",
      htmlContent: `
      <p>Hi,</p>
      <p>We received a request to reset the password for your account. Click the link
      below to choose a new one. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email — your password
      won't be changed.</p>
    `,
    }),
  });
  if (!res.ok) {
    throw new Error(`Brevo API error ${res.status}: ${await res.text()}`);
  }
}

async function sendVerificationEmail(to, verifyUrl) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Waheed Books", email: process.env.SMTP_FROM },
      to: [{ email: to }],
      subject: "Verify your email — The Reading Room",
      htmlContent: `
      <p>Hi,</p>
      <p>Thanks for signing up. Click the link below to verify your email address and
      activate your account. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `,
    }),
  });
  if (!res.ok) {
    throw new Error(`Brevo API error ${res.status}: ${await res.text()}`);
  }
}

async function sendLoginPinEmail(to, pin) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Waheed Books", email: process.env.SMTP_FROM },
      to: [{ email: to }],
      subject: `Your login PIN: ${pin} — Waheed Books`,
      htmlContent: `
      <p>Hi,</p>
      <p>Use this 6-digit PIN to finish logging in to Waheed Books. It expires in 10 minutes.</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:18px 0;">${pin}</p>
      <p>If you didn't try to log in, someone may know your password. Please change it
      using "Forgot password" on the login page. Never share this PIN with anyone.</p>
    `,
    }),
  });
  if (!res.ok) {
    throw new Error(`Brevo API error ${res.status}: ${await res.text()}`);
  }
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail, sendLoginPinEmail };
