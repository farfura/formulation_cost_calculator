import * as XLSX from 'xlsx';
import { Recipe, ExportData } from '@/types';
import { formatWeight } from './conversions';

/**
 * Convert recipe to export data format
 */
export function prepareExportData(recipe: Recipe): ExportData[] {
  return recipe.ingredients.map(ingredient => ({
    ingredientName: ingredient.materialName,
    usedAmount: formatWeight(ingredient.amount, ingredient.unit),
    convertedToGrams: ingredient.amountInGrams,
    costPerGram: ingredient.cost / ingredient.amountInGrams,
    totalCost: ingredient.cost,
    recipeTotalCost: recipe.totalCost,
    costPerUnit: recipe.costPerUnit
  }));
}

/**
 * Export recipe to CSV
 */
export function exportToCSV(recipe: Recipe): void {
  const data = prepareExportData(recipe);
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recipe Cost Breakdown');
  
  // Export
  XLSX.writeFile(wb, `${recipe.name}_cost_breakdown.csv`);
}

/**
 * Export recipe to Excel
 */
export function exportToExcel(recipe: Recipe): void {
  const data = prepareExportData(recipe);
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Ingredient Name
    { wch: 15 }, // Used Amount
    { wch: 15 }, // Converted to Grams
    { wch: 15 }, // Cost per Gram
    { wch: 12 }, // Total Cost
    { wch: 15 }, // Recipe Total Cost
    { wch: 12 }  // Cost per Unit
  ];
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recipe Cost Breakdown');
  
  // Export
  XLSX.writeFile(wb, `${recipe.name}_cost_breakdown.xlsx`);
}

/**
 * Export multiple recipes to Excel
 */
export function exportMultipleRecipesToExcel(recipes: Recipe[]): void {
  const wb = XLSX.utils.book_new();
  
  recipes.forEach(recipe => {
    const data = prepareExportData(recipe);
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, recipe.name.substring(0, 31)); // Excel sheet name limit
  });
  
  XLSX.writeFile(wb, 'all_recipes_cost_breakdown.xlsx');
} 