const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
// Key should be 32 bytes (256 bits). For demo, using a hash of secret. 
// In production, use a proper random key stored in env/vault.
const secretKey = crypto.createHash('sha256').update(String(process.env.SESSION_SECRET)).digest('base64').substr(0, 32);

exports.encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
};

exports.decryptBuffer = (buffer) => {
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return result;
};
