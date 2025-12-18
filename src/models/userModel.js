import db from '../knex/db.js';

export const addUser = async (user) => {
  const dbUser = {
    user_id: user.userId,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    hash_password: user.password,
    role: user.role || 'user',
  };
  const [result] = await db('ragapp.users').insert(dbUser).returning('id');
  return result.id;
};

export const findUserByEmail = async (email) => {
  return db('ragapp.users')
    .where('email', email)
    .where('is_deleted', false)
    .first();
};

export const findUserById = async (id) => {
  return db('ragapp.users').where('id', id).where('is_deleted', false).first();
};

export const deleteUser = async (id) => {
  return db('ragapp.users')
    .where('id', id)
    .update({ is_deleted: true, deleted_at: new Date() });
};

// Refresh Token Functions
export const saveRefreshToken = async (token, userId, expiresAt) => {
  return db('ragapp.refresh_tokens').insert({
    refresh_token: token,
    fk_user_id: userId,
    expires_at: expiresAt,
  });
};

export const findRefreshToken = async (token) => {
  return db('ragapp.refresh_tokens')
    .where('refresh_token', token)
    .where('is_deleted', false)
    .first();
};

export const deleteRefreshToken = async (token) => {
  return db('ragapp.refresh_tokens')
    .where('refresh_token', token)
    .update({ is_deleted: true, deleted_at: new Date() });
};

export const deleteAllRefreshTokensForUser = async (userId) => {
  return db('ragapp.refresh_tokens')
    .where('fk_user_id', userId)
    .update({ is_deleted: true, deleted_at: new Date() });
};
