import { Worker } from 'bullmq';
import redisConfig from '../config/redis.js';
import {
    deleteEmbeddingsByFileIds,
    deleteEmbeddingsByNotebookIds,
    deleteEmbeddingsByUserIds
} from '../services/vector_service/vectorStore.js';
import { archiveToGlacier } from '../services/aws_service/s3Service.js';
import {
    deleteFilesByUserIds,
    deleteFilesByNotebookIds,
    deleteFilesByIds
} from '../models/fileModel.js';
import {
    deleteChatsByIds,
    deleteChatsByNotebookIds,
    deleteChatsByUserIds
} from '../models/chatModel.js';
import {
    deleteConversationsByChatIds,
    deleteConversationsByNotebookIds,
    deleteConversationsByUserIds
} from '../models/conversationModel.js';
import {
    deleteNotebooksByIds,
    deleteNotebooksByUserIds
} from '../models/notebookModel.js';
import { deleteUsersByIds } from '../models/userModel.js';

const worker = new Worker(
    'deletion-queue',
    async (job) => {
        const { type } = job.data;
        console.log(`Processing deletion job ${job.id} of type ${type}`);

        switch (type) {
            case 'DELETE_FILE': {
                const { fileId, userId, notebookId, objectKey } = job.data;
                console.log(JSON.stringify(job.data))
                await deleteEmbeddingsByFileIds([fileId]);
                console.log(`Deleted embeddings for file ${fileId}`);

                // if (objectKey) {
                //     await archiveToGlacier(objectKey);
                //     console.log(`Archived S3 object to Glacier: ${objectKey}`);
                // }

                await deleteFilesByIds({ fileIds: [fileId], notebookId, userId });
                console.log(`Soft deleted file record ${fileId}`);
            }
                break;

            case 'DELETE_CHAT': {
                const { chatId, userId } = job.data;

                await deleteConversationsByChatIds({ chatIds: [chatId], userId });
                console.log(`Deleted conversations for chat ${chatId}`);

                await deleteChatsByIds({ chatIds: [chatId], userId });
                console.log(`Soft deleted chat record ${chatId}`);
            }
                break;

            case 'DELETE_NOTEBOOK': {
                const { notebookId, userId } = job.data;

                const result1 = await deleteEmbeddingsByNotebookIds([notebookId]);
                console.log(`Deleted embeddings for notebook ${notebookId} -- ${JSON.stringify(result1)}`);

                const result2 = await deleteFilesByNotebookIds({ notebookIds: [notebookId], userId });
                console.log(`Soft deleted file records for notebook ${notebookId} -- ${JSON.stringify(result2)}`);

                const result5 = await deleteConversationsByNotebookIds({ notebookIds: [notebookId], userId });
                console.log(`Deleted conversations for notebook ${notebookId} -- ${JSON.stringify(result5)}`);

                const result3 = await deleteChatsByNotebookIds({ notebookIds: [notebookId], userId });
                console.log(`Soft deleted chat records for notebook ${notebookId} -- ${JSON.stringify(result3)}`);

                const result4 = await deleteNotebooksByIds({ notebookIds: [notebookId], userId });
                console.log(`Soft deleted notebook ${notebookId} -- ${JSON.stringify(result4)}`);
            }
                break;

            case 'DELETE_USER': {
                const { userId } = job.data;

                await deleteEmbeddingsByUserIds([userId]);
                console.log(`Deleted embeddings for user ${userId}`);

                await deleteFilesByUserIds({ userIds: [userId] });
                console.log(`Soft deleted file records for user ${userId}`);

                await deleteConversationsByUserIds({ userIds: [userId] });
                console.log(`Deleted conversations for user ${userId}`);

                await deleteChatsByUserIds({ userIds: [userId] });
                console.log(`Soft deleted chat records for user ${userId}`);

                await deleteNotebooksByUserIds({ userIds: [userId] });
                console.log(`Soft deleted notebook records for user ${userId}`);

                await deleteUsersByIds({ userIds: [userId] });
                console.log(`Soft deleted user ${userId}`);
            }
                break;

            default:
                throw new Error(`Unknown deletion job type: ${type}`);
        }
    },
    {
        connection: redisConfig,
    }
);

worker.on('completed', (job) => {
    console.log(`Deletion job ${job.id} completed:`);
});

worker.on('failed', (job, err) => {
    console.error(`Deletion job ${job.id} failed:`, err.message);
});

export default worker;
