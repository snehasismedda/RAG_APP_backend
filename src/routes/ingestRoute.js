import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { ingestFile, ingestUrl, fetchFileStatus, deleteFile, testMulterIngestion, uploadMiddleware } from '../controllers/ingestionController.js';
import { expensiveOpLimiter, defaultRateLimiter, deleteRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.post("/file/completed", expensiveOpLimiter, ingestFile);
router.post("/url/completed", expensiveOpLimiter, ingestUrl);
router.get("/status/:fileId", defaultRateLimiter, fetchFileStatus);
router.delete("/delete/:fileId", deleteRateLimiter, deleteFile);

router.post("/test-multer", uploadMiddleware, testMulterIngestion);

export default router;
