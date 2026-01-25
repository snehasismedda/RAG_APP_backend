import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import logger from './config/logger.js';
import passport from './config/passport.js';
import userRoutes from './routes/userRoute.js';
import chatRoutes from './routes/chatRoute.js';
import notebookRoutes from './routes/notebookRoute.js';
import ingestRoutes from './routes/ingestRoute.js';
import awsRoutes from './routes/awsRoute.js';
import * as workers from './workers/index.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/ingest', ingestRoutes);
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/notebook', notebookRoutes);
app.use('/aws', awsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error: 'Something went wrong!', details: err.message });
});

const port = process.env.PORT || 8000;
app.listen(port, () =>
  logger.info(
    `backend server running at: http://localhost:${port} | postgresql: 8080 | qdrant: 6333`
  )
);
