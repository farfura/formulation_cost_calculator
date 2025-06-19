'use server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { RawMaterial, Recipe, PackagingItem } from '@/types';
import { getUserId } from '../lib/session';

// Raw Materials using Supabase Client
export async function getRawMaterialsFromSupabase(): Promise<RawMaterial[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching raw materials:', error.message);
      return [];
    }

    return data?.map((item: any) => ({
      id: item.id,
      name: item.name,
      totalCost: parseFloat(item.total_cost || '0'),
      totalWeight: parseFloat(item.total_weight || '0'),
      weightUnit: item.weight_unit,
      costPerGram: parseFloat(item.cost_per_gram || '0'),
      supplierName: item.supplier_name,
      supplierContact: item.supplier_contact,
      lastPurchaseDate: item.last_purchase_date,
      purchaseNotes: item.purchase_notes,
      usageNotes: item.usage_notes,
      typicalMonthlyUsage: parseFloat(item.typical_monthly_usage || '0'),
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];
  } catch (err) {
    console.log('Error fetching raw materials:', err);
    return [];
  }
}

// Recipes using Supabase Client
export async function getRecipesFromSupabase(): Promise<Recipe[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching recipes:', error.message);
      return [];
    }

    return data?.map((item: any) => ({
      id: item.id,
      name: item.name,
      ingredients: item.ingredients || [],
      totalCost: parseFloat(item.total_cost || '0'),
      batchSize: parseFloat(item.batch_size || '0'),
      numberOfUnits: item.number_of_units,
      costPerUnit: parseFloat(item.cost_per_unit || '0'),
      originalBatchSize: parseFloat(item.original_batch_size || '0'),
      packaging: item.packaging || [],
      totalPackagingCost: parseFloat(item.total_packaging_cost || '0'),
      category: item.category,
      description: item.description,
      instructions: item.instructions,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];
  } catch (err) {
    console.log('Error fetching recipes:', err);
    return [];
  }
}

// Packaging Items using Supabase Client
export async function getPackagingItemsFromSupabase(): Promise<PackagingItem[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('packaging_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching packaging items:', error.message);
      return [];
    }

    return data?.map((item: any) => ({
      id: item.id,
      name: item.name,
      cost: parseFloat(item.cost || '0'),
      description: item.description,
      supplier: item.supplier,
      category: item.category || 'other',
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];
  } catch (err) {
    console.log('Error fetching packaging items:', err);
    return [];
  }
}

// Save Raw Material using Supabase Client
export async function saveRawMaterialToDB(material: RawMaterial): Promise<RawMaterial> {
  console.log('saveRawMaterialToDB called with:', { name: material.name, id: material.id });
  
  const userId = await getUserId();
  console.log('User ID from session:', userId);
  
  if (!userId) {
    console.error('No user ID found - authentication required');
    throw new Error('Authentication required');
  }

  try {
    const supabase = await createSupabaseServerClient();
    console.log('Supabase client created successfully');
    
    const data = {
      id: material.id,
      name: material.name,
      total_cost: material.totalCost,
      total_weight: material.totalWeight,
      weight_unit: material.weightUnit,
      cost_per_gram: material.costPerGram,
      supplier_name: material.supplierName || null,
      supplier_contact: material.supplierContact || null,
      last_purchase_date: material.lastPurchaseDate || null,
      purchase_notes: material.purchaseNotes || null,
      usage_notes: material.usageNotes || null,
      typical_monthly_usage: material.typicalMonthlyUsage || null,
      user_id: userId,
    };

    console.log('Data to be saved:', data);

    const { data: result, error } = await supabase
      .from('raw_materials')
      .upsert([data])
      .select()
      .single();

    console.log('Supabase response:', { result, error });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    if (!result) {
      throw new Error('No data returned from upsert operation');
    }

    console.log('Material saved successfully:', result);

    return {
      id: result.id,
      name: result.name,
      totalCost: parseFloat(result.total_cost || '0'),
      totalWeight: parseFloat(result.total_weight || '0'),
      weightUnit: result.weight_unit,
      costPerGram: parseFloat(result.cost_per_gram || '0'),
      supplierName: result.supplier_name,
      supplierContact: result.supplier_contact,
      lastPurchaseDate: result.last_purchase_date,
      purchaseNotes: result.purchase_notes,
      usageNotes: result.usage_notes,
      typicalMonthlyUsage: parseFloat(result.typical_monthly_usage || '0'),
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  } catch (err) {
    console.error('Error saving raw material:', err);
    throw err;
  }
}

// Delete Raw Material using Supabase Client
export async function deleteRawMaterialFromDB(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (err) {
    console.log('Error deleting raw material:', err);
    throw err;
  }
}

// Save Recipe using Supabase Client
export async function saveRecipeToDB(recipe: Recipe): Promise<Recipe> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  try {
    const supabase = await createSupabaseServerClient();
    const data = {
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients,
      total_cost: recipe.totalCost,
      batch_size: recipe.batchSize,
      number_of_units: recipe.numberOfUnits,
      cost_per_unit: recipe.costPerUnit,
      original_batch_size: recipe.originalBatchSize,
      packaging: recipe.packaging,
      total_packaging_cost: recipe.totalPackagingCost,
      category: recipe.category,
      description: recipe.description,
      instructions: recipe.instructions,
      user_id: userId,
    };

    const { data: result, error } = await supabase
      .from('recipes')
      .upsert([data])
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      name: result.name,
      ingredients: result.ingredients || [],
      totalCost: parseFloat(result.total_cost || '0'),
      batchSize: parseFloat(result.batch_size || '0'),
      numberOfUnits: result.number_of_units,
      costPerUnit: parseFloat(result.cost_per_unit || '0'),
      originalBatchSize: parseFloat(result.original_batch_size || '0'),
      packaging: result.packaging || [],
      totalPackagingCost: parseFloat(result.total_packaging_cost || '0'),
      category: result.category,
      description: result.description,
      instructions: result.instructions,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  } catch (err) {
    console.log('Error saving recipe:', err);
    throw err;
  }
}

// Delete Recipe using Supabase Client
export async function deleteRecipeFromDB(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (err) {
    console.log('Error deleting recipe:', err);
    throw err;
  }
}

// Save Packaging Item using Supabase Client
export async function savePackagingItemToDB(item: PackagingItem): Promise<PackagingItem> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  try {
    const supabase = await createSupabaseServerClient();
    const data = {
      id: item.id,
      name: item.name,
      cost: item.cost,
      description: item.description,
      supplier: item.supplier,
      category: item.category,
      user_id: userId,
    };

    const { data: result, error } = await supabase
      .from('packaging_items')
      .upsert([data])
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      name: result.name,
      cost: parseFloat(result.cost || '0'),
      description: result.description,
      supplier: result.supplier,
      category: result.category || 'other',
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  } catch (err) {
    console.log('Error saving packaging item:', err);
    throw err;
  }
}

// Delete Packaging Item using Supabase Client
export async function deletePackagingItemFromDB(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('packaging_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (err) {
    console.log('Error deleting packaging item:', err);
    throw err;
  }
} 