const AuditLog = require('../models/AuditLog');

const logAction = async (userId, userEmail, action, req, details = {}) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const log = new AuditLog({
            userId,
            userEmail,
            action,
            ipAddress: ip,
            userAgent,
            details
        });

        await log.save();
    } catch (err) {
        console.error('Audit Logging Failed:', err); // Fallback to console
    }
};

module.exports = { logAction };
