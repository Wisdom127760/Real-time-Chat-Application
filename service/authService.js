const nodemailer = require('nodemailer');

async function sendConfirmationEmail(email, token) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Password Reset Confirmation',
    text: `Please confirm your password reset by submitting this token: ${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send confirmation email:', err);
  }
}

module.exports = {
    sendConfirmationEmail
  };
  