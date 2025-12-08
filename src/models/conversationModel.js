import db from '../knex/db.js';

export const getConversationHistory = async ({ chatId, notebookId }) => {
  // Return empty array if no chatId is provided (new chat session)
  if (!chatId) {
    return [];
  }

  const conversations = await db('ragapp.conversations')
    .select('message', 'metadata', 'role')
    .where('fk_chat_id', chatId)
    .where('is_deleted', false)
    .orderBy('created_at', 'asc');

  return conversations;
};

export const saveConversation = async ({
  message,
  metadata,
  role,
  chatId,
  notebookId,
  userId,
}) => {
  const [result] = await db('ragapp.conversations')
    .insert({
      message: JSON.stringify(message),
      metadata: metadata ? JSON.stringify(metadata) : null,
      role,
      fk_chat_id: chatId,
      fk_notebook_id: notebookId,
      fk_user_id: userId,
    })
    .returning('*');
  return result;
};
