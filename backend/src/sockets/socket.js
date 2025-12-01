const { verifyAccessToken } = require('../services/tokenService');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const onlineUsers = new Set();

function registerSocketHandlers(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token);
      socket.user = { id: payload.id, email: payload.email };
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    try {
      await User.findByIdAndUpdate(socket.user.id, { $set: { lastSeen: new Date() } });
      socket.join(socket.user.id); // Join personal room
      onlineUsers.add(socket.user.id);
      io.emit('user:online', { userId: socket.user.id });
      socket.emit('online:users', Array.from(onlineUsers));
    } catch { }

    socket.on('chat:join', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.map(String).includes(socket.user.id)) return;
        socket.join(chatId);
      } catch { }
    });

    socket.on('typing:start', ({ chatId }) => {
      socket.to(chatId).emit('typing:start', { userId: socket.user.id, chatId });
    });
    socket.on('typing:stop', ({ chatId }) => {
      socket.to(chatId).emit('typing:stop', { userId: socket.user.id, chatId });
    });

    socket.on('message:send', async ({ chatId, type = 'text', content, url, replyTo }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.map(String).includes(socket.user.id)) return;

        // Check for admin-only restriction
        if (chat.isGroup && chat.onlyAdminsCanSend && !chat.admins.map(String).includes(socket.user.id)) {
          // Optionally emit an error event back to the user
          return;
        }

        // Auto-accept chat if sending message
        if (!chat.acceptedBy.map(String).includes(socket.user.id)) {
          chat.acceptedBy.push(socket.user.id);
          await chat.save();
        }

        const msg = await Message.create({
          chat: chatId,
          sender: socket.user.id,
          type,
          content,
          url,
          replyTo,
          readBy: [socket.user.id],
          deliveredTo: [socket.user.id] // Sender has "delivered" it
        });
        await Chat.findByIdAndUpdate(chatId, { $set: { lastMessage: msg._id } });
        const populated = await msg.populate([
          { path: 'sender', select: 'name email avatarUrl' },
          { path: 'replyTo', select: 'content sender type url', populate: { path: 'sender', select: 'name' } }
        ]);
        io.to(chatId).emit('message:new', { chatId, message: populated });
      } catch { }
    });

    socket.on('message:delivered', async ({ messageId, chatId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (!msg.deliveredTo.map(String).includes(socket.user.id)) {
          msg.deliveredTo.push(socket.user.id);
          await msg.save();
        }
        socket.to(chatId).emit('message:delivered', { messageId, userId: socket.user.id, chatId });
      } catch { }
    });

    socket.on('message:read', async ({ messageId, chatId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (!msg.readBy.map(String).includes(socket.user.id)) {
          msg.readBy.push(socket.user.id);
          await msg.save();
        }
        socket.to(chatId).emit('message:read', { messageId, userId: socket.user.id, chatId });
      } catch { }
    });

    socket.on('message:react', async ({ messageId, chatId, emoji }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        // Remove existing reaction by this user
        msg.reactions = msg.reactions.filter(r => r.user.toString() !== socket.user.id);
        // Add new reaction
        msg.reactions.push({ user: socket.user.id, emoji });

        await msg.save();
        io.to(chatId).emit('message:react', { messageId, userId: socket.user.id, emoji, chatId });
      } catch (e) { console.error(e); }
    });

    socket.on('message:delete', async ({ messageId, chatId, deleteType }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (msg.sender.toString() !== socket.user.id) return;

        if (deleteType === 'forMe') {
          // Delete for me - add user to deletedFor array
          if (!msg.deletedFor.map(String).includes(socket.user.id)) {
            msg.deletedFor.push(socket.user.id);
            await msg.save();
          }
          // Only emit to the user who deleted it
          socket.emit('message:deleted', { messageId, chatId, deleteType: 'forMe' });
        } else if (deleteType === 'forEveryone') {
          // Check if message is within 2 minutes
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
          if (new Date(msg.createdAt) < twoMinutesAgo) {
            socket.emit('error', { message: 'Can only delete for everyone within 2 minutes' });
            return;
          }

          msg.isDeleted = true;
          msg.content = 'This message was deleted';
          msg.type = 'text';
          msg.url = null;
          await msg.save();

          // Emit to everyone in the chat
          io.to(chatId).emit('message:deleted', { messageId, chatId, deleteType: 'forEveryone' });
        }
      } catch (e) { console.error(e); }
    });

    socket.on('message:edit', async ({ messageId, chatId, content }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (msg.sender.toString() !== socket.user.id) return;
        if (msg.isDeleted) return;

        // Check if message is within 2 minutes
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (new Date(msg.createdAt) < twoMinutesAgo) {
          socket.emit('error', { message: 'Can only edit messages within 2 minutes' });
          return;
        }

        msg.content = content.trim();
        msg.isEdited = true;
        msg.editedAt = new Date();
        await msg.save();

        io.to(chatId).emit('message:edited', { messageId, chatId, content: msg.content, isEdited: true, editedAt: msg.editedAt });
      } catch (e) { console.error(e); }
    });

    // WebRTC Signaling
    socket.on('call:start', ({ toUserId, offer }) => {
      const room = io.sockets.adapter.rooms.get(toUserId);
      if (!room || room.size === 0) {
        socket.emit('call:failed', { message: 'User is offline' });
        return;
      }
      io.to(toUserId).emit('call:incoming', { from: socket.user.id, offer });
    });

    socket.on('call:answer', ({ toUserId, answer }) => {
      io.to(toUserId).emit('call:accepted', { from: socket.user.id, answer });
    });

    socket.on('call:ice-candidate', ({ toUserId, candidate }) => {
      io.to(toUserId).emit('call:ice-candidate', { from: socket.user.id, candidate });
    });

    socket.on('call:end', ({ toUserId }) => {
      io.to(toUserId).emit('call:ended', { from: socket.user.id });
    });

    socket.on('disconnect', async () => {
      try {
        onlineUsers.delete(socket.user.id);
        await User.findByIdAndUpdate(socket.user.id, { $set: { lastSeen: new Date() } });
        io.emit('user:offline', { userId: socket.user.id, lastSeen: new Date() });
      } catch { }
    });
  });
}

module.exports = registerSocketHandlers;
