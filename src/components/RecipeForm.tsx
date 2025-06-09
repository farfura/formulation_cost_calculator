'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, RawMaterial, RecipeIngredient, WeightUnit } from '@/types';
import { convertToGrams, calculateCost, formatWeight } from '@/utils/conversions';
import { formatCurrency } from '@/utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ChefHat, Sparkles, Beaker, Target, Zap, Heart, Star, Calculator, Trash2 } from 'lucide-react';

interface RecipeFormProps {
  recipe?: Recipe;
  materials: RawMaterial[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export default function RecipeForm({ recipe, materials, onSave, onCancel }: RecipeFormProps) {
  const { currency } = useCurrency();
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [batchSize, setBatchSize] = useState<number | undefined>();
  const [numberOfUnits, setNumberOfUnits] = useState<number | undefined>();

  useEffect(() => {
    if (recipe) {
      setRecipeName(recipe.name);
      setIngredients(recipe.ingredients);
      setBatchSize(recipe.batchSize);
      setNumberOfUnits(recipe.numberOfUnits);
    }
  }, [recipe]);

  const addIngredient = () => {
    if (materials.length === 0) {
      alert('Please add raw materials first');
      return;
    }

    const firstMaterial = materials[0];
    const newIngredient: RecipeIngredient = {
      materialId: firstMaterial.id,
      materialName: firstMaterial.name,
      amount: 0,
      unit: 'g',
      amountInGrams: 0,
      cost: 0,
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients];
    const ingredient = { ...updated[index] };
    
    if (field === 'materialId') {
      const material = materials.find(m => m.id === value);
      if (material) {
        ingredient.materialId = value as string;
        ingredient.materialName = material.name;
        ingredient.amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);
        ingredient.cost = calculateCost(ingredient.amountInGrams, material.costPerGram);
      }
    } else if (field === 'amount') {
      ingredient.amount = value as number;
      const material = materials.find(m => m.id === ingredient.materialId);
      if (material) {
        ingredient.amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);
        ingredient.cost = calculateCost(ingredient.amountInGrams, material.costPerGram);
      }
    } else if (field === 'unit') {
      ingredient.unit = value as WeightUnit;
      const material = materials.find(m => m.id === ingredient.materialId);
      if (material) {
        ingredient.amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);
        ingredient.cost = calculateCost(ingredient.amountInGrams, material.costPerGram);
      }
    }

    updated[index] = ingredient;
    setIngredients(updated);
  };

  const totalCost = ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
  const costPerUnit = numberOfUnits && numberOfUnits > 0 ? totalCost / numberOfUnits : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeName || ingredients.length === 0) {
      alert('Please provide a recipe name and at least one ingredient');
      return;
    }

    const hasInvalidIngredients = ingredients.some(ing => ing.amount <= 0);
    if (hasInvalidIngredients) {
      alert('Please ensure all ingredients have valid amounts');
      return;
    }

    const newRecipe: Recipe = {
      id: recipe?.id || Date.now().toString(),
      name: recipeName,
      ingredients,
      totalCost,
      batchSize,
      numberOfUnits,
      costPerUnit,
      originalBatchSize: recipe?.originalBatchSize || batchSize || ingredients.reduce((sum, ing) => sum + ing.amountInGrams, 0),
      packaging: recipe?.packaging || [],
      totalPackagingCost: recipe?.totalPackagingCost || 0,
      created_at: recipe?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave(newRecipe);
    
    if (!recipe) {
      setRecipeName('');
      setIngredients([]);
      setBatchSize(undefined);
      setNumberOfUnits(undefined);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Recipe Name Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-lilac-50/80 to-powder-50/80 backdrop-blur-sm border-lilac-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-lilac-400/10 to-powder-400/10 border-b border-lilac-200/30">
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-2 rounded-full bg-gradient-to-r from-lilac-400 to-powder-400 text-white"
                >
                  <ChefHat className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-lilac-500 to-powder-500 bg-clip-text text-transparent">
                    Recipe Details ✨
                  </h3>
                  <p className="text-sm text-lilac-600 font-normal">Give your creation a magical name</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <label htmlFor="recipeName" className="block text-sm font-semibold text-lilac-600 mb-2">
                  Recipe Name 💖
                </label>
                <motion.input
                  type="text"
                  id="recipeName"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-lilac-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lilac-300 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 text-lilac-700 placeholder-lilac-400"
                  placeholder="e.g., Magical Moisturizing Face Cream ✨"
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ingredients Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-mint-50/80 to-sky-50/80 backdrop-blur-sm border-mint-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-mint-400/10 to-sky-400/10 border-b border-mint-200/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="p-2 rounded-full bg-gradient-to-r from-mint-400 to-sky-400 text-white"
                  >
                    <Beaker className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-mint-500 to-sky-500 bg-clip-text text-transparent">
                      Formula Ingredients 🧪
                    </h3>
                    <p className="text-sm text-mint-600 font-normal">Build your perfect formulation</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    onClick={addIngredient}
                    className="bg-gradient-to-r from-mint-400 to-sky-400 hover:from-mint-500 hover:to-sky-500 text-white shadow-lg border-0"
                    disabled={materials.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ingredient ✨
                  </Button>
                </motion.div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {materials.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-peach-100/80 to-coral-100/80 border-2 border-peach-200 rounded-xl p-6 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target className="w-12 h-12 text-peach-400 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-peach-600 font-semibold mb-2">No materials available yet! 🎯</p>
                  <p className="text-sm text-peach-500">
                    Please add raw materials first to start creating your magical recipes.
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/70 backdrop-blur-sm border-2 border-mint-200/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-mint-600 mb-2">
                            Material 🧴
                          </label>
                          <select
                            value={ingredient.materialId}
                            onChange={(e) => updateIngredient(index, 'materialId', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-mint-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-300 focus:border-transparent bg-white/80 text-mint-700"
                          >
                            {materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-mint-600 mb-2">
                            Amount 📏
                          </label>
                          <input
                            type="number"
                            value={ingredient.amount || ''}
                            onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 border-2 border-mint-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-300 focus:border-transparent bg-white/80 text-mint-700"
                            placeholder="0"
                            step="0.01"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-mint-600 mb-2">
                            Unit ⚖️
                          </label>
                          <select
                            value={ingredient.unit}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value as WeightUnit)}
                            className="w-full px-4 py-3 border-2 border-mint-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-300 focus:border-transparent bg-white/80 text-mint-700"
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="oz">oz</option>
                            <option value="lb">lb</option>
                          </select>
                        </div>

                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <div className="bg-gradient-to-r from-emerald-100 to-mint-100 rounded-xl p-3 text-center">
                              <p className="text-xs text-emerald-600 font-medium">Cost</p>
                              <p className="text-sm font-bold text-emerald-700">
                                {formatCurrency(ingredient.cost, currency)}
                              </p>
                              <p className="text-xs text-emerald-600">
                                ({formatWeight(ingredient.amountInGrams, 'g')})
                              </p>
                            </div>
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Batch Information Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-peach-50/80 to-coral-50/80 backdrop-blur-sm border-peach-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-peach-400/10 to-coral-400/10 border-b border-peach-200/30">
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 rounded-full bg-gradient-to-r from-peach-400 to-coral-400 text-white"
                >
                  <Calculator className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-peach-500 to-coral-500 bg-clip-text text-transparent">
                    Batch Information 📦
                  </h3>
                  <p className="text-sm text-peach-600 font-normal">Optional production details</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="batchSize" className="block text-sm font-semibold text-peach-600 mb-2">
                    Batch Size (grams) 📏
                  </label>
                  <motion.input
                    type="number"
                    id="batchSize"
                    value={batchSize || ''}
                    onChange={(e) => setBatchSize(parseFloat(e.target.value) || undefined)}
                    className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-300 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 text-peach-700 placeholder-peach-400"
                    placeholder="e.g., 100"
                    step="0.01"
                    min="0"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="numberOfUnits" className="block text-sm font-semibold text-peach-600 mb-2">
                    Number of Units 📦
                  </label>
                  <motion.input
                    type="number"
                    id="numberOfUnits"
                    value={numberOfUnits || ''}
                    onChange={(e) => setNumberOfUnits(parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-3 border-2 border-peach-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-300 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 text-peach-700 placeholder-peach-400"
                    placeholder="e.g., 10"
                    min="1"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Summary Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-cream-50/80 to-rose-50/80 backdrop-blur-sm border-cream-200/50 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Star className="w-8 h-8 text-cream-400" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cream-500 to-rose-500 bg-clip-text text-transparent">
                  Recipe Summary ✨
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 border-cream-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold text-cream-600">Total Recipe Cost</span>
                    </div>
                    <span className="text-3xl font-bold text-emerald-600">{formatCurrency(totalCost, currency)}</span>
                  </motion.div>
                  
                  {costPerUnit && (
                    <motion.div 
                      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 border-cream-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-sky-400" />
                        <span className="font-semibold text-cream-600">Cost per Unit</span>
                      </div>
                      <span className="text-3xl font-bold text-sky-600">{formatCurrency(costPerUnit, currency)}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-lilac-400 via-peach-400 to-mint-400 hover:from-lilac-500 hover:via-peach-500 hover:to-mint-500 text-white py-4 px-8 rounded-xl text-lg font-semibold shadow-xl border-0 transition-all duration-300"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              {recipe ? 'Update Recipe ✨' : 'Save Recipe 💖'}
            </Button>
          </motion.div>
          
          {recipe && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-300"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
} 