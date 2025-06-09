import { createSupabaseServerClient } from './supabase/server';
import type { Recipe } from '@/types';

// Recipe Functions
export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecipe(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllRecipes() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateRecipe(id: string, updates: Partial<Recipe>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw error;
} 