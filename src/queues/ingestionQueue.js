import { Queue } from 'bullmq';
import redisConfig from '../config/redis.js';

export const ingestionQueue = new Queue('ingestion-queue', {
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
