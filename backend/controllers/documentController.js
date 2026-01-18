const Document = require('../models/Document');
const { encryptBuffer, decryptBuffer } = require('../utils/encryption');
const logger = require('../utils/logger');

exports.uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    try {
        const encrypted = encryptBuffer(req.file.buffer);

        const doc = new Document({
            user: req.user.id,
            filename: req.file.filename || req.file.originalname, // Multer with memory storage uses originalname
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            encryptedContent: encrypted
        });

        await doc.save();

        logger.info({
            message: 'File Uploaded',
            userId: req.user.id,
            email: req.user.email,
            filename: doc.originalName,
            timestamp: new Date()
        });

        res.status(201).json({ msg: 'File uploaded and encrypted successfully', docId: doc.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        // Patient sees own, Doctor sees all (or specific logic)
        let docs;
        if (req.user.role === 'patient') {
            docs = await Document.find({ user: req.user.id }).select('-encryptedContent');
        } else if (req.user.role === 'doctor' || req.user.role === 'admin') {
            // For demo, doctors see all. In real app, shared specifically.
            docs = await Document.find().populate('user', 'email').select('-encryptedContent');
        } else {
            return res.status(403).json({ msg: 'Unauthorized' });
        }
        res.json(docs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        // Access Control
        if (req.user.role === 'patient' && doc.user.toString() !== req.user.id) {
            logger.warn({
                message: 'Unauthorized Access Attempt',
                userId: req.user.id,
                docId: doc.id,
                timestamp: new Date()
            });
            return res.status(403).json({ msg: 'Access Denied' });
        }

        // Decrypt
        const decrypted = decryptBuffer(doc.encryptedContent);

        logger.info({
            message: 'File Accessed/Decrypted',
            userId: req.user.id,
            docId: doc.id,
            accessBy: req.user.role,
            timestamp: new Date()
        });

        res.set('Content-Type', doc.mimeType);
        res.set('Content-Disposition', `attachment; filename="${doc.originalName}"`);
        res.send(decrypted);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
