import db from '../knex/db.js';

export const createChat = async (data) => {
  const result = await db('ragapp.chats')
    .insert({
      title: data.title,
      fk_notebook_id: data.notebookId,
      fk_user_id: data.userId,
    })
    .returning('*');
  return result;
};

export const getChatsByNotebookIds = async (data) => {
  return db('ragapp.chats')
    .select('id', 'title', 'created_at', 'updated_at')
    .whereIn('fk_notebook_id', data.notebookIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .orderBy('created_at', 'desc');
};

export const getChatsByIds = async (data) => {
  return db('ragapp.chats')
    .select('id', 'title', 'fk_notebook_id', 'created_at', 'updated_at')
    .whereIn('id', data.ids)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .orderBy('created_at', 'desc');
};

export const updateChatsByIds = async (data) => {
  const result = await db('ragapp.chats')
    .whereIn('id', data.ids)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      ...data.updates,
      updated_at: new Date(),
    })
    .returning('*');
  return result;
};

export const deleteChatsByIds = async (data) => {
  return db('ragapp.chats')
    .whereIn('id', data.chatIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};

export const deleteChatsByNotebookIds = async (data) => {
  return db('ragapp.chats')
    .whereIn('fk_notebook_id', data.notebookIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};

export const deleteChatsByUserIds = async (data) => {
  return db('ragapp.chats')
    .whereIn('fk_user_id', data.userIds)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};
