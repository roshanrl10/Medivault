const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { encryptBuffer, decryptBuffer, generateSignature, verifySignature } = require('./utils/encryption');
require('dotenv').config();

const run = async () => {
    console.log('🔍 Starting Security Verification Suite...');
    let errors = 0;

    // 1. Certificate Check
    console.log('\n[1/5] Checking SSL Certificates...');
    const certPath = path.join(__dirname, 'certificates', 'server.crt');
    const keyPath = path.join(__dirname, 'certificates', 'server.key');
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        console.log('✅ Certificates present.');
    } else {
        console.error('❌ Certificates MISSING.');
        errors++;
    }

    // 2. Encryption Module Check
    console.log('\n[2/5] Testing Encryption Logic...');
    try {
        const originalInfo = 'Secret Info ' + Date.now();
        const buffer = Buffer.from(originalInfo);
        const encrypted = encryptBuffer(buffer);
        const decrypted = decryptBuffer(encrypted);

        if (decrypted.toString() === originalInfo) {
            console.log('✅ Encryption/Decryption Roundtrip successful.');
        } else {
            console.error('❌ Encryption Roundtrip FAILED (Data Mismatch).');
            errors++;
        }
    } catch (err) {
        console.error('❌ Encryption Check Threw Error:', err.message);
        errors++;
    }

    // 3. Signature Module Check
    console.log('\n[3/5] Testing Digital Signatures...');
    try {
        const buffer = Buffer.from('Signed Data');
        const { hash, signature } = generateSignature(buffer);
        const isValid = verifySignature(buffer, hash, signature);
        const isInvalid = verifySignature(Buffer.from('Signed Data tampered'), hash, signature);

        if (isValid && !isInvalid) {
            console.log('✅ Signature Verification successful.');
        } else {
            console.error('❌ Signature Verification FAILED.');
            errors++;
        }
    } catch (err) {
        console.error('❌ Signature Check Threw Error:', err.message);
        errors++;
    }

    // 4. Database Roundtrip
    console.log('\n[4/5] Testing Database Integration...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Document = require('./models/Document');
        // We need a dummy user ID.
        // If no user exists, skip usage of user field (or fail if required)
        // Schema requires user.
        const User = require('./models/User'); // Assuming this exists
        const user = await User.findOne();

        if (user) {
            const content = Buffer.from('DB Test ' + Date.now());
            const { hash, signature } = generateSignature(content);
            const doc = new Document({
                user: user._id,
                filename: 'verify_test.txt',
                originalName: 'verify_test.txt',
                mimeType: 'text/plain',
                encryptedContent: encryptBuffer(content),
                fileHash: hash,
                digitalSignature: signature
            });
            await doc.save();

            const fetched = await Document.findById(doc._id);
            const decrypted = decryptBuffer(fetched.encryptedContent);
            const sigValid = verifySignature(decrypted, fetched.fileHash, fetched.digitalSignature);

            await Document.deleteOne({ _id: doc._id });

            if (decrypted.toString() === content.toString() && sigValid) {
                console.log('✅ Database Roundtrip successful.');
            } else {
                console.error('❌ Database Roundtrip FAILED.');
                errors++;
            }
        } else {
            console.log('⚠️ No users found in DB, skipping DB write test.');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Database Check Failed:', err.message);
        errors++;
        try { await mongoose.disconnect(); } catch (e) { }
    }

    // Report
    console.log('\n----------------------------------------');
    if (errors === 0) {
        console.log('✅✅ SUITE PASSED. System Integrity Verified.');
    } else {
        console.error(`❌❌ SUITE FAILED with ${errors} errors.`);
    }
};

run();
