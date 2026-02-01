import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import * as userModel from '../models/userModel.js';
import { deletionQueue } from '../queues/index.js';

dotenv.config({ quiet: true });

import { generateTokens, cookieOptions } from '../utils/tokenUtils.js';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userName } = req.body;

    if (!firstName || !lastName || !email || !password || !userName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await userModel.findUserByEmail({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await userModel.addUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userName,
    });
    const { accessToken, refreshToken } = await generateTokens(user.id);

    res.cookie('jwt', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, cookieOptions);
    res.status(201).json({
      id: user.id
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Login an existing user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await userModel.findUserByEmail({ email });

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
        userName: user.user_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to login user" });
  }
};

// Logout the current user
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await userModel.deleteRefreshTokensByToken(refreshToken);
    }
    res.clearCookie('jwt');
    res.clearCookie('refresh_token');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to logout user" });
  }
};

// Delete the current user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findUserById({ id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await deletionQueue.add('DELETE_USER', {
      type: 'DELETE_USER',
      userId: id,
    }, {
      jobId: `Job-delete-user-${id}`,
    });
    res.clearCookie('jwt');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
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
        userName: user.user_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
};
