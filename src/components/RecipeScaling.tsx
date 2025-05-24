'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, RawMaterial } from '@/types';
import { scaleRecipe, getScalingOptions, getTotalRecipeWeight, formatScalingFactor } from '@/utils/scaling';
import { formatCurrency, formatWeight } from '@/utils/conversions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Scale, Zap, ArrowRight, Sparkles, Target, Calculator } from 'lucide-react';

interface RecipeScalingProps {
  recipe: Recipe;
  materials: RawMaterial[];
  onScaledRecipe: (scaledRecipe: Recipe) => void;
  className?: string;
}

export default function RecipeScaling({ recipe, materials, onScaledRecipe, className = '' }: RecipeScalingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customSize, setCustomSize] = useState<number>(100);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const currentSize = recipe.batchSize || getTotalRecipeWeight(recipe);
  const scalingOptions = getScalingOptions(recipe);

  const handleQuickScale = (newSize: number) => {
    const scaledRecipe = scaleRecipe(recipe, newSize, materials);
    onScaledRecipe(scaledRecipe);
    setSelectedSize(newSize);
    
    // Auto-close after a delay for better UX
    setTimeout(() => {
      setIsOpen(false);
      setSelectedSize(null);
    }, 1500);
  };

  const handleCustomScale = () => {
    if (customSize > 0 && customSize !== currentSize) {
      handleQuickScale(customSize);
    }
  };

  if (!recipe.ingredients.length) return null;

  return (
    <div className={className}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="h-12 px-6 border-pink-300 hover:border-pink-400 hover:bg-pink-50 text-pink-700"
          size="lg"
        >
          <Scale className="w-5 h-5 mr-2" />
          Scale Recipe ⚖️
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
            {formatWeight(currentSize, 'g')}
          </Badge>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="fixed inset-x-4 top-16 bottom-4 z-[9999] max-w-5xl mx-auto overflow-auto"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-pink-200/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-pink-500/10 to-yellow-500/10 border-b border-pink-200/30">
                <CardTitle className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white"
                  >
                    <Calculator className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                      ⚖️ Scale Recipe: {recipe.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      Current size: {formatWeight(currentSize, 'g')} • Cost: {formatCurrency(recipe.totalCost)}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="ml-auto p-2 rounded-full hover:bg-pink-100 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-xl text-pink-600">×</span>
                  </motion.button>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Quick Scale Options */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <h4 className="font-semibold text-primary">Quick Scale Options</h4>
                    <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {scalingOptions.slice(0, 12).map((size, index) => {
                      const scalingFactor = size / currentSize;
                      const isSelected = selectedSize === size;
                      
                      return (
                        <motion.div
                          key={`${size}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => handleQuickScale(size)}
                            variant={isSelected ? "default" : "outline"}
                            className={`w-full min-h-[4rem] flex flex-col gap-1 text-center p-2 justify-center items-center ${
                              isSelected 
                                ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg border-pink-400' 
                                : 'border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                            }`}
                            style={{ height: '4rem' }}
                          >
                            <span className="font-bold text-sm leading-tight">{formatWeight(size, 'g')}</span>
                            <span className="text-xs opacity-70 leading-none">
                              {scalingFactor < 1 ? '↓' : '↑'} {(scalingFactor * 100).toFixed(0)}%
                            </span>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {scalingOptions.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No scaling options available for this recipe size.</p>
                    </div>
                  )}
                </div>

                <Separator className="bg-pink-200/50" />

                {/* Custom Size Input */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-pink-500" />
                    <h4 className="font-semibold text-primary">Custom Size</h4>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={customSize || ''}
                        onChange={(e) => setCustomSize(parseFloat(e.target.value) || 0)}
                        placeholder="Enter custom size..."
                        className="h-12 border-pink-200 focus:border-pink-500 focus:ring-pink-500/20"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">grams</span>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleCustomScale}
                          disabled={!customSize || customSize <= 0 || customSize === currentSize}
                          className="h-12 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Scale ✨
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  {customSize > 0 && customSize !== currentSize && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-gradient-to-r from-pink-50 to-yellow-50 border border-pink-200/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Preview:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatWeight(currentSize, 'g')} → {formatWeight(customSize, 'g')}
                          </span>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {formatScalingFactor(customSize / currentSize)}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Success Message */}
                <AnimatePresence>
                  {selectedSize && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Recipe Scaled Successfully! 🎉</p>
                          <p className="text-sm text-green-600">
                            New size: {formatWeight(selectedSize, 'g')} • 
                            New cost: {formatCurrency(scaleRecipe(recipe, selectedSize, materials).totalCost)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 