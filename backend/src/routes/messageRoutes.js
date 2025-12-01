const express = require('express');
const { requireAuth } = require('../middleware/auth');
const msg = require('../controllers/messageController');

const router = express.Router();

router.use(requireAuth);

const { upload } = require('../services/uploadService');

router.get('/chats/:id/messages', msg.listMessages);
router.patch('/messages/:id/read', msg.markRead);
router.post('/messages/upload', upload.single('image'), msg.uploadMessageImage);
router.delete('/messages/:id', msg.deleteMessage);
router.patch('/messages/:id/edit', msg.editMessage);

module.exports = router;
