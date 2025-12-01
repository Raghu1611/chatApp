const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../services/uploadService');

router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, upload.single('avatar'), userController.updateProfile);
router.put('/password', requireAuth, userController.changePassword);
router.get('/search', requireAuth, userController.searchUsers);
router.get('/:id', requireAuth, userController.getUserById);
router.post('/:userId/block', requireAuth, userController.blockUser);
router.delete('/:userId/block', requireAuth, userController.unblockUser);
router.patch('/me/bio', requireAuth, userController.updateBio);

module.exports = router;
