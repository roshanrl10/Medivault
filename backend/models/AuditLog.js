const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null if failure/anonymous
    },
    userEmail: {
        type: String,
        required: false
    },
    action: {
        type: String,
        required: true,
        enum: ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'MFA_SUCCESS', 'MFA_FAILURE', 'FILE_UPLOAD', 'FILE_ACCESS', 'FILE_TAMPERED', 'LOGOUT', 'REGISTER_SUCCESS', 'REGISTER_FAILURE', 'UNAUTHORIZED_ACCESS']
    },
    ipAddress: {
        type: String,
        required: false
    },
    details: {
        type: Object,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
