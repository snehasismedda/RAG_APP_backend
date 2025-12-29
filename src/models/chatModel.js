import db from '../knex/db.js';

export const createChat = async ({ title, notebookId, userId }) => {
  const result = await db('ragapp.chats')
    .insert({
      title,
      fk_notebook_id: notebookId,
      fk_user_id: userId,
    })
    .returning('*');
  return result;
};

export const getChats = async ({ notebookId, userId }) => {
  return db('ragapp.chats')
    .select('id', 'title', 'created_at', 'updated_at')
    .where('fk_notebook_id', notebookId)
    .where('fk_user_id', userId)
    .where('is_deleted', false)
    .orderBy('created_at', 'desc');
};

export const getChatById = async ({ id, userId }) => {
  return db('ragapp.chats')
    .select('id', 'title', 'fk_notebook_id', 'created_at', 'updated_at')
    .where('id', id)
    .where('fk_user_id', userId)
    .where('is_deleted', false)
    .first();
};

export const updateChat = async ({ id, userId, data }) => {
  const result = await db('ragapp.chats')
    .where('id', id)
    .where('fk_user_id', userId)
    .where('is_deleted', false)
    .update({
      ...data,
      updated_at: new Date(),
    })
    .returning('*');
  return result;
};

export const deleteChat = async ({ id, userId }) => {
  return db('ragapp.chats').where('id', id).where('fk_user_id', userId).update({
    is_deleted: true,
    deleted_at: new Date(),
  });
};
