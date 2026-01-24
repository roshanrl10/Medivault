const { encryptBuffer, decryptBuffer } = require('./utils/encryption');
require('dotenv').config();

console.log('Testing Encryption/Decryption...');

try {
    const original = Buffer.from('Test Content');
    console.log('Original:', original.toString());

    const encrypted = encryptBuffer(original);
    console.log('Encrypted (hex):', encrypted.toString('hex'));
    console.log('Encrypted Length:', encrypted.length);

    const decrypted = decryptBuffer(encrypted);
    console.log('Decrypted:', decrypted.toString());

    if (decrypted.toString() === original.toString()) {
        console.log('✅ Integrity Check Passed');
    } else {
        console.error('❌ Data Mismatch');
    }

} catch (err) {
    console.error('❌ Decryption Failed:', err.message);
}
