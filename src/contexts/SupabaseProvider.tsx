"use client";

import { createContext, useContext } from 'react';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface SupabaseContextType {
  supabase: SupabaseClient;
}

// Test the connection
const testConnection = async () => {
  try {
    await supabase.from('pricing').select('count(*)', { count: 'exact', head: true });
    console.log('Supabase connection test successful');
  } catch (error) {
    console.error('Supabase connection test failed:', (error as Error).message);
  }
};

// Run the test
void testConnection();

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