import type { Request, Response } from 'express';
import { generateTokenPair } from '../../utils/jwt';
import { verifyRefreshToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import {
  createSession,
  findActiveSession,
  rotateSessionToken,
  deactivateSession,
  deactivateAllUserSessions,
  getUserActiveSessions,
} from '../../services/auth/session.service';
import { findUserById } from '../../services/auth/user.service';
import type { User } from '../../types';
import { config } from '../../config/env';

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: (config.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function handleGoogleCallback(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;

    if (!user) {
      res.redirect(
        `${config.FRONTEND_URL}/auth/error?message=Authentication failed`
      );
      return;
    }

    const deviceInfo = req.headers['user-agent'] ?? null;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
      req.socket.remoteAddress ??
      null;

    // Create session first to get session ID
    const tempSession = await createSession({
      user_id: user.id,
      refresh_token: 'temp',
      device_info: deviceInfo,
      ip_address: ipAddress,
    });

    const tokens = generateTokenPair(user.id, user.email, tempSession.id);

    // Update session with actual refresh token
    await rotateSessionToken(tempSession.id, tokens.refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie('refresh_token', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Redirect to frontend with access token
    res.redirect(
      `${config.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&userId=${user.id}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Authentication failed';
    res.redirect(
      `${config.FRONTEND_URL}/auth/error?message=${encodeURIComponent(message)}`
    );
  }
}

export async function handleRefreshToken(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const refreshToken = req.cookies['refresh_token'] as string | undefined;

    if (!refreshToken) {
      sendError(res, 'Refresh token not found', 401);
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const session = await findActiveSession(payload.sessionId, refreshToken);

    if (!session) {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: (config.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
        path: '/',
      });
      sendError(res, 'Session expired or invalid. Please login again.', 401);
      return;
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    const tokens = generateTokenPair(user.id, user.email, session.id);
    await rotateSessionToken(session.id, tokens.refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    sendSuccess(res, 'Token refreshed successfully', {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch {
    res.clearCookie('refresh_token', {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: (config.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
});
    sendError(res, 'Invalid refresh token. Please login again.', 401);
  }
}

export async function handleLogout(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const sessionId = req.sessionId;

    if (sessionId) {
      await deactivateSession(sessionId);
    }

    res.clearCookie('refresh_token', { path: '/' });
    sendSuccess(res, 'Logged out successfully');
  } catch {
    sendError(res, 'Logout failed');
  }
}

export async function handleLogoutAll(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    await deactivateAllUserSessions(user.id);
    res.clearCookie('refresh_token', { path: '/' });
    sendSuccess(res, 'Logged out from all devices successfully');
  } catch {
    sendError(res, 'Logout failed');
  }
}

export async function handleGetMe(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    sendSuccess(res, 'User fetched successfully', {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    });
  } catch {
    sendError(res, 'Failed to fetch user');
  }
}

export async function handleGetSessions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const sessions = await getUserActiveSessions(user.id);

    const safeSessions = sessions.map((s) => ({
      id: s.id,
      device_info: s.device_info,
      ip_address: s.ip_address,
      created_at: s.created_at,
      expires_at: s.expires_at,
      is_current: s.id === req.sessionId,
    }));

    sendSuccess(res, 'Sessions fetched successfully', { sessions: safeSessions });
  } catch {
    sendError(res, 'Failed to fetch sessions');
  }
}