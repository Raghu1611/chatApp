// Simple email API using Nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',  // Your Gmail
    pass: 'your-app-password'       // Gmail App Password
  }
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to,
    subject,
    html
  });
}

module.exports = { sendEmail };
