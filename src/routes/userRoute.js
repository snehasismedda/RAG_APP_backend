import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.delete('/delete', authenticate, deleteUser); 

export default router;
