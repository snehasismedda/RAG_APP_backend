import logger from '../config/logger.js';
import _ from 'lodash';

export const isWhitelisted = (req, whitelistIPs = []) => {
    const ip = getClientIp(req);
    return _.includes(whitelistIPs, ip);
};

export const getClientIp = (req) => {
    return req.ip || req.connection?.remoteAddress || 'unknown';
};

export const getIdentifier = (req) => {
    const userId = _.get(req, 'user.id', null);
    if (userId) {
        return `user:${userId}`;
    }
    const ip = getClientIp(req);
    return `ip:${ip}`;
};

export const logRateLimitViolation = (req, limit, remaining, retryAfter) => {
    const userId = _.get(req, 'user.id', 'anonymous');
    const ip = getClientIp(req);
    const endpoint = `${req.method}:${_.get(req, 'route.path', req.path)}`;

    logger.warn('Rate limit exceeded', {
        userId,
        ip,
        endpoint,
        userAgent: req.get('user-agent'),
        limit,
        remaining,
        retryAfter,
        timestamp: new Date().toISOString(),
    });
};

export const logRateLimitCheck = (req, limit, remaining) => {
    const userId = _.get(req, 'user.id', 'anonymous');
    const ip = getClientIp(req);
    const path = _.get(req, 'route.path', req.path);
    const fullPath = _.get(req, 'baseUrl', '') + path;
    const endpoint = `${_.get(req, 'method',)}:${fullPath}`;

    logger.debug('Rate limit check', {
        userId,
        ip,
        endpoint,
        limit,
        remaining,
        timestamp: new Date().toISOString(),
    });
};

export const formatRateLimitError = (retryAfter, resetTime) => {
    return {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter,
        resetTime: new Date(resetTime).toISOString(),
    };
};

export const setRateLimitHeaders = (res, limit, remaining, resetTime) => {
    res.set({
        'X-RateLimit-Limit': limit,
        'X-RateLimit-Remaining': Math.max(0, remaining),
        'X-RateLimit-Reset': Math.floor(resetTime / 1000),
    });
};

export const setRetryAfterHeader = (res, retryAfter) => {
    res.set({
        'Retry-After': retryAfter,
        'X-RateLimit-Retry-After': retryAfter,
    });
};
