'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RawMaterial, Recipe } from '@/types';
import { getRawMaterials, saveRawMaterials, getRecipes, saveRecipes } from '@/utils/storage';
import { exportToExcel } from '@/utils/export';

import RawMaterialForm from '@/components/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterialList';
import RecipeForm from '@/components/RecipeForm';
import RecipeList from '@/components/RecipeList';
import ExportButton from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, ChefHat, Sparkles, Heart, Star } from 'lucide-react';

export default function Home() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | undefined>();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [activeTab, setActiveTab] = useState<'materials' | 'recipes'>('materials');

  // Load data from localStorage on component mount
  useEffect(() => {
    setMaterials(getRawMaterials());
    setRecipes(getRecipes());
  }, []);

  // Raw Materials Management
  const handleSaveMaterial = (material: RawMaterial) => {
    let updatedMaterials;
    if (editingMaterial) {
      updatedMaterials = materials.map(m => m.id === material.id ? material : m);
      setEditingMaterial(undefined);
    } else {
      updatedMaterials = [...materials, material];
    }
    setMaterials(updatedMaterials);
    saveRawMaterials(updatedMaterials);
  };

  const handleDeleteMaterial = (id: string) => {
    const updatedMaterials = materials.filter(m => m.id !== id);
    setMaterials(updatedMaterials);
    saveRawMaterials(updatedMaterials);
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
  };

  const handleCancelEditMaterial = () => {
    setEditingMaterial(undefined);
  };

  // Recipes Management
  const handleSaveRecipe = (recipe: Recipe) => {
    let updatedRecipes;
    if (editingRecipe) {
      updatedRecipes = recipes.map(r => r.id === recipe.id ? recipe : r);
      setEditingRecipe(undefined);
    } else {
      updatedRecipes = [...recipes, recipe];
    }
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
  };

  const handleDeleteRecipe = (id: string) => {
    const updatedRecipes = recipes.filter(r => r.id !== id);
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setActiveTab('recipes');
  };

  const handleCancelEditRecipe = () => {
    setEditingRecipe(undefined);
  };

  const handleExportRecipe = (recipe: Recipe) => {
    exportToExcel(recipe);
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
    saveRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-300/20 to-yellow-300/20 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400/30 to-pink-400/30 blur-lg"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-gradient-to-r from-pink-200/15 to-yellow-200/15 blur-2xl"
          animate={{
            x: [0, 150, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/80 backdrop-blur-md border-b border-pink-200/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative">
                <Calculator className="w-10 h-10 text-primary pulse-glow" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                  ✨ Beauty Formula Calculator
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Create magical formulations <Heart className="w-3 h-3 text-pink-500" /> with precision
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {recipes.length > 0 && (
                <ExportButton recipes={recipes} />
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 bg-gradient-to-r from-pink-50/80 to-yellow-50/80 backdrop-blur-sm border-b border-pink-200/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Button
              variant={activeTab === 'materials' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-2 py-6 px-6 rounded-none border-b-2 transition-all duration-300 ${
                activeTab === 'materials'
                  ? 'border-primary bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                  : 'border-transparent hover:border-pink-300 hover:bg-pink-50'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Raw Materials</span>
              <Badge variant="secondary" className="ml-2">
                {materials.length}
              </Badge>
            </Button>
            <Button
              variant={activeTab === 'recipes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 py-6 px-6 rounded-none border-b-2 transition-all duration-300 ${
                activeTab === 'recipes'
                  ? 'border-primary bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'border-transparent hover:border-yellow-300 hover:bg-yellow-50'
              }`}
            >
              <ChefHat className="w-5 h-5" />
              <span className="font-medium">Recipes</span>
              <Badge variant="secondary" className="ml-2">
                {recipes.length}
              </Badge>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'materials' && (
            <motion.div
              key="materials"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <RawMaterialForm
                  material={editingMaterial}
                  onSave={handleSaveMaterial}
                  onCancel={handleCancelEditMaterial}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <RawMaterialList
                  materials={materials}
                  onEdit={handleEditMaterial}
                  onDelete={handleDeleteMaterial}
                />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'recipes' && (
            <motion.div
              key="recipes"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <RecipeForm
                  recipe={editingRecipe}
                  materials={materials}
                  onSave={handleSaveRecipe}
                  onCancel={handleCancelEditRecipe}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <RecipeList
                  recipes={recipes}
                  materials={materials}
                  onEdit={handleEditRecipe}
                  onDelete={handleDeleteRecipe}
                  onExport={handleExportRecipe}
                  onUpdateRecipe={handleUpdateRecipe}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 bg-gradient-to-r from-pink-100/50 to-yellow-100/50 backdrop-blur-sm border-t border-pink-200/50 mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-pink-200/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
                  <span className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                    Beauty Formula Calculator
                  </span>
                  <Star className="w-5 h-5 text-pink-500 animate-pulse" />
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Transform your creativity into beautiful, cost-effective formulations for skincare and cosmetics. 
                  Every ingredient matters, every formula tells a story. ✨
                </p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Badge variant="outline" className="text-pink-600 border-pink-300">
                    Made with 💖
                  </Badge>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    For Beauty Creators
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.footer>
    </div>
  );
}
