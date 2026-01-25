import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  getMe,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authRateLimiter, defaultRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.post('/logout', authenticate, authRateLimiter, logoutUser);
router.get('/me', authenticate, defaultRateLimiter, getMe);
router.delete('/:id', authenticate, authRateLimiter, deleteUser);

export default router;
