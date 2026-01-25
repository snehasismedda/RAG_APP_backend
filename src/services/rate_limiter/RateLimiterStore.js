import Redis from 'ioredis';
import redisConfig from '../../config/redis.js';
import logger from '../../config/logger.js';
import { ALGORITHMS } from '../../config/rateLimitConfig.js';

class RateLimiterStore {
    constructor() {
        this.redis = null;
        this.inMemoryStore = new Map();
        this.redisAvailable = false;
        this.initRedis();
    }

    async initRedis() {
        try {
            this.redis = new Redis({
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.password,
                enableOfflineQueue: false,
                retryStrategy: (times) => {
                    if (times > 3) {
                        logger.error('Redis connection failed after 3 retries. Using in-memory fallback.');
                        this.redisAvailable = false;
                        return null;
                    }
                    return Math.min(times * 100, 3000);
                },
            });

            this.redis.on('connect', () => {
                this.redisAvailable = true;
                logger.info('Rate limiter: Redis connected');
            });

            this.redis.on('error', (err) => {
                this.redisAvailable = false;
                logger.error('Rate limiter Redis error:', err);
            });

            this.redis.on('close', () => {
                this.redisAvailable = false;
                logger.warn('Rate limiter: Redis connection closed');
            });

        } catch (error) {
            logger.error('Failed to initialize Redis for rate limiter:', error);
            this.redisAvailable = false;
        }
    }

    async consume(key, points, duration, algorithm = ALGORITHMS.SLIDING_WINDOW, options = {}) {
        if (this.redisAvailable && this.redis) {
            try {
                switch (algorithm) {
                    case ALGORITHMS.SLIDING_WINDOW:
                        return await this.slidingWindowConsume(key, points, duration);
                    case ALGORITHMS.TOKEN_BUCKET:
                        return await this.tokenBucketConsume(key, points, duration, options);
                    default:
                        return await this.slidingWindowConsume(key, points, duration);
                }
            } catch (error) {
                logger.error('Redis rate limiter error, falling back to in-memory:', error);
                return this.inMemoryConsume(key, points, duration);
            }
        } else {
            return this.inMemoryConsume(key, points, duration);
        }
    }

    // Sliding Window Algorithm 
    async slidingWindowConsume(key, maxPoints, windowSeconds) {
        const now = Date.now();
        const windowStart = now - windowSeconds * 1000;
        const resetTime = now + windowSeconds * 1000;

        // Lua script for atomic operations
        const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local windowStart = tonumber(ARGV[2])
      local maxPoints = tonumber(ARGV[3])
      local windowSeconds = tonumber(ARGV[4])
      local resetTime = tonumber(ARGV[5])
      
      -- Remove expired entries
      redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
      
      -- Count current requests in window
      local current = redis.call('ZCARD', key)
      
      if current < maxPoints then
        -- Add new request
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, windowSeconds)
        return {1, maxPoints - current - 1, resetTime, 0}
      else
        -- Rate limit exceeded
        local oldestScore = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')[2]
        local retryAfter = math.ceil((tonumber(oldestScore) + windowSeconds * 1000 - now) / 1000)
        return {0, 0, resetTime, retryAfter}
      end
    `;

        const result = await this.redis.eval(
            luaScript,
            1,
            key,
            now,
            windowStart,
            maxPoints,
            windowSeconds,
            resetTime
        );

        return {
            allowed: result[0] === 1,
            remaining: result[1],
            resetTime: result[2],
            retryAfter: result[3],
        };
    }

    // Token Bucket Algorithm
    async tokenBucketConsume(key, tokensNeeded, refillDuration, options = {}) {
        const bucketSize = options.bucketSize || tokensNeeded;
        const refillRate = options.refillRate || tokensNeeded; // tokens per refillDuration
        const now = Date.now();

        const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local tokensNeeded = tonumber(ARGV[2])
      local bucketSize = tonumber(ARGV[3])
      local refillRate = tonumber(ARGV[4])
      local refillDuration = tonumber(ARGV[5])
      
      -- Get current state
      local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local tokens = tonumber(bucket[1]) or bucketSize
      local lastRefill = tonumber(bucket[2]) or now
      
      -- Calculate refill
      local timePassed = now - lastRefill
      local tokensToAdd = math.floor((timePassed / (refillDuration * 1000)) * refillRate)
      tokens = math.min(bucketSize, tokens + tokensToAdd)
      
      if tokensToAdd > 0 then
        lastRefill = now
      end
      
      if tokens >= tokensNeeded then
        -- Consume tokens
        tokens = tokens - tokensNeeded
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
        redis.call('EXPIRE', key, refillDuration * 2)
        
        local resetTime = now + ((bucketSize - tokens) / refillRate) * refillDuration * 1000
        return {1, math.floor(tokens), math.floor(resetTime), 0}
      else
        -- Not enough tokens
        local tokensShort = tokensNeeded - tokens
        local retryAfter = math.ceil((tokensShort / refillRate) * refillDuration)
        local resetTime = now + retryAfter * 1000
        
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
        redis.call('EXPIRE', key, refillDuration * 2)
        
        return {0, math.floor(tokens), math.floor(resetTime), retryAfter}
      end
    `;

        const result = await this.redis.eval(
            luaScript,
            1,
            key,
            now,
            tokensNeeded,
            bucketSize,
            refillRate,
            refillDuration
        );

        return {
            allowed: result[0] === 1,
            remaining: result[1],
            resetTime: result[2],
            retryAfter: result[3],
        };
    }

    // In-Memory Fallback (Simple Sliding Window)
    inMemoryConsume(key, maxPoints, windowSeconds) {
        const now = Date.now();
        const windowStart = now - windowSeconds * 1000;

        if (!this.inMemoryStore.has(key)) {
            this.inMemoryStore.set(key, []);
        }

        const timestamps = this.inMemoryStore.get(key);

        // Remove expired timestamps
        const validTimestamps = timestamps.filter((ts) => ts > windowStart);

        if (validTimestamps.length < maxPoints) {
            validTimestamps.push(now);
            this.inMemoryStore.set(key, validTimestamps);

            return {
                allowed: true,
                remaining: maxPoints - validTimestamps.length,
                resetTime: now + windowSeconds * 1000,
                retryAfter: 0,
            };
        } else {
            const oldestTimestamp = Math.min(...validTimestamps);
            const retryAfter = Math.ceil((oldestTimestamp + windowSeconds * 1000 - now) / 1000);

            return {
                allowed: false,
                remaining: 0,
                resetTime: oldestTimestamp + windowSeconds * 1000,
                retryAfter,
            };
        }
    }

    // Reset rate limit for a key
    async reset(key) {
        if (this.redisAvailable && this.redis) {
            await this.redis.del(key);
        }
        this.inMemoryStore.delete(key);
    }

    // Get remaining points for a key (non-consuming check)
    async getRemainingPoints(key, maxPoints, windowSeconds, algorithm = ALGORITHMS.SLIDING_WINDOW) {
        if (!this.redisAvailable || !this.redis) {
            const timestamps = this.inMemoryStore.get(key) || [];
            const windowStart = Date.now() - windowSeconds * 1000;
            const validTimestamps = timestamps.filter((ts) => ts > windowStart);
            return Math.max(0, maxPoints - validTimestamps.length);
        }

        try {
            if (algorithm === ALGORITHMS.SLIDING_WINDOW) {
                const now = Date.now();
                const windowStart = now - windowSeconds * 1000;
                await this.redis.zremrangebyscore(key, 0, windowStart);
                const current = await this.redis.zcard(key);
                return Math.max(0, maxPoints - current);
            } else if (algorithm === ALGORITHMS.TOKEN_BUCKET) {
                const tokens = await this.redis.hget(key, 'tokens');
                return tokens ? parseInt(tokens) : maxPoints;
            } else {
                const current = await this.redis.get(key);
                return Math.max(0, maxPoints - (current ? parseInt(current) : 0));
            }
        } catch (error) {
            logger.error('Error getting remaining points:', error);
            return maxPoints; // Fail-open
        }
    }

    // Cleanup method for graceful shutdown
    async close() {
        if (this.redis) {
            await this.redis.quit();
        }
        this.inMemoryStore.clear();
    }
}

const rateLimiterStore = new RateLimiterStore();

export default rateLimiterStore;
