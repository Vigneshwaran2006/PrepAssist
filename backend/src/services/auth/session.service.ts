import { supabaseAdmin } from '../../config/supabase';
import { hashToken } from '../../utils/hash';
import type { Session } from '../../types';

interface CreateSessionInput {
  user_id: string;
  refresh_token: string;
  device_info: string | null;
  ip_address: string | null;
}

export async function createSession(
  input: CreateSessionInput
): Promise<Session> {
  const refresh_token_hash = hashToken(input.refresh_token);

  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + 7); // 7 days

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      user_id: input.user_id,
      refresh_token_hash,
      device_info: input.device_info,
      ip_address: input.ip_address,
      is_active: true,
      expires_at: expires_at.toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data as Session;
}

export async function findActiveSession(
  sessionId: string,
  refreshToken: string
): Promise<Session | null> {
  const refresh_token_hash = hashToken(refreshToken);

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('refresh_token_hash', refresh_token_hash)
    .eq('is_active', true)
    .single();

  if (error) {
    return null;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    await deactivateSession(sessionId);
    return null;
  }

  return data as Session;
}

export async function rotateSessionToken(
  sessionId: string,
  newRefreshToken: string
): Promise<void> {
  const refresh_token_hash = hashToken(newRefreshToken);

  const new_expires_at = new Date();
  new_expires_at.setDate(new_expires_at.getDate() + 7);

  const { error } = await supabaseAdmin
    .from('sessions')
    .update({
      refresh_token_hash,
      expires_at: new_expires_at.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to rotate session: ${error.message}`);
  }
}

export async function deactivateSession(sessionId: string): Promise<void> {
  await supabaseAdmin
    .from('sessions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', sessionId);
}

export async function deactivateAllUserSessions(
  userId: string
): Promise<void> {
  await supabaseAdmin
    .from('sessions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

export async function getUserActiveSessions(
  userId: string
): Promise<Session[]> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data as Session[];
}