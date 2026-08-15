import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many requests from this IP. Please try again after 15 minutes.',
      429
    );
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many requests from this IP. Please try again after 15 minutes.',
      429
    );
  },
});