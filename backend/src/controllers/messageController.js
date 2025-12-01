const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.listMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat || !chat.members.map(String).includes(req.user.id)) return res.status(404).json({ message: 'Chat not found' });
    const limit = parseInt(req.query.limit || '30', 10);
    const messages = await Message.find({
      chat: id,
      deletedFor: { $ne: req.user.id } // Exclude messages deleted for this user
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email avatarUrl')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      });
    res.json(messages.reverse());
  } catch (e) {
    res.status(500).json({ message: 'Failed to load messages' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (!msg.readBy.map(String).includes(req.user.id)) {
      msg.readBy.push(req.user.id);
      await msg.save();
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to mark read' });
  }
};

exports.uploadMessageImage = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('req.file:', req.file);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { uploadToCloudinary } = require('../services/uploadService');
    console.log('Uploading to Cloudinary...');
    const url = await uploadToCloudinary(req.file.path);
    console.log('Cloudinary URL:', url);

    res.json({ url });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteType } = req.body; // 'forMe' or 'forEveryone'
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    if (msg.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    if (deleteType === 'forMe') {
      // Delete for me - add user to deletedFor array
      if (!msg.deletedFor.map(String).includes(req.user.id)) {
        msg.deletedFor.push(req.user.id);
        await msg.save();
      }
      return res.json({ message: 'Message deleted for you', deleteType: 'forMe' });
    } else if (deleteType === 'forEveryone') {
      // Check if message is within 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      if (new Date(msg.createdAt) < twoMinutesAgo) {
        return res.status(400).json({ message: 'Can only delete for everyone within 2 minutes' });
      }

      // Delete for everyone
      msg.isDeleted = true;
      msg.content = 'This message was deleted';
      msg.type = 'text';
      msg.url = null;
      await msg.save();
      return res.json({ message: 'Message deleted for everyone', deleteType: 'forEveryone' });
    }

    res.status(400).json({ message: 'Invalid delete type' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    if (msg.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    if (msg.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit deleted message' });
    }

    // Check if message is within 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (new Date(msg.createdAt) < twoMinutesAgo) {
      return res.status(400).json({ message: 'Can only edit messages within 2 minutes' });
    }

    msg.content = content.trim();
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    res.json({ message: 'Message edited', data: msg });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

