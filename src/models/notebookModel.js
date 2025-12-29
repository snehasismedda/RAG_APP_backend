import db from '../knex/db.js';

export const createNotebook = async ({ title, description, userId }) => {
  const result = await db('ragapp.notebooks')
    .insert({
      title,
      description,
      fk_user_id: userId,
    })
    .returning('*');
  return result;
};

export const getNotebooks = async ({ userId }) => {
  return db('ragapp.notebooks')
    .select('id', 'title', 'description', 'updated_at')
    .where('fk_user_id', userId)
    .where('is_deleted', false)
    .orderBy('updated_at', 'desc');
};

export const getNotebookById = async ({ id, userId }) => {
  return db('ragapp.notebooks')
    .select('id', 'title', 'description', 'created_at', 'updated_at')
    .where('id', id)
    .where('fk_user_id', userId)
    .where('is_deleted', false)
    .first();
};

export const updateNotebook = async (id, data, userId) => {
  const [result] = await db('ragapp.notebooks')
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

export const deleteNotebook = async (id, userId) => {
  return db('ragapp.notebooks')
    .where('id', id)
    .where('fk_user_id', userId)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};
