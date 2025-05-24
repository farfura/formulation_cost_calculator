import { Recipe, RecipeIngredient, ScaledRecipe } from '@/types';
import { convertToGrams, calculateCost } from './conversions';

/**
 * Scale a recipe to a new batch size
 */
export function scaleRecipe(
  recipe: Recipe, 
  newBatchSize: number, 
  materials: any[]
): ScaledRecipe {
  const originalBatchSize = recipe.originalBatchSize || recipe.batchSize || getTotalRecipeWeight(recipe);
  const scalingFactor = newBatchSize / originalBatchSize;
  
  // Scale each ingredient
  const scaledIngredients: RecipeIngredient[] = recipe.ingredients.map(ingredient => {
    const scaledAmount = ingredient.amount * scalingFactor;
    const scaledAmountInGrams = convertToGrams(scaledAmount, ingredient.unit);
    
    // Find the material to get cost per gram
    const material = materials.find(m => m.id === ingredient.materialId);
    const scaledCost = material ? calculateCost(scaledAmountInGrams, material.costPerGram) : 0;
    
    return {
      ...ingredient,
      amount: scaledAmount,
      amountInGrams: scaledAmountInGrams,
      cost: scaledCost,
    };
  });

  const scaledTotalCost = scaledIngredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
  const scaledCostPerUnit = recipe.numberOfUnits 
    ? scaledTotalCost / recipe.numberOfUnits 
    : undefined;

  return {
    ...recipe,
    ingredients: scaledIngredients,
    totalCost: scaledTotalCost,
    batchSize: newBatchSize,
    costPerUnit: scaledCostPerUnit,
    scalingFactor,
    originalRecipe: recipe,
    originalBatchSize: originalBatchSize,
  };
}

/**
 * Get total weight of all ingredients in a recipe
 */
export function getTotalRecipeWeight(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.amountInGrams, 0);
}

/**
 * Calculate percentage of each ingredient in recipe
 */
export function calculateIngredientPercentages(recipe: Recipe): Array<{
  ingredient: RecipeIngredient;
  percentage: number;
}> {
  const totalWeight = getTotalRecipeWeight(recipe);
  
  return recipe.ingredients.map(ingredient => ({
    ingredient,
    percentage: totalWeight > 0 ? (ingredient.amountInGrams / totalWeight) * 100 : 0,
  }));
}

/**
 * Get common scaling options based on recipe size
 */
export function getScalingOptions(recipe: Recipe): number[] {
  const currentSize = recipe.batchSize || getTotalRecipeWeight(recipe);
  
  // Generate smart scaling options based on current size
  let baseOptions = [5, 10, 15, 20, 25, 30, 50, 75, 100, 150, 200, 250, 500, 1000];
  
  // Add size-specific options
  const customOptions = [
    currentSize * 0.25,  // Quarter size
    currentSize * 0.5,   // Half size
    currentSize * 0.75,  // Three quarters
    currentSize * 1.25,  // 25% larger
    currentSize * 1.5,   // 50% larger
    currentSize * 2,     // Double
    currentSize * 2.5,   // 2.5x
    currentSize * 3,     // Triple
    currentSize * 5,     // 5x
    currentSize * 10,    // 10x
  ];
  
  // If current size is small, add more small options
  if (currentSize <= 50) {
    baseOptions.unshift(1, 2, 3, 4, 6, 8, 12, 16);
  }
  
  // Combine and filter options
  const allOptions = [...baseOptions, ...customOptions]
    .filter(size => size > 0 && Math.abs(size - currentSize) > 0.1) // Exclude current size and very close values
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .sort((a, b) => a - b); // Sort ascending
    
  // Return top 12 most relevant options
  const finalOptions = allOptions.slice(0, 12);
  
  // Ensure we always have at least some basic options
  if (finalOptions.length < 4) {
    const basicOptions = [
      Math.max(1, currentSize * 0.5),
      Math.max(2, currentSize * 0.75), 
      currentSize * 1.5,
      currentSize * 2
    ].filter(size => Math.abs(size - currentSize) > 0.1);
    
    return [...finalOptions, ...basicOptions]
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b)
      .slice(0, 8);
  }
  
  return finalOptions;
}

/**
 * Format scaling factor for display
 */
export function formatScalingFactor(factor: number): string {
  if (factor === 1) return '1:1 (Original)';
  if (factor < 1) return `1:${(1/factor).toFixed(1)} (Scaled Down)`;
  return `${factor.toFixed(1)}:1 (Scaled Up)`;
} 