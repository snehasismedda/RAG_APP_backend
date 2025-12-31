import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
};

export default redisConfig;
