'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, RawMaterial } from '@/types';
import { formatWeight } from '@/utils/conversions';
import { formatCurrency } from '@/utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getTotalRecipeWeight, calculateIngredientPercentages } from '@/utils/scaling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RecipeScaling from './RecipeScaling';
import { Edit2, Trash2, ChefHat, Download, Scale, Sparkles, DollarSign, Beaker, Palette, Star, Heart, Zap, Target, Layers } from 'lucide-react';
import ExportButton from '@/components/ExportButton';

interface RecipeListProps {
  recipes: Recipe[];
  materials: RawMaterial[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onExport: (recipe: Recipe) => void;
  onUpdateRecipe?: (recipe: Recipe) => void;
  showHeader?: boolean;
}

export default function RecipeList({ recipes, materials, onEdit, onDelete, onExport, onUpdateRecipe, showHeader = true }: RecipeListProps) {
  const { currency } = useCurrency();

  console.log('Materials:', materials);

  // Helper to get material cost per gram
  const getMaterialCostPerGram = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.costPerGram : undefined;
  };

  if (!recipes || recipes.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No recipes yet. Start by creating your first recipe!</div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-end mb-4">
        <ExportButton
          recipes={recipes}
          variant="recipes"
          className="w-52 hover:bg-primary/90 h-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-to-r from-green-200 to-green-300 text-green-900 border-none shadow-none px-8 py-3"
          label="Export to Excel"
          iconPosition="left"
        />
      </div>
      {recipes.map((recipe) => {
        const totalWeight = getTotalRecipeWeight(recipe);
        const percentages = calculateIngredientPercentages(recipe);
        return (
          <div key={recipe.id} className="bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border border-purple-200 rounded-2xl shadow-lg p-0">
            {/* Header Row */}
            <div className="flex items-center justify-between px-8 pt-8 pb-3">
              <div>
                <h3 className="text-2xl font-bold text-purple-800 mb-1 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 mr-2"></span>
                  {recipe.name}
                </h3>
                <div className="flex gap-6 text-base text-gray-700 font-medium mt-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">💰 {formatCurrency(recipe.totalCost, currency)}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">⚖️ {formatWeight(totalWeight, 'g')}</span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full">🧪 {recipe.ingredients.length} ingredients</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => onExport(recipe)} variant="outline" size="icon" title="Export" className="border-yellow-400 text-yellow-600 hover:bg-yellow-50">
                  <Download className="w-5 h-5" />
                </Button>
                <Button onClick={() => onEdit(recipe)} variant="outline" size="icon" title="Edit" className="border-pink-400 text-pink-600 hover:bg-pink-50">
                  <Edit2 className="w-5 h-5" />
                </Button>
                <Button onClick={() => { if (confirm(`Delete recipe \"${recipe.name}\"?`)) onDelete(recipe.id); }} variant="outline" size="icon" title="Delete" className="border-purple-400 text-purple-600 hover:bg-purple-50">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            {/* Ingredient Table */}
            <div className="overflow-x-auto px-8 pb-8">
              <table className="min-w-full mt-6 border rounded-xl overflow-hidden shadow">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 text-purple-900 text-base">
                    <th className="py-3 px-4 text-left font-bold">Ingredient</th>
                    <th className="py-3 px-4 text-right font-bold">Amount</th>
                    <th className="py-3 px-4 text-right font-bold">Weight (g)</th>
                    <th className="py-3 px-4 text-right font-bold">%</th>
                    <th className="py-3 px-4 text-right font-bold">Material Cost/g</th>
                    <th className="py-3 px-4 text-right font-bold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {percentages.map(({ ingredient, percentage }, idx) => {
                    const materialCostPerGram = getMaterialCostPerGram(ingredient.materialId);
                    console.log('Material ID:', ingredient.materialId, 'Material Cost/Gram:', materialCostPerGram, 'Ingredient Cost:', ingredient.cost);
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/60'}>
                        <td className="py-2 px-4 text-purple-900 font-semibold">{ingredient.materialName}</td>
                        <td className="py-2 px-4 text-right text-gray-700">{formatWeight(ingredient.amount, ingredient.unit)}</td>
                        <td className="py-2 px-4 text-right text-gray-700">{ingredient.amountInGrams.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right text-pink-700 font-bold">{percentage.toFixed(1)}%</td>
                        <td className="py-2 px-4 text-right text-blue-700">{materialCostPerGram !== undefined ? formatCurrency(materialCostPerGram, currency) : <span className="text-gray-400">N/A</span>}</td>
                        <td className="py-2 px-4 text-right text-green-700 font-bold">{formatCurrency(ingredient.cost, currency)}</td>
                      </tr>
                    );
                  })}
                  {/* Table Footer for totals */}
                  <tr className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 font-bold">
                    <td className="py-2 px-4 text-purple-800">TOTAL</td>
                    <td></td>
                    <td className="py-2 px-4 text-right text-purple-800">{totalWeight.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right text-pink-800">100.0%</td>
                    <td></td>
                    <td className="py-2 px-4 text-right text-green-800">{formatCurrency(recipe.totalCost, currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
} 