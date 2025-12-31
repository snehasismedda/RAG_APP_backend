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
                await deleteEmbeddingsByFileIds([fileId]);
                // if (objectKey) {
                //     await archiveToGlacier(objectKey);
                // }
                await deleteFilesByIds({ fileIds: [fileId], notebookId, userId });
            }
                break;

            case 'DELETE_CHAT': {
                const { chatId, userId } = job.data;

                await deleteConversationsByChatIds({ chatIds: [chatId], userId });
                await deleteChatsByIds({ chatIds: [chatId], userId });
            }
                break;

            case 'DELETE_NOTEBOOK': {
                const { notebookId, userId } = job.data;

                await deleteEmbeddingsByNotebookIds([notebookId]);
                await deleteFilesByNotebookIds({ notebookIds: [notebookId], userId });
                await deleteConversationsByNotebookIds({ notebookIds: [notebookId], userId });
                await deleteChatsByNotebookIds({ notebookIds: [notebookId], userId });
                await deleteNotebooksByIds({ notebookIds: [notebookId], userId });
            }
                break;

            case 'DELETE_USER': {
                const { userId } = job.data;

                await deleteEmbeddingsByUserIds([userId]);
                await deleteFilesByUserIds({ userIds: [userId] });
                await deleteConversationsByUserIds({ userIds: [userId] });
                await deleteChatsByUserIds({ userIds: [userId] });
                await deleteNotebooksByUserIds({ userIds: [userId] });
                await deleteUsersByIds({ userIds: [userId] });
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
