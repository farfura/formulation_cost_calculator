import { supabase } from '@/lib/supabase';
import { RawMaterial, Recipe, PackagingItem } from '@/types';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

// Raw Materials
export async function getRawMaterialsFromDB(): Promise<RawMaterial[]> {
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('raw_materials')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;

  // Transform data from snake_case (DB) to camelCase (TS)
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    totalCost: item.total_cost,
    totalWeight: item.total_weight,
    weightUnit: item.weight_unit,
    costPerGram: item.cost_per_gram,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function saveRawMaterialToDB(material: RawMaterial): Promise<RawMaterial> {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Only include id if it is a valid UUID
    const hasValidId = material.id && validateUUID(material.id);
    const dbMaterial = {
      ...(hasValidId ? { id: material.id } : {}),
      name: material.name,
      total_cost: material.totalCost,
      total_weight: material.totalWeight,
      weight_unit: material.weightUnit,
      cost_per_gram: material.costPerGram,
      user_id: user.id,
      // created_at and updated_at are handled by DB triggers
    };

    console.log('Saving material with payload:', JSON.stringify(dbMaterial, null, 2));
    
    const { data, error } = await supabase
      .from('raw_materials')
      .upsert([dbMaterial], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error saving raw material to DB:', error.message, error.details, error.hint);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from database after save');
    }

    // Transform returned data from snake_case (DB) to camelCase (TS)
    return {
      id: data.id,
      name: data.name,
      totalCost: data.total_cost,
      totalWeight: data.total_weight,
      weightUnit: data.weight_unit,
      costPerGram: data.cost_per_gram,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in saveRawMaterialToDB:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function deleteRawMaterialFromDB(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('raw_materials')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
}

// Recipes
export async function getRecipesFromDB() {
  console.log('Fetching recipes from DB - START');
  
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }

  console.log('Raw data from DB:', data);

  if (!data || data.length === 0) {
    console.log('No recipes found in DB');
    return [];
  }

  // Transform the data to match the TypeScript interface
  const transformedData = data.map(recipe => {
    // Ensure ingredients is an array and has the correct structure
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    
    return {
      id: recipe.id,
      name: recipe.name,
      ingredients: ingredients.map((ing: { 
        name?: string;
        materialName?: string;
        quantity?: number;
        amount?: number;
        unit: string;
        amount_in_grams?: number;
        amountInGrams?: number;
        cost: number;
      }) => ({
        materialName: ing.name || ing.materialName || '',
        amount: ing.quantity || ing.amount || 0,
        unit: ing.unit,
        amountInGrams: ing.amount_in_grams || ing.amountInGrams || 0,
        cost: ing.cost
      })),
      totalCost: recipe.total_cost || recipe.totalCost || 0,
      batchSize: recipe.batch_size || recipe.batchSize,
      numberOfUnits: recipe.number_of_units || recipe.numberOfUnits,
      costPerUnit: recipe.cost_per_unit || recipe.costPerUnit,
      originalBatchSize: recipe.original_batch_size || recipe.originalBatchSize,
      packaging: recipe.packaging || [],
      totalPackagingCost: recipe.total_packaging_cost || recipe.totalPackagingCost,
      category: recipe.category,
      description: recipe.description,
      instructions: recipe.instructions,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at
    };
  });

  console.log('Transformed recipes:', transformedData);
  return transformedData;
}

export async function saveRecipeToDB(recipe: Recipe) {
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Only include id if it is a valid UUID
  const hasValidId = recipe.id && validateUUID(recipe.id);

  // Sanitize payload: ensure no undefined, always arrays for JSONB fields
  const dbRecipe = {
    ...(hasValidId ? { id: recipe.id } : {}),
    name: recipe.name,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    total_cost: recipe.totalCost ?? 0,
    batch_size: recipe.batchSize ?? null,
    number_of_units: recipe.numberOfUnits ?? null,
    cost_per_unit: recipe.costPerUnit ?? null,
    original_batch_size: recipe.originalBatchSize ?? null,
    packaging: Array.isArray(recipe.packaging) ? recipe.packaging : [],
    total_packaging_cost: recipe.totalPackagingCost ?? 0,
    category: recipe.category ?? null,
    description: recipe.description ?? null,
    instructions: recipe.instructions ?? null,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('recipes')
    .upsert([dbRecipe], { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    console.error("Error in saveRecipeToDB:", error);
    throw error;
  }

  // Transform back to match the TypeScript interface
  return {
    id: data.id,
    name: data.name,
    ingredients: data.ingredients,
    totalCost: data.total_cost,
    batchSize: data.batch_size,
    numberOfUnits: data.number_of_units,
    costPerUnit: data.cost_per_unit,
    originalBatchSize: data.original_batch_size,
    packaging: data.packaging,
    totalPackagingCost: data.total_packaging_cost,
    category: data.category,
    description: data.description,
    instructions: data.instructions,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export async function deleteRecipeFromDB(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
}

// Packaging Items
export async function getPackagingItemsFromDB(): Promise<PackagingItem[]> {
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('packaging_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;

  // Transform data to include created_at and updated_at
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    cost: item.cost,
    description: item.description,
    supplier: item.supplier,
    category: item.category,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
}

export async function savePackagingItemToDB(item: PackagingItem): Promise<PackagingItem> {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Transform data from camelCase (TS) to snake_case (DB) if necessary
    const payload = item.id ? { ...item, user_id: user.id } : {
      name: item.name,
      cost: item.cost,
      description: item.description,
      supplier: item.supplier,
      category: item.category,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('packaging_items')
      .upsert([payload], { onConflict: 'id' })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error saving packaging item:", error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from database after save');
    }

    // Transform back if necessary
    return {
      id: data.id,
      name: data.name,
      cost: data.cost,
      description: data.description,
      supplier: data.supplier,
      category: data.category,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error("Error in savePackagingItemToDB:", error);
    throw error;
  }
}

export async function deletePackagingItemFromDB(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('packaging_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
} 