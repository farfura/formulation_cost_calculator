import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wpogjjrlhevjcnejycjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb2dqanJsaGV2amNuZWp5Y2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MjE5NzAsImV4cCI6MjAyNTM5Nzk3MH0.Hs-Rl_YHgxVBZBGVPlOv9lxBiGhz9Z4K1RgY0LQE_Ow';

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