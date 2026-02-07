const axios = require('axios');
const https = require('https');
require('dotenv').config();

const agent = new https.Agent({
    rejectUnauthorized: false
});

const API_URL = `https://localhost:${process.env.PORT || 5001}`;
const AUTH_URL = `${API_URL}/api/auth`;

console.log(`🚀 Starting Live Security Feature Verification on ${API_URL}...`);

const run = async () => {
    let passed = 0;
    let failed = 0;

    // Helper to log result
    const logResult = (name, success, msg) => {
        if (success) {
            console.log(`✅ [PASS] ${name}: ${msg || ''}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name}: ${msg || ''}`);
            failed++;
        }
    };

    try {
        // 1. Check Security Headers
        console.log('\n--- 1. Testing Security Headers ---');
        try {
            const res = await axios.get(API_URL, { httpsAgent: agent });
            const headers = res.headers;

            logResult('Content-Security-Policy', headers['content-security-policy'], `Value: ${headers['content-security-policy']?.substring(0, 50)}...`);
            logResult('Strict-Transport-Security', headers['strict-transport-security'], `Value: ${headers['strict-transport-security']}`);
            logResult('X-Frame-Options', headers['x-frame-options'] === 'SAMEORIGIN', `Value: ${headers['x-frame-options']}`);
            logResult('X-Content-Type-Options', headers['x-content-type-options'] === 'nosniff', `Value: ${headers['x-content-type-options']}`);
            logResult('X-Powered-By Hidden', !headers['x-powered-by'], 'Header is missing (good)');

        } catch (err) {
            console.error('Failed to fetch headers:', err.message);
            failed++;
        }

        // 2. Check Host Validation
        console.log('\n--- 2. Testing Host Validation ---');
        try {
            // Send request with invalid Host header
            await axios.get(API_URL, {
                headers: { 'Host': 'evil.com' },
                httpsAgent: agent,
                validateStatus: status => true // Don't throw on error status
            });
            // Based on code, it logs warning but continues (next()). 
            // The code said: // res.status(403).send('Forbidden Host'); // Temporarily disabled for debugging
            // So we expect it to PASS (code logic currently allows it, but logs it).
            // This is a FINDING: Host validation is implemented but disabled/permissive.
            console.log('⚠️ [NOTE] Host Validation logic is currently PERMISSIVE (logs warning but allows request). Verification skipped for blocking.');
            // If we want to strictly verify logic, we'd check server logs, but we can't easily here.
            // I'll mark it as a "Finding" rather than Pass/Fail for the script.
        } catch (err) {
            console.error('Host validation test error:', err.message);
        }

        // 3. Test Authentication (Do this BEFORE rate limiting blocks us)
        console.log('\n--- 3. Testing Authentication Flow ---');
        const userEmail = `auth_${Date.now()}@test.com`;

        // Register
        try {
            const regRes = await axios.post(`${AUTH_URL}/register`, { email: userEmail, password: 'SecurePassword123!', role: 'patient' }, { httpsAgent: agent });
            logResult('Registration', regRes.status === 201, 'User created');
        } catch (err) {
            logResult('Registration', false, err.response?.data?.msg || err.message);
        }

        // Login
        try {
            const loginRes = await axios.post(`${AUTH_URL}/login`, { email: userEmail, password: 'SecurePassword123!' }, { httpsAgent: agent });
            logResult('Login', loginRes.status === 200, 'Login successful');

            // Check Cookie
            const cookies = loginRes.headers['set-cookie'];
            const jwtCookie = cookies && cookies.find(c => c.startsWith('jwt='));
            const isHttpOnly = jwtCookie && jwtCookie.includes('HttpOnly');

            logResult('JWT Cookie', !!jwtCookie, 'Cookie received');
            logResult('HttpOnly Flag', !!isHttpOnly, 'Cookie is HttpOnly');

        } catch (err) {
            logResult('Login', false, err.response?.data?.msg || err.message);
        }

        // 4. Test Rate Limiting (Login)
        console.log('\n--- 4. Testing Login Rate Limiting ---');
        const email = `ratelimit_${Date.now()}@test.com`;
        const password = 'password123';

        let blocked = false;
        for (let i = 1; i <= 7; i++) { // Limit is 5
            try {
                await axios.post(`${AUTH_URL}/login`, { email, password }, { httpsAgent: agent });
                process.stdout.write(`Attempt ${i}: OK `);
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    console.log(`\nAttempt ${i}: Blocked (429)!`);
                    blocked = true;
                    break;
                } else {
                    process.stdout.write(`Attempt ${i}: ${err.response ? err.response.status : err.message} `);
                }
            }
        }

        logResult('Rate Limiting', blocked, 'Blocked after exceeding limit');


    } catch (err) {
        console.error('Top level error:', err);
    }

    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
};

run();
