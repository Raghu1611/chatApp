const express = require('express');
const { requireAuth } = require('../middleware/auth');
const chat = require('../controllers/chatController');

const router = express.Router();

router.use(requireAuth);

const { upload } = require('../services/uploadService');

router.get('/', chat.listMyChats);
router.get('/:id', chat.getChat);
router.post('/', chat.createDirectChat);
router.post('/group', upload.single('avatar'), chat.createGroupChat);
router.patch('/:id', chat.renameGroup);
router.patch('/:id/members', chat.updateMembers);
router.patch('/:id/pin', chat.togglePin);
router.patch('/:id/accept', chat.acceptChat);
router.patch('/:id/block', chat.blockChat);

module.exports = router;
