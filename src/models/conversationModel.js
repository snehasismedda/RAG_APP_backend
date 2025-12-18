import db from '../knex/db.js';

export const getConversationHistory = async ({ chatId, notebookId }) => {
  if (!chatId) {
    return [];
  }
  const conversations = await db('ragapp.conversations')
    .select('content', 'metadata', 'role')
    .where('fk_chat_id', chatId)
    .where('fk_notebook_id', notebookId)
    .where('is_deleted', false)
    .orderBy('created_at', 'asc');

  return conversations;
};

export const saveConversations = async ({
  conversations,
  chatId,
  notebookId,
  userId,
  model,
  modelId,
}) => {
  if (!Array.isArray(conversations) || conversations.length === 0) {
    throw new Error('conversations must be a non-empty array');
  }

  console.log("::CONVERSATIONS:: ",conversations);

  const records = conversations.map((conv) => ({
    content: conv.content? JSON.stringify(conv.content) : JSON.stringify({}),
    metadata: conv.metadata ? JSON.stringify(conv.metadata) : JSON.stringify({}),
    role: conv.role,
    model: model,
    model_id: modelId,
    fk_chat_id: chatId,
    fk_notebook_id: notebookId,
    fk_user_id: userId,
  }));

  console.log("::RECORDS:: ",records);
  const results = await db('ragapp.conversations')
    .insert(records)
    .returning('*');

  return results;
};
