const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
