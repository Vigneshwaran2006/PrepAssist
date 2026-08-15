import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { JwtAccessPayload, JwtRefreshPayload, AuthTokens } from '../types';

export function generateAccessToken(payload: JwtAccessPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JwtRefreshPayload): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtAccessPayload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtRefreshPayload;
}

export function generateTokenPair(
  userId: string,
  email: string,
  sessionId: string
): AuthTokens {
  const accessToken = generateAccessToken({ userId, email, sessionId });
  const refreshToken = generateRefreshToken({ userId, sessionId });
  return { accessToken, refreshToken };
}