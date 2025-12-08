import express from 'express';
import {
  chat,
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Chat message endpoint
router.post('/', chat);

// Chat CRUD operations
router.post('/create', createChat);
router.get('/notebook/:notebookId', getChats);
router.get('/:id', getChatById);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

export default router;
