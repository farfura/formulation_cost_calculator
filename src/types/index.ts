export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';

export type Currency = 'USD' | 'PKR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY' | 'CNY';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

export interface AppSettings {
  currency: Currency;
}

export interface RawMaterial {
  id: string;
  name: string;
  totalCost: number;
  totalWeight: number;
  weightUnit: WeightUnit;
  costPerGram: number;
}

export interface RecipeIngredient {
  materialId: string;
  materialName: string;
  amount: number;
  unit: WeightUnit;
  amountInGrams: number;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  batchSize?: number;
  numberOfUnits?: number;
  costPerUnit?: number;
  originalBatchSize?: number;
}

export interface ScaledRecipe extends Recipe {
  scalingFactor: number;
  originalRecipe: Recipe;
}

export interface ExportData {
  ingredientName: string;
  usedAmount: string;
  convertedToGrams: number;
  costPerGram: number;
  totalCost: number;
  recipeTotalCost: number;
  costPerUnit?: number;
} 