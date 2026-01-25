import rateLimiterStore from '../services/rate_limiter/RateLimiterStore.js';
import {
    RATE_LIMIT_CONFIG,
    getDefaultRateLimit,
    generateRateLimitKey,
} from '../config/rateLimitConfig.js';
import {
    getIdentifier,
    isWhitelisted,
    formatRateLimitError,
    setRateLimitHeaders,
    setRetryAfterHeader,
    logRateLimitViolation,
    logRateLimitCheck,
} from '../utils/rateLimitMonitor.js';
import logger from '../config/logger.js';
import _ from 'lodash';

export const createRateLimiter = (options = {}) => {
    return async (req, res, next) => {

        if (!RATE_LIMIT_CONFIG.enabled) {
            logger.debug('[RateLimiter] Rate limiting is DISABLED');
            return next();
        }

        if (isWhitelisted(req, RATE_LIMIT_CONFIG.whitelistIPs)) {
            logger.debug('Rate limit bypassed for whitelisted IP');
            return next();
        }

        try {
            const method = _.get(req, 'method', 'GET');
            const path = _.get(req, 'route.path', req.path);
            const fullPath = _.get(req, 'baseUrl', '') + path;
            const isAuthenticated = !!req.user;
            const endpointConfig = options.points
                ? options
                : getDefaultRateLimit(isAuthenticated);

            const {
                points,
                duration,
                algorithm,
                bucketSize,
                refillRate,
                blockDuration,
            } = endpointConfig;

            logger.debug(`[RateLimiter] Config: ${points} req/${duration}s, algorithm: ${algorithm}`);

            const identifier = getIdentifier(req);
            const endpoint = `${method}:${fullPath}`;
            const key = generateRateLimitKey(RATE_LIMIT_CONFIG.keyPrefix, endpoint, identifier);

            logger.debug(`[RateLimiter] Key: ${key}`);

            if (blockDuration) {
                const blockKey = `${key}:blocked`;
                const blocked = await rateLimiterStore.redis?.get(blockKey);
                if (blocked) {
                    const ttl = await rateLimiterStore.redis.ttl(blockKey);
                    setRetryAfterHeader(res, ttl);
                    return res.status(429).json({
                        error: 'Too Many Requests',
                        message: 'Your account has been temporarily blocked due to too many failed attempts.',
                        retryAfter: ttl,
                        blockedUntil: new Date(Date.now() + ttl * 1000).toISOString(),
                    });
                }
            }

            const result = await rateLimiterStore.consume(key, points, duration, algorithm, {
                bucketSize,
                refillRate,
            });

            setRateLimitHeaders(res, points, result.remaining, result.resetTime);

            if (result.allowed) {
                logRateLimitCheck(req, points, result.remaining);
                return next();
            } else {
                setRetryAfterHeader(res, result.retryAfter);
                logRateLimitViolation(req, points, result.remaining, result.retryAfter);

                if (blockDuration && rateLimiterStore.redis) {
                    const blockKey = `${key}:blocked`;
                    await rateLimiterStore.redis.setex(blockKey, blockDuration, '1');
                    logger.warn(`User/IP blocked for ${blockDuration}s due to rate limit violation`, {
                        identifier,
                        endpoint,
                    });
                }

                return res.status(429).json(formatRateLimitError(result.retryAfter, result.resetTime));
            }
        } catch (error) {
            logger.error('Rate limiter error:', error);
            if (RATE_LIMIT_CONFIG.skipOnRedisFailure) {
                logger.warn('Rate limiter failed, allowing request (fail-open mode)');
                return next();
            } else {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Rate limiting service is temporarily unavailable.',
                });
            }
        }
    };
};

export const defaultRateLimiter = createRateLimiter();

export const authRateLimiter = createRateLimiter({
    points: 5,
    duration: 300,
    blockDuration: 300,
});

export const expensiveOpLimiter = createRateLimiter({
    points: 10,
    duration: 60,
    algorithm: 'TOKEN_BUCKET',
    bucketSize: 15,
    refillRate: 10,
});

export const chatRateLimiter = createRateLimiter({
    points: 30,
    duration: 60,
});

export const deleteRateLimiter = createRateLimiter({
    points: 30,
    duration: 60,
});

export const resetRateLimit = async (req, res) => {
    try {
        const { userId, ip, endpoint } = req.body;

        if (!userId && !ip) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Either userId or ip must be provided',
            });
        }

        const identifier = userId ? `user:${userId}` : `ip:${ip}`;
        const key = endpoint
            ? generateRateLimitKey(RATE_LIMIT_CONFIG.keyPrefix, endpoint, identifier)
            : `${RATE_LIMIT_CONFIG.keyPrefix}:*:${identifier}`;

        await rateLimiterStore.reset(key);

        logger.info('Rate limit reset', { identifier, endpoint });

        return res.json({
            success: true,
            message: 'Rate limit reset successfully',
            identifier,
            endpoint: endpoint || 'all',
        });
    } catch (error) {
        logger.error('Error resetting rate limit:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to reset rate limit',
        });
    }
};
