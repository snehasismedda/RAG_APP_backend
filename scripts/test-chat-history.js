/**
 * Test script to verify chat history is remembered across messages
 * Run with: node scripts/test-chat-history.js
 */

const BASE_URL = 'http://localhost:8000';

let accessToken = '';
let notebookId = '';
let chatId = '';

const testUser = {
  firstName: 'History',
  lastName: 'Tester',
  email: `historytest${Date.now()}@example.com`,
  password: 'Test123!@#',
  userId: `historyuser_${Date.now()}`,
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

async function setup() {
  console.log('🔧 Setting up test environment...\n');

  // Register user
  await fetchJson(`${BASE_URL}/user/register`, {
    method: 'POST',
    body: JSON.stringify(testUser),
  });

  // Login
  const { response: loginRes } = await fetchJson(`${BASE_URL}/user/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  const cookies = loginRes.headers.get('set-cookie');
  const tokenMatch = cookies?.match(/jwt=([^;]+)/);
  accessToken = tokenMatch ? tokenMatch[1] : null;

  if (!accessToken) {
    console.log('❌ Login failed');
    return false;
  }
  console.log('✅ Logged in\n');

  // Create notebook
  const { data: notebook } = await fetchJson(`${BASE_URL}/notebook`, {
    method: 'POST',
    body: JSON.stringify({ title: 'History Test Notebook' }),
  });
  notebookId = notebook.id;
  console.log('✅ Notebook created:', notebookId);

  // Create chat
  const { data: chat } = await fetchJson(`${BASE_URL}/chat/create`, {
    method: 'POST',
    body: JSON.stringify({ title: 'History Test Chat', notebookId }),
  });
  chatId = chat.id;
  console.log('✅ Chat created:', chatId, '\n');

  return true;
}

async function sendMessage(query) {
  const { response, data } = await fetchJson(`${BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify({
      query,
      model: 'gemini',
      modelId: 'gemini-2.0-flash',
      temperature: 0.7,
      maxOutputTokens: 200,
      notebookId,
      chatId,
    }),
  });
  return { ok: response.ok, response: data.response, error: data.error };
}

async function testHistoryRemembered() {
  console.log('🧪 Testing Conversation History...\n');
  console.log('='.repeat(50));

  // Message 1: Tell the AI something specific to remember
  console.log('\n📤 Message 1: Telling AI a secret...');
  const msg1 = await sendMessage(
    'My favorite color is purple and my pet is a golden retriever named Max. Please remember this.'
  );
  if (!msg1.ok) {
    console.log('❌ Failed:', msg1.error);
    return false;
  }
  console.log('📥 AI:', msg1.response?.substring(0, 150) + '...');

  // Message 2: Ask the AI to recall what we told it
  console.log('\n📤 Message 2: Asking AI to recall the information...');
  const msg2 = await sendMessage(
    "What is my favorite color and what is my pet's name? Please tell me both."
  );
  if (!msg2.ok) {
    console.log('❌ Failed:', msg2.error);
    return false;
  }
  console.log('📥 AI:', msg2.response);

  // Check if AI remembered
  const response = msg2.response?.toLowerCase() || '';
  const rememberedColor = response.includes('purple');
  const rememberedPet = response.includes('max') || response.includes('golden retriever');

  console.log('\n' + '='.repeat(50));
  console.log('\n🔍 Memory Check:');
  console.log(`   Remembered "purple": ${rememberedColor ? '✅' : '❌'}`);
  console.log(`   Remembered "Max" or "golden retriever": ${rememberedPet ? '✅' : '❌'}`);

  if (rememberedColor && rememberedPet) {
    console.log('\n✅ SUCCESS: Chat history is working! AI remembered the conversation.\n');
    return true;
  } else {
    console.log('\n❌ FAIL: AI did not remember the conversation history.\n');
    return false;
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up...');
  if (chatId) await fetchJson(`${BASE_URL}/chat/${chatId}`, { method: 'DELETE' });
  if (notebookId) await fetchJson(`${BASE_URL}/notebook/${notebookId}`, { method: 'DELETE' });
  console.log('✅ Cleanup complete\n');
}

async function run() {
  console.log('\n🧪 Chat History Test\n');
  console.log('Testing if the AI remembers previous messages in a conversation.\n');

  try {
    const healthCheck = await fetch(`${BASE_URL}/`);
    if (!healthCheck.ok) {
      console.log('❌ Server is not running');
      return;
    }

    const ready = await setup();
    if (!ready) return;

    await testHistoryRemembered();
    await cleanup();
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

run();
