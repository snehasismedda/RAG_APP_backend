import { generatePresignedUrl } from '../services/aws_service/s3Service.js';
import { saveFile, updateFileStatus } from '../models/fileModel.js';
import { loadFile } from '../utils/fileLoader.js';
import { embedAndStore } from '../services/vector_service/vectorStore.js';
import path from 'path';
import fs from 'fs';

export const getPresignedUrl = async (req, res) => {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
        return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    try {
        const data = await generatePresignedUrl({ fileName, fileType });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// export const confirmUpload = async (req, res) => {
//     const { fileName, fileUrl, key, notebookId, fileSize, fileType } = req.body;
//     const userId = req.user.id;

//     if (!fileUrl || !key) {
//         return res.status(400).json({ error: 'fileUrl and key are required' });
//     }

//     try {
//         // 1. Save file to DB with PENDING status
//         const [fileData] = await saveFile({
//             fileName: fileName || 'Untitled',
//             fileUrl,
//             notebookId,
//             userId,
//             mimeType: fileType,
//             fileSize,
//             status: 'UPLOADED'
//         });

//         const fileId = fileData.id;

//         // 2. Respond to client immediately (optimistic)
//         // In a real message queue setup, we'd push to queue here.
//         // For now, we trigger ingestion asynchronously.
//         res.status(202).json({
//             message: 'Upload confirmed, ingestion started',
//             fileId
//         });

//         // 3. Trigger Ingestion (placeholder for MQ)
//         processIngestion(fileId, key, notebookId, userId, fileType);

//     } catch (error) {
//         console.error('Error confirming upload:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// async function processIngestion(fileId, key, notebookId, userId, mimeType) {
//     const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}_${path.basename(key)}`);
//     try {
//         await updateFileStatus(fileId, 'PROCESSING');

//         // Download from S3
//         await downloadFile(key, tempPath);

//         // Load and split
//         const docs = await loadFile(tempPath, mimeType);

//         // Embed and Store
//         await embedAndStore(docs, fileId, notebookId, userId);

//         await updateFileStatus(fileId, 'COMPLETED');
//         console.log(`Ingestion completed for file ${fileId}`);
//     } catch (error) {
//         console.error(`Ingestion failed for file ${fileId}:`, error);
//         await updateFileStatus(fileId, 'FAILED');
//     } finally {
//         // Cleanup temp file
//         if (fs.existsSync(tempPath)) {
//             fs.unlinkSync(tempPath);
//         }
//     }
// }
