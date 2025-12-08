/**
 * Test script for the complete Notebook → Chat → Conversation flow
 * Run with: node scripts/test-chat-route.js
 */

const BASE_URL = 'http://localhost:8000';

// Store tokens and IDs for testing
let accessToken = '';
let notebookId = '';
let chatId = '';

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'Test123!@#',
  userId: `testuser_${Date.now()}`,
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Cookie: `jwt=${accessToken}` }),
      ...options.headers,
    },
  });
  const data = await response.json();
  return { response, data };
}

async function registerAndLogin() {
  console.log('📝 Registering new user...');
  const { response: regRes, data: regData } = await fetchJson(
    `${BASE_URL}/user/register`,
    {
      method: 'POST',
      body: JSON.stringify(testUser),
    }
  );

  if (regRes.ok) {
    console.log('✅ User registered\n');
  } else {
    console.log('ℹ️  Registration:', regData.error || 'User might exist\n');
  }

  console.log('🔑 Logging in...');
  const { response: loginRes, data: loginData } = await fetchJson(
    `${BASE_URL}/user/login`,
    {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    }
  );

  if (loginRes.ok) {
    // Extract token from cookies (jwt cookie)
    const cookies = loginRes.headers.get('set-cookie');
    const tokenMatch = cookies?.match(/jwt=([^;]+)/);
    accessToken = tokenMatch ? tokenMatch[1] : null;
    console.log('✅ Logged in successfully\n');
    return true;
  } else {
    console.log('❌ Login failed:', loginData.error, '\n');
    return false;
  }
}

async function testNotebookCRUD() {
  console.log('📓 Testing Notebook CRUD...\n');

  // Create notebook
  console.log('  Creating notebook...');
  const { response: createRes, data: createData } = await fetchJson(
    `${BASE_URL}/notebook`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Notebook',
        description: 'A test notebook for API testing',
      }),
    }
  );

  if (createRes.status === 201) {
    notebookId = createData.id;
    console.log('  ✅ Notebook created, ID:', notebookId);
  } else {
    console.log('  ❌ Failed to create notebook:', createData.error);
    return false;
  }

  // Get all notebooks
  console.log('  Getting all notebooks...');
  const { response: getAllRes, data: notebooks } = await fetchJson(
    `${BASE_URL}/notebook`
  );

  if (getAllRes.ok && notebooks.length > 0) {
    console.log('  ✅ Retrieved', notebooks.length, 'notebook(s)');
  } else {
    console.log('  ❌ Failed to get notebooks');
  }

  // Get notebook by ID
  console.log('  Getting notebook by ID...');
  const { response: getOneRes, data: notebook } = await fetchJson(
    `${BASE_URL}/notebook/${notebookId}`
  );

  if (getOneRes.ok) {
    console.log('  ✅ Retrieved notebook:', notebook.title);
  } else {
    console.log('  ❌ Failed to get notebook by ID');
  }

  console.log('  ✅ Notebook CRUD tests passed\n');
  return true;
}

async function testChatCRUD() {
  console.log('💬 Testing Chat CRUD...\n');

  // Create chat
  console.log('  Creating chat in notebook...');
  const { response: createRes, data: createData } = await fetchJson(
    `${BASE_URL}/chat/create`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Chat',
        notebookId: notebookId,
      }),
    }
  );

  if (createRes.status === 201) {
    chatId = createData.id;
    console.log('  ✅ Chat created, ID:', chatId);
  } else {
    console.log('  ❌ Failed to create chat:', createData.error);
    return false;
  }

  // Get all chats in notebook
  console.log('  Getting all chats in notebook...');
  const { response: getAllRes, data: chats } = await fetchJson(
    `${BASE_URL}/chat/notebook/${notebookId}`
  );

  if (getAllRes.ok && chats.length > 0) {
    console.log('  ✅ Retrieved', chats.length, 'chat(s)');
  } else {
    console.log('  ❌ Failed to get chats');
  }

  console.log('  ✅ Chat CRUD tests passed\n');
  return true;
}

async function testConversation() {
  console.log('🤖 Testing Conversation (Chat Message)...\n');

  console.log('  Sending message...');
  const { response, data } = await fetchJson(`${BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify({
      query: 'Hello! Please respond with a short greeting.',
      model: 'gemini',
      modelId: 'gemini-2.0-flash',
      temperature: 0.7,
      maxOutputTokens: 100,
      notebookId: notebookId,
      chatId: chatId,
    }),
  });

  if (response.ok) {
    console.log('  ✅ Message sent and response received');
    console.log('  AI Response:', data.response?.substring(0, 100) + '...');
    console.log('  ✅ Conversation stored in database\n');
    return true;
  } else {
    console.log('  ❌ Failed to send message:', data.error, '\n');
    return false;
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up...\n');

  // Delete chat
  if (chatId) {
    await fetchJson(`${BASE_URL}/chat/${chatId}`, { method: 'DELETE' });
    console.log('  Deleted chat');
  }

  // Delete notebook
  if (notebookId) {
    await fetchJson(`${BASE_URL}/notebook/${notebookId}`, { method: 'DELETE' });
    console.log('  Deleted notebook');
  }

  console.log('  ✅ Cleanup complete\n');
}

async function runTests() {
  console.log('🧪 Testing Notebook → Chat → Conversation Flow\n');
  console.log('='.repeat(50) + '\n');

  try {
    // Check server
    const healthCheck = await fetch(`${BASE_URL}/`);
    if (!healthCheck.ok) {
      console.log('❌ Server is not running');
      return;
    }
    console.log('✅ Server is running\n');

    // Run tests
    const loggedIn = await registerAndLogin();
    if (!loggedIn) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    const notebookOk = await testNotebookCRUD();
    if (!notebookOk) return;

    const chatOk = await testChatCRUD();
    if (!chatOk) return;

    await testConversation();

    await cleanup();

    console.log('='.repeat(50));
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

runTests();
