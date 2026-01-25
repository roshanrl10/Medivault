const crypto = require('crypto');
const algorithm = 'aes-256-gcm';

// Use a dedicated MASTER_KEY from env, or fallback (securely warning in logs).
// For assignment: "Never store the encryption key in the same table as the data. Use an environment variable."
const getMasterKey = () => {
    if (process.env.MASTER_KEY) {
        // console.log('Master Key Loaded:', process.env.MASTER_KEY.substring(0, 10) + '...'); // DEBUG
        return Buffer.from(process.env.MASTER_KEY, 'hex');
    }
    return crypto.createHash('sha256').update(process.env.SESSION_SECRET || 'dev_secret').digest();
};

const masterKey = getMasterKey();
// Server side private key for signing (For the "Digital Signature" feature)
// in real world, this would be an RSA Private Key loaded from file/vault.
// For this assignment, we use an HMAC with a separate secret key.
const signingKey = crypto.createHash('sha256').update('medivault_signing_secret').digest();

exports.encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, masterKey, iv);

    // GCM requires separate calls usually, but update/final work standardly in Node
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Format: IV (16) + AuthTag (16) + EncryptedData (n)
    return Buffer.concat([iv, authTag, encrypted]);
};

exports.decryptBuffer = (buffer) => {
    // Parse
    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(16, 32);
    const encrypted = buffer.slice(32);

    const decipher = crypto.createDecipheriv(algorithm, masterKey, iv);
    decipher.setAuthTag(authTag);

    // Will throw error if tampering detected (GCM standard auth check)
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

// "The Digital Signature Integrity Check"
// Generate SHA-256 Hash of the original data and Sign it.
exports.generateSignature = (buffer) => {
    // Generate Hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    // Sign Hash (HMAC)
    const signature = crypto.createHmac('sha256', signingKey).update(hash).digest('hex');
    return { hash, signature };
};

exports.verifySignature = (buffer, originalHash, originalSignature) => {
    const { hash, signature } = exports.generateSignature(buffer);
    if (hash !== originalHash) return false;
    if (signature !== originalSignature) return false;
    return true;
};
