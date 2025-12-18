import express from 'express';
import {
  createNotebook,
  getNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
} from '../controllers/notebookController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notebook routes require authentication
router.use(authenticate);

router.post('/', createNotebook);
router.get('/', getNotebooks);
router.get('/:id', getNotebookById);
router.put('/:id', updateNotebook);
router.delete('/:id', deleteNotebook);

export default router;
