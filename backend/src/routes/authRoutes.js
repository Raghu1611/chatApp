const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/request-email-verification', auth.requestEmailVerification);
router.post('/verify-email', auth.verifyEmail);
router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);

router.post('/forgot-password/request-otp', auth.requestPasswordResetOtp);
router.post('/forgot-password/verify-otp', auth.verifyPasswordResetOtp);
router.post('/forgot-password/reset', auth.resetPassword);

module.exports = router;
