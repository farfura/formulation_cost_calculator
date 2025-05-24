'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, RawMaterial } from '@/types';
import { formatCurrency, formatWeight } from '@/utils/conversions';
import { getTotalRecipeWeight, calculateIngredientPercentages } from '@/utils/scaling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RecipeScaling from './RecipeScaling';
import { Edit2, Trash2, ChefHat, Download, Scale, Sparkles, DollarSign } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  materials: RawMaterial[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onExport: (recipe: Recipe) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
}

export default function RecipeList({ recipes, materials, onEdit, onDelete, onExport, onUpdateRecipe }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200/50 shadow-xl">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChefHat className="w-20 h-20 text-pink-300 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent mb-3">
              No recipes yet! 👩‍🍳
            </h3>
            <p className="text-lg text-muted-foreground mb-2">Ready to create your first masterpiece?</p>
            <p className="text-sm text-muted-foreground">
              Start formulating and watch your beauty creations come to life! ✨
            </p>
            <motion.div
              className="mt-6 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="outline" className="text-pink-600 border-pink-300 bg-pink-50">
                💕 Face Moisturizer
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                ✨ Body Lotion
              </Badge>
              <Badge variant="outline" className="text-pink-600 border-pink-300 bg-pink-50">
                🌸 Facial Serum
              </Badge>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-pink-200/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-pink-500/10 to-yellow-500/10 border-b border-pink-200/30">
          <CardTitle className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white"
            >
              <ChefHat className="w-5 h-5" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                👩‍🍳 Recipe Collection
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground font-normal">
                  Your beautiful formulation library
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} ✨
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <AnimatePresence>
              {recipes.map((recipe, index) => {
                const totalWeight = getTotalRecipeWeight(recipe);
                const percentages = calculateIngredientPercentages(recipe);
                
                return (
                  <motion.div
                    key={recipe.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                    layout
                    className="group relative"
                  >
                    <Card className="border-pink-200/50 hover:border-pink-300/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-white to-pink-50/30">
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          {/* Recipe Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <motion.div
                                  className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                />
                                <h4 className="text-2xl font-bold text-primary">{recipe.name}</h4>
                                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                              </div>
                              
                              {/* Recipe Stats */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span>Total Cost: <span className="font-semibold text-primary text-lg">
                                    {formatCurrency(recipe.totalCost)}
                                  </span></span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Scale className="w-4 h-4 text-blue-500" />
                                  <span>Weight: <span className="font-semibold text-primary text-lg">
                                    {formatWeight(totalWeight, 'g')}
                                  </span></span>
                                </div>
                                
                                {recipe.costPerUnit && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-yellow-100 text-primary border-pink-200">
                                      {formatCurrency(recipe.costPerUnit)}/unit ✨
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              {recipe.batchSize && (
                                <div className="mb-4">
                                  <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                                    Batch Size: {formatWeight(recipe.batchSize, 'g')}
                                  </Badge>
                                </div>
                              )}

                              {recipe.numberOfUnits && (
                                <div className="mb-4">
                                  <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
                                    Units: {recipe.numberOfUnits}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 ml-6">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => onExport(recipe)}
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-600"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => onEdit(recipe)}
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-pink-600"
                                >
                                  <Edit2 className="w-4 h-4" />
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
                                  className="h-10 w-10 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>

                          {/* Ingredients with Percentages */}
                          <div>
                            <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                              Ingredients ({recipe.ingredients.length})
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                100% Formula ✨
                              </Badge>
                            </h5>
                            <div className="space-y-2">
                              {percentages.map(({ ingredient, percentage }, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50/50 to-yellow-50/50 rounded-lg border border-pink-100/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400" />
                                    <span className="font-medium text-primary">{ingredient.materialName}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">
                                      {formatWeight(ingredient.amount, ingredient.unit)} 
                                      <span className="text-xs ml-1">({formatWeight(ingredient.amountInGrams, 'g')})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={percentage} 
                                        className="w-16 h-2 bg-pink-100" 
                                      />
                                      <Badge variant="outline" className="text-xs min-w-[3rem] bg-white/70">
                                        {percentage.toFixed(1)}%
                                      </Badge>
                                    </div>
                                    <span className="font-semibold text-primary min-w-[4rem] text-right">
                                      {formatCurrency(ingredient.cost)}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Recipe Scaling Tool */}
                          <div className="relative">
                            <RecipeScaling
                              recipe={recipe}
                              materials={materials}
                              onScaledRecipe={onUpdateRecipe}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 