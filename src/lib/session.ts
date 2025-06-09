'use server';

import { createSupabaseServerClient } from './supabase/server';
import type { Session } from '@supabase/supabase-js';

/**
 * Gets the current session from the server-side Supabase client.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  
  return session;
}

/**
 * Gets the current user's ID from the session.
 * Throws an error if not authenticated.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
} 