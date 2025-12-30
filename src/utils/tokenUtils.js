import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { saveRefreshToken } from '../models/userModel.js';

dotenv.config();

export const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Short-lived access token
  });
  const refreshToken = jwt.sign(
    { userId, randomId: Math.random().toString(36).substring(7) },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d', // Long-lived refresh token
    }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await saveRefreshToken({ token: refreshToken, userId, expiresAt });

  return { accessToken, refreshToken };
};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
