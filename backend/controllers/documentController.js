const Document = require('../models/Document');
const { encryptBuffer, decryptBuffer, generateSignature, verifySignature } = require('../utils/encryption');
const { logAction } = require('../services/auditService');

exports.uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    try {
        // 1. Generate Integrity Data (Hash & Sign ORIGINAL data)
        const { hash, signature } = generateSignature(req.file.buffer);

        // 2. Encrypt Data (AES-256-GCM)
        const encrypted = encryptBuffer(req.file.buffer);

        const doc = new Document({
            user: req.user.id,
            filename: req.file.filename || req.file.originalname,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            encryptedContent: encrypted,
            fileHash: hash,
            digitalSignature: signature
        });

        await doc.save();

        // 3. Audit Log
        await logAction(req.user.id, req.user.email, 'FILE_UPLOAD', req, {
            filename: doc.originalName,
            docId: doc.id
        });

        res.status(201).json({ msg: 'File uploaded, encrypted, and signed successfully', docId: doc.id });
    } catch (err) {
        console.error(err);
        await logAction(req.user?.id, req.user?.email, 'UPLOAD_FAILURE', req, { error: err.message });
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        let docs;
        if (req.user.role === 'patient') {
            docs = await Document.find({ user: req.user.id }).select('-encryptedContent');
        } else if (req.user.role === 'doctor' || req.user.role === 'admin') {
            // Doctors can view all for this scope, or selective based on permission
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
        // Patients can only access their own. Doctors can access any (RBAC). 
        // Admins can see metadata but NOT decrypt content (Implementation Choice: Deny download for Admin)
        if (req.user.role === 'admin') {
            await logAction(req.user.id, req.user.email, 'UNAUTHORIZED_ACCESS', req, {
                reason: 'Admin attempted to view medical record',
                docId: doc.id
            });
            return res.status(403).json({ msg: 'Admins cannot view medical records' });
        }

        if (req.user.role === 'patient' && doc.user.toString() !== req.user.id) {
            await logAction(req.user.id, req.user.email, 'UNAUTHORIZED_ACCESS', req, {
                reason: 'Patient accessed another user file',
                docId: doc.id
            });
            return res.status(403).json({ msg: 'Access Denied' });
        }

        // 1. Decrypt
        // If AES-GCM tag check fails, this throws an error (Integrity Check 1)
        let decrypted;
        try {
            decrypted = decryptBuffer(doc.encryptedContent);
        } catch (decryptErr) {
            await logAction(req.user.id, req.user.email, 'FILE_TAMPERED', req, {
                reason: 'Decryption Auth Tag Failed',
                docId: doc.id
            });
            return res.status(500).json({ msg: 'Integrity Error: File Corrupted or Tampered' });
        }

        // 2. Verify Digital Signature (Integrity Check 2)
        // We re-compute the hash/sig of the decrypted content and match DB
        const isValid = verifySignature(decrypted, doc.fileHash, doc.digitalSignature);

        if (!isValid) {
            await logAction(req.user.id, req.user.email, 'FILE_TAMPERED', req, {
                reason: 'Digital Signature Mismatch',
                docId: doc.id
            });
            return res.status(500).json({ msg: 'CRITICAL SECURITY ALERT: Digital Signature Mismatch. File has been tampered with.' });
        }

        await logAction(req.user.id, req.user.email, 'FILE_ACCESS', req, {
            docId: doc.id,
            filename: doc.originalName
        });

        res.set('Content-Type', doc.mimeType);
        res.set('Content-Disposition', `attachment; filename="${doc.originalName}"`);
        res.send(decrypted);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
