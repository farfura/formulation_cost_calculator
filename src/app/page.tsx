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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, ChefHat, Info, ArrowRight, CheckCircle, Sparkles, Heart, Star, HelpCircle, Target, Lightbulb } from 'lucide-react';

export default function Home() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | undefined>();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [activeTab, setActiveTab] = useState<'materials' | 'recipes'>('materials');
  const [showSuccessMessage, setShowSuccessMessage] = useState<string>('');

  // Load data from localStorage on component mount
  useEffect(() => {
    setMaterials(getRawMaterials());
    setRecipes(getRecipes());
  }, []);

  // Show success message temporarily
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Raw Materials Management
  const handleSaveMaterial = (material: RawMaterial) => {
    let updatedMaterials;
    const isEditing = editingMaterial;
    
    if (editingMaterial) {
      updatedMaterials = materials.map(m => m.id === material.id ? material : m);
      setEditingMaterial(undefined);
      setShowSuccessMessage(`✨ "${material.name}" updated successfully!`);
    } else {
      updatedMaterials = [...materials, material];
      setShowSuccessMessage(`🎉 "${material.name}" added to your collection!`);
    }
    setMaterials(updatedMaterials);
    saveRawMaterials(updatedMaterials);
    
    // Auto-switch to recipes tab if this is the first material
    if (!isEditing && updatedMaterials.length === 1) {
      setTimeout(() => {
        setShowSuccessMessage('🚀 Great! Now you can create your first recipe!');
      }, 3500);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    const materialName = materials.find(m => m.id === id)?.name;
    const updatedMaterials = materials.filter(m => m.id !== id);
    setMaterials(updatedMaterials);
    saveRawMaterials(updatedMaterials);
    setShowSuccessMessage(`🗑️ "${materialName}" removed from your collection`);
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
    const isEditing = editingRecipe;
    
    if (editingRecipe) {
      updatedRecipes = recipes.map(r => r.id === recipe.id ? recipe : r);
      setEditingRecipe(undefined);
      setShowSuccessMessage(`✨ Recipe "${recipe.name}" updated successfully!`);
    } else {
      updatedRecipes = [...recipes, recipe];
      setShowSuccessMessage(`🧪 Recipe "${recipe.name}" created successfully!`);
    }
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
  };

  const handleDeleteRecipe = (id: string) => {
    const recipeName = recipes.find(r => r.id === id)?.name;
    const updatedRecipes = recipes.filter(r => r.id !== id);
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
    setShowSuccessMessage(`🗑️ Recipe "${recipeName}" deleted`);
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
    setShowSuccessMessage(`📊 Recipe "${recipe.name}" exported successfully!`);
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
    saveRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
  };

  // Determine current step for guidance
  const currentStep = materials.length === 0 ? 1 : recipes.length === 0 ? 2 : 3;

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
      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {showSuccessMessage}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Beautiful Header */}
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
                  Create magical formulations <Heart className="w-3 h-3 text-pink-500" /> with precision and cost control
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              {recipes.length > 0 && (
                <ExportButton recipes={recipes} />
              )}
              {/* Help Button */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => setShowSuccessMessage('💡 Tip: Start by adding your ingredients, then create recipes to calculate costs!')}
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Help
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Beautiful Progress Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 bg-gradient-to-r from-pink-50/80 to-yellow-50/80 backdrop-blur-sm border-b border-pink-200/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-500" />
              Your Progress
            </h2>
            <div className="flex items-center space-x-8">
              <motion.div 
                className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-pink-600' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
              >
                {currentStep > 1 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <CheckCircle className="w-6 h-6 text-pink-600" />
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                    1
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-base">Add Materials ✨</div>
                  <div className="text-xs text-gray-500">Add your ingredients with costs</div>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 text-pink-400" />
              </motion.div>
              
              <motion.div 
                className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
              >
                {currentStep > 2 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <CheckCircle className="w-6 h-6 text-yellow-600" />
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    2
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-base">Create Recipes 🧪</div>
                  <div className="text-xs text-gray-500">Build formulations & calculate costs</div>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <ArrowRight className="w-5 h-5 text-yellow-400" />
              </motion.div>
              
              <motion.div 
                className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  3
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base">Export & Analyze 📊</div>
                  <div className="text-xs text-gray-500">Download & share your formulas</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Getting Started Guide */}
      {materials.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Card className="bg-gradient-to-r from-pink-50/80 to-yellow-50/80 backdrop-blur-sm border-pink-200/50 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lightbulb className="w-8 h-8 text-pink-600" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                    Welcome to your Beauty Laboratory! ✨
                  </h3>
                  <p className="text-lg text-pink-800 mb-6">
                    Transform your creativity into beautiful, cost-effective formulations! This calculator helps you track ingredient costs and create precise recipes.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 rounded-lg p-4 border border-pink-200/50">
                      <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        What you'll need:
                      </h4>
                      <ul className="text-sm text-pink-600 space-y-1">
                        <li>• Ingredient names (e.g., "Sweet Almond Oil")</li>
                        <li>• Purchase prices (what you paid)</li>
                        <li>• Weights/quantities (how much you bought)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/60 rounded-lg p-4 border border-yellow-200/50">
                      <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        What you'll get:
                      </h4>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        <li>• Automatic cost-per-gram calculations</li>
                        <li>• Recipe cost breakdowns</li>
                        <li>• Export-ready formulation sheets</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-100/50 to-yellow-100/50 rounded-lg p-4 border border-pink-200/50">
                    <div className="flex items-center gap-2 text-pink-700">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <strong>👇 Start here:</strong> Add your first ingredient below with its cost and weight. The calculator will automatically compute the cost per gram!
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Beautiful Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 bg-gradient-to-r from-white/80 to-pink-50/80 backdrop-blur-sm border-b border-pink-200/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={activeTab === 'materials' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('materials')}
                className={`flex items-center gap-3 py-6 px-8 rounded-none border-b-3 transition-all duration-300 ${
                  activeTab === 'materials'
                    ? 'border-pink-500 bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl'
                    : 'border-transparent hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="font-semibold">Raw Materials 💖</span>
                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                  {materials.length}
                </Badge>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={activeTab === 'recipes' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('recipes')}
                disabled={materials.length === 0}
                className={`flex items-center gap-3 py-6 px-8 rounded-none border-b-3 transition-all duration-300 ${
                  activeTab === 'recipes'
                    ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg hover:shadow-xl'
                    : materials.length === 0 
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <ChefHat className="w-5 h-5" />
                <span className="font-semibold">Recipes ✨</span>
                <Badge variant="secondary" className="ml-2 bg-pink-100 text-pink-800">
                  {recipes.length}
                </Badge>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Recipe Tab Disabled Message */}
      {materials.length === 0 && activeTab === 'recipes' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Card className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm border-yellow-200/50 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChefHat className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-4">Almost there! Add ingredients first 🌟</h3>
                <p className="text-lg text-yellow-800 mb-4">
                  Before creating recipes, you need some ingredients in your collection.
                </p>
                <div className="bg-white/60 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-yellow-700 mb-2">Quick example:</h4>
                  <p className="text-yellow-600 text-sm">
                    Add "Sweet Almond Oil" → Cost: $15.99 → Weight: 500g → The calculator shows $0.0320/g
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setActiveTab('materials')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                  >
                    ✨ Go to Raw Materials
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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

          {activeTab === 'recipes' && materials.length > 0 && (
            <motion.div
              key="recipes"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {/* Enhanced Recipe Guide */}
              {recipes.length === 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm border-green-200/50 shadow-xl">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Info className="w-8 h-8 text-green-600" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                            Ready to create magical recipes! 🧪✨
                          </h3>
                          <p className="text-lg text-green-800 mb-6">
                            Perfect! You have {materials.length} ingredient{materials.length > 1 ? 's' : ''} ready. Now create formulations and watch the calculator compute costs automatically!
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/60 rounded-lg p-4 border border-green-200/50">
                              <h4 className="font-semibold text-green-700 mb-2">💡 Recipe Tips:</h4>
                              <ul className="text-sm text-green-600 space-y-1">
                                <li>• Use percentages or actual weights</li>
                                <li>• The calculator shows cost per gram</li>
                                <li>• Scale recipes to any batch size</li>
                              </ul>
                            </div>
                            
                            <div className="bg-white/60 rounded-lg p-4 border border-emerald-200/50">
                              <h4 className="font-semibold text-emerald-700 mb-2">📊 You'll see:</h4>
                              <ul className="text-sm text-emerald-600 space-y-1">
                                <li>• Total recipe cost</li>
                                <li>• Cost breakdown by ingredient</li>
                                <li>• Cost per finished gram</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-green-100/50 to-emerald-100/50 rounded-lg p-4 border border-green-200/50">
                            <div className="flex items-center gap-2 text-green-700">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              <strong>👇 Create your first recipe:</strong> Give it a name, select ingredients, and specify quantities!
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
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
    </div>
  );
}
