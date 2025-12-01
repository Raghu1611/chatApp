const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, unique: true, sparse: true }, // sparse allows null/undefined for existing users
  name: { type: String, required: true },
  avatarUrl: { type: String },
  avatarPublicId: { type: String },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  lastSeen: { type: Date },
  bio: { type: String, maxlength: 200 },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
