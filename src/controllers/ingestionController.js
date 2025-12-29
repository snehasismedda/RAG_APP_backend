import { saveFile } from "../models/fileModel.js";
import { loadFile } from "../utils/fileLoader.js";
import { loadUrl } from "../utils/urlLoader.js";
import { embedAndStore } from "../services/vector_service/vectorStore.js";
import path from "path";
import fs from "fs";
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

    return res.status(200).json({ fileData });

  } catch (error) {
    console.error("Error ingesting file:", error);
    return res.status(500).json({ error: "Failed to ingest file" });
  }
}

export const ingestUrl = async (req, res) => {
  try {
    console.log("Processing URL:",);
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    let fileData;
    try {
      fileData = await saveFile({
        fileName: url,
        objectKey: url,
        storageProvider: 'url',
        mimeType: "text/html",
        userId: userId,
        notebookId: req.body.notebookId || null
      });
    } catch (err) {
      return res.status(500).json({ error: "Saving file failed: " + err.message });
    }

    await ingestionQueue.add('process-url', {
      type: 'URL',
      fileId: fileData.id,
      notebookId: req.body.notebookId,
      userId,
      data: { url }
    });

    return res.status(201).json({ status: "success", message: "URL ingestion queued", fileId: fileData.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


export const ingestText = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }
    const uploadsDir = path.join(process.cwd(), "uploads");
    console.log("Uploads directory:", uploadsDir);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a filename (could include userId + timestamp for uniqueness)
    const fileName = `${userId || "guest"}_${Date.now()}.txt`;
    const filePath = path.join(uploadsDir, fileName);

    // Write the text into the file
    fs.writeFileSync(filePath, text, "utf-8");

    const fileData = await saveFile({
      fileName: fileName,
      objectKey: `uploads/${fileName}`,
      storageProvider: 'local',
      mimeType: "text/plain",
      userId: userId,
      notebookId: req.body.notebookId || null
    });

    await ingestionQueue.add('process-text', {
      type: 'TEXT',
      fileId: fileData.id,
      notebookId: req.body.notebookId,
      userId,
      data: {
        filePath,
        mimeType: "text/plain"
      }
    });

    res.status(201).json({
      message: "Text ingestion queued",
      fileId: fileData.id,
      fileName,
    });
  } catch (err) {
    console.error("Error saving text:", err);
    res.status(500).json({ error: "Failed to save text" });
  }
};

export const testMulterIngestion = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
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
    res.status(500).json({ error: error.message });
  }
};