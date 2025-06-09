'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.');
}

/**
 * Creates a Supabase client for use in Client Components (the browser).
 * 
 * This client is a singleton, meaning the same instance is returned on every call
 * from this file.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey); 