const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const u of users) {
            console.log(`\nUser: ${u.email}`);
            console.log(`  Role: ${u.role}`);
            console.log(`  MFA Enabled: ${u.mfa_enabled}`);
            console.log(`  Failed Attempts: ${u.failed_login_attempts}`);
            console.log(`  Lock Until: ${u.lock_until}`);

            // Unlock user
            u.lock_until = undefined;
            u.failed_login_attempts = 0;
            // u.mfa_enabled = false; // Uncomment to disable MFA if stuck
            await u.save();
            console.log('  -> Unlocked and reset failed attempts.');
        }

        console.log('\nDone.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
