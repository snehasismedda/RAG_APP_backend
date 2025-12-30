import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { ingestFile, ingestUrl, fetchFileStatus, deleteFile, testMulterIngestion, uploadMiddleware } from '../controllers/ingestionController.js';

const router = express.Router();

router.use(authenticate);
// /ingest/file
router.post("/file/completed", ingestFile);
// /ingest/url
router.post("/url/completed", ingestUrl);
// /ingest/status/:fileId
router.get("/status/:fileId", fetchFileStatus);
// /ingest/delete/:fileId
router.delete("/delete/:fileId", deleteFile);
// TEST ROUTE: /ingest/test-multer
router.post("/test-multer", uploadMiddleware, testMulterIngestion);

export default router;
