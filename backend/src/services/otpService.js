const bcrypt = require('bcryptjs');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function compareOTP(otp, hash) {
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOTP, hashOTP, compareOTP };
