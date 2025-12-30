import express from 'express';
import { getPresignedUrl } from '../controllers/awsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/presigned-url', authenticate, getPresignedUrl);

export default router;
