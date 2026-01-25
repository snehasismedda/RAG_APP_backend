import express from 'express';
import { getPresignedUrl } from '../controllers/awsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const s3RateLimiter = createRateLimiter({ points: 20, duration: 60 });
router.post('/presigned-url', authenticate, s3RateLimiter, getPresignedUrl);

export default router;
