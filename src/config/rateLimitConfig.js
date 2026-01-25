import dotenv from 'dotenv';
dotenv.config();

export const ALGORITHMS = {
    SLIDING_WINDOW: 'SLIDING_WINDOW',
    TOKEN_BUCKET: 'TOKEN_BUCKET',
};

export const DEFAULT_LIMITS = {
    anonymous: {
        points: 20,
        duration: 60,
        algorithm: ALGORITHMS.SLIDING_WINDOW,
    },
    authenticated: {
        points: 100,
        duration: 60,
        algorithm: ALGORITHMS.SLIDING_WINDOW,
    },
};

export const RATE_LIMIT_CONFIG = {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    skipOnRedisFailure: process.env.RATE_LIMIT_SKIP_ON_REDIS_FAILURE !== 'false',
    keyPrefix: 'ratelimit',
    whitelistIPs: (process.env.RATE_LIMIT_WHITELIST_IPS || '127.0.0.1,::1')
        .split(',')
        .map((ip) => ip.trim()),
    useForwardedFor: process.env.RATE_LIMIT_USE_FORWARDED_FOR === 'true',
};

export const generateRateLimitKey = (prefix, endpoint, identifier) => {
    const sanitizedEndpoint = endpoint.replace(/:/g, '_').replace(/\//g, '_');
    return `${prefix}:${sanitizedEndpoint}:${identifier}`;
};

export const getDefaultRateLimit = (isAuthenticated) => {
    return isAuthenticated ? DEFAULT_LIMITS.authenticated : DEFAULT_LIMITS.anonymous;
};