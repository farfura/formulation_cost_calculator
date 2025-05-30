import * as XLSX from 'xlsx-js-style';
import { Recipe, ExportData, RawMaterial, Currency } from '@/types';
import { formatWeight } from './conversions';
import { formatCurrency } from './currency';

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
    fill: { fgColor: { rgb: "9B8ABF" } }, // Soft lavender
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "8A7BB0" } },
      bottom: { style: "medium", color: { rgb: "8A7BB0" } }
    }
  },
  
  // Column header style - clean and professional
  columnHeader: {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "B5A8D4" } }, // Light lavender
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      bottom: { style: "medium", color: { rgb: "9B8ABF" } }
    }
  },
  
  // Data cell style - clean and readable
  dataCell: {
    font: { sz: 11 },
    alignment: { vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E6E6FA" } },
      bottom: { style: "thin", color: { rgb: "E6E6FA" } },
      left: { style: "thin", color: { rgb: "E6E6FA" } },
      right: { style: "thin", color: { rgb: "E6E6FA" } }
    }
  },
  
  // Number cell style - right-aligned for numbers
  numberCell: {
    font: { sz: 11 },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E6E6FA" } },
      bottom: { style: "thin", color: { rgb: "E6E6FA" } },
      left: { style: "thin", color: { rgb: "E6E6FA" } },
      right: { style: "thin", color: { rgb: "E6E6FA" } }
    }
  },
  
  // Alternating row styles for better readability
  dataRowAlternate: {
    font: { sz: 11 },
    fill: { fgColor: { rgb: "F5F3FF" } }, // Very light lavender
    alignment: { vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E6E6FA" } },
      bottom: { style: "thin", color: { rgb: "E6E6FA" } },
      left: { style: "thin", color: { rgb: "E6E6FA" } },
      right: { style: "thin", color: { rgb: "E6E6FA" } }
    }
  },
  
  numberRowAlternate: {
    font: { sz: 11 },
    fill: { fgColor: { rgb: "F5F3FF" } }, // Very light lavender
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E6E6FA" } },
      bottom: { style: "thin", color: { rgb: "E6E6FA" } },
      left: { style: "thin", color: { rgb: "E6E6FA" } },
      right: { style: "thin", color: { rgb: "E6E6FA" } }
    }
  },
  
  // Total row style - bold with subtle highlight
  totalRow: {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: "E6E6FA" } }, // Light lavender
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "9B8ABF" } },
      bottom: { style: "medium", color: { rgb: "9B8ABF" } }
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
export function exportToExcel(recipe: Recipe, currency: Currency = 'PKR', materials?: RawMaterial[]): void {
  const wb = XLSX.utils.book_new();
  
  // Calculate total weight from ingredients
  const totalWeight = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.amountInGrams || 0);
  }, 0);
  
  // Recipe Overview Sheet with beautiful formatting
  const overviewData = [
    ['🧪 RECIPE DETAILS', '', '', '', '', ''],
    [''], // Empty row for spacing
    ['Recipe Information', '', '', '', '', ''],
    ['Recipe Name:', recipe.name, '', '', '', ''],
    ['Total Batch Size:', `${totalWeight.toFixed(2)}g`, '', '', '', ''],
    ['Total Recipe Cost:', formatCurrency(recipe.totalCost, currency), '', '', '', ''],
    ['Cost per Gram:', formatCurrency(recipe.totalCost / totalWeight, currency), '', '', '', ''],
    ['Number of Ingredients:', recipe.ingredients.length.toString(), '', '', '', ''],
    [''], // Empty row for spacing
    ['INGREDIENTS BREAKDOWN', '', '', '', '', ''],
    [''], // Empty row for spacing
    ['Ingredient', 'Amount', 'Weight (g)', '%', 'Cost/g', 'Total Cost']
  ];

  // Add ingredient breakdown with costs
  recipe.ingredients.forEach((ingredient) => {
    if (ingredient && ingredient.materialName) {
      const percentage = totalWeight > 0 ? ((ingredient.amountInGrams / totalWeight) * 100).toFixed(2) : '0';
      let costPerGram = ingredient.amountInGrams > 0 ? ingredient.cost / ingredient.amountInGrams : 0;
      if (materials) {
        const material = materials.find(m => m.id === ingredient.materialId);
        if (material) {
          costPerGram = material.costPerGram;
        }
      }
      overviewData.push([
        ingredient.materialName,
        `${ingredient.amount} ${ingredient.unit}`,
        ingredient.amountInGrams.toFixed(2),
        `${percentage}%`,
        formatCurrency(costPerGram, currency),
        formatCurrency(ingredient.cost, currency)
      ]);
    }
  });

  // Add total row
  overviewData.push(['']); // Empty row for spacing
  overviewData.push([
    'TOTAL',
    '',
    totalWeight.toFixed(2),
    '100%',
    '',
    formatCurrency(recipe.totalCost, currency)
  ]);

  const ws = XLSX.utils.aoa_to_sheet(overviewData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Ingredient name
    { wch: 15 }, // Amount
    { wch: 15 }, // Weight
    { wch: 12 }, // Percentage
    { wch: 15 }, // Cost/g
    { wch: 15 }  // Total Cost
  ];

  // Set row heights
  ws['!rows'] = overviewData.map((_, index) => {
    if (index === 0) return { hpt: 35 }; // Header row
    if (index === 2) return { hpt: 28 }; // Section header
    if (index === 9) return { hpt: 28 }; // Ingredients header
    return { hpt: 24 }; // Regular rows
  });

  // Apply styling
  // Main header
  applyCellStyle(ws, 'A1', styles.mainHeader);
  mergeCells(ws, 'A1:F1');
  
  // Section headers
  applyCellStyle(ws, 'A3', styles.sectionHeader);
  mergeCells(ws, 'A3:F3');
  applyCellStyle(ws, 'A10', styles.sectionHeader);
  mergeCells(ws, 'A10:F10');
  
  // Info rows
  for (let row = 4; row <= 8; row++) {
    applyCellStyle(ws, `A${row}`, styles.dataCell);
    applyCellStyle(ws, `B${row}`, styles.numberCell);
  }
  
  // Column headers for ingredients
  const headerRow = 12;
  for (let col = 0; col < 6; col++) {
    applyCellStyle(ws, XLSX.utils.encode_cell({ r: headerRow - 1, c: col }), styles.columnHeader);
  }
  
  // Ingredient rows with alternating colors
  const startRow = headerRow;
  const endRow = startRow + recipe.ingredients.length - 1;
  for (let row = startRow; row <= endRow; row++) {
    const isAlternate = (row - startRow) % 2 === 1;
    for (let col = 0; col < 6; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (col === 0) {
        applyCellStyle(ws, cellRef, isAlternate ? styles.dataRowAlternate : styles.dataCell);
      } else {
        applyCellStyle(ws, cellRef, isAlternate ? styles.numberRowAlternate : styles.numberCell);
      }
    }
  }
  
  // Total row
  const totalRow = endRow + 2;
  for (let col = 0; col < 6; col++) {
    applyCellStyle(ws, XLSX.utils.encode_cell({ r: totalRow, c: col }), styles.totalRow);
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Recipe');
  
  // Save the file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${recipe.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`);
}

// Helper function to merge cells
function mergeCells(ws: any, range: string) {
  if (!ws['!merges']) ws['!merges'] = [];
  const [start, end] = range.split(':');
  const startCell = XLSX.utils.decode_cell(start);
  const endCell = XLSX.utils.decode_cell(end);
  ws['!merges'].push({
    s: { r: startCell.r, c: startCell.c },
    e: { r: endCell.r, c: endCell.c }
  });
}

/**
 * Export recipe to CSV (simplified version)
 */
export function exportToCSV(recipe: Recipe, currency: Currency = 'PKR'): void {
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
      'Total Cost': formatCurrency(recipe.totalCost, currency),
      'Cost per Gram': formatCurrency(recipe.costPerUnit || 0, currency),
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
        'Number of Ingredients': formatCurrency(ingredient.cost || 0, currency),
        'Created Date': formatCurrency(costPerGram, currency)
      });
    }
  });
  
  // Add totals row
  data.push({
    'Recipe Name': 'TOTAL:',
    'Total Batch Weight (g)': `${recipe.ingredients.length} ingredients`,
    'Total Cost': `${totalWeight.toFixed(2)}g`,
    'Cost per Gram': '100%',
    'Number of Ingredients': formatCurrency(recipe.totalCost, currency),
    'Created Date': formatCurrency(recipe.costPerUnit || 0, currency)
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
export function exportMultipleRecipesToExcel(recipes: Recipe[], materials?: RawMaterial[], currency: Currency = 'PKR'): void {
  const wb = XLSX.utils.book_new();
  const wsData: any[] = [];
  const rowMeta: { type: 'header' | 'subheader' | 'tableHeader' | 'ingredient' | 'total' | 'empty', idx: number }[] = [];

  recipes.forEach((recipe, recipeIdx) => {
    // Add two blank rows for extra spacing between recipes
    if (recipeIdx > 0) {
      wsData.push(['', '', '', '', '', '']);
      rowMeta.push({ type: 'empty', idx: wsData.length - 1 });
      wsData.push(['', '', '', '', '', '']);
      rowMeta.push({ type: 'empty', idx: wsData.length - 1 });
    }

    // Recipe name header (centered, bold, pastel)
    wsData.push([
      `${recipe.name}`, '', '', '', '', ''
    ]);
    rowMeta.push({ type: 'header', idx: wsData.length - 1 });

    // Recipe summary row (not bold, regular font)
    wsData.push([
      `Total Cost: ${formatCurrency(recipe.totalCost, currency)}`,
      `Total Weight: ${recipe.ingredients.reduce((sum, i) => sum + i.amountInGrams, 0).toFixed(2)}g`,
      `Ingredients: ${recipe.ingredients.length}`,
      '', '', ''
    ]);
    rowMeta.push({ type: 'subheader', idx: wsData.length - 1 });

    // Table header (not bold, pastel background)
    wsData.push([
      'Ingredient', 'Amount', 'Weight (g)', '%', 'Material Cost/g', 'Cost'
    ]);
    rowMeta.push({ type: 'tableHeader', idx: wsData.length - 1 });

    // Ingredient rows
    const totalWeight = recipe.ingredients.reduce((sum, i) => sum + i.amountInGrams, 0);
    recipe.ingredients.forEach((ingredient, i) => {
      let materialCostPerGram = '';
      if (materials) {
        const material = materials.find(m => m.id === ingredient.materialId);
        materialCostPerGram = material ? formatCurrency(material.costPerGram, currency) : 'N/A';
      } else if (ingredient.amountInGrams > 0) {
        materialCostPerGram = formatCurrency((ingredient.cost || 0) / ingredient.amountInGrams, currency);
      } else {
        materialCostPerGram = 'N/A';
      }
      const percentage = totalWeight > 0 ? (ingredient.amountInGrams / totalWeight) * 100 : 0;
      wsData.push([
        ingredient.materialName,
        `${ingredient.amount} ${ingredient.unit}`,
        ingredient.amountInGrams.toFixed(2),
        `${percentage.toFixed(1)}%`,
        materialCostPerGram,
        formatCurrency(ingredient.cost, currency)
      ]);
      rowMeta.push({ type: 'ingredient', idx: wsData.length - 1 });
    });
    // Totals row (bold, pastel background)
    wsData.push([
      'TOTAL', '', totalWeight.toFixed(2), '100.0%', '', formatCurrency(recipe.totalCost, currency)
    ]);
    rowMeta.push({ type: 'total', idx: wsData.length - 1 });
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 16 }
  ];

  // Apply pastel styles
  rowMeta.forEach(({ type, idx }) => {
    if (type === 'header') {
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: idx, c: col });
        // Only bold and center the first cell (recipe name)
        if (col === 0) {
          applyCellStyle(ws, cellRef, {
            ...styles.mainHeader,
            alignment: { horizontal: 'center', vertical: 'center' }
          });
        } else {
          applyCellStyle(ws, cellRef, { ...styles.mainHeader, font: { ...styles.mainHeader.font, bold: false } });
        }
      }
    } else if (type === 'subheader') {
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: idx, c: col });
        applyCellStyle(ws, cellRef, {
          ...styles.sectionHeader,
          font: { ...styles.sectionHeader.font, bold: false }
        });
      }
    } else if (type === 'tableHeader') {
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: idx, c: col });
        applyCellStyle(ws, cellRef, {
          ...styles.columnHeader,
          font: { ...styles.columnHeader.font, bold: false }
        });
      }
    } else if (type === 'ingredient') {
      const isAlt = idx % 2 === 1;
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: idx, c: col });
        if (col === 0) {
          applyCellStyle(ws, cellRef, isAlt ? styles.dataRowAlternate : styles.dataCell);
        } else {
          applyCellStyle(ws, cellRef, isAlt ? styles.numberRowAlternate : styles.numberCell);
        }
      }
    } else if (type === 'total') {
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: idx, c: col });
        applyCellStyle(ws, cellRef, styles.totalRow);
      }
    }
    // empty rows: no style
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Recipes');
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Recipes_${timestamp}.xlsx`);
}

/**
 * Export raw materials inventory to Excel with beautiful formatting
 */
export function exportRawMaterialsToExcel(materials: RawMaterial[], currency: Currency = 'PKR'): void {
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
    ['Total Inventory Value:', formatCurrency(totalValue, currency), '', '', ''],
    ['Average Cost per Gram:', formatCurrency(avgCostPerGram, currency), '', '', ''],
    [''], // Empty row
    ['Material Name', 'Weight', 'Unit', 'Cost per Gram', 'Total Cost']
  ];

  materials.forEach(material => {
    overviewData.push([
      material.name,
      material.totalWeight.toString(),
      material.weightUnit,
      formatCurrency(material.costPerGram || 0, currency),
      formatCurrency(material.totalCost || 0, currency)
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
      formatCurrency(material.costPerGram || 0, currency),
      formatCurrency(material.totalCost || 0, currency)
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

export { styles, applyCellStyle }; 