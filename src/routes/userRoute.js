import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  getMe,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticate, getMe);
router.delete('/:id', authenticate, deleteUser);

export default router;
