import express from 'express';
import {
  chat,
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  getConversations,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Chat message endpoint
router.post('/', chat);

// Chat CRUD operations
router.post('/create', createChat);
router.get('/:chatId', getConversations);
router.patch('/:id', updateChat);
router.delete('/:id', deleteChat);

export default router;
