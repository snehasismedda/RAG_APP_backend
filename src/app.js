import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import userRoutes from './routes/userRoute.js';
import chatRoutes from './routes/chatRoute.js';
import notebookRoutes from './routes/notebookRoute.js';
import ingestRoutes from './routes/ingestRoute.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/ingest', ingestRoutes);
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/notebook', notebookRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: 'Something went wrong!', details: err.message });
});

const port = process.env.PORT || 8000;
app.listen(port, () =>
  console.log(
    `backend server running at: http://localhost:${port}\npostgresql running at: http://localhost:8080\nqdrant running at: http://localhost:6333/dashboard`
  )
);
