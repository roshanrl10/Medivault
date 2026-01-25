const https = require('https');

// Ignore self-signed certs
const agent = new https.Agent({
    rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:5001/api';

// Helper for requests
async function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            agent,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(`${BASE_URL}${path}`, options, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                const text = buffer.toString();
                let json;
                try { json = JSON.parse(text); } catch (e) { }

                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: text,
                    json,
                    buffer
                });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    console.log('🔍 Starting Diagnostic...');

    try {
        // 1. Register a Temp User (to get a fresh account + cookie) or Login if exists
        const email = `diag_${Date.now()}@test.com`;
        const password = 'Password123!';

        console.log(`[1] Registering ${email}...`);
        await request('POST', '/auth/register', { email, password, confirmPassword: password });

        // 2. Login
        console.log('[2] Logging in...');
        const loginRes = await request('POST', '/auth/login', { email, password });

        if (loginRes.status !== 200) {
            console.error('❌ Login Failed:', loginRes.body);
            return;
        }

        const cookies = loginRes.headers['set-cookie'];
        if (!cookies) {
            console.error('❌ No cookies received!');
            return;
        }
        const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
        console.log('✅ Logged in. cookie:', cookieHeader.substring(0, 20) + '...');

        // 3. Upload a file
        // Construct multipart manually is hard with native https...
        // Wait, if I cannot upload, I cannot view...
        // But the user ALREADY has a file.
        // I want to see why THAT file fails. 
        // But I cannot access THAT user's file without their credentials.

        // ISSUE: I don't have the user's password. I cannot login as them.
        // I can only test logic with a NEW user.

        // IF I verify a NEW file works for a NEW user, then the issue is confirmed to be KEY ROTATION.
        // IF I verify a NEW file FAILS for a NEW user, then the issue is CODE/SERVER logic.

        // Let's manually construct a simple multipart body for upload.
        console.log('[3] Uploading file for NEW user...');
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const fileContent = 'Diagnostic Test Content';

        const postData =
            `--${boundary}\r
Content-Disposition: form-data; name="document"; filename="diag.txt"\r
Content-Type: text/plain\r
\r
${fileContent}\r
--${boundary}--\r
`;

        const uploadHeaders = {
            'Cookie': cookieHeader,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(postData)
        };

        const uploadReq = https.request(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            agent,
            headers: uploadHeaders
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const json = JSON.parse(data);
                console.log('Upload Status:', res.statusCode);
                if (res.statusCode !== 201) {
                    console.error('Upload Failed:', data);
                    return;
                }
                const docId = json.docId;
                console.log(`✅ Uploaded. DocID: ${docId}`);

                // 4. Download it immediately
                downloadDoc(docId, cookieHeader);
            });
        });

        uploadReq.write(postData);
        uploadReq.end();

    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

function downloadDoc(docId, cookie, attempts = 0) {
    console.log(`[4] Downloading ${docId}...`);
    const opts = {
        method: 'GET',
        agent,
        headers: { 'Cookie': cookie }
    };

    const req = https.request(`${BASE_URL}/documents/download/${docId}`, opts, (res) => {
        let chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
            const body = Buffer.concat(chunks);
            console.log(`Download Status: ${res.statusCode}`);

            if (res.statusCode === 200) {
                console.log('✅ Download Success!');
                console.log('Content:', body.toString());
            } else {
                console.error('❌ Download FAILED');
                console.error('Response Body:', body.toString()); // THIS IS WHAT WE NEED
            }
        });
    });
    req.end();
}

run();
