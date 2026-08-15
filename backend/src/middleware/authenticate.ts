import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { findUserById } from '../services/auth/user.service';
import { sendError } from '../utils/response';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      sendError(res, 'Access token required', 401);
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.userId);

    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    req.user = user;
    req.sessionId = payload.sessionId;
    next();
  } catch {
    sendError(res, 'Invalid or expired access token', 401);
  }
}