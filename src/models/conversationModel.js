import db from '../knex/db.js';

export const getConversationHistory = async (data) => {
  if (!data.chatId || !data.notebookId || !data.userId) {
    return [];
  }
  const conversations = await db('ragapp.conversations')
    .select('content', 'metadata', 'role')
    .where('fk_chat_id', data.chatId)
    .where('fk_notebook_id', data.notebookId)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .orderBy('created_at', 'asc');

  return conversations;
};

export const saveConversations = async (data) => {
  if (!Array.isArray(data.conversations) || data.conversations.length === 0) {
    throw new Error('conversations must be a non-empty array');
  }

  const records = data.conversations.map((conv) => ({
    content: conv.content ? JSON.stringify(conv.content) : JSON.stringify({}),
    metadata: conv.metadata ? JSON.stringify(conv.metadata) : JSON.stringify({}),
    role: conv.role,
    model: data.model,
    model_id: data.modelId,
    fk_chat_id: data.chatId,
    fk_notebook_id: data.notebookId,
    fk_user_id: data.userId,
  }));

  const results = await db('ragapp.conversations')
    .insert(records)
    .returning('*');

  return results;
};

export const deleteConversationsByChatIds = async (data) => {
  return db('ragapp.conversations')
    .whereIn('fk_chat_id', data.chatIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};

export const deleteConversationsByNotebookIds = async (data) => {
  return db('ragapp.conversations')
    .whereIn('fk_notebook_id', data.notebookIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};

export const deleteConversationsByUserIds = async (data) => {
  return db('ragapp.conversations')
    .whereIn('fk_user_id', data.userIds)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
}