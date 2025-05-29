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

interface RecipeListProps {
  recipes: Recipe[];
  materials: RawMaterial[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onExport: (recipe: Recipe) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
}

export default function RecipeList({ recipes, materials, onEdit, onDelete, onExport, onUpdateRecipe }: RecipeListProps) {
  const { currency } = useCurrency();
  console.log('RecipeList component - received recipes:', recipes);

  if (!recipes || recipes.length === 0) {
    console.log('RecipeList - No recipes to display');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 backdrop-blur-sm border-purple-200/50 shadow-xl">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChefHat className="w-24 h-24 text-purple-300 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-4">
              No recipes yet! 👩‍🍳
            </h3>
            <p className="text-lg text-purple-600 mb-3">Ready to create your first magical masterpiece?</p>
            <p className="text-sm text-purple-500 mb-8">
              Start formulating and watch your beauty creations come to life! ✨
            </p>
            <motion.div
              className="flex justify-center gap-3 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, staggerChildren: 0.1 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }}>
                <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-100/70 px-4 py-2">
                  💜 Face Moisturizer
                </Badge>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }}>
                <Badge variant="outline" className="text-pink-600 border-pink-300 bg-pink-100/70 px-4 py-2">
                  💖 Body Lotion
                </Badge>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }}>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-100/70 px-4 py-2">
                  💛 Facial Serum
                </Badge>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  console.log('RecipeList - Rendering recipes list:', recipes.length, 'recipes');
  console.log('Recipe details:', recipes.map(r => ({ id: r.id, name: r.name, ingredients: r.ingredients?.length || 0 })));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Enhanced Header Card with Purple Theme */}
      <Card className="bg-gradient-to-r from-purple-50/90 via-pink-50/90 to-yellow-50/90 backdrop-blur-sm border-purple-200/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-yellow-400/10 border-b border-purple-200/30">
          <CardTitle className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white shadow-lg"
            >
              <ChefHat className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
                ✨ Recipe Collection
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-purple-600 font-medium">
                  Your beautiful formulation library
                </p>
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                  {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} 💖
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Recipes with Enhanced Tabular Structure */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <AnimatePresence>
          {recipes.map((recipe, index) => {
            const totalWeight = getTotalRecipeWeight(recipe);
            const percentages = calculateIngredientPercentages(recipe);
            
            // Enhanced color themes with purple variations
            const colorThemes = [
              { 
                gradient: 'from-purple-50 to-violet-100/50',
                border: 'border-purple-200/60',
                accent: 'from-purple-400 to-violet-400',
                text: 'text-purple-700',
                icon: 'text-purple-500',
                headerBg: 'bg-gradient-to-r from-purple-500 to-violet-500'
              },
              { 
                gradient: 'from-pink-50 to-rose-100/50',
                border: 'border-pink-200/60',
                accent: 'from-pink-400 to-rose-400',
                text: 'text-pink-700',
                icon: 'text-pink-500',
                headerBg: 'bg-gradient-to-r from-pink-500 to-rose-500'
              },
              { 
                gradient: 'from-yellow-50 to-amber-100/50',
                border: 'border-yellow-200/60',
                accent: 'from-yellow-400 to-amber-400',
                text: 'text-yellow-700',
                icon: 'text-yellow-600',
                headerBg: 'bg-gradient-to-r from-yellow-500 to-amber-500'
              },
              { 
                gradient: 'from-orchid-50 to-plum-100/50',
                border: 'border-orchid-200/60',
                accent: 'from-orchid-400 to-plum-400',
                text: 'text-orchid-700',
                icon: 'text-orchid-500',
                headerBg: 'bg-gradient-to-r from-orchid-500 to-plum-500'
              },
              { 
                gradient: 'from-grape-50 to-violet-100/50',
                border: 'border-grape-200/60',
                accent: 'from-grape-400 to-violet-400',
                text: 'text-grape-700',
                icon: 'text-grape-500',
                headerBg: 'bg-gradient-to-r from-grape-500 to-violet-500'
              }
            ];
            
            const theme = colorThemes[index % colorThemes.length];
            
            return (
              <motion.div
                key={recipe.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
                layout
                className="group relative"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className={`bg-gradient-to-br ${theme.gradient} backdrop-blur-sm ${theme.border} hover:border-opacity-80 transition-all duration-500 hover:shadow-2xl shadow-lg overflow-hidden relative`}>
                  {/* Floating decoration */}
                  <motion.div
                    className={`absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-r ${theme.accent} opacity-10`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  />
                  
                  <CardContent className="p-0 relative z-10">
                    {/* Recipe Header with Enhanced Styling */}
                    <div className={`${theme.headerBg} text-white p-6 relative overflow-hidden`}>
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        animate={{ 
                          x: [-100, 100],
                          opacity: [0, 0.5, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                              >
                                <Sparkles className="w-6 h-6 text-white" />
                              </motion.div>
                              <h4 className="text-3xl font-bold text-white">{recipe.name}</h4>
                            </div>
                            
                            {/* Enhanced Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                              <motion.div 
                                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className="flex items-center gap-3">
                                  <DollarSign className="w-5 h-5 text-white" />
                                  <div>
                                    <p className="text-white/80 text-sm font-medium">Total Cost</p>
                                    <p className="font-bold text-white text-xl">
                                      {formatCurrency(recipe.totalCost, currency)}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                              
                              <motion.div 
                                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className="flex items-center gap-3">
                                  <Scale className="w-5 h-5 text-white" />
                                  <div>
                                    <p className="text-white/80 text-sm font-medium">Total Weight</p>
                                    <p className="font-bold text-white text-xl">
                                      {formatWeight(totalWeight, 'g')}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>

                              <motion.div 
                                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className="flex items-center gap-3">
                                  <Beaker className="w-5 h-5 text-white" />
                                  <div>
                                    <p className="text-white/80 text-sm font-medium">Ingredients</p>
                                    <p className="font-bold text-white text-xl">
                                      {recipe.ingredients.length}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-6">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => onExport(recipe)}
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 bg-yellow-300 border-yellow-400 hover:bg-yellow-400 text-white shadow-lg backdrop-blur-sm"
                              >
                                <Download className="w-5 h-5" />
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => onEdit(recipe)}
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 bg-pink-300 border-pink-400 hover:bg-pink-400 text-white shadow-lg backdrop-blur-sm"
                              >
                                <Edit2 className="w-5 h-5" />
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete recipe "${recipe.name}"? 💔`)) {
                                    onDelete(recipe.id);
                                  }
                                }}
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 bg-orchid-300 border-orchid-400 hover:bg-orchid-400 text-white shadow-lg backdrop-blur-sm"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Tabular Ingredients Section */}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          >
                            <Beaker className={`w-6 h-6 ${theme.icon}`} />
                          </motion.div>
                          <h5 className={`font-bold ${theme.text} text-xl`}>
                            Formula Breakdown
                          </h5>
                          <Badge variant="secondary" className={`bg-gradient-to-r ${theme.gradient} ${theme.text} border-current`}>
                            {recipe.ingredients.length} ingredients ✨
                          </Badge>
                        </div>
                        
                        {/* Enhanced Table Structure */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 overflow-hidden shadow-lg">
                          {/* Table Header */}
                          <div className={`${theme.headerBg} text-white p-4`}>
                            <div className="grid grid-cols-12 gap-4 font-semibold text-sm">
                              <div className="col-span-4">Ingredient Name</div>
                              <div className="col-span-2 text-center">Amount</div>
                              <div className="col-span-2 text-center">Weight (g)</div>
                              <div className="col-span-2 text-center">Percentage</div>
                              <div className="col-span-2 text-center">Cost</div>
                            </div>
                          </div>
                          
                          {/* Table Body */}
                          <div className="divide-y divide-gray-200">
                            {percentages.map(({ ingredient, percentage }, ingredientIndex) => (
                              <motion.div
                                key={ingredientIndex}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ingredientIndex * 0.1 }}
                                className="grid grid-cols-12 gap-4 p-4 hover:bg-white/60 transition-all duration-300 group"
                                whileHover={{ scale: 1.01 }}
                              >
                                <div className="col-span-4 flex items-center gap-3">
                                  <motion.div 
                                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.accent} shadow-sm`}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: ingredientIndex * 0.2 }}
                                  />
                                  <span className={`font-semibold ${theme.text} group-hover:text-opacity-80`}>
                                    {ingredient.materialName}
                                  </span>
                                </div>
                                
                                <div className="col-span-2 text-center">
                                  <div className="font-medium text-gray-700">
                                    {formatWeight(ingredient.amount, ingredient.unit)}
                                  </div>
                                </div>
                                
                                <div className="col-span-2 text-center">
                                  <div className="font-medium text-gray-600">
                                    {formatWeight(ingredient.amountInGrams, 'g')}
                                  </div>
                                </div>
                                
                                <div className="col-span-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-16">
                                      <Progress 
                                        value={percentage} 
                                        className="h-2 bg-gray-200" 
                                      />
                                    </div>
                                    <Badge variant="outline" className="text-xs min-w-[3rem] bg-white/80 border-gray-300">
                                      {percentage.toFixed(1)}%
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="col-span-2 text-center">
                                  <span className="font-bold text-emerald-600 text-lg">
                                    {formatCurrency(ingredient.cost, currency)}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          {/* Table Footer with Totals */}
                          <div className={`${theme.headerBg} text-white p-4 border-t border-white/20`}>
                            <div className="grid grid-cols-12 gap-4 font-bold">
                              <div className="col-span-4">TOTAL</div>
                              <div className="col-span-2"></div>
                              <div className="col-span-2 text-center">
                                {formatWeight(totalWeight, 'g')}
                              </div>
                              <div className="col-span-2 text-center">100.0%</div>
                              <div className="col-span-2 text-center text-lg">
                                {formatCurrency(recipe.totalCost, currency)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info Badges */}
                        <div className="flex flex-wrap gap-3 mt-6">
                          {recipe.costPerUnit && (
                            <Badge variant="outline" className="bg-gradient-to-r from-emerald-100 to-mint-100 text-emerald-700 border-emerald-200 px-3 py-1">
                              💰 {formatCurrency(recipe.costPerUnit, currency)}/unit
                            </Badge>
                          )}
                          {recipe.batchSize && (
                            <Badge variant="outline" className="bg-gradient-to-r from-sky-100 to-powder-100 text-sky-700 border-sky-200 px-3 py-1">
                              📏 {formatWeight(recipe.batchSize, 'g')} batch
                            </Badge>
                          )}
                          {recipe.numberOfUnits && (
                            <Badge variant="outline" className={`bg-gradient-to-r ${theme.gradient} ${theme.text} border-current px-3 py-1`}>
                              📦 {recipe.numberOfUnits} units
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Recipe Scaling Tool */}
                      <motion.div 
                        className="relative mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <RecipeScaling
                          recipe={recipe}
                          materials={materials}
                          onScaledRecipe={onUpdateRecipe}
                          className="w-full"
                        />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 