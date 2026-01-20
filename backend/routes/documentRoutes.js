const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated, ensureRole } = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');

// Multer config for memory storage (encrypt before save)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', ensureAuthenticated, upload.single('file'), documentController.uploadDocument);
router.get('/', ensureAuthenticated, documentController.getDocuments);
router.get('/:id', ensureAuthenticated, documentController.downloadDocument);
router.post('/:id/share', ensureAuthenticated, documentController.shareDocument);
router.post('/:id/revoke', ensureAuthenticated, documentController.revokeAccess);

module.exports = router;
