import { Queue } from 'bullmq';
import redisConfig from '../config/redis.js';

export const userQueue = new Queue('user-queue', {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});