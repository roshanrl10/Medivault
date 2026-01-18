const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Email not registered' });
            }

            // Check if account is locked
            if (user.lock_until && user.lock_until > Date.now()) {
                return done(null, false, { message: 'Account is temporarily locked due to multiple failed attempts' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                // Increment failed attempts
                user.failed_login_attempts += 1;

                // Lock account if 5 failed attempts
                if (user.failed_login_attempts >= 5) {
                    user.lock_until = Date.now() + 15 * 60 * 1000; // 15 minutes lock
                    await user.save();
                    return done(null, false, { message: 'Account locked for 15 minutes' });
                }

                await user.save();
                return done(null, false, { message: 'Password incorrect' });
            }

            // Reset failed attempts on success
            user.failed_login_attempts = 0;
            user.lock_until = undefined;
            await user.save();

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
