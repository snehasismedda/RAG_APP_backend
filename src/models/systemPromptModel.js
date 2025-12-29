import db from '../knex/db.js';

export const getSystemPrompt = async ({ promptKey, version }) => {
    return db('ragapp.system_prompts')
        .where('prompt_key', promptKey)
        .where('version', version || 'v1')
        .where('is_deleted', false)
        .first();
};

export const addSystemPrompt = async (data) => {
    const dbSystemPrompt = {
        prompt_key: data.promptKey,
        version: data.version || 'v1',
        content: data.content,
        created_at: new Date(),
        updated_at: new Date(),
    };
    const result = await db('ragapp.system_prompts')
        .insert(dbSystemPrompt)
        .returning('id');
    return result;
};

export const updateSystemPrompt = async (data) => {
    const dbSystemPrompt = {
        prompt_key: data.promptKey,
        version: data.version || 'v1',
        content: data.content,
        updated_at: new Date(),
    };
    const result = await db('ragapp.system_prompts')
        .where('id', data.id)
        .update(dbSystemPrompt)
        .returning('id');
    return result;
};

export const deleteSystemPrompt = async (id) => {
    const result = await db('ragapp.system_prompts')
        .where('id', id)
        .update({ is_deleted: true, deleted_at: new Date() });
    return result;
};