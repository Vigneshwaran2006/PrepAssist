import 'dotenv/config';
import { validateEnv } from './config/env';

validateEnv();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import './config/passport';
import { generalRateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import analysisRoutes from './routes/analysis.routes';
import { sendError } from './utils/response';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(generalRateLimiter);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PrepAssist API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyses', analysisRoutes);

app.use((_req, res) => {
  sendError(res, 'Route not found', 404);
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    sendError(
      res,
      config.NODE_ENV === 'development' ? err.message : 'Internal server error',
      500
    );
  }
);

app.listen(config.PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║       PrepAssist API Server        ║
  ║  Running on http://localhost:${config.PORT}  ║
  ║  Environment: ${config.NODE_ENV.padEnd(20)}║
  ╚════════════════════════════════════╝
  `);
});

export default app;