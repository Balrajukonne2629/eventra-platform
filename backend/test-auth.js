const http = require('http');

async function waitPort(port, host = '127.0.0.1', timeout = 60000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            const req = http.get(`http://${host}:${port}/api/auth/me`, (res) => {
                // Ignore API status, just waiting for the server to bind to port and respond
                resolve();
            }).on('error', (err) => {
                if (Date.now() - start > timeout) {
                    reject(new Error('Timeout waiting for port'));
                } else {
                    setTimeout(check, 2000);
                }
            });
        };
        check();
    });
}

async function testSuite() {
    console.log("Waiting for Next.js to be fully booted on port 3000... (might take ~15s)");
    await waitPort(3000);
    console.log("Server is reachable!\n");

    const baseUrl = 'http://127.0.0.1:3000/api';
    
    // Test 1: Try protected route without auth
    console.log("--- Test 1: Protected route without Auth ---");
    const resNoAuth = await fetch(`${baseUrl}/events/create`);
    console.log(`Status: ${resNoAuth.status}`);
    const resNoAuthJson = await resNoAuth.json().catch(()=>({ error: "Failed to parse JSON, might have redirected." }));
    console.log(`Response: ${JSON.stringify(resNoAuthJson)}`);
    console.log(resNoAuth.status === 401 || resNoAuth.redirected ? "✅ TEST PASSED\n" : "❌ TEST FAILED\n");

    // Randomize email to allow re-running tests
    const testEmail = `tester_${Date.now()}@eventra.com`;

    // Test 2: Register
    console.log(`--- Test 2: Register user (${testEmail}) ---`);
    const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Automated Tester', email: testEmail, password: 'password123', role: 'organizer' })
    });
    console.log(`Status: ${regRes.status}`);
    const regResJson = await regRes.json();
    console.log(`Response: ${JSON.stringify(regResJson, null, 2)}`);
    console.log(regRes.status === 201 ? "✅ TEST PASSED\n" : "❌ TEST FAILED\n");

    // Test 3: Login
    console.log("--- Test 3: Login user ---");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    console.log(`Status: ${loginRes.status}`);
    const loginResJson = await loginRes.json();
    console.log(`Response: ${JSON.stringify(loginResJson, null, 2)}`);
    
    const setCookieHeader = loginRes.headers.get('set-cookie');
    console.log(`Set-Cookie header found: ${!!setCookieHeader}`);
    console.log(loginRes.status === 200 && setCookieHeader ? "✅ TEST PASSED\n" : "❌ TEST FAILED\n");

    // Extract cookie for next request
    let cookie = '';
    if (setCookieHeader) {
        cookie = setCookieHeader.split(';')[0];
    }

    // Test 4: Verify Session (/api/auth/me)
    console.log("--- Test 4: Verify Auth Session ---");
    const meRes = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: { 'Cookie': cookie }
    });
    console.log(`Status: ${meRes.status}`);
    const meResJson = await meRes.json();
    console.log(`Response: ${JSON.stringify(meResJson, null, 2)}`);
    console.log(meRes.status === 200 ? "✅ TEST PASSED\n" : "❌ TEST FAILED\n");
    
    process.exit(0);
}

testSuite().catch(console.error);
