import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/user';

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  userId: `test-user-${Date.now()}`,
};

let accessToken = '';
let refreshToken = '';

const runTest = async () => {
  try {
    console.log('--- Starting Auth Verification ---');

    // 1. Register
    console.log('\n1. Testing Register...');
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    if (regRes.ok) {
      console.log('✅ Register Success');
      accessToken = regData.accessToken;
      refreshToken = regData.refreshToken;
    } else {
      console.error('❌ Register Failed:', regData);
      process.exit(1);
    }

    // 2. Profile (Protected)
    console.log('\n2. Testing Protected Route (/profile)...');
    const profRes = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (profRes.ok) {
      console.log('✅ Profile Access Success');
    } else {
      console.error('❌ Profile Access Failed:', await profRes.text());
    }

    // 3. Login
    console.log('\n3. Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      console.log('✅ Login Success');
      accessToken = loginData.accessToken; // Update tokens
      refreshToken = loginData.refreshToken;
    } else {
      console.error('❌ Login Failed:', loginData);
    }

    // 4. Refresh Token
    console.log('\n4. Testing Refresh Token...');
    const refreshRes = await fetch(`${BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData = await refreshRes.json();
    if (refreshRes.ok) {
      console.log('✅ Refresh Token Success');
      accessToken = refreshData.accessToken;
      refreshToken = refreshData.refreshToken; // New refresh token (rotation)
    } else {
      console.error('❌ Refresh Token Failed:', refreshData);
    }

    // 5. Delete User
    console.log('\n5. Testing Delete User...');
    const delRes = await fetch(`${BASE_URL}/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
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
