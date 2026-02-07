const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/setup-mfa', ensureAuthenticated, authController.setupMFA);
router.post('/verify-mfa', authController.verifyMFA); // Public for login flow, requires userId in body if not auth
router.get('/session', authController.checkSession); // Handles its own token check
router.post('/logout', authController.logout);
router.get('/logs', ensureAuthenticated, authController.getAuditLogs);
router.get('/doctors', ensureAuthenticated, authController.getDoctors);


router.post('/change-password', ensureAuthenticated, authController.changePassword);

module.exports = router;
