import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with:', { 
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey 
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Recipe = {
  id: string;
  name: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }[];
  total_cost: number;
  created_at: string;
  updated_at: string;
}; 