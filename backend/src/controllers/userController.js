const User = require('../models/User');
const { uploadToCloudinary } = require('../services/uploadService');
const bcrypt = require('bcryptjs');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;

    if (req.file) {
      const avatarUrl = await uploadToCloudinary(req.file.path);
      user.avatarUrl = avatarUrl;
    }

    await user.save();
    res.json({ user: { id: user._id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    }).select('name email avatarUrl').limit(10);

    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Search failed' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update password' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatarUrl lastSeen bio createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the requesting user has blocked this user
    const me = await User.findById(req.user.id).select('blockedUsers');
    const isBlocked = me.blockedUsers.map(String).includes(req.params.id);

    res.json({ ...user.toObject(), isBlocked });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.blockedUsers.map(String).includes(userId)) {
      user.blockedUsers.push(userId);
      await user.save();
    }

    res.json({ message: 'User blocked successfully', blockedUsers: user.blockedUsers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to block user' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();

    res.json({ message: 'User unblocked successfully', blockedUsers: user.blockedUsers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
};

exports.updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    if (bio && bio.length > 200) {
      return res.status(400).json({ message: 'Bio must be 200 characters or less' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.bio = bio || '';
    await user.save();

    res.json({ message: 'Bio updated successfully', bio: user.bio });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update bio' });
  }
};

