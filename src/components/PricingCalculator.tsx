'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Trash2, ListChecks, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useToast } from '@/components/ui/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency, getCurrencySymbol, convertCurrency } from '@/utils/currency';
import ExportButton from '@/components/ExportButton';

const LOCAL_STORAGE_KEY = 'pricingCalculatorHistory';

interface Recipe {
  id: string;
  name: string;
  total_cost: number;
}

export interface PriceBreakdown {
  id: string;
  recipeName: string;
  actualCost: number;
  packagingCost: number;
  containerPrice: number;
  profitMargin: number;
  finalPrice: number;
}

interface PricingCalculatorProps {
  hideHeader?: boolean;
  onAddPrice?: (price: PriceBreakdown) => Promise<void>;
  onCalculationsCountChange?: (count: number) => void;
}

export function PricingCalculator({ hideHeader = false, onAddPrice, onCalculationsCountChange }: PricingCalculatorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [actualCost, setActualCost] = useState<number>(0);
  const [packagingCost, setPackagingCost] = useState<string>('');
  const [containerPrice, setContainerPrice] = useState<string>('');
  const [profitMargin, setProfitMargin] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [calculationHistory, setCalculationHistory] = useState<PriceBreakdown[]>(() => {
    if (typeof window !== 'undefined' && !onAddPrice) {
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        return parsedHistory.map((item: any) => ({
          ...item,
          containerPrice: typeof item.containerPrice === 'number' ? item.containerPrice : 0,
          actualCost: typeof item.actualCost === 'number' ? item.actualCost : 0,
          packagingCost: typeof item.packagingCost === 'number' ? item.packagingCost : 0,
          profitMargin: typeof item.profitMargin === 'number' ? item.profitMargin : 0,
          finalPrice: typeof item.finalPrice === 'number' ? item.finalPrice : 0,
        }));
      }
      return [];
    }
    return [];
  });
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { currency } = useCurrency();

  const fetchRecipes = useCallback(async () => {
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('PricingCalculator: User not authenticated, cannot fetch recipes.');
          return;
        }

        const { data, error } = await supabase
          .from('recipes')
          .select('id, name, total_cost')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;
        setRecipes(data || []);
      } else {
        console.log('PricingCalculator: Supabase client not available, cannot fetch recipes.');
      }
    } catch (error: any) {
      toast({
        title: 'Error loading recipes',
        description: error.message || 'Failed to load recipes for calculator',
        variant: 'destructive',
      });
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !onAddPrice) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(calculationHistory));
    }
    // Notify parent component of calculations count changes
    if (onCalculationsCountChange) {
      onCalculationsCountChange(calculationHistory.length);
    }
  }, [calculationHistory, onAddPrice, onCalculationsCountChange]);

  const handleRecipeChange = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    const selectedRecipe = recipes.find(r => r.id === recipeId);
    if (selectedRecipe) {
      // Convert recipe cost from USD to display currency
      setActualCost(convertCurrency(selectedRecipe.total_cost, 'USD', currency));
    } else {
      setActualCost(0);
    }
    setEditingItemId(null);
  };

  const clearAllInputs = () => {
    setSelectedRecipeId('');
    setPackagingCost('');
    setContainerPrice('');
    setProfitMargin('');
    setActualCost(0);
    setEditingItemId(null);
  };

  const clearAll = () => {
    clearAllInputs();
    setCalculationHistory([]);
    if (typeof window !== 'undefined' && !onAddPrice) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    toast({
      title: 'Cleared',
      description: 'Inputs and calculation history have been cleared.',
    });
  };

  const handleDeleteHistoryItem = (itemId: string) => {
    setCalculationHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
    if (editingItemId === itemId) {
      clearAllInputs();
    }
    toast({
      title: 'Item Deleted',
      description: 'The calculation has been removed from the history.',
    });
  };

  const handleLoadHistoryItemForEditing = (itemId: string) => {
    const itemToEdit = calculationHistory.find(item => item.id === itemId);
    if (itemToEdit) {
      const recipeInList = recipes.find(r => r.name === itemToEdit.recipeName);
      if (recipeInList) {
        setSelectedRecipeId(recipeInList.id);
        // Convert recipe cost from USD to display currency
        setActualCost(convertCurrency(recipeInList.total_cost, 'USD', currency));
      } else {
        setSelectedRecipeId('');
        // Convert stored USD value back to display currency for editing
        setActualCost(convertCurrency(itemToEdit.actualCost, 'USD', currency));
      }
      
      // Convert stored USD values back to display currency for editing
      setPackagingCost(String(convertCurrency(itemToEdit.packagingCost, 'USD', currency)));
      setContainerPrice(String(convertCurrency(itemToEdit.containerPrice, 'USD', currency)));
      setProfitMargin(String(itemToEdit.profitMargin));
      setEditingItemId(itemId);
      
      toast({
        title: "Editing Item",
        description: `Loaded "${itemToEdit.recipeName}" for editing. Modify and click 'Update Price in List'.`,
      });
      
      const formElement = document.getElementById('pricing-calculator-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleCalculate = async () => {
    let recipeName = "Custom Calculation";
    let currentActualCost = actualCost;

    if (selectedRecipeId) {
      const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
      if (selectedRecipe) {
        recipeName = selectedRecipe.name;
        currentActualCost = selectedRecipe.total_cost;
      } else if (!editingItemId) {
        toast({ title: 'Error', description: 'Selected recipe not found.', variant: 'destructive' });
        return;
      }
    } else if (!editingItemId && recipes.length > 0 && !actualCost) {
      toast({ title: 'No Recipe', description: 'Please select a recipe or set actual cost.', variant: 'default' });
      return;
    }
    
    if (!editingItemId && currentActualCost === 0 && !packagingCost && !containerPrice && !profitMargin) {
      toast({ title: 'Input Required', description: 'Please provide values for calculation.', variant: 'default' });
      return;
    }

    const packaging = parseFloat(packagingCost) || 0;
    const container = parseFloat(containerPrice) || 0;
    const margin = parseFloat(profitMargin) || 0;
    
    // Convert user input costs from selected currency to USD for storage
    const packagingInUSD = convertCurrency(packaging, currency, 'USD');
    const containerInUSD = convertCurrency(container, currency, 'USD');
    // actualCost is already in USD if it comes from a recipe, or needs conversion if manually entered
    const actualCostInUSD = selectedRecipeId ? currentActualCost : convertCurrency(currentActualCost, currency, 'USD');
    
    const totalCostValue = actualCostInUSD + packagingInUSD + containerInUSD;
    const profitAmount = (totalCostValue * (margin / 100));
    const finalPrice = totalCostValue + profitAmount;

    const newCalculationData: Omit<PriceBreakdown, 'id'> = {
      recipeName,
      actualCost: actualCostInUSD,
      packagingCost: packagingInUSD,
      containerPrice: containerInUSD,
      profitMargin: margin,
      finalPrice: parseFloat(finalPrice.toFixed(2))
    };

    if (onAddPrice) {
      setIsCalculating(true);
      try {
        const calculationToSave: PriceBreakdown = { ...newCalculationData, id: new Date().toISOString() };
        await onAddPrice(calculationToSave);
        clearAllInputs();
        toast({
          title: 'Calculation Saved',
          description: 'The price calculation has been saved successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Error Saving Calculation',
          description: error.message || 'Failed to save the price calculation.',
          variant: 'destructive',
        });
      } finally {
        setIsCalculating(false);
      }
    } else {
      if (editingItemId) {
        setCalculationHistory(prevHistory => 
          prevHistory.map(item => 
            item.id === editingItemId ? { ...newCalculationData, id: editingItemId } : item
          )
        );
        toast({
          title: 'Calculation Updated',
          description: `"${recipeName}" has been updated in the list.`,
        });
      } else {
        const newId = new Date().toISOString();
        setCalculationHistory(prevHistory => [{ ...newCalculationData, id: newId }, ...prevHistory]);
        toast({
          title: 'Calculation Added',
          description: `Result for "${recipeName}" added to the list below.`,
        });
      }
      clearAllInputs();
    }
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2 text-purple-600">
            <span className="text-2xl">💰</span> Product Pricing
          </h2>
          <p className="text-gray-600">Calculate your product costs and profit margins</p>
        </div>
      )}
      <Card id="pricing-calculator-form-card" className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-pink-600">Recipe</Label>
              <Select 
                value={selectedRecipeId} 
                onValueChange={handleRecipeChange}
                disabled={recipes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={recipes.length === 0 ? "No recipes loaded" : "Select a recipe"} />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-pink-600">Actual Cost ({getCurrencySymbol(currency)})</Label>
              <Input
                type="number"
                value={actualCost}
                readOnly={!!selectedRecipeId}
                className={selectedRecipeId ? "bg-gray-100 cursor-not-allowed focus:ring-0" : "bg-white"}
                placeholder={`Auto-filled or enter cost in ${getCurrencySymbol(currency)}`}
                onChange={(e) => !selectedRecipeId && setActualCost(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className="text-pink-600">Packaging Cost ({getCurrencySymbol(currency)})</Label>
              <Input
                type="number"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                placeholder={`e.g., 1.50 (${getCurrencySymbol(currency)})`}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label className="text-pink-600">Container Price ({getCurrencySymbol(currency)})</Label>
              <Input
                type="number"
                value={containerPrice}
                onChange={(e) => setContainerPrice(e.target.value)}
                placeholder={`e.g., 0.50 (${getCurrencySymbol(currency)})`}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label className="text-pink-600">Profit Margin (%)</Label>
              <Input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="e.g., 20"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>
          <Button 
            className="w-full mt-8 bg-purple-500 hover:bg-purple-600"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Processing...' : 
              (onAddPrice ? 'Calculate & Save Price' : 
                (editingItemId ? 'Update Price in List' : 'Add to Price List'))}
          </Button>
          {editingItemId && (
            <Button 
              variant="outline"
              className="w-full mt-3 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                clearAllInputs();
                setEditingItemId(null);
              }}
            >
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {!onAddPrice && calculationHistory.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
            <div className="text-xl font-semibold text-purple-700 flex items-center">
              <ListChecks className="w-6 h-6 mr-2 text-purple-600" />
              Calculation History
            </div>
            <div className="flex gap-2">
              <ExportButton
                variant="pricing"
                label="Export to Excel"
                pricingHistory={calculationHistory}
              />
              <Button variant="outline" onClick={clearAll} size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1.5" /> Clear History
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/30 overflow-x-auto shadow-md">
            <table className="min-w-full text-pink-800">
              <thead>
                <tr className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-t-2xl">
                  <th className="px-6 py-4 text-left font-bold text-pink-700 text-base rounded-l-xl">Recipe</th>
                  <th className="px-6 py-4 text-right font-bold text-pink-700 text-base">Actual Cost</th>
                  <th className="px-6 py-4 text-right font-bold text-pink-700 text-base">Packaging</th>
                  <th className="px-6 py-4 text-right font-bold text-pink-700 text-base">Container</th>
                  <th className="px-6 py-4 text-right font-bold text-pink-700 text-base">Margin (%)</th>
                  <th className="px-6 py-4 text-right font-bold text-pink-700 text-base">Final Price</th>
                  <th className="px-6 py-4 text-center font-bold text-pink-700 text-base rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calculationHistory.map((calc, i) => (
                  <tr
                    key={calc.id}
                    className={
                      `${i % 2 === 0 ? 'bg-white' : 'bg-yellow-50'} ` +
                      `${editingItemId === calc.id ? 'bg-purple-100 !important' : ''}`
                    }
                  >
                    <td className="px-6 py-3 font-semibold text-pink-900 rounded-l-xl">{calc.recipeName}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(calc.actualCost || 0, currency)}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(calc.packagingCost || 0, currency)}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(calc.containerPrice || 0, currency)}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{(calc.profitMargin || 0)}%</td>
                    <td className="px-6 py-3 text-right font-semibold text-purple-600">{formatCurrency(calc.finalPrice || 0, currency)}</td>
                    <td className="px-6 py-3 text-center rounded-r-xl">
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-pink-200 text-pink-600 bg-white rounded-full px-3 py-1 hover:bg-pink-50 shadow-sm"
                          onClick={() => handleLoadHistoryItemForEditing(calc.id)}
                          title="Edit item"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="bg-pink-200 text-pink-900 rounded-full px-4 py-1 hover:bg-pink-400 border-none shadow-sm"
                          onClick={() => handleDeleteHistoryItem(calc.id)}
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 