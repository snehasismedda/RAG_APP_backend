import express from 'express';
import {
  chat,
  createChat,
  updateChat,
  deleteChat,
  getConversations,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { chatRateLimiter, defaultRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.post('/', chatRateLimiter, chat);
router.post('/create', chatRateLimiter, createChat);
router.get('/:chatId', defaultRateLimiter, getConversations);
router.patch('/:id', defaultRateLimiter, updateChat);
router.delete('/:id', defaultRateLimiter, deleteChat);

export default router;
