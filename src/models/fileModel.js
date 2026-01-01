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
        url: data.url || null,
    }).returning('id');
    return _.first(result);
}

export const updateFileById = async (data) => {
    return db('ragapp.files')
        .where('id', data.fileId)
        .where('fk_user_id', data.userId)
        .update({
            processing_started_at: data.processingStartedAt,
            processing_completed_at: data.processingCompletedAt,
            status: data.status,
            updated_at: db.fn.now()
        });
}

export const getFilesByNotebookIds = async (data) => {
    return db('ragapp.files')
        .whereIn('fk_notebook_id', data.notebookIds)
        .where('fk_user_id', data.userId)
        .where('is_deleted', false)
        .orderBy('created_at', 'desc');
}

export const getFileStatusByIds = async (data) => {
    return db('ragapp.files')
        .select('id', 'status')
        .whereIn('id', data.fileIds)
        .where('fk_user_id', data.userId)
        .where('is_deleted', false)
        .orderBy('created_at', 'desc');
}

export const deleteFilesByIds = async (data) => {
    return db('ragapp.files')
        .whereIn('id', data.fileIds)
        .where('fk_notebook_id', data.notebookId)
        .where('fk_user_id', data.userId)
        .where('is_deleted', false)
        .update({
            is_deleted: true,
            deleted_at: new Date()
        });
}

export const deleteFilesByNotebookIds = async (data) => {
    return db('ragapp.files')
        .whereIn('fk_notebook_id', data.notebookIds)
        .where('fk_user_id', data.userId)
        .where('is_deleted', false)
        .update({
            is_deleted: true,
            deleted_at: new Date()
        });

}

export const deleteFilesByUserIds = async (data) => {
    return db('ragapp.files')
        .whereIn('fk_user_id', data.userIds)
        .where('is_deleted', false)
        .update({
            is_deleted: true,
            deleted_at: new Date()
        });
}

export const getFilesByIds = async (data) => {
    return db('ragapp.files')
        .whereIn('id', data.fileIds)
        .where('fk_user_id', data.userId)
        .where('is_deleted', false)
        .orderBy('created_at', 'desc');
}

export const getFilesByUserIds = async (data) => {
    return db('ragapp.files')
        .whereIn('fk_user_id', data.userIds)
        .where('is_deleted', false)
        .orderBy('created_at', 'desc');
}
