import * as XLSX from 'xlsx-js-style';
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
 * Define consistent styles for the Excel workbook with beautiful pastel colors
 */
const styles = {
  // Main header style - large, elegant font, white text on soft pink background
  mainHeader: {
    font: { bold: true, sz: 18, color: { rgb: "FFFFFF" }, name: "Georgia" },
    fill: { fgColor: { rgb: "D87AA7" } }, // Soft dusty pink
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thick", color: { rgb: "C76B98" } },
      bottom: { style: "thick", color: { rgb: "C76B98" } },
      left: { style: "thick", color: { rgb: "C76B98" } },
      right: { style: "thick", color: { rgb: "C76B98" } }
    }
  },
  
  // Section header style - medium size, elegant font, white text on lavender background
  sectionHeader: {
    font: { bold: true, sz: 15, color: { rgb: "FFFFFF" }, name: "Georgia" },
    fill: { fgColor: { rgb: "B8A9C9" } }, // Soft lavender
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "A594B8" } },
      bottom: { style: "medium", color: { rgb: "A594B8" } },
      left: { style: "medium", color: { rgb: "A594B8" } },
      right: { style: "medium", color: { rgb: "A594B8" } }
    }
  },
  
  // Column header style - elegant font, white text on soft coral background
  columnHeader: {
    font: { bold: true, sz: 13, color: { rgb: "FFFFFF" }, name: "Georgia" },
    fill: { fgColor: { rgb: "F4A6CD" } }, // Soft coral pink
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "F092BB" } },
      bottom: { style: "medium", color: { rgb: "F092BB" } },
      left: { style: "medium", color: { rgb: "F092BB" } },
      right: { style: "medium", color: { rgb: "F092BB" } }
    }
  },
  
  // Data cell style - elegant font with subtle borders
  dataCell: {
    font: { sz: 14, name: "Calibri" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E8D5E8" } },
      bottom: { style: "thin", color: { rgb: "E8D5E8" } },
      left: { style: "thin", color: { rgb: "E8D5E8" } },
      right: { style: "thin", color: { rgb: "E8D5E8" } }
    }
  },
  
  // Number cell style - right aligned for numbers with elegant styling
  numberCell: {
    font: { sz: 14, name: "Calibri" },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E8D5E8" } },
      bottom: { style: "thin", color: { rgb: "E8D5E8" } },
      left: { style: "thin", color: { rgb: "E8D5E8" } },
      right: { style: "thin", color: { rgb: "E8D5E8" } }
    }
  },
  
  // Total row style - bold with soft peach background
  totalRow: {
    font: { bold: true, sz: 15, name: "Georgia", color: { rgb: "8B4B6B" } },
    fill: { fgColor: { rgb: "FFE5CC" } }, // Soft peach
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "FFD4B3" } },
      bottom: { style: "medium", color: { rgb: "FFD4B3" } },
      left: { style: "medium", color: { rgb: "FFD4B3" } },
      right: { style: "medium", color: { rgb: "FFD4B3" } }
    }
  },
  
  // Info cell style - soft mint background for informational cells
  infoCell: {
    font: { sz: 14, name: "Calibri", italic: true, color: { rgb: "5D4E75" } },
    fill: { fgColor: { rgb: "F0F8F0" } }, // Very soft mint
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E8D5E8" } },
      bottom: { style: "thin", color: { rgb: "E8D5E8" } },
      left: { style: "thin", color: { rgb: "E8D5E8" } },
      right: { style: "thin", color: { rgb: "E8D5E8" } }
    }
  },

  // Enhanced data cell with alternating row background
  dataRowAlternate: {
    font: { sz: 14, name: "Calibri" },
    fill: { fgColor: { rgb: "FDF8FD" } }, // Very light pink
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E8D5E8" } },
      bottom: { style: "thin", color: { rgb: "E8D5E8" } },
      left: { style: "thin", color: { rgb: "E8D5E8" } },
      right: { style: "thin", color: { rgb: "E8D5E8" } }
    }
  },

  // Enhanced number cell with alternating row background
  numberRowAlternate: {
    font: { sz: 14, name: "Calibri" },
    fill: { fgColor: { rgb: "FDF8FD" } }, // Very light pink
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E8D5E8" } },
      bottom: { style: "thin", color: { rgb: "E8D5E8" } },
      left: { style: "thin", color: { rgb: "E8D5E8" } },
      right: { style: "thin", color: { rgb: "E8D5E8" } }
    }
  }
};

/**
 * Apply style to a specific cell
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCellStyle(ws: any, cellRef: string, style: any) {
  if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
  ws[cellRef].s = style;
}

/**
 * Create a comprehensive Excel export for a single recipe with beautiful formatting
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
  
  // Recipe Overview Sheet with beautiful formatting
  const overviewData = [
    ['🧪 RECIPE OVERVIEW', '', '', '', ''],
    [''], // Empty row for spacing
    ['Recipe Information', '', '', '', ''],
    ['Recipe Name:', recipe.name, '', '', ''],
    ['Created Date:', new Date().toLocaleDateString(), '', '', ''],
    ['Total Batch Size:', `${totalWeight.toFixed(2)}g`, '', '', ''],
    ['Total Recipe Cost:', formatCurrency(recipe.totalCost), '', '', ''],
    ['Cost per Gram:', formatCurrency(recipe.costPerUnit || 0), '', '', ''],
    ['Cost per 100g:', formatCurrency((recipe.costPerUnit || 0) * 100), '', '', ''],
    [''], // Empty row for spacing
    ['💡 INGREDIENT BREAKDOWN', '', '', '', ''],
    [''], // Empty row for spacing
    ['Ingredient Name', 'Amount Used', 'Weight (g)', 'Percentage', 'Total Cost']
  ];

  // Add ingredient breakdown
  recipe.ingredients.forEach((ingredient) => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      overviewData.push([
        ingredient.materialName,
        `${ingredient.amount}${ingredient.unit}`,
        `${ingredient.amountInGrams.toFixed(2)}g`,
        `${percentage}%`,
        formatCurrency(ingredient.cost || 0)
      ]);
    }
  });

  // Add scaling guide
  overviewData.push(['']); // Empty row for spacing
  overviewData.push(['📊 SCALING GUIDE', '', '', '', '']);
  overviewData.push(['']); // Empty row for spacing
  overviewData.push(['Batch Size', 'Total Cost', 'Cost per Gram', '', '']);
  
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
    { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 25 }
  ];

  // Set row heights for better appearance
  ws1['!rows'] = [
    { hpt: 35 }, // Main header row - taller for elegance
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    ...Array(6).fill({ hpt: 25 }), // Info rows - slightly taller
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Column headers - taller for better visibility
    ...Array(recipe.ingredients.length).fill({ hpt: 24 }), // Ingredient rows - more spacious
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Scaling headers
    ...Array(scalingSizes.length).fill({ hpt: 24 }) // Scaling rows
  ];

  // Apply beautiful styling
  // Main header
  applyCellStyle(ws1, 'A1', styles.mainHeader);
  ws1['A1'].s = { ...styles.mainHeader, alignment: { horizontal: "left", vertical: "center" } };
  
  // Section headers
  applyCellStyle(ws1, 'A3', styles.sectionHeader);
  applyCellStyle(ws1, 'A11', styles.sectionHeader);
  const scalingHeaderRow = 15 + recipe.ingredients.length;
  applyCellStyle(ws1, `A${scalingHeaderRow}`, styles.sectionHeader);
  
  // Column headers for ingredient breakdown
  const ingredientHeaderRow = 13;
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: ingredientHeaderRow - 1, c: col });
    applyCellStyle(ws1, cellRef, styles.columnHeader);
  }
  
  // Column headers for scaling guide
  const scalingTableHeaderRow = scalingHeaderRow + 2;
  for (let col = 0; col < 3; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: scalingTableHeaderRow - 1, c: col });
    applyCellStyle(ws1, cellRef, styles.columnHeader);
  }
  
  // Apply data cell styles to ingredient rows with alternating colors
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const row = ingredientHeaderRow + i;
    const isAlternateRow = i % 2 === 1; // Every other row gets alternate styling
    for (let col = 0; col < 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0) {
        applyCellStyle(ws1, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(ws1, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }
  
  // Apply data cell styles to scaling rows with alternating colors
  for (let i = 0; i < scalingSizes.length; i++) {
    const row = scalingTableHeaderRow + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 3; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      applyCellStyle(ws1, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
    }
  }
  
  // Apply info cell styles to recipe information
  for (let row = 4; row <= 9; row++) {
    applyCellStyle(ws1, `A${row}`, styles.infoCell);
    applyCellStyle(ws1, `B${row}`, styles.dataCell);
  }

  XLSX.utils.book_append_sheet(wb, ws1, 'Recipe Overview');

  // Recipe Ingredients Sheet with beautiful formatting
  const ingredientsData = [
    ['🧪 RECIPE INGREDIENTS & WEIGHTS', '', '', '', ''],
    [''], // Empty row
    ['Recipe Information', '', '', '', ''],
    ['Recipe:', recipe.name, '', '', ''],
    ['Total Batch Weight:', `${totalWeight.toFixed(2)}g`, '', '', ''],
    ['Number of Ingredients:', recipe.ingredients.length.toString(), '', '', ''],
    [''], // Empty row
    ['INGREDIENT', 'AMOUNT', 'UNIT', 'WEIGHT (G)', 'PERCENTAGE']
  ];

  // Add each ingredient with clear formatting
  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      ingredientsData.push([
        `${index + 1}. ${ingredient.materialName}`,
        (ingredient.amount || 0).toString(),
        ingredient.unit || 'g',
        `${(ingredient.amountInGrams || 0).toFixed(2)}`,
        `${percentage}%`
      ]);
    }
  });

  // Add summary
  ingredientsData.push(['']); // Empty row
  ingredientsData.push(['TOTALS:', recipe.ingredients.length.toString(), '', `${totalWeight.toFixed(2)}`, '100%']);
  
  // Add scaling reference
  ingredientsData.push(['']); // Empty row
  ingredientsData.push(['🔄 SCALING REFERENCE (100g batch)', '', '', '', '']);
  ingredientsData.push(['']); // Empty row
  ingredientsData.push(['INGREDIENT', '', '', 'WEIGHT (G)', '']);
  
  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient && ingredient.materialName) {
      const scaledAmount = totalWeight > 0 ? (ingredient.amountInGrams / totalWeight) * 100 : 0;
      ingredientsData.push([
        `${index + 1}. ${ingredient.materialName}`,
        '',
        '',
        `${scaledAmount.toFixed(2)}`,
        ''
      ]);
    }
  });

  const wsIngredients = XLSX.utils.aoa_to_sheet(ingredientsData);
  
  // Set column widths for ingredients sheet
  wsIngredients['!cols'] = [
    { wch: 45 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 20 }
  ];

  // Set row heights
  wsIngredients['!rows'] = [
    { hpt: 35 }, // Main header - elegant height
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    ...Array(3).fill({ hpt: 25 }), // Info rows
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Column headers
    ...Array(recipe.ingredients.length).fill({ hpt: 24 }), // Ingredient rows
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Total row
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Scaling header
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Scaling column headers
    ...Array(recipe.ingredients.length).fill({ hpt: 24 }) // Scaling rows
  ];

  // Apply styling to ingredients sheet
  applyCellStyle(wsIngredients, 'A1', styles.mainHeader);
  applyCellStyle(wsIngredients, 'A3', styles.sectionHeader);
  
  // Column headers for main ingredient table
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 7, c: col });
    applyCellStyle(wsIngredients, cellRef, styles.columnHeader);
  }
  
  // Data rows for ingredients with alternating colors
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const row = 8 + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0) {
        applyCellStyle(wsIngredients, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(wsIngredients, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }
  
  // Total row styling
  const totalRowIngredients = 9 + recipe.ingredients.length;
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: totalRowIngredients, c: col });
    applyCellStyle(wsIngredients, cellRef, styles.totalRow);
  }
  
  // Scaling section
  const scalingHeaderIndex = totalRowIngredients + 2;
  applyCellStyle(wsIngredients, `A${scalingHeaderIndex + 1}`, styles.sectionHeader);
  
  // Scaling column headers
  const scalingColHeaderIndex = scalingHeaderIndex + 2;
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: scalingColHeaderIndex, c: col });
    applyCellStyle(wsIngredients, cellRef, styles.columnHeader);
  }

  // Scaling data rows with alternating colors
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const row = scalingColHeaderIndex + 1 + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0) {
        applyCellStyle(wsIngredients, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(wsIngredients, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsIngredients, 'Recipe Ingredients');

  // Detailed Ingredient Sheet with beautiful formatting
  const detailData = [
    ['🔬 DETAILED INGREDIENT ANALYSIS', '', '', '', '', '', ''],
    [''], // Empty row
    ['Ingredient', 'Amount', 'Unit', 'Weight (g)', 'Cost/Gram', 'Total Cost', 'Percentage']
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
  detailData.push(['']); // Empty row
  detailData.push(['TOTALS:', '', '', totalWeight.toFixed(2), '', formatCurrency(recipe.totalCost), '100%']);

  const ws2 = XLSX.utils.aoa_to_sheet(detailData);
  ws2['!cols'] = [
    { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 18 }
  ];

  // Set row heights for elegant appearance
  ws2['!rows'] = [
    { hpt: 35 }, // Main header
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Column headers
    ...Array(recipe.ingredients.length).fill({ hpt: 24 }), // Data rows
    { hpt: 22 }, // Empty row
    { hpt: 26 } // Total row
  ];

  // Apply styling to detail sheet
  applyCellStyle(ws2, 'A1', styles.mainHeader);
  
  // Column headers
  for (let col = 0; col < 7; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: col });
    applyCellStyle(ws2, cellRef, styles.columnHeader);
  }
  
  // Data rows with alternating colors
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const row = 3 + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 7; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0) {
        applyCellStyle(ws2, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(ws2, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }
  
  // Total row
  const totalRowDetails = 4 + recipe.ingredients.length;
  for (let col = 0; col < 7; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: totalRowDetails, c: col });
    applyCellStyle(ws2, cellRef, styles.totalRow);
  }

  XLSX.utils.book_append_sheet(wb, ws2, 'Ingredient Details');

  // Instructions Sheet with beautiful formatting
  const instructionsData = [
    ['📋 HOW TO USE THIS SPREADSHEET', '', ''],
    [''], // Empty row
    ['Sheet Guide', '', ''],
    ['Recipe Overview Tab:', 'Main summary of your recipe with costs', ''],
    ['• Recipe name and basic information', '', ''],
    ['• Total costs and cost per gram calculations', '', ''],
    ['• Ingredient breakdown with percentages', '', ''],
    ['• Scaling guide for different batch sizes', '', ''],
    [''], // Empty row
    ['Recipe Ingredients Tab:', 'Clear ingredient list for easy reference', ''],
    ['• Numbered ingredient list with weights', '', ''],
    ['• Original amounts and converted grams', '', ''],
    ['• Percentage breakdown of each ingredient', '', ''],
    ['• 100g scaling reference for easy calculations', '', ''],
    [''], // Empty row
    ['Ingredient Details Tab:', 'Detailed cost analysis per ingredient', ''],
    ['• Exact amounts and units used', '', ''],
    ['• Conversion to grams for accuracy', '', ''],
    ['• Individual costs and cost percentages', '', ''],
    [''], // Empty row
    ['💡 Tips for Using Your Recipe:', '', ''],
    ['• Always measure ingredients by weight (grams) for accuracy', '', ''],
    ['• Use the scaling guide to make different batch sizes', '', ''],
    ['• Cost per gram helps you price your final products', '', ''],
    ['• Keep this sheet for your records and inventory tracking', '', ''],
    ['• Refer to Recipe Ingredients tab for quick formulation reference', '', ''],
    [''], // Empty row
    ['📞 Support Information', '', ''],
    ['This file was generated by Beauty Formula Calculator', '', ''],
    ['For formulation questions, consult a qualified cosmetic chemist', '', ''],
    ['Always follow proper safety guidelines when formulating', '', '']
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsWs['!cols'] = [{ wch: 45 }, { wch: 60 }, { wch: 20 }];

  // Set row heights for elegant appearance
  instructionsWs['!rows'] = [
    { hpt: 35 }, // Main header
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    ...Array(instructionsData.length - 3).fill({ hpt: 25 }) // All other rows with comfortable spacing
  ];

  // Apply styling to instructions sheet
  applyCellStyle(instructionsWs, 'A1', styles.mainHeader);
  applyCellStyle(instructionsWs, 'A3', styles.sectionHeader);
  applyCellStyle(instructionsWs, 'A10', styles.sectionHeader);
  applyCellStyle(instructionsWs, 'A16', styles.sectionHeader);
  applyCellStyle(instructionsWs, 'A21', styles.sectionHeader);
  applyCellStyle(instructionsWs, 'A28', styles.sectionHeader);
  
  // Apply info cell styles to bullet points and instructions
  for (let row = 4; row < instructionsData.length; row++) {
    if (instructionsData[row][0] && instructionsData[row][0] !== '' && !instructionsData[row][0].includes(':')) {
      applyCellStyle(instructionsWs, `A${row + 1}`, styles.infoCell);
      applyCellStyle(instructionsWs, `B${row + 1}`, styles.infoCell);
    } else if (instructionsData[row][0] && instructionsData[row][0].includes(':')) {
      applyCellStyle(instructionsWs, `A${row + 1}`, styles.dataCell);
      applyCellStyle(instructionsWs, `B${row + 1}`, styles.dataCell);
    }
  }

  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

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
 * Export multiple recipes to comprehensive Excel workbook with beautiful formatting
 */
export function exportMultipleRecipesToExcel(recipes: Recipe[]): void {
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet with beautiful formatting
  const summaryData = [
    ['📊 RECIPE COLLECTION SUMMARY', '', '', '', '', ''],
    [''], // Empty row
    ['Collection Information', '', '', '', '', ''],
    ['Generated on:', new Date().toLocaleString(), '', '', '', ''],
    ['Total Recipes:', recipes.length.toString(), '', '', '', ''],
    [''], // Empty row
    ['Recipe Name', 'Batch Size', 'Total Cost', 'Cost/Gram', 'Ingredients', 'Date Created']
  ];

  recipes.forEach(recipe => {
    const totalWeight = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.amountInGrams, 0);
    summaryData.push([
      recipe.name,
      `${totalWeight.toFixed(2)}g`,
      formatCurrency(recipe.totalCost),
      formatCurrency(recipe.costPerUnit || 0),
      recipe.ingredients.length.toString(),
      new Date().toLocaleDateString()
    ]);
  });

  // Add cost analysis
  summaryData.push(['']); // Empty row
  summaryData.push(['💰 COST ANALYSIS', '', '', '', '', '']);
  summaryData.push(['']); // Empty row
  
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
    { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 20 }
  ];

  // Set row heights for elegant appearance
  summaryWs['!rows'] = [
    { hpt: 35 }, // Main header
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    ...Array(2).fill({ hpt: 25 }), // Info rows
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Column headers
    ...Array(recipes.length).fill({ hpt: 24 }), // Recipe rows
    { hpt: 22 }, // Empty row for cost analysis
    { hpt: 28 }, // Cost analysis header
    { hpt: 22 }, // Empty row
    ...Array(3).fill({ hpt: 25 }) // Cost analysis rows
  ];

  // Apply beautiful styling to summary sheet
  applyCellStyle(summaryWs, 'A1', styles.mainHeader);
  applyCellStyle(summaryWs, 'A3', styles.sectionHeader);
  
  // Column headers
  for (let col = 0; col < 6; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c: col });
    applyCellStyle(summaryWs, cellRef, styles.columnHeader);
  }
  
  // Data rows with alternating colors
  for (let i = 0; i < recipes.length; i++) {
    const row = 7 + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 6; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0) {
        applyCellStyle(summaryWs, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(summaryWs, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }
  
  // Cost analysis section
  const analysisStartRow = 8 + recipes.length;
  applyCellStyle(summaryWs, `A${analysisStartRow + 1}`, styles.sectionHeader);

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Individual recipe sheets (simplified for space)
  recipes.forEach((recipe, index) => {
    if (index < 10) { // Limit to first 10 recipes to avoid too many sheets
      const totalWeight = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.amountInGrams, 0);
      const recipeData = [
        [`🧪 ${recipe.name.toUpperCase()}`, '', '', '', ''],
        [''], // Empty row
        ['Recipe Information', '', '', '', ''],
        ['Total Weight:', `${totalWeight.toFixed(2)}g`, '', '', ''],
        ['Total Cost:', formatCurrency(recipe.totalCost), '', '', ''],
        ['Cost per Gram:', formatCurrency(recipe.costPerUnit || 0), '', '', ''],
        [''], // Empty row
        ['Ingredient', 'Amount', 'Unit', 'Weight (g)', 'Cost']
      ];

      recipe.ingredients.forEach(ingredient => {
        if (ingredient && ingredient.materialName) {
          recipeData.push([
            ingredient.materialName,
            (ingredient.amount || 0).toString(),
            ingredient.unit || 'g',
            (ingredient.amountInGrams || 0).toFixed(2),
            formatCurrency(ingredient.cost || 0)
          ]);
        }
      });

      const recipeWs = XLSX.utils.aoa_to_sheet(recipeData);
      recipeWs['!cols'] = [
        { wch: 35 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 20 }
      ];

      // Set row heights for elegant appearance
      recipeWs['!rows'] = [
        { hpt: 35 }, // Main header
        { hpt: 22 }, // Empty row
        { hpt: 28 }, // Section header
        ...Array(3).fill({ hpt: 25 }), // Info rows
        { hpt: 22 }, // Empty row
        { hpt: 26 }, // Column headers
        ...Array(recipe.ingredients.length).fill({ hpt: 24 }) // Ingredient rows
      ];

      // Apply styling
      applyCellStyle(recipeWs, 'A1', styles.mainHeader);
      applyCellStyle(recipeWs, 'A3', styles.sectionHeader);
      
      // Column headers
      for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 7, c: col });
        applyCellStyle(recipeWs, cellRef, styles.columnHeader);
      }

      // Data rows with alternating colors
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const row = 8 + i;
        const isAlternateRow = i % 2 === 1;
        for (let col = 0; col < 5; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (col === 0) {
            applyCellStyle(recipeWs, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
          } else {
            applyCellStyle(recipeWs, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
          }
        }
      }

      const sheetName = recipe.name.length > 25 ? recipe.name.substring(0, 25) + '...' : recipe.name;
      XLSX.utils.book_append_sheet(wb, recipeWs, sheetName.replace(/[^a-zA-Z0-9]/g, '_'));
    }
  });

  // Instructions sheet
  const instructionsData = [
    ['📋 RECIPE COLLECTION GUIDE', '', ''],
    [''], // Empty row
    ['How to Use This Workbook:', '', ''],
    ['Summary Tab:', 'Overview of all recipes in your collection', ''],
    ['Individual Recipe Tabs:', 'Detailed breakdown of each recipe', ''],
    [''], // Empty row
    ['💡 Tips:', '', ''],
    ['• Use the Summary tab to compare costs across recipes', '', ''],
    ['• Individual recipe tabs show detailed ingredient breakdowns', '', ''],
    ['• Cost analysis helps identify your most economical formulations', '', ''],
    ['• Keep this file for your formulation library and reference', '', ''],
    [''], // Empty row
    ['📞 Support:', '', ''],
    ['Generated by Beauty Formula Calculator', '', ''],
    ['For formulation questions, consult a qualified cosmetic chemist', '', '']
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsWs['!cols'] = [{ wch: 45 }, { wch: 60 }, { wch: 20 }];

  // Set row heights for elegant appearance
  instructionsWs['!rows'] = [
    { hpt: 35 }, // Main header
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    ...Array(instructionsData.length - 3).fill({ hpt: 25 }) // All other rows with comfortable spacing
  ];

  // Apply styling to instructions
  applyCellStyle(instructionsWs, 'A1', styles.mainHeader);
  applyCellStyle(instructionsWs, 'A3', styles.sectionHeader);
  applyCellStyle(instructionsWs, 'A7', styles.sectionHeader);
  applyCellStyle(instructionsWs, 'A13', styles.sectionHeader);

  XLSX.utils.book_append_sheet(wb, instructionsWs, 'How to Use');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Beauty_Recipes_Collection_${timestamp}.xlsx`);
}

/**
 * Export raw materials inventory to Excel with beautiful formatting
 */
export function exportRawMaterialsToExcel(materials: RawMaterial[]): void {
  const wb = XLSX.utils.book_new();
  
  // Calculate statistics
  const totalMaterials = materials.length;
  const totalValue = materials.reduce((sum, material) => sum + (material.totalCost || 0), 0);
  const avgCostPerGram = materials.length > 0 ? 
    materials.reduce((sum, material) => sum + (material.costPerGram || 0), 0) / materials.length : 0;

  // Inventory Overview Sheet with beautiful formatting
  const overviewData = [
    ['📦 RAW MATERIALS INVENTORY OVERVIEW', '', '', '', ''],
    [''], // Empty row
    ['Inventory Summary', '', '', '', ''],
    ['Generated on:', new Date().toLocaleString(), '', '', ''],
    ['Total Materials:', totalMaterials.toString(), '', '', ''],
    ['Total Inventory Value:', formatCurrency(totalValue), '', '', ''],
    ['Average Cost per Gram:', formatCurrency(avgCostPerGram), '', '', ''],
    [''], // Empty row
    ['Material Name', 'Weight', 'Unit', 'Cost per Gram', 'Total Cost']
  ];

  materials.forEach(material => {
    overviewData.push([
      material.name,
      material.totalWeight.toString(),
      material.weightUnit,
      formatCurrency(material.costPerGram || 0),
      formatCurrency(material.totalCost || 0)
    ]);
  });

  const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
  overviewWs['!cols'] = [
    { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
  ];

  // Set row heights for elegant appearance
  overviewWs['!rows'] = [
    { hpt: 35 }, // Main header
    { hpt: 22 }, // Empty row
    { hpt: 28 }, // Section header
    ...Array(4).fill({ hpt: 25 }), // Info rows
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Column headers
    ...Array(materials.length).fill({ hpt: 24 }) // Material rows
  ];

  // Apply beautiful styling
  applyCellStyle(overviewWs, 'A1', styles.mainHeader);
  applyCellStyle(overviewWs, 'A3', styles.sectionHeader);
  
  // Column headers
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 8, c: col });
    applyCellStyle(overviewWs, cellRef, styles.columnHeader);
  }
  
  // Data rows with alternating colors
  for (let i = 0; i < materials.length; i++) {
    const row = 9 + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0 || col === 2) {
        applyCellStyle(overviewWs, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(overviewWs, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, overviewWs, 'Inventory Overview');

  // Detailed materials sheet
  const detailData = [
    ['📋 DETAILED MATERIALS LIST', '', '', '', '', ''],
    [''], // Empty row
    ['Material Name', 'Total Weight', 'Unit', 'Weight (g)', 'Cost/Gram', 'Total Cost']
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
      formatCurrency(material.costPerGram || 0),
      formatCurrency(material.totalCost || 0)
    ]);
  });

  const detailWs = XLSX.utils.aoa_to_sheet(detailData);
  detailWs['!cols'] = [
    { wch: 35 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 20 }
  ];

  // Set row heights for elegant appearance
  detailWs['!rows'] = [
    { hpt: 35 }, // Main header
    { hpt: 22 }, // Empty row
    { hpt: 26 }, // Column headers
    ...Array(materials.length).fill({ hpt: 24 }) // Material rows
  ];

  // Apply styling
  applyCellStyle(detailWs, 'A1', styles.mainHeader);
  
  // Column headers
  for (let col = 0; col < 6; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: col });
    applyCellStyle(detailWs, cellRef, styles.columnHeader);
  }
  
  // Data rows with alternating colors
  for (let i = 0; i < materials.length; i++) {
    const row = 3 + i;
    const isAlternateRow = i % 2 === 1;
    for (let col = 0; col < 6; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0 || col === 2) {
        applyCellStyle(detailWs, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(detailWs, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, detailWs, 'Materials Detail');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Raw_Materials_Inventory_${timestamp}.xlsx`);
} 