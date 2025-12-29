import db from '../knex/db.js';
import _ from 'lodash'

export const saveFile = async (data) => {
    const result = await db('ragapp.files').insert({
        file_name: data.fileName,
        object_key: data.objectKey,
        bucket_name: data.bucketName,
        storage_provider: data.storageProvider || 's3',
        fk_notebook_id: data.notebookId,
        fk_user_id: data.userId,
        mime_type: data.mimeType,
        file_size: data.fileSize,
        status: data.status || 'PENDING',
        upload_completed_at: data.uploadCompletedAt || null,
    }).returning('id');
    return _.first(result);
}

export const updateFileStatus = async (id, status) => {
    return db('ragapp.files')
        .where('id', id)
        .update({ status, updated_at: db.fn.now() });
}

export const getFiles = async ({ notebookId, userId }) => {
    return db('ragapp.files')
        .select('id', 'file_name', 'object_key', 'bucket_name', 'storage_provider', 'mime_type', 'file_size', 'status', 'created_at', 'updated_at')
        .where('fk_notebook_id', notebookId)
        .where('fk_user_id', userId)
        .where('is_deleted', false)
        .orderBy('created_at', 'desc');
}