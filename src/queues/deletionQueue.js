import { Queue } from 'bullmq';
import redisConfig from '../config/redis.js';

export const deletionQueue = new Queue('deletion-queue', {
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