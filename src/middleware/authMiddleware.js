import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  findRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokensForUser,
  findUserById,
} from '../models/userModel.js';
import { generateTokens, cookieOptions } from '../utils/tokenUtils.js';

dotenv.config();

/**
 * Authentication middleware with automatic token refresh
 * Security features:
 * - Auto-refresh expired JWT if valid refresh token exists
 * - Token rotation on refresh (old token invalidated)
 * - Reuse detection (if stolen token used, all tokens revoked)
 */
export const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }

    // If user found, JWT is valid - proceed
    if (user) {
      req.user = user;
      return next();
    }

    // JWT invalid/expired - try to refresh using refresh token
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'No valid token found',
      });
    }

    try {
      // Check if refresh token exists in database
      const storedToken = await findRefreshToken(refreshToken);

      if (!storedToken) {
        // Token not in DB - possible token reuse attack!
        // Decode to get userId and revoke ALL their tokens
        try {
          const decoded = jwt.decode(refreshToken);
          if (decoded?.userId) {
            await deleteAllRefreshTokensForUser(decoded.userId);
            console.warn(
              `Security: Possible token reuse detected for user ${decoded.userId}`
            );
          }
        } catch (e) {
          // Ignore decode errors
        }
        return res.status(403).json({
          error: 'Session expired',
          details: 'Please login again',
        });
      }

      // Check if refresh token is expired
      if (new Date(storedToken.expires_at) < new Date()) {
        await deleteRefreshToken(refreshToken);
        return res.status(403).json({
          error: 'Session expired',
          details: 'Please login again',
        });
      }

      // Verify refresh token JWT signature
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Get user from database
      const refreshedUser = await findUserById(decoded.userId);
      if (!refreshedUser) {
        await deleteRefreshToken(refreshToken);
        return res.status(403).json({
          error: 'User not found',
        });
      }

      // Token Rotation: Delete old token, generate new pair
      await deleteRefreshToken(refreshToken);
      const newTokens = await generateTokens(refreshedUser.id);

      // Set new cookies
      res.cookie('jwt', newTokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refresh_token', newTokens.refreshToken, cookieOptions);

      // Attach user and continue
      req.user = refreshedUser;
      next();
    } catch (error) {
      // JWT verification failed (invalid signature, etc.)
      console.error('Token refresh error:', error.message);
      return res.status(403).json({
        error: 'Invalid session',
        details: 'Please login again',
      });
    }
  })(req, res, next);
};
