const User = require('../models/User');
const passport = require('passport');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { logAction } = require('../services/auditService');

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
        await logAction(user.id, email, 'REGISTER_SUCCESS', req, { role });

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        await logAction(null, email, 'REGISTER_FAILURE', req, { error: err.message });
        res.status(500).send('Server Error');
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ msg: info.message });

        req.logIn(user, async (err) => {
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

    // Save secret to user
    req.user.mfa_secret = secret;
    await req.user.save();

    // Generate QR code
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) return res.status(500).json({ msg: 'Error generating QR code' });
        res.json({ secret: secret.base32, qr_code: data_url });
    });
};

exports.verifyMFA = async (req, res) => {
    const { token, userId } = req.body;
    let user = req.user;

    if (!user && userId) {
        user = await User.findById(userId);
    }

    if (!user) return res.status(401).json({ msg: 'Unauthorized' });

    const verified = speakeasy.totp.verify({
        secret: user.mfa_secret.base32,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 30sec skew
    });

    if (verified) {
        user.mfa_enabled = true;
        await user.save();

        await logAction(user.id, user.email, 'MFA_SUCCESS', req);

        res.json({ msg: 'MFA Verified', mfa_verified: true });
    } else {
        await logAction(user.id, user.email, 'MFA_FAILURE', req);
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

exports.logout = async (req, res, next) => {
    const user = req.user;
    if (user) {
        await logAction(user.id, user.email, 'LOGOUT', req);
    }

    req.logout((err) => {
        if (err) return next(err);
        res.json({ msg: 'Logged out' });
    });
};
