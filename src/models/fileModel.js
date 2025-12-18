import db from '../knex/db.js';

export const saveFile = async (data) => {
    const result = await db('ragapp.files').insert({
        file_name: data.fileName,
        file_url: data.fileUrl || data.filePath,
        fk_notebook_id: data.notebookId,
        fk_user_id: data.userId,
        mime_type: data.mimeType,
        file_size: data.fileSize,
        status: data.status || 'PENDING'
    }).returning('id');
    return result;
}