const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated, ensureRole } = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');

// Multer config for memory storage (encrypt before save)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
        }
    }
});

router.post('/upload', ensureAuthenticated, upload.single('file'), documentController.uploadDocument);
router.get('/', ensureAuthenticated, documentController.getDocuments);
router.get('/:id', ensureAuthenticated, documentController.downloadDocument);
router.post('/:id/share', ensureAuthenticated, documentController.shareDocument);
router.post('/:id/revoke', ensureAuthenticated, documentController.revokeAccess);

module.exports = router;
