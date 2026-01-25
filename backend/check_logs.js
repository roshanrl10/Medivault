const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB. Querying Audit Logs...');

        // Find recent FILE_TAMPERED events (last 1 hour)
        const recentLogs = await AuditLog.find({
            action: 'FILE_TAMPERED',
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        }).sort({ createdAt: -1 }).limit(5);

        if (recentLogs.length > 0) {
            console.log('\n❌ Found recent TAMPERED events:');
            recentLogs.forEach(log => {
                console.log(`[${log.createdAt.toISOString()}] Reason: ${log.details.reason}, DocID: ${log.details.docId}`);
            });
        } else {
            console.log('\n✅ No FILE_TAMPERED events found in the last hour.');
            // Check for any recent logs to verify logging works
            const anyLog = await AuditLog.findOne().sort({ createdAt: -1 });
            if (anyLog) {
                console.log(`(Last log seen: [${anyLog.createdAt.toISOString()}] ${anyLog.action})`);
            } else {
                console.log('(No logs found at all)');
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

run();
