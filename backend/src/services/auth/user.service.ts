import { supabaseAdmin } from '../../config/supabase';
import type { User } from '../../types';

interface GoogleUserInput {
  email: string;
  name: string;
  avatar_url: string | null;
  google_id: string;
}

export async function findOrCreateGoogleUser(
  input: GoogleUserInput
): Promise<User> {
  // Check if user already exists by google_id
  const { data: existingUser, error: findError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('google_id', input.google_id)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Database error finding user: ${findError.message}`);
  }

  if (existingUser) {
    // Update last seen info
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name: input.name,
        avatar_url: input.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)
      .select('*')
      .single();

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    return updatedUser as User;
  }

  // Create new user
  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      email: input.email,
      name: input.name,
      avatar_url: input.avatar_url,
      google_id: input.google_id,
    })
    .select('*')
    .single();

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  return newUser as User;
}

export async function findUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data as User;
}