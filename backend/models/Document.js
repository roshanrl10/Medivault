const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    encryptedContent: {
        type: Buffer,
        required: true
    },
    // Integrity Fields
    fileHash: {
        type: String,
        required: true
    },
    digitalSignature: {
        type: String,
        required: true
    },
    // Access Control
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
