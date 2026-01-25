const mongoose = require('mongoose');
const { decryptBuffer, encryptBuffer } = require('./utils/encryption');
require('dotenv').config();
const crypto = require('crypto');

const run = async () => {
    try {
        const keyHex = process.env.MASTER_KEY;
        console.log(`Env MASTER_KEY: ${keyHex ? keyHex.substring(0, 10) + '...' : 'UNDEFINED'}`);

        // Manual Master Key Check
        let effectiveKey;
        if (keyHex) {
            effectiveKey = Buffer.from(keyHex, 'hex');
        } else {
            effectiveKey = crypto.createHash('sha256').update(process.env.SESSION_SECRET || 'dev_secret').digest();
        }
        console.log(`Effective Key (Hex): ${effectiveKey.toString('hex').substring(0, 10)}...`);

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const docs = await Document.find({});
        console.log(`Found ${docs.length} documents.`);

        for (const doc of docs) {
            console.log(`--------------------------------------------------`);
            console.log(`Checking Doc: ${doc.originalName} (${doc._id})`);
            console.log(`Encrypted Size: ${doc.encryptedContent ? doc.encryptedContent.length : 'NULL'}`);

            try {
                const decrypted = decryptBuffer(doc.encryptedContent);
                console.log(`✅ Decryption Successful! Length: ${decrypted.length}`);
            } catch (err) {
                console.error(`❌ Decryption Failed: ${err.message}`);
            }
        }

    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
