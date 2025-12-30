import db from '../knex/db.js';
import _ from 'lodash'

export const addUser = async (data) => {
  const dbUser = {
    user_name: data.userName,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    hash_password: data.password,
    role: data.role || 'user',
  };
  const result = await db('ragapp.users')
    .insert(dbUser)
    .returning('*');
  return _.first(result);
};

export const findUserByEmail = async (data) => {
  return db('ragapp.users')
    .where('email', data.email)
    .where('is_deleted', false)
    .first();
};

export const findUserById = async (data) => {
  return db('ragapp.users')
    .where('id', data.id)
    .where('is_deleted', false)
    .first();
};

export const deleteUsersByIds = async (data) => {
  return db('ragapp.users')
    .whereIn('id', data.userIds)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date(),
    });
};

export const saveRefreshToken = async (data) => {
  return db('ragapp.refresh_tokens')
    .insert({
      refresh_token: data.token,
      fk_user_id: data.userId,
      expires_at: data.expiresAt,
    })
    .returning('id');
};

export const findRefreshTokenByToken = async (data) => {
  return db('ragapp.refresh_tokens')
    .where('refresh_token', data.token)
    .where('is_deleted', false)
    .first();
};

export const deleteRefreshTokensByToken = async (data) => {
  return db('ragapp.refresh_tokens')
    .where('refresh_token', data.token)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date()
    });
};

export const deleteAllRefreshTokensByUserId = async (data) => {
  return db('ragapp.refresh_tokens')
    .where('fk_user_id', data.userId)
    .where('is_deleted', false)
    .update({
      is_deleted: true,
      deleted_at: new Date()
    });
};
