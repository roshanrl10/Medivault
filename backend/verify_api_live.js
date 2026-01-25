const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');
require('dotenv').config();

// Ignore self-signed certs for this test script
const agent = new https.Agent({
    rejectUnauthorized: false
});

const API_URL = `https://localhost:${process.env.PORT || 5001}/api`;
const TEST_FILE_PATH = path.join(__dirname, 'test_upload.txt');
const DOWNLOAD_PATH = path.join(__dirname, 'test_download.txt');

// Create a dummy file
fs.writeFileSync(TEST_FILE_PATH, 'Live API Test Content ' + Date.now());

const run = async () => {
    console.log('🚀 Starting Live API Verification...');

    try {
        // 1. Login (using a known test user or assume one exists)
        // We need valid credentials. Since we don't know them easily, 
        // we'll attempt to register a temp user or use a hardcoded dev acc if available.
        // For this environment, let's try to REGISTER a new temp user to be safe.
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'TestPassword123!';

        console.log(`[1/4] Registering temp user: ${email}`);
        let cookie;
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
                confirmPassword: password
            }, { httpsAgent: agent });

            // Login to get cookie
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            }, { httpsAgent: agent });

            const cookies = loginRes.headers['set-cookie'];
            if (!cookies) throw new Error('No cookies received');
            cookie = cookies.find(c => c.startsWith('jwt=')); // Find jwt cookie
            console.log('✅ Login Successful. Cookie received.');
        } catch (err) {
            console.warn('⚠️ Registration failed (maybe disabled?), trying Login with existing dev account...');
            // Fallback: This might fail if no dev account known. 
            // Better strategy: Use mongoose to CREATE a user first if this fails? 
            // But we want to test "live" server...
            // Let's assume registration works or fallback to a known seeded user if user provided one.
            // For now, if reg fails, we might be stuck unless we know a user.
            throw err;
        }

        // 2. Upload
        console.log('[2/4] Uploading file...');
        const form = new FormData();
        form.append('document', fs.createReadStream(TEST_FILE_PATH));

        const uploadRes = await axios.post(`${API_URL}/documents/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'Cookie': cookie
            },
            httpsAgent: agent
        });

        const docId = uploadRes.data.docId;
        console.log(`✅ Upload Successful. Doc ID: ${docId}`);

        // 3. Download
        console.log('[3/4] Downloading file...');
        const downloadRes = await axios.get(`${API_URL}/documents/download/${docId}`, {
            headers: { 'Cookie': cookie },
            responseType: 'arraybuffer', // Get raw bytes
            httpsAgent: agent
        });

        fs.writeFileSync(DOWNLOAD_PATH, downloadRes.data);
        console.log('✅ Download Successful.');

        // 4. Verify Content
        console.log('[4/4] Verifying content...');
        const original = fs.readFileSync(TEST_FILE_PATH, 'utf8');
        const downloaded = fs.readFileSync(DOWNLOAD_PATH, 'utf8');

        if (original === downloaded) {
            console.log('✅✅ SUCCESS: Content matches perfectly.');
        } else {
            console.error('❌ FAILURE: Content mismatch!');
            console.log(`Original: ${original}`);
            console.log(`Downloaded: ${downloaded}`);
        }

        // Cleanup
        // await axios.delete(`${API_URL}/documents/${docId}`, { headers: { 'Cookie': cookie }, httpsAgent: agent });

    } catch (err) {
        console.error('❌ API Test Failed:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    } finally {
        if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
        if (fs.existsSync(DOWNLOAD_PATH)) fs.unlinkSync(DOWNLOAD_PATH);
    }
};

run();
