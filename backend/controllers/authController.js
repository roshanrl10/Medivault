const User = require('../models/User');
const passport = require('passport');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

exports.register = async (req, res) => {
    const { email, password, role } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            email,
            password_hash: password, // Pre-save hook will hash this
            role
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ msg: info.message });

        req.logIn(user, (err) => {
            if (err) return next(err);

            // If MFA is enabled, require code verification
            if (user.mfa_enabled) {
                return res.json({
                    msg: 'MFA Required',
                    user: {
                        id: user.id,
                        role: user.role,
                        mfa_enabled: true
                    }
                });
            }

            return res.json({
                msg: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    mfa_enabled: false
                }
            });
        });
    })(req, res, next);
};

exports.setupMFA = async (req, res) => {
    if (!req.user) return res.status(401).send('Unauthorized');

    // Generate secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Save secret to user (temporarily or permanently depends on flow, here we save but don't enable yet)
    req.user.mfa_secret = secret;
    await req.user.save();

    // Generate QR code
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) return res.status(500).json({ msg: 'Error generating QR code' });
        res.json({ secret: secret.base32, qr_code: data_url });
    });
};

exports.verifyMFA = async (req, res) => {
    const { token, userId } = req.body; // userId used if not fully logged in yet
    let user = req.user;

    // Implementation for login-phase verification where req.user might not be set in session yet if using stateless or 2-step
    // Note: Since we use session, req.user is set after successful passport login. 
    // If we want to enforce MFA *before* full session access, we'd need a temp session or partial auth state.
    // For this assignment, we will assume the user is "logged in" but needs to verify to access sensitive routes or finalize login.
    // Simplifying: User logs in -> (if mfa_enabled) -> Frontend sees flag -> Prompts code -> calls verifyMFA.

    if (!user && userId) {
        user = await User.findById(userId);
    }

    if (!user) return res.status(401).json({ msg: 'Unauthorized' });

    const verified = speakeasy.totp.verify({
        secret: user.mfa_secret.base32,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        user.mfa_enabled = true; // Enable if not already
        await user.save();

        // Ensure session is fully valid/authorized for sensitive actions if needed
        res.json({ msg: 'MFA Verified', mfa_verified: true });
    } else {
        res.status(400).json({ msg: 'Invalid Token' });
    }
};

exports.checkSession = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ msg: 'Logged out' });
    });
};
