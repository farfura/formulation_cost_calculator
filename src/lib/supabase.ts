import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wpogjjrlhevjcnejycjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY';

console.log('Initializing Supabase client with:', { 
  url: supabaseUrl,
  hasKey: !!supabaseKey 
});

export const supabase = createClient(supabaseUrl, supabaseKey);

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

export type History = {
  id: string;
  recipe_id: string;
  changes: any;
  created_at: string;
}; 