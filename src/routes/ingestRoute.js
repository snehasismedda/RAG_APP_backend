import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { ingestFile, ingestUrl, ingestText } from '../controllers/ingestionController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.use(authenticate);
// /ingest/file
router.post("/file",upload.array("file", 5), ingestFile);
// /ingest/url
router.post("/url", ingestUrl);
// /ingest/text
router.post("/text", ingestText);

export default router;
