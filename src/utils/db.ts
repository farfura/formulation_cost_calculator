'use server';
import { prisma } from '@/lib/prisma';
import { RawMaterial, Recipe, PackagingItem, WeightUnit, PackagingType, RecipeIngredient } from '@/types';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { getUserId } from '../lib/session';
import { Decimal } from '@prisma/client/runtime/library';
import type { JsonValue, InputJsonValue } from '@prisma/client/runtime/library';
import { z } from 'zod';
import type { RawMaterial as PrismaRawMaterial, PackagingItem as PrismaPackagingItem, recipes as PrismaRecipe } from '@prisma/client';

// Safe error logging function
const safeLog = (message: string, error: unknown) => {
  try {
    if (error && typeof error === 'object') {
      console.log(`${message}:`, error);
    } else {
      console.log(`${message}: ${String(error || 'Unknown error')}`);
    }
  } catch {
    console.log(`${message}: Unable to log error details`);
  }
};

// Re-defining validation schemas to be explicit and avoid 'any'
const recipeIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  percentage: z.number(),
  cost: z.number(),
});

const packagingItemInRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
  units: z.number(),
});

const rawMaterialSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  totalCost: z.number().positive("Total cost must be positive"),
  totalWeight: z.number().positive("Total weight must be positive"),
  weightUnit: z.enum(['g', 'kg', 'oz', 'lb', 'ml', 'l']),
  costPerGram: z.number().positive("Cost per gram must be positive"),
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  lastPurchaseDate: z.string().optional(),
  purchaseNotes: z.string().optional(),
  usageNotes: z.string().optional(),
  typicalMonthlyUsage: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const recipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  ingredients: z.array(recipeIngredientSchema),
  totalCost: z.number().min(0),
  batchSize: z.number().positive().optional(),
  numberOfUnits: z.number().int().positive().optional(),
  costPerUnit: z.number().min(0).optional(),
  originalBatchSize: z.number().positive().optional(),
  packaging: z.array(packagingItemInRecipeSchema).optional(),
  totalPackagingCost: z.number().min(0),
  category: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const packagingItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  cost: z.number().positive("Cost must be positive"),
  description: z.string().optional(),
  supplier: z.string().optional(),
  category: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Helper functions
const fromDecimal = (decimal: Decimal | null): number => decimal ? parseFloat(decimal.toString()) : 0;
const fromDate = (date: Date | null): string => date ? date.toISOString() : new Date(0).toISOString();
const safeJsonCast = <T>(value: JsonValue | null, defaultValue: T): T => {
  if (value === null || typeof value !== 'object') return defaultValue;
  try {
    // No need to stringify/parse if it's already a JS object
    return value as T;
  } catch {
    return defaultValue;
  }
};
const toPrismaJson = (value: unknown): InputJsonValue => value as InputJsonValue;
const ensureWeightUnit = (unit: string): WeightUnit => ['g', 'kg', 'ml', 'l', 'oz', 'lb'].includes(unit) ? (unit as WeightUnit) : 'g';
const ensurePackagingType = (category: string | null): PackagingType => ['container', 'label', 'cap', 'pump', 'box', 'other'].includes(category || '') ? (category as PackagingType) : 'other';

// Unified Raw Material conversion with proper type handling
function toRawMaterial(item: any): RawMaterial {
  return {
    id: item.id,
    name: item.name,
    totalCost: fromDecimal(item.total_cost),
    totalWeight: fromDecimal(item.total_weight),
    weightUnit: ensureWeightUnit(item.weight_unit),
    costPerGram: fromDecimal(item.cost_per_gram),
    supplierName: item.supplier_name ?? undefined,
    supplierContact: item.supplier_contact ?? undefined,
    lastPurchaseDate: item.last_purchase_date?.toISOString(),
    purchaseNotes: item.purchase_notes ?? undefined,
    usageNotes: item.usage_notes ?? undefined,
    typicalMonthlyUsage: fromDecimal(item.typical_monthly_usage),
    created_at: fromDate(item.created_at),
    updated_at: fromDate(item.updated_at),
  };
}

// Raw Materials
export async function getRawMaterialsFromDB(): Promise<RawMaterial[]> {
  const userId = await getUserId();
  if (!userId) return [];

  // Temporarily return empty array to prevent database connection errors
  // TODO: Re-enable when database connection is fixed
  return [];

  /* Commented out until database connection is resolved
  try {
    const materials = await prisma.rawMaterial.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return materials.map(toRawMaterial);
  } catch (err) {
    safeLog('Error fetching raw materials', err);
    return [];
  }
  */
}

export async function saveRawMaterialToDB(material: RawMaterial): Promise<RawMaterial> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  const validatedData = rawMaterialSchema.parse(material);
  const data = {
    name: validatedData.name,
    total_cost: new Decimal(validatedData.totalCost),
    total_weight: new Decimal(validatedData.totalWeight),
    weight_unit: validatedData.weightUnit,
    cost_per_gram: new Decimal(validatedData.costPerGram),
    supplier_name: validatedData.supplierName,
    supplier_contact: validatedData.supplierContact,
    last_purchase_date: validatedData.lastPurchaseDate ? new Date(validatedData.lastPurchaseDate) : null,
    purchase_notes: validatedData.purchaseNotes,
    usage_notes: validatedData.usageNotes,
    typical_monthly_usage: validatedData.typicalMonthlyUsage ? new Decimal(validatedData.typicalMonthlyUsage) : null,
  };

  const result = await prisma.rawMaterial.upsert({
    where: { id: validatedData.id || uuidv4() },
    update: data,
    create: { ...data, id: validatedData.id || uuidv4(), user_id: userId },
  });
  return toRawMaterial(result);
}

export async function deleteRawMaterialFromDB(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');
  if (!validateUUID(id)) throw new Error('Invalid material ID');
  await prisma.rawMaterial.delete({ where: { id, user_id: userId } });
}

// Unified Recipe conversion with proper type handling
function toRecipe(recipe: any): Recipe {
  return {
    id: recipe.id,
    name: recipe.name,
    ingredients: safeJsonCast<RecipeIngredient[]>(recipe.ingredients, []),
    totalCost: fromDecimal(recipe.total_cost),
    batchSize: fromDecimal(recipe.batch_size),
    numberOfUnits: recipe.number_of_units ?? undefined,
    costPerUnit: fromDecimal(recipe.cost_per_unit),
    originalBatchSize: fromDecimal(recipe.original_batch_size),
    packaging: safeJsonCast<PackagingItem[]>(recipe.packaging, []),
    totalPackagingCost: fromDecimal(recipe.total_packaging_cost),
    category: recipe.category ?? undefined,
    description: recipe.description ?? undefined,
    instructions: recipe.instructions ?? undefined,
    created_at: fromDate(recipe.created_at),
    updated_at: fromDate(recipe.updated_at),
  };
}

// Recipes
export async function getRecipesFromDB(): Promise<Recipe[]> {
  const userId = await getUserId();
  if (!userId) return [];

  // Temporarily return empty array to prevent database connection errors
  // TODO: Re-enable when database connection is fixed
  return [];

  /* Commented out until database connection is resolved
  try {
    const recipes = await prisma.recipes.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return recipes.map(toRecipe);
  } catch (err) {
    safeLog('Error fetching recipes', err);
    return [];
  }
  */
}

export async function saveRecipeToDB(recipe: Recipe): Promise<Recipe> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  const validatedData = recipeSchema.parse(recipe);
  const data = {
    name: validatedData.name,
    ingredients: toPrismaJson(validatedData.ingredients),
    total_cost: new Decimal(validatedData.totalCost),
    batch_size: validatedData.batchSize ? new Decimal(validatedData.batchSize) : null,
    number_of_units: validatedData.numberOfUnits ?? null,
    cost_per_unit: validatedData.costPerUnit ? new Decimal(validatedData.costPerUnit) : null,
    original_batch_size: validatedData.originalBatchSize ? new Decimal(validatedData.originalBatchSize) : null,
    packaging: toPrismaJson(validatedData.packaging),
    total_packaging_cost: new Decimal(validatedData.totalPackagingCost),
    category: validatedData.category ?? null,
    description: validatedData.description ?? null,
    instructions: validatedData.instructions ?? null,
  };

  const result = await prisma.recipes.upsert({
    where: { id: validatedData.id || uuidv4() },
    update: data,
    create: { ...data, id: validatedData.id || uuidv4(), user_id: userId },
  });
  return toRecipe(result);
}

export async function deleteRecipeFromDB(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');
  if (!validateUUID(id)) throw new Error('Invalid recipe ID');
  await prisma.recipes.delete({ where: { id, user_id: userId } });
}

// Unified Packaging Item conversion with proper type handling
function toPackagingItem(item: any): PackagingItem {
  return {
    id: item.id,
    name: item.name,
    cost: fromDecimal(item.cost),
    description: item.description ?? undefined,
    supplier: item.supplier ?? undefined,
    category: ensurePackagingType(item.category),
    created_at: fromDate(item.created_at),
    updated_at: fromDate(item.updated_at),
  };
}

// Packaging Items
export async function getPackagingItemsFromDB(): Promise<PackagingItem[]> {
  const userId = await getUserId();
  if (!userId) return [];

  // Temporarily return empty array to prevent database connection errors
  // TODO: Re-enable when database connection is fixed
  return [];

  /* Commented out until database connection is resolved
  try {
    const items = await prisma.packagingItem.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return items.map(toPackagingItem);
  } catch (err) {
    safeLog('Error fetching packaging items', err);
    return [];
  }
  */
}

export async function savePackagingItemToDB(item: PackagingItem): Promise<PackagingItem> {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');

  const validatedData = packagingItemSchema.parse(item);
  const data = {
    name: validatedData.name,
    cost: new Decimal(validatedData.cost),
    description: validatedData.description ?? null,
    supplier: validatedData.supplier ?? null,
    category: validatedData.category ?? null,
  };

  const result = await prisma.packagingItem.upsert({
    where: { id: validatedData.id || uuidv4() },
    update: data,
    create: { ...data, id: validatedData.id || uuidv4(), user_id: userId },
  });
  return toPackagingItem(result);
}

export async function deletePackagingItemFromDB(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Authentication required');
  if (!validateUUID(id)) throw new Error('Invalid packaging item ID');
  await prisma.packagingItem.delete({ where: { id, user_id: userId } });
} 