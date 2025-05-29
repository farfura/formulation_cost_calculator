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
  created_at: string;
  updated_at: string;
  // user_id?: string; // To be added later for user-specific data
}

export interface PackagingItem {
  id: string;
  name: string;
  cost: number;
  description?: string;
  supplier?: string;
  category: 'container' | 'label' | 'cap' | 'pump' | 'box' | 'other';
  created_at: string;
  updated_at: string;
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
  packaging?: PackagingItem[];
  totalPackagingCost?: number;
  category?: string;
  description?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
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

export interface LabelData {
  productName: string;
  brandName?: string;
  description?: string;
  ingredients: {
    name: string;
    percentage: number;
    inci?: string;
  }[];
  netWeight: string;
  warnings?: string[];
  instructions?: string;
  batchNumber?: string;
  expiryDate?: string;
  madeIn?: string;
}

export interface LabelSettings {
  template: 'minimal' | 'elegant' | 'modern' | 'vintage';
  colorScheme: 'pink' | 'purple' | 'green' | 'blue' | 'gold';
  fontSize: 'small' | 'medium' | 'large';
  showPercentages: boolean;
  showInci: boolean;
  logoUrl?: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'in';
  };
} 