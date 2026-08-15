import { Router } from 'express';
import passport from '../config/passport';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/authenticate';
import {
  handleGoogleCallback,
  handleRefreshToken,
  handleLogout,
  handleLogoutAll,
  handleGetMe,
  handleGetSessions,
} from '../controllers/auth/auth.controller';

const router = Router();

// Google OAuth
router.get(
  '/google',
  authRateLimiter,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env['FRONTEND_URL']}/auth/error?message=Google authentication failed`,
  }),
  handleGoogleCallback
);

// Token management
router.post('/refresh', authRateLimiter, handleRefreshToken);

// Protected routes
router.post('/logout', authenticate, handleLogout);
router.post('/logout-all', authenticate, handleLogoutAll);
router.get('/me', authenticate, handleGetMe);
router.get('/sessions', authenticate, handleGetSessions);

export default router;