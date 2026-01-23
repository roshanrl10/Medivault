const Document = require('../models/Document');
const { encryptBuffer, decryptBuffer, generateSignature, verifySignature } = require('../utils/encryption');
const { logAction } = require('../services/auditService');

exports.uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    try {
        // 1. Validate Magic Bytes (Signature)
        const fileSignature = req.file.buffer.toString('hex', 0, 4).toUpperCase();
        const validSignatures = {
            '25504446': 'application/pdf', // %PDF
            'FFD8FFE0': 'image/jpeg',
            'FFD8FFE1': 'image/jpeg',
            'FFD8FFEE': 'image/jpeg',
            '89504E47': 'image/png'
        };

        let isValidSignature = false;
        // Simple prefix check
        for (const sig in validSignatures) {
            if (fileSignature.startsWith(sig)) {
                isValidSignature = true;
                break;
            }
        }

        // Strict PNG check
        if (!isValidSignature && fileSignature === '89504E47') isValidSignature = true;

        if (!isValidSignature) {
            // Fallback for some JPEG variations or extend list as needed
            if (req.file.mimetype === 'image/jpeg' && fileSignature.startsWith('FFD8')) {
                isValidSignature = true;
            }
        }

        if (!isValidSignature) {
            return res.status(400).json({ msg: 'Security Alert: File signature mismatch. Upload rejected.' });
        }

        // 2. Generate Integrity Data (Hash & Sign ORIGINAL data)
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
        } else if (req.user.role === 'doctor') {
            // Doctors can ONLY see documents explicitly shared with them
            docs = await Document.find({ sharedWith: req.user.id })
                .populate('user', 'email')
                .select('-encryptedContent');
        } else if (req.user.role === 'admin') {
            // Admins can see metadata of all docs
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

exports.shareDocument = async (req, res) => {
    const { doctorId } = req.body;
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        // Only owner can share
        if (doc.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (!doc.sharedWith.includes(doctorId)) {
            doc.sharedWith.push(doctorId);
            await doc.save();
            await logAction(req.user.id, req.user.email, 'DOC_SHARED', req, { docId: doc.id, doctorId });
        }

        res.json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.revokeAccess = async (req, res) => {
    const { doctorId } = req.body;
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        // Only owner can revoke
        if (doc.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        doc.sharedWith = doc.sharedWith.filter(id => id.toString() !== doctorId);
        await doc.save();
        await logAction(req.user.id, req.user.email, 'ACCESS_REVOKED', req, { docId: doc.id, doctorId });

        res.json(doc);
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
        if (req.user.role === 'admin') {
            await logAction(req.user.id, req.user.email, 'UNAUTHORIZED_ACCESS', req, {
                reason: 'Admin attempted to view medical record',
                docId: doc.id
            });
            return res.status(403).json({ msg: 'Admins cannot view medical records' });
        }

        const isOwner = doc.user.toString() === req.user.id;
        const isShared = doc.sharedWith.includes(req.user.id);

        if (!isOwner && !isShared) {
            await logAction(req.user.id, req.user.email, 'UNAUTHORIZED_ACCESS', req, {
                reason: 'User accessed unshared file',
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
