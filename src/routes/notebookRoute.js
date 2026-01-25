import express from 'express';
import {
  createNotebook,
  getNotebooks,
  getNotebookContent,
  updateNotebook,
  deleteNotebook,
} from '../controllers/notebookController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { defaultRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.post('/', defaultRateLimiter, createNotebook);
router.get('/', defaultRateLimiter, getNotebooks);
router.get('/:id', defaultRateLimiter, getNotebookContent);
router.patch('/:id', defaultRateLimiter, updateNotebook);
router.delete('/:id', defaultRateLimiter, deleteNotebook);

export default router;
