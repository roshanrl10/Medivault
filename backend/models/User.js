const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },
    mfa_secret: {
        type: Object, // Stores ASCII, hex, base32, otpauth_url
        default: null
    },
    mfa_enabled: {
        type: Boolean,
        default: false
    },
    failed_login_attempts: {
        type: Number,
        default: 0
    },
    lock_until: {
        type: Date
    }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password_hash')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);
