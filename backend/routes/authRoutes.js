const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/setup-mfa', authController.setupMFA);
router.post('/verify-mfa', authController.verifyMFA);
router.get('/session', authController.checkSession);
router.post('/logout', authController.logout);

module.exports = router;
