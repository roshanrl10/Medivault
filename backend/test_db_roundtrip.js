const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User'); // Needed for ref
const { encryptBuffer, decryptBuffer, generateSignature, verifySignature } = require('./utils/encryption');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create a dummy user ID if needed, or just use a random ObjectId for testing if schema allows (it refs User, so valid ID better)
        // We'll create a temp user or find one.
        let user = await User.findOne();
        if (!user) {
            console.log('No users found, cannot create linked doc. Exiting.');
            return;
        }

        const originalContent = Buffer.from('Roundtrip Test Content ' + Date.now());
        console.log('Original Content:', originalContent.toString());

        // Encrypt
        const encrypted = encryptBuffer(originalContent);
        console.log('Encrypted Buffer Length:', encrypted.length);

        // Sign
        const { hash, signature } = generateSignature(originalContent);

        // Save
        const doc = new Document({
            user: user._id,
            filename: 'test_roundtrip.txt',
            originalName: 'test_roundtrip.txt',
            mimeType: 'text/plain',
            encryptedContent: encrypted,
            fileHash: hash,
            digitalSignature: signature
        });

        await doc.save();
        console.log('Document Saved with ID:', doc._id);

        // Retrieve
        const fetchedDoc = await Document.findById(doc._id);
        console.log('Document Retrieved.');
        console.log('Fetched Encrypted Length:', fetchedDoc.encryptedContent.length);

        // Decrypt
        const decrypted = decryptBuffer(fetchedDoc.encryptedContent);
        console.log('Decrypted Content:', decrypted.toString());

        if (decrypted.toString() === originalContent.toString()) {
            console.log('✅ Roundtrip SUCCESS');
        } else {
            console.error('❌ Roundtrip DATA MISMATCH');
        }

        // Cleanup
        await Document.deleteOne({ _id: doc._id });
        console.log('Cleanup Done');

    } catch (err) {
        console.error('❌ Roundtrip FAILED:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

run();
