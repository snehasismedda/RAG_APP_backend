import { Worker } from 'bullmq';
import redisConfig from '../config/redis.js';
import { loadFile } from '../utils/fileLoader.js';
import { loadUrl } from '../utils/urlLoader.js';
import { embedAndStore } from '../services/vector_service/vectorStore.js';
import { updateFileStatus } from '../models/fileModel.js';
import { getObjectStream } from '../services/aws_service/s3Service.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';

const worker = new Worker(
    'ingestion-queue',
    async (job) => {
        const { type, fileId, notebookId, userId, data } = job.data;
        console.log(`Processing job ${job.id} of type ${type} for file ${fileId}`);

        let tempFilePath = null;
        try {
            await updateFileStatus(fileId, 'PROCESSING');

            let docs;
            if (type === 'FILE') {
                const { objectKey, mimeType } = data;
                const stream = await getObjectStream(objectKey);
                tempFilePath = path.join(os.tmpdir(), `ingest_${fileId}_${Date.now()}`);
                await pipeline(stream, fs.createWriteStream(tempFilePath));
                docs = await loadFile(tempFilePath, mimeType);
            } else if (type === 'URL') {
                docs = await loadUrl(data.url);
            } else if (type === 'TEXT') {
                // For text, it's already a local file created in the controller
                docs = await loadFile(data.filePath, data.mimeType);
                tempFilePath = data.filePath; // So it gets cleaned up if desired, though controller puts it in uploads/
            }

            if (docs && docs.length > 0) {
                await embedAndStore(docs, fileId, notebookId, userId);
                await updateFileStatus(fileId, 'COMPLETED');
            } else {
                throw new Error('No documents found to process');
            }

            // Cleanup temp file if it was created in tmp dir or if it was a TEXT job where we want to cleanup
            if (tempFilePath && fs.existsSync(tempFilePath) && (type === 'FILE' || type === 'TEXT')) {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (unlinkErr) {
                    console.error(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
                }
            }
        } catch (error) {
            console.error(`Error in worker for job ${job.id}:`, error);
            await updateFileStatus(fileId, 'FAILED');

            // Cleanup on error
            if (tempFilePath && fs.existsSync(tempFilePath) && (type === 'FILE' || type === 'TEXT')) {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (unlinkErr) {
                    console.error(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
                }
            }
            throw error;
        }
    },
    {
        connection: redisConfig,
    }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

export default worker;
