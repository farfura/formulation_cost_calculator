import * as XLSX from 'xlsx';
import { Recipe, ExportData, RawMaterial } from '@/types';
import { formatWeight, formatCurrency } from './conversions';

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
 * Create a comprehensive Excel export for a single recipe
 */
export function exportToExcel(recipe: Recipe): void {
  const wb = XLSX.utils.book_new();
  
  // Validate recipe and ingredients
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    // Create error sheet if no ingredients
    const errorData = [
      ['❌ EXPORT ERROR'],
      ['Recipe Name:', recipe?.name || 'Unknown'],
      ['Issue:', 'No ingredients found in this recipe'],
      [''],
      ['Please ensure your recipe has ingredients before exporting.']
    ];
    const errorWs = XLSX.utils.aoa_to_sheet(errorData);
    XLSX.utils.book_append_sheet(wb, errorWs, 'Error');
    XLSX.writeFile(wb, `ERROR_${(recipe?.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
    return;
  }
  
  // Calculate total weight from ingredients
  const totalWeight = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.amountInGrams || 0);
  }, 0);
  
  // Recipe Overview Sheet
  const overviewData = [
    ['🧪 RECIPE OVERVIEW', '', '', ''],
    ['Recipe Name:', recipe.name, '', ''],
    ['Created Date:', new Date().toLocaleDateString(), '', ''],
    ['Total Batch Size:', `${totalWeight}g`, '', ''],
    ['Total Recipe Cost:', formatCurrency(recipe.totalCost), '', ''],
    ['Cost per Gram:', formatCurrency(recipe.costPerUnit || 0), '', ''],
    ['Cost per 100g:', formatCurrency((recipe.costPerUnit || 0) * 100), '', ''],
    ['', '', '', ''],
    ['💡 COST BREAKDOWN BY INGREDIENT', '', '', ''],
    ['Ingredient Name', 'Amount Used', 'Percentage', 'Cost', 'Cost per Gram'],
  ];

  // Add ingredient breakdown
  recipe.ingredients.forEach((ingredient) => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      overviewData.push([
        ingredient.materialName,
        `${ingredient.amount}${ingredient.unit}`,
        `${percentage}%`,
        formatCurrency(ingredient.cost || 0),
        formatCurrency(ingredient.amountInGrams > 0 ? (ingredient.cost || 0) / ingredient.amountInGrams : 0)
      ]);
    }
  });

  // Add scaling guide
  overviewData.push(['', '', '', '', '']);
  overviewData.push(['📊 SCALING GUIDE', '', '', '', '']);
  overviewData.push(['Batch Size', 'Total Cost', 'Cost per Unit', '', '']);
  
  const scalingSizes = [50, 100, 250, 500, 1000];
  scalingSizes.forEach(size => {
    const scaleFactor = totalWeight > 0 ? size / totalWeight : 1;
    const scaledCost = recipe.totalCost * scaleFactor;
    overviewData.push([
      `${size}g`,
      formatCurrency(scaledCost),
      formatCurrency(scaledCost / size),
      '',
      ''
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
  
  // Set column widths for overview
  ws1['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
  ];

  // Style the headers
  const headerCells = ['A1', 'A9'];
  const scalingHeaderRow = overviewData.findIndex(row => row[0] === '📊 SCALING GUIDE') + 1;
  headerCells.push(`A${scalingHeaderRow}`);
  
  headerCells.forEach(cell => {
    if (!ws1[cell]) ws1[cell] = {};
    ws1[cell].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "E91E63" } }
    };
  });

  XLSX.utils.book_append_sheet(wb, ws1, 'Recipe Overview');

  // Recipe Ingredients Sheet (NEW - for easier ingredient reference)
  const ingredientsData = [
    ['🧪 RECIPE INGREDIENTS & WEIGHTS', '', '', '', ''],
    ['Recipe:', recipe.name, '', '', ''],
    ['Total Batch Weight:', `${totalWeight}g`, '', '', ''],
    ['Number of Ingredients:', recipe.ingredients.length.toString(), '', '', ''],
    ['', '', '', '', ''],
    ['INGREDIENT', 'AMOUNT', 'UNIT', 'GRAMS', 'PERCENTAGE'],
    ['', '', '', '', '']
  ];

  // Add each ingredient with clear formatting
  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      ingredientsData.push([
        `${index + 1}. ${ingredient.materialName}`,
        (ingredient.amount || 0).toString(),
        ingredient.unit || 'g',
        `${(ingredient.amountInGrams || 0).toFixed(2)}g`,
        `${percentage}%`
      ]);
    }
  });

  // Add summary
  ingredientsData.push(['', '', '', '', '']);
  ingredientsData.push(['TOTAL INGREDIENTS:', recipe.ingredients.length.toString(), '', `${totalWeight.toFixed(2)}g`, '100%']);
  
  // Add scaling reference
  ingredientsData.push(['', '', '', '', '']);
  ingredientsData.push(['🔄 SCALING REFERENCE:', '', '', '', '']);
  ingredientsData.push(['To make 100g batch:', '', '', '', '']);
  
  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient && ingredient.materialName) {
      const scaledAmount = totalWeight > 0 ? (ingredient.amountInGrams / totalWeight) * 100 : 0;
      ingredientsData.push([
        `${index + 1}. ${ingredient.materialName}`,
        '',
        '',
        `${scaledAmount.toFixed(2)}g`,
        ''
      ]);
    }
  });

  const wsIngredients = XLSX.utils.aoa_to_sheet(ingredientsData);
  
  // Set column widths for ingredients sheet
  wsIngredients['!cols'] = [
    { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 12 }
  ];

  // Style the ingredient headers
  const ingredientHeaderCells = ['A1', 'A6'];
  const scalingRefRow = ingredientsData.findIndex(row => row[0] === '🔄 SCALING REFERENCE:') + 1;
  ingredientHeaderCells.push(`A${scalingRefRow}`);
  
  ingredientHeaderCells.forEach(cell => {
    if (!wsIngredients[cell]) wsIngredients[cell] = {};
    wsIngredients[cell].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2563EB" } }
    };
  });

  XLSX.utils.book_append_sheet(wb, wsIngredients, 'Recipe Ingredients');

  // Detailed Ingredient Sheet
  const detailData = [
    ['🔬 DETAILED INGREDIENT ANALYSIS', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Ingredient', 'Amount', 'Unit', 'Grams', 'Cost/Gram', 'Total Cost', 'Percentage'],
  ];

  recipe.ingredients.forEach(ingredient => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      const costPerGram = ingredient.amountInGrams > 0 ? (ingredient.cost || 0) / ingredient.amountInGrams : 0;
      detailData.push([
        ingredient.materialName,
        (ingredient.amount || 0).toString(),
        ingredient.unit || 'g',
        (ingredient.amountInGrams || 0).toFixed(2),
        formatCurrency(costPerGram),
        formatCurrency(ingredient.cost || 0),
        `${percentage}%`
      ]);
    }
  });

  // Add totals
  detailData.push(['', '', '', '', '', '', '']);
  detailData.push(['TOTALS:', '', '', totalWeight.toFixed(2), '', formatCurrency(recipe.totalCost), '100%']);

  const ws2 = XLSX.utils.aoa_to_sheet(detailData);
  ws2['!cols'] = [
    { wch: 25 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Ingredient Details');

  // Instructions Sheet
  const instructionsData = [
    ['📋 HOW TO USE THIS SPREADSHEET', '', ''],
    ['', '', ''],
    ['Recipe Overview Tab:', 'Main summary of your recipe with costs', ''],
    ['• Recipe name and basic info', '', ''],
    ['• Total costs and cost per gram', '', ''],
    ['• Ingredient breakdown with percentages', '', ''],
    ['• Scaling guide for different batch sizes', '', ''],
    ['', '', ''],
    ['Recipe Ingredients Tab:', 'Clear ingredient list for easy reference', ''],
    ['• Numbered ingredient list with weights', '', ''],
    ['• Original amounts and converted grams', '', ''],
    ['• Percentage breakdown', '', ''],
    ['• 100g scaling reference', '', ''],
    ['', '', ''],
    ['Ingredient Details Tab:', 'Detailed cost analysis', ''],
    ['• Exact amounts and units', '', ''],
    ['• Conversion to grams', '', ''],
    ['• Individual costs and percentages', '', ''],
    ['', '', ''],
    ['💡 Tips for Using Your Recipe:', '', ''],
    ['• Use the Recipe Ingredients tab for quick reference', '', ''],
    ['• Always measure ingredients by weight (grams) for accuracy', '', ''],
    ['• Use the scaling guide to make different batch sizes', '', ''],
    ['• Cost per gram helps you price your final products', '', ''],
    ['• Keep this sheet for your records and inventory tracking', '', ''],
    ['', '', ''],
    ['📞 Need Help?', '', ''],
    ['This file was generated by Beauty Formula Calculator', '', ''],
    ['For questions about formulation, consult a cosmetic chemist', '', '']
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(instructionsData);
  ws3['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws3, 'Instructions');

  // Export with better filename
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${recipe.name.replace(/[^a-zA-Z0-9]/g, '_')}_Recipe_${timestamp}.xlsx`);
}

/**
 * Export recipe to CSV (simplified version)
 */
export function exportToCSV(recipe: Recipe): void {
  // Validate recipe and ingredients
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    alert('Recipe has no ingredients to export');
    return;
  }
  
  const totalWeight = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.amountInGrams || 0);
  }, 0);
  
  // Add recipe header information
  const data = [
    {
      'Recipe Name': recipe.name,
      'Total Batch Weight (g)': totalWeight.toFixed(2),
      'Total Cost': formatCurrency(recipe.totalCost),
      'Cost per Gram': formatCurrency(recipe.costPerUnit || 0),
      'Number of Ingredients': recipe.ingredients.length.toString(),
      'Created Date': new Date().toLocaleDateString()
    },
    // Empty row
    {},
    // Header row
    {
      'Recipe Name': 'INGREDIENT DETAILS',
      'Total Batch Weight (g)': 'Original Amount',
      'Total Cost': 'Weight in Grams',
      'Cost per Gram': 'Percentage',
      'Number of Ingredients': 'Total Cost',
      'Created Date': 'Cost per Gram'
    }
  ];
  
  // Add ingredient details with better validation
  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      const costPerGram = ingredient.amountInGrams > 0 ? (ingredient.cost || 0) / ingredient.amountInGrams : 0;
      data.push({
        'Recipe Name': `${index + 1}. ${ingredient.materialName}`,
        'Total Batch Weight (g)': `${ingredient.amount || 0} ${ingredient.unit || 'g'}`,
        'Total Cost': `${(ingredient.amountInGrams || 0).toFixed(2)}g`,
        'Cost per Gram': `${percentage}%`,
        'Number of Ingredients': formatCurrency(ingredient.cost || 0),
        'Created Date': formatCurrency(costPerGram)
      });
    }
  });
  
  // Add totals row
  data.push({
    'Recipe Name': 'TOTAL:',
    'Total Batch Weight (g)': `${recipe.ingredients.length} ingredients`,
    'Total Cost': `${totalWeight.toFixed(2)}g`,
    'Cost per Gram': '100%',
    'Number of Ingredients': formatCurrency(recipe.totalCost),
    'Created Date': formatCurrency(recipe.costPerUnit || 0)
  });
  
  // Rename columns for clarity
  const finalData = data.map(row => ({
    'Recipe/Ingredient': row['Recipe Name'],
    'Amount/Weight': row['Total Batch Weight (g)'],
    'Grams': row['Total Cost'],
    'Percentage': row['Cost per Gram'],
    'Cost': row['Number of Ingredients'],
    'Cost per Gram': row['Created Date']
  }));
  
  const ws = XLSX.utils.json_to_sheet(finalData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recipe');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${recipe.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`);
}

/**
 * Export multiple recipes to comprehensive Excel workbook
 */
export function exportMultipleRecipesToExcel(recipes: Recipe[]): void {
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['📊 RECIPE COLLECTION SUMMARY', '', '', '', '', ''],
    ['Generated on:', new Date().toLocaleString(), '', '', '', ''],
    ['Total Recipes:', recipes.length.toString(), '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Recipe Name', 'Batch Size', 'Total Cost', 'Cost/Gram', 'Ingredients', 'Date Created'],
  ];

  recipes.forEach(recipe => {
    const totalWeight = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.amountInGrams, 0);
    summaryData.push([
      recipe.name,
      `${totalWeight}g`,
      formatCurrency(recipe.totalCost),
      formatCurrency(recipe.costPerUnit || 0),
      recipe.ingredients.length.toString(),
      new Date().toLocaleDateString()
    ]);
  });

  // Add cost analysis
  summaryData.push(['', '', '', '', '', '']);
  summaryData.push(['💰 COST ANALYSIS', '', '', '', '', '']);
  
  const validCostPerUnit = recipes.filter(r => r.costPerUnit !== undefined).map(r => r.costPerUnit!);
  if (validCostPerUnit.length > 0) {
    const avgCostPerGram = validCostPerUnit.reduce((sum, cost) => sum + cost, 0) / validCostPerUnit.length;
    const minCostPerGram = Math.min(...validCostPerUnit);
    const maxCostPerGram = Math.max(...validCostPerUnit);
    
    summaryData.push(['Average Cost per Gram:', formatCurrency(avgCostPerGram), '', '', '', '']);
    summaryData.push(['Lowest Cost per Gram:', formatCurrency(minCostPerGram), '', '', '', '']);
    summaryData.push(['Highest Cost per Gram:', formatCurrency(maxCostPerGram), '', '', '', '']);
  }

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Individual recipe sheets
  recipes.forEach((recipe) => {
    const totalWeight = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.amountInGrams, 0);
    const recipeData = [
      [`🧪 ${recipe.name.toUpperCase()}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['Recipe Info:', '', '', '', ''],
      ['Total Weight:', `${totalWeight}g`, '', '', ''],
      ['Total Cost:', formatCurrency(recipe.totalCost), '', '', ''],
      ['Cost per Gram:', formatCurrency(recipe.costPerUnit || 0), '', '', ''],
      ['', '', '', '', ''],
      ['Ingredient', 'Amount', 'Unit', 'Cost', 'Percentage'],
    ];

    recipe.ingredients.forEach(ingredient => {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      recipeData.push([
        ingredient.materialName,
        ingredient.amount.toString(),
        ingredient.unit,
        formatCurrency(ingredient.cost),
        `${percentage}%`
      ]);
    });

    const recipeWs = XLSX.utils.aoa_to_sheet(recipeData);
    recipeWs['!cols'] = [
      { wch: 25 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }
    ];

    // Truncate sheet name if too long
    const sheetName = recipe.name.length > 31 ? recipe.name.substring(0, 28) + '...' : recipe.name;
    XLSX.utils.book_append_sheet(wb, recipeWs, sheetName);
  });

  // Instructions sheet for multiple recipes
  const instructionsData = [
    ['📚 RECIPE COLLECTION GUIDE', '', ''],
    ['', '', ''],
    ['This workbook contains:', '', ''],
    ['• Summary tab with all recipes overview', '', ''],
    ['• Individual tabs for each recipe', '', ''],
    ['• Cost analysis and comparisons', '', ''],
    ['', '', ''],
    ['How to use:', '', ''],
    ['1. Start with the Summary tab for overview', '', ''],
    ['2. Click individual recipe tabs for details', '', ''],
    ['3. Use cost analysis to compare recipes', '', ''],
    ['4. Reference batch sizes for scaling', '', ''],
    ['', '', ''],
    ['💡 Pro Tips:', '', ''],
    ['• Compare cost per gram across recipes', '', ''],
    ['• Use this data for pricing your products', '', ''],
    ['• Keep this file as your recipe database', '', ''],
    ['• Update costs when ingredient prices change', '', '']
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsWs['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'How to Use');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Beauty_Recipes_Collection_${timestamp}.xlsx`);
}

/**
 * Export raw materials inventory to Excel
 */
export function exportRawMaterialsToExcel(materials: RawMaterial[]): void {
  const wb = XLSX.utils.book_new();
  
  // Inventory Overview
  const overviewData = [
    ['📦 RAW MATERIALS INVENTORY', '', '', '', '', ''],
    ['Generated on:', new Date().toLocaleString(), '', '', '', ''],
    ['Total Materials:', materials.length.toString(), '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Material Name', 'Total Weight', 'Total Cost', 'Cost/Gram', 'Cost/100g', 'Purchase Date'],
  ];

  let totalInventoryValue = 0;
  materials.forEach(material => {
    totalInventoryValue += material.totalCost;
    overviewData.push([
      material.name,
      formatWeight(material.totalWeight, material.weightUnit),
      formatCurrency(material.totalCost),
      formatCurrency(material.costPerGram),
      formatCurrency(material.costPerGram * 100),
      new Date().toLocaleDateString() // Could be actual purchase date if stored
    ]);
  });

  // Add summary statistics
  overviewData.push(['', '', '', '', '', '']);
  overviewData.push(['📊 INVENTORY SUMMARY', '', '', '', '', '']);
  overviewData.push(['Total Inventory Value:', formatCurrency(totalInventoryValue), '', '', '', '']);
  
  const avgCostPerGram = materials.reduce((sum, m) => sum + m.costPerGram, 0) / materials.length;
  overviewData.push(['Average Cost per Gram:', formatCurrency(avgCostPerGram), '', '', '', '']);

  const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
  overviewWs['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, overviewWs, 'Inventory Overview');

  // Detailed materials list
  const detailData = [
    ['🔬 DETAILED MATERIALS LIST', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Material', 'Weight', 'Unit', 'Weight (g)', 'Total Cost', 'Cost/Gram'],
  ];

  materials.forEach(material => {
    // Convert all weights to grams for comparison
    let weightInGrams = material.totalWeight;
    if (material.weightUnit === 'kg') weightInGrams *= 1000;
    if (material.weightUnit === 'oz') weightInGrams *= 28.3495;
    if (material.weightUnit === 'lb') weightInGrams *= 453.592;

    detailData.push([
      material.name,
      material.totalWeight.toString(),
      material.weightUnit,
      weightInGrams.toFixed(2),
      formatCurrency(material.totalCost),
      formatCurrency(material.costPerGram)
    ]);
  });

  const detailWs = XLSX.utils.aoa_to_sheet(detailData);
  detailWs['!cols'] = [
    { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, detailWs, 'Materials Detail');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Raw_Materials_Inventory_${timestamp}.xlsx`);
} 