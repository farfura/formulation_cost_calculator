import { WeightUnit } from '@/types';
import { formatCurrency as formatCurrencyWithLocale } from './currency';

/**
 * Convert weight to grams based on the unit
 */
export function convertToGrams(weight: number, unit: WeightUnit): number {
  switch (unit) {
    case 'g':
      return weight;
    case 'kg':
      return weight * 1000;
    case 'oz':
      return weight * 28.3495;
    case 'lb':
      return weight * 453.592;
    default:
      return weight;
  }
}

/**
 * Calculate cost based on used grams and cost per gram
 */
export function calculateCost(usedGrams: number, costPerGram: number): number {
  return usedGrams * costPerGram;
}

/**
 * Calculate cost per gram from total cost and total weight
 */
export function calculateCostPerGram(totalCost: number, totalWeight: number, unit: WeightUnit): number {
  const totalWeightInGrams = convertToGrams(totalWeight, unit);
  return totalWeightInGrams > 0 ? totalCost / totalWeightInGrams : 0;
}

/**
 * Format currency value
 * @deprecated Use formatCurrency from './currency' with currency parameter instead
 */
export function formatCurrency(amount: number): string {
  return formatCurrencyWithLocale(amount, 'USD');
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, unit: WeightUnit): string {
  return `${weight.toFixed(2)} ${unit}`;
} 