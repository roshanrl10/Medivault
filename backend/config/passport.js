const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const { logAction } = require('../services/auditService');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                // Log failed attempt for non-existent user? (Optional, maybe for IP protection)
                return done(null, false, { message: 'Email not registered' });
            }

            // Check if account is locked
            if (user.lock_until && user.lock_until > Date.now()) {
                const remaining = Math.ceil((user.lock_until - Date.now()) / 60000);
                await logAction(user.id, user.email, 'LOGIN_FAILURE', req, {
                    reason: 'Account Locked',
                    remainingMinutes: remaining
                });
                return done(null, false, { message: `Account is temporarily locked. Try again in ${remaining} minutes.` });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                // Increment failed attempts
                user.failed_login_attempts += 1;

                // Lock account if 5 or more failed attempts
                if (user.failed_login_attempts >= 5) {
                    let lockoutDuration = 1; // Default 1 minute for 5th attempt
                    if (user.failed_login_attempts > 5) {
                        lockoutDuration = 5; // Increase to 5 minutes for subsequent attempts
                    }

                    user.lock_until = Date.now() + lockoutDuration * 60 * 1000;
                    await user.save();

                    await logAction(user.id, user.email, 'LOGIN_FAILURE', req, {
                        reason: 'Max Attempts Reached - Locked',
                        attempts: user.failed_login_attempts,
                        lockoutDuration: lockoutDuration
                    });

                    return done(null, false, { message: `Account locked for ${lockoutDuration} minute(s) due to multiple failed attempts.` });
                }

                await user.save();

                // Log failure
                await logAction(user.id, user.email, 'LOGIN_FAILURE', req, {
                    attempts: user.failed_login_attempts
                });

                return done(null, false, { message: 'Password incorrect' });
            }

            // Reset failed attempts on success
            if (user.failed_login_attempts > 0 || user.lock_until) {
                user.failed_login_attempts = 0;
                user.lock_until = undefined;
                await user.save();
            }

            await logAction(user.id, user.email, 'LOGIN_SUCCESS', req);
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
