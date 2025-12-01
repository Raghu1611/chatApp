const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');

exports.listMyChats = async (req, res) => {
  try {
    const chats = await Chat.aggregate([
      { $match: { members: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $addFields: {
          isPinned: { $in: [new mongoose.Types.ObjectId(req.user.id), { $ifNull: ["$pinnedBy", []] }] }
        }
      },
      { $sort: { isPinned: -1, updatedAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members'
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          as: 'lastMessage'
        }
      },
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'lastMessage.sender'
        }
      },
      { $unwind: { path: '$lastMessage.sender', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          'members.passwordHash': 0,
          'lastMessage.sender.passwordHash': 0
        }
      }
    ]);
    res.json(chats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load chats' });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const userId = req.user.id;
    const isPinned = chat.pinnedBy.map(String).includes(userId);

    if (isPinned) {
      chat.pinnedBy = chat.pinnedBy.filter(id => String(id) !== userId);
    } else {
      chat.pinnedBy.push(userId);
    }

    await chat.save();
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('members', 'name email avatarUrl')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name email avatarUrl' } });
    if (!chat || !chat.members.some(m => String(m._id) === req.user.id)) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load chat' });
  }
};

exports.createDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    if (userId === req.user.id) return res.status(400).json({ message: 'Cannot chat with yourself' });

    const other = await User.findById(userId);
    if (!other) return res.status(404).json({ message: 'User not found' });

    let chat = await Chat.findOne({ isGroup: false, members: { $all: [req.user.id, userId], $size: 2 } });
    if (!chat) {
      chat = await Chat.create({ isGroup: false, members: [req.user.id, userId] });
    }
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

exports.createGroupChat = async (req, res) => {
  try {
    const { name, members, onlyAdminsCanSend } = req.body;
    let membersArray = members;
    if (typeof members === 'string') {
      try {
        membersArray = JSON.parse(members);
      } catch (e) {
        membersArray = [];
      }
    }

    if (!name || !Array.isArray(membersArray) || membersArray.length === 0)
      return res.status(400).json({ message: 'name and members[] required' });

    const uniqueMembers = Array.from(new Set([req.user.id, ...membersArray]));

    let avatarUrl = null;
    if (req.file) {
      const { uploadToCloudinary } = require('../services/uploadService');
      avatarUrl = await uploadToCloudinary(req.file.path);
    }

    const chat = await Chat.create({
      isGroup: true,
      name,
      members: uniqueMembers,
      admins: [req.user.id],
      avatarUrl,
      onlyAdminsCanSend: onlyAdminsCanSend === 'true' || onlyAdminsCanSend === true
    });
    res.json(chat);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

exports.renameGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.isGroup) return res.status(404).json({ message: 'Group not found' });
    if (!chat.admins.map(String).includes(req.user.id)) return res.status(403).json({ message: 'Not admin' });
    chat.name = name || chat.name;
    await chat.save();
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to rename group' });
  }
};

exports.updateMembers = async (req, res) => {
  try {
    const { action, userId } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.isGroup) return res.status(404).json({ message: 'Group not found' });
    if (!chat.admins.map(String).includes(req.user.id)) return res.status(403).json({ message: 'Not admin' });

    if (action === 'add' && userId) {
      const set = new Set(chat.members.map(String));
      set.add(String(userId));
      chat.members = Array.from(set);
    } else if (action === 'remove' && userId) {
      chat.members = chat.members.filter(m => String(m) !== String(userId));
    }
    await chat.save();
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update members' });
  }
};

exports.acceptChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const userId = req.user.id;
    if (!chat.acceptedBy.map(String).includes(userId)) {
      chat.acceptedBy.push(userId);
      await chat.save();
    }
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to accept chat' });
  }
};

exports.blockChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const userId = req.user.id;
    if (!chat.blockedBy.map(String).includes(userId)) {
      chat.blockedBy.push(userId);
      // If blocking, also remove from acceptedBy if present, to be safe? 
      // Or just rely on blockedBy check. Let's just add to blockedBy.
      await chat.save();
    }
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: 'Failed to block chat' });
  }
};
