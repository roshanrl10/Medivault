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
    iv: {
        type: Buffer, // Stored with content in utils usually, but explicit here if needed. 
        // Utils implementation prepends IV, so we just store the full blob in encryptedContent
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
