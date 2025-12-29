import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  addUser,
  findUserByEmail,
  deleteRefreshToken,
  deleteUser as dbDeleteUser,
  deleteAllRefreshTokensForUser,
} from '../models/userModel.js';

dotenv.config({ quiet: true });

import { generateTokens, cookieOptions } from '../utils/tokenUtils.js';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userId } = req.body;

    if (!firstName || !lastName || !email || !password || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userId,
    };

    const id = await addUser(user);
    const { accessToken, refreshToken } = await generateTokens(id);

    res.cookie('jwt', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, cookieOptions);
    const { hash_password, ...userWithoutPassword } = user;
    res.status(201).json({
      user: { ...userWithoutPassword, id },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login an existing user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.hash_password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id);

    res.cookie('jwt', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, cookieOptions);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userId: user.user_id,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Logout the current user
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    res.clearCookie('jwt');
    res.clearCookie('refresh_token');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete the current user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await deleteAllRefreshTokensForUser(userId);
    await dbDeleteUser(userId);
    res.clearCookie('jwt');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current authenticated user
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userId: user.user_id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
