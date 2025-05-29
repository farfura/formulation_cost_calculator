"use client";

import { createContext, useContext } from 'react';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

interface SupabaseContextType {
  supabase: SupabaseClient;
}

// Verify environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables. Check your .env.local file:\n` +
    `NEXT_PUBLIC_SUPABASE_URL: ${!!supabaseUrl}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${!!supabaseAnonKey}`
  );
}

// Create a single instance of Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Test the connection
Promise.resolve(
  supabase
    .from('pricing')
    .select('count(*)', { count: 'exact', head: true })
).then(() => {
  console.log('Supabase connection test successful');
}).catch((error: Error | PostgrestError) => {
  console.error('Supabase connection test failed:', error.message);
});

const SupabaseContext = createContext<SupabaseContextType>({ supabase });

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
} 