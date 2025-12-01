const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String },
  avatarUrl: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  onlyAdminsCanSend: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
