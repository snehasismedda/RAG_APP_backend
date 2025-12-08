import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/user';

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  userId: `test-user-${Date.now()}`,
};

let cookies = {};

const updateCookies = (res) => {
  const rawCookies = res.headers.raw()['set-cookie'];
  if (rawCookies) {
    rawCookies.forEach((cookie) => {
      const [pair] = cookie.split(';');
      const [key, value] = pair.split('=');
      cookies[key] = value;
    });
  }
};

const getCookieHeader = () => {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
};

const runTest = async () => {
  try {
    console.log('--- Starting Cookie Auth Verification ---');

    // 1. Register
    console.log('\n1. Testing Register...');
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();

    updateCookies(regRes);

    if (regRes.ok && cookies['jwt'] && cookies['refresh_token']) {
      console.log('✅ Register Success (Cookies Set)');
    } else {
      console.error('❌ Register Failed:', regData);
      process.exit(1);
    }

    // 2. Profile (Protected) - Note: Profile route was removed, using Delete failure to test OR add profile back temporarily.
    // Actually, delete route is protected, so we can test access there, but wait, let's add profile back temporarily or just assume if login works we are good?
    // Let's add the profile route back for this test script to work reliably without side effects.
    // Or I can just check if login works.
    // The implementation plan says "Test Access Protected Route".
    // I'll skip adding the route and test "Delete" at the end. Or I can call a dummy protected route if I had one.
    // Let's assume Profile route is GONE. I will use DELETE route but I don't want to delete yet.
    // I'll add a temporary "me" route in user controller/route or simplified:
    // Verification script should be aligned with actual routes.
    // Current routes: Register, Login, Refresh, Logout, Delete.
    // I can trying calling Delete with INVALID cookie to see 401, then Valid to see 200.
    // But let's stick to the flow.

    // 3. Login
    console.log('\n2. Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    const loginData = await loginRes.json();
    updateCookies(loginRes);

    if (loginRes.ok && cookies['jwt']) {
      console.log('✅ Login Success');
    } else {
      console.error('❌ Login Failed:', loginData);
    }

    // 4. Refresh Token
    console.log('\n3. Testing Refresh Token...');
    const refreshRes = await fetch(`${BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: getCookieHeader(),
      },
    });
    const refreshData = await refreshRes.json();
    updateCookies(refreshRes); // Should update jwt and match new expiration

    if (refreshRes.ok) {
      console.log('✅ Refresh Token Success');
    } else {
      console.error('❌ Refresh Token Failed:', refreshData);
    }

    // 5. Delete User (Protected)
    console.log('\n4. Testing Delete User (Protected)...');
    const delRes = await fetch(`${BASE_URL}/delete`, {
      method: 'DELETE',
      headers: {
        Cookie: getCookieHeader(),
      },
    });
    if (delRes.ok) {
      console.log('✅ Delete User Success');
    } else {
      console.error('❌ Delete User Failed:', await delRes.text());
    }

    console.log('\n--- Verification Complete ---');
  } catch (error) {
    console.error('Verification Error:', error);
  }
};

runTest();
