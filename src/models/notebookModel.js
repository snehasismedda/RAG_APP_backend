import db from '../knex/db.js';
import _ from 'lodash';

export const createNotebook = async (data) => {
  const result = await db('ragapp.notebooks')
    .insert({
      title: data.title,
      description: data.description,
      fk_user_id: data.userId,
    })
    .returning('*');
  return _.first(result);
};

export const getNotebooksByUserIds = async (data) => {
  return db('ragapp.notebooks')
    .select('id', 'title', 'description', 'updated_at')
    .whereIn('fk_user_id', data.userIds)
    .where('is_deleted', false)
    .orderBy('updated_at', 'desc');
};

export const getNotebooksByIds = async (data) => {
  return db('ragapp.notebooks')
    .select('id', 'title', 'description', 'created_at', 'updated_at')
    .whereIn('id', data.notebookIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .orderBy('updated_at', 'desc');
};

export const updateNotebookById = async (data) => {
  const result = await db('ragapp.notebooks')
    .where('id', data.notebookId)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      ...data.updates,
      updated_at: new Date(),
    })
    .returning('*');
  return _.first(result);
};

export const deleteNotebooksByIds = async (data) => {
  return db('ragapp.notebooks')
    .whereIn('id', data.notebookIds)
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};

export const deleteNotebooksByUserIds = async (data) => {
  return db('ragapp.notebooks')
    .whereIn('fk_user_id', data.userIds)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};
