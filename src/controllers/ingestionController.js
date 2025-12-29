import { saveFile, getFileStatus } from "../models/fileModel.js";
import { getHeadObject } from "../services/aws_service/s3Service.js";
import { ingestionQueue } from "../queues/ingestionQueue.js";
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
export const uploadMiddleware = upload.single('file');

export const ingestFile = async (req, res) => {
  try {
    const { objectKey, fileType, fileSize, fileName, notebookId, storageProvider } = req.body;
    const userId = req.user.id;

    if (!objectKey || !notebookId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const headObjectResponse = await getHeadObject(objectKey);

    if (!headObjectResponse) {
      return res.status(404).json({ error: "File not found" });
    }
    const { ContentType, ContentLength } = headObjectResponse;

    if (ContentType !== fileType || ContentLength != fileSize) {
      return res.status(400).json({ error: "Invalid file. Please try again." });
    }

    const fileData = await saveFile({
      fileName: fileName,
      objectKey: objectKey,
      bucketName: process.env.AWS_BUCKET_NAME,
      storageProvider: storageProvider,
      mimeType: fileType,
      fileSize: fileSize,
      userId: userId,
      notebookId: notebookId,
      status: "UPLOADED",
      uploadCompletedAt: new Date(Date.now()),
    });

    await ingestionQueue.add('process-file', {
      type: 'FILE',
      fileId: fileData.id,
      notebookId,
      userId,
      data: {
        objectKey,
        mimeType: fileType
      }
    });

    return res.status(200).json({ isSuccess: true, message: "File ingestion queued", fileId: fileData.id });

  } catch (error) {
    console.error("Error ingesting file:", error);
    return res.status(500).json({ isSuccess: false, error: "Failed to ingest file" });
  }
}

export const ingestUrl = async (req, res) => {
  try {
    const { url, notebookId } = req.body;
    const userId = req.user.id;

    if (!url || !notebookId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fileData = await saveFile({
      fileName: `${userId}_${Date.now()}_url`,
      objectKey: url,
      storageProvider: null,
      mimeType: "text/html",
      userId: userId,
      notebookId: notebookId
    });

    await ingestionQueue.add('process-url', {
      type: 'URL',
      fileId: fileData.id,
      notebookId: notebookId,
      userId,
      data: { url }
    });

    return res.status(201).json({ isSuccess: true, message: "URL ingestion queued", fileId: fileData.id });

  } catch (err) {
    return res.status(500).json({ isSuccess: false, error: err.message });
  }
}

export const fetchFileStatus = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const fileData = await getFileStatus({ fileId, userId });
    return res.status(200).json({ isSuccess: true, message: "File status retrieved", data: fileData });
  } catch (err) {
    return res.status(500).json({ isSuccess: false, error: err.message });
  }
}

export const testMulterIngestion = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ isSuccess: false, error: "No file uploaded" });
    }

    const { originalname, mimetype, size, path: filePath } = file;

    res.status(200).json({
      message: "File info captured successfully (TEST)",
      fileInfo: {
        fileName: originalname,
        fileType: mimetype,
        fileSize: size
      }
    });

  } catch (error) {
    console.error("Error in testMulterIngestion:", error);
    res.status(500).json({ isSuccess: false, error: error.message });
  }
};