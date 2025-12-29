import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { ingestFile, ingestUrl, ingestText, testMulterIngestion, uploadMiddleware } from '../controllers/ingestionController.js';

const router = express.Router();

router.use(authenticate);
// /ingest/file
router.post("/file/completed", ingestFile);
// /ingest/url
router.post("/url/completed", ingestUrl);
// /ingest/text
router.post("/text/completed", ingestText);

// TEST ROUTE: /ingest/test-multer
router.post("/test-multer", uploadMiddleware, testMulterIngestion);

export default router;
