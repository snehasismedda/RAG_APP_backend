import { Worker } from 'bullmq';
import redisConfig from '../config/redis.js';
import { embedAndStore } from '../services/vector_service/vectorStore.js';
import { updateFile } from '../models/fileModel.js';
import { getObjectStream } from '../services/aws_service/s3Service.js';
import {
    readTextStream,
    extractPdfText,
    extractDocxText,
    cleanText,
    semanticChunk,
    loadUrl,
} from '../utils/textExtractor.js';

const worker = new Worker(
    'ingestion-queue',
    async (job) => {
        const { type, fileId, notebookId, userId, data } = job.data;
        console.log(`Processing job ${job.id} of type ${type} for file ${fileId}`);
        if (type === 'FILE') {
            const { mimeType, objectKey, fileName } = data;

            // Step 1: Get file stream from S3
            const fileStream = await getObjectStream(objectKey);

            // Step 2: File-type detection & text extraction
            let rawText = '';

            if (mimeType.includes('text') || mimeType.includes('markdown')) {
                rawText = await readTextStream(fileStream);
            } else if (mimeType.includes('pdf')) {
                rawText = await extractPdfText(fileStream);
            } else if (mimeType.includes('doc') || mimeType.includes('msword') ||
                mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                rawText = await extractDocxText(fileStream);
            } else {
                throw new Error(`Unsupported file type: ${mimeType}`);
            }

            // Step 3: Clean text
            const cleanedText = cleanText(rawText);

            // Step 4: Semantic chunking (returns LangChain documents with all metadata)
            const chunks = await semanticChunk(cleanedText, {
                source: fileName || objectKey,
                fileId,
                notebookId,
                userId,
                mimeType
            });

            // Step 5: Generate embeddings and store
            await embedAndStore(chunks);

            return { isSuccess: true, message: 'File ingested successfully' };
        }

        if (type === 'URL') {
            const { url } = data;

            // loadUrl returns array of docs, extract text from pageContent
            const docs = await loadUrl(url);
            const rawText = docs.map(doc => doc.pageContent).join('\n');
            const cleanedText = cleanText(rawText);

            const chunks = await semanticChunk(cleanedText, {
                source: url,
                fileId,
                notebookId,
                userId,
                mimeType: 'text/html'
            });
            await embedAndStore(chunks);
            return { isSuccess: true, message: 'URL ingested successfully' };
        }

        throw new Error(`Unknown job type: ${type}`);
    },
    {
        connection: redisConfig,
    }
);

worker.on('completed', async (job) => {
    const result = await updateFile({
        id: job.data.fileId,
        userId: job.data.userId,
        processingStartedAt: new Date(job.processedOn),
        processingCompletedAt: new Date(job.finishedOn),
        status: 'INGESTED',
    })
    console.log(`Job ${job.id} completed successfully`, result);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

export default worker;