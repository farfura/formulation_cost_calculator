'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RawMaterial, Recipe } from '@/types';
import { 
  getRawMaterialsFromSupabase as getRawMaterialsFromDB, 
  saveRawMaterialToDB, 
  deleteRawMaterialFromDB,
  getRecipesFromSupabase as getRecipesFromDB,
  saveRecipeToDB,
  deleteRecipeFromDB
} from '@/utils/db-supabase';
import { exportToExcel } from '@/utils/export';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/currency';

import RawMaterialForm from '@/components/RawMaterialForm';
import RawMaterialList from '@/components/RawMaterialList';
import RecipeForm from '@/components/RecipeForm';
import RecipeList from '@/components/RecipeList';
import ExportButton from '@/components/ExportButton';
import CurrencySelector from '@/components/CurrencySelector';
import LabelGenerator from '@/components/LabelGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, ChefHat, Sparkles, Heart, HelpCircle, Lightbulb, Plus, TrendingUp, Beaker, BarChart3, Layers, Zap, Tag, LogOut } from 'lucide-react';
import { InventoryManager } from '@/components/InventoryManager';
import { PricingCalculator } from '@/components/PricingCalculator';

export default function Home() {
  const { currency } = useCurrency();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | undefined>();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'materials' | 'recipes' | 'labels' | 'analytics' | 'inventory' | 'pricing'>('overview');
  const [showSuccessMessage, setShowSuccessMessage] = useState<string>('');
  const [selectedRecipeForLabel, setSelectedRecipeForLabel] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "👋 See you soon!",
        description: "You've been successfully logged out.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('Starting to load data...');
      setLoading(true);
      try {
        const [materialsData, recipesData] = await Promise.all([
          getRawMaterialsFromDB(),
          getRecipesFromDB()
        ]);
        console.log('Loaded recipes:', recipesData);
        setMaterials(materialsData);
        setRecipes(recipesData);
      } catch (err) {
        console.error('Error loading data:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data from database",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  // Show success message temporarily
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Raw Materials Management
  const handleSaveMaterial = async (material: RawMaterial) => {
    setLoading(true);
    try {
      console.log('Attempting to save material:', material.name);
      const savedMaterial = await saveRawMaterialToDB(material);
      let updatedMaterials;
      
      if (editingMaterial) {
        updatedMaterials = materials.map(m => m.id === material.id ? savedMaterial : m);
        setEditingMaterial(undefined);
        setShowSuccessMessage(`<span className="text-2xl">✨</span> "${material.name}" updated successfully!`);
      } else {
        updatedMaterials = [...materials, savedMaterial];
        setShowSuccessMessage(`<span className="text-2xl">🎉</span> "${material.name}" added to your collection!`);
      }
      setMaterials(updatedMaterials);
      setShowMaterialForm(false);
    } catch (err) {
      console.error('Error saving material:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save material';
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save material: ${errorMessage}`,
      });
      // Don't close the form on error so user can try again
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setLoading(true);
    try {
      const materialName = materials.find(m => m.id === id)?.name;
      await deleteRawMaterialFromDB(id);
      const updatedMaterials = materials.filter(m => m.id !== id);
      setMaterials(updatedMaterials);
      setShowSuccessMessage(`<span className="text-2xl">🗑️</span> "${materialName}" removed from your collection`);
    } catch (err) {
      console.error('Error deleting material:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete material",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
    setShowMaterialForm(true);
  };

  const handleCancelEditMaterial = () => {
    setEditingMaterial(undefined);
    setShowMaterialForm(false);
  };

  // Recipes Management
  const handleSaveRecipe = async (recipe: Recipe) => {
    setLoading(true);
    try {
      const savedRecipe = await saveRecipeToDB(recipe);
      let updatedRecipes;
      
      if (editingRecipe) {
        updatedRecipes = recipes.map(r => r.id === recipe.id ? savedRecipe : r);
        setEditingRecipe(undefined);
        setShowSuccessMessage(`<span className="text-2xl">✨</span> Recipe "${recipe.name}" updated successfully!`);
      } else {
        updatedRecipes = [...recipes, savedRecipe];
        setShowSuccessMessage(`<span className="text-2xl">🧪</span> Recipe "${recipe.name}" created successfully!`);
      }
      setRecipes(updatedRecipes);
      setShowRecipeForm(false);
    } catch (err) {
      console.error('Error saving recipe:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save recipe",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    setLoading(true);
    try {
      const recipeName = recipes.find(r => r.id === id)?.name;
      await deleteRecipeFromDB(id);
      const updatedRecipes = recipes.filter(r => r.id !== id);
      setRecipes(updatedRecipes);
      setShowSuccessMessage(`<span className="text-2xl">🗑️</span> Recipe "${recipeName}" deleted`);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete recipe",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowRecipeForm(true);
  };

  const handleCancelEditRecipe = () => {
    setEditingRecipe(undefined);
    setShowRecipeForm(false);
  };

  const handleExportRecipe = (recipe: Recipe) => {
    exportToExcel(recipe);
    setShowSuccessMessage(`<span className="text-2xl">📊</span> Recipe "${recipe.name}" exported successfully!`);
  };

  // Calculate statistics
  const totalInvestment = materials.reduce((sum, m) => sum + m.totalCost, 0);

  const totalFormulated = recipes.reduce((sum, r) => sum + r.ingredients.reduce((iSum, i) => iSum + i.amountInGrams, 0), 0);

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

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-yellow-400 to-amber-400', bg: 'from-yellow-50 to-amber-50', text: 'text-yellow-600' },
    { id: 'materials', label: 'Materials', icon: Package, color: 'from-pink-400 to-rose-400', bg: 'from-pink-50 to-rose-50', text: 'text-pink-600' },
    { id: 'recipes', label: 'Recipes', icon: ChefHat, color: 'from-purple-400 to-violet-400', bg: 'from-purple-50 to-violet-50', text: 'text-purple-600' },
    { id: 'labels', label: 'Labels', icon: Tag, color: 'from-green-400 to-emerald-400', bg: 'from-green-50 to-emerald-50', text: 'text-green-600' },
    { id: 'inventory', label: 'Inventory', icon: Package, color: 'from-blue-400 to-indigo-400', bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600' },
    { id: 'pricing', label: 'Pricing', icon: Calculator, color: 'from-purple-400 to-violet-400', bg: 'from-purple-50 to-violet-50', text: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            Loading...
          </div>
        </div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-2xl border border-purple-300"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              {showSuccessMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-yellow-200/40 to-amber-200/40 blur-xl"
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
          className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-purple-200/50 to-violet-200/50 blur-lg"
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
          className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-gradient-to-r from-orchid-200/35 to-plum-200/35 blur-2xl"
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
        <motion.div
          className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-gradient-to-r from-pink-200/45 to-rose-200/45 blur-lg"
          animate={{
            x: [0, -60, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-60 right-1/3 w-28 h-28 rounded-full bg-gradient-to-r from-grape-200/30 to-violet-200/30 blur-xl"
          animate={{
            x: [0, -120, 0],
            y: [0, 60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>

      {/* Header with Sign Out */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/90 backdrop-blur-md border-b border-purple-200/60 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative">
                <Calculator className="w-10 h-10 text-purple-500 pulse-glow" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-500 bg-clip-text text-transparent">
                  ✨ Beauty Formula Calculator
                </h1>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1 bg-white p-1 rounded-md shadow-md">
                  Logged in as: {user?.email} <Heart className="w-3 h-3 text-red-500" />
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <CurrencySelector showLabel={false} className="w-48" />
              
              <ExportButton 
                variant="all" 
                recipes={recipes} 
                materials={materials}
              />
              
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  onClick={() => setShowSuccessMessage('💡 Tip: Start by adding your ingredients, then create recipes to calculate costs!')}
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Help
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleSignOut}
                  className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 bg-gradient-to-r from-white/90 via-purple-50/80 to-yellow-50/90 backdrop-blur-sm border-b border-purple-200/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as 'overview' | 'materials' | 'recipes' | 'labels' | 'analytics' | 'inventory' | 'pricing')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-3 ${
                    isActive
                      ? `border-opacity-60 ${item.text} bg-gradient-to-r ${item.bg} shadow-lg border-current`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  {item.label}
                  {item.id === 'materials' && materials.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-pink-100 text-pink-700">
                      {materials.length}
                    </Badge>
                  )}
                  {item.id === 'recipes' && recipes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700">
                      {recipes.length}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {/* Stats Grid */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="bg-gradient-to-br from-yellow-400 to-amber-400 text-white shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-100 text-sm font-medium">Total Materials</p>
                            <p className="text-3xl font-bold">{materials.length}</p>
                          </div>
                          <motion.div 
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Package className="w-8 h-8 text-yellow-200" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-pink-100 text-sm font-medium">Investment</p>
                            <p className="text-3xl font-bold">{formatCurrency(totalInvestment, currency)}</p>
                          </div>
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <TrendingUp className="w-8 h-8 text-pink-200" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="bg-gradient-to-br from-purple-400 to-violet-400 text-white shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">Total Recipes</p>
                            <p className="text-3xl font-bold">{recipes.length}</p>
                          </div>
                          <motion.div 
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <ChefHat className="w-8 h-8 text-purple-200" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="bg-gradient-to-br from-orchid-400 to-plum-400 text-white shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orchid-100 text-sm font-medium">Formulated</p>
                            <p className="text-3xl font-bold">{totalFormulated.toFixed(0)}g</p>
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Beaker className="w-8 h-8 text-orchid-200" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5 text-purple-500" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                          Quick Actions
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setShowMaterialForm(true)}
                          className="w-full justify-start bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Material <span className="text-2xl">✨</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setShowRecipeForm(true)}
                          disabled={materials.length === 0}
                          className="w-full justify-start bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white disabled:opacity-50 shadow-lg"
                        >
                          <ChefHat className="w-4 h-4 mr-2" />
                          Create New Recipe <span className="text-2xl">🧪</span>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-yellow-200/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Layers className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                          Recent Activity
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {materials.length === 0 && recipes.length === 0 ? (
                        <div className="text-center py-4">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          </motion.div>
                          <p className="text-gray-500 text-sm">No activity yet. Start by adding materials! 🌟</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {materials.slice(-3).map((material, index) => (
                            <motion.div
                              key={material.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Package className="w-3 h-3 text-pink-500" />
                              <span className="text-gray-600">Added material: {material.name}</span>
                            </motion.div>
                          ))}
                          {recipes.slice(-2).map((recipe, index) => (
                            <motion.div
                              key={recipe.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (materials.slice(-3).length + index) * 0.1 }}
                              className="flex items-center gap-2 text-sm"
                            >
                              <ChefHat className="w-3 h-3 text-purple-500" />
                              <span className="text-gray-600">Created recipe: {recipe.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Getting Started */}
              {materials.length === 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-r from-purple-50/90 via-pink-50/90 to-yellow-50/90 backdrop-blur-sm border-purple-200/60 shadow-xl">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightbulb className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                          Welcome to your Beauty Laboratory! <span className="text-2xl">✨</span>
                        </h3>
                        <p className="text-lg text-gray-700 mb-6">
                          Transform your creativity into beautiful, cost-effective formulations! Start by adding your ingredients to begin creating professional formulations with precise cost calculations.
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => {
                              setShowMaterialForm(true);
                              setActiveSection('materials');
                            }}
                            className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:to-yellow-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Your First Material <span className="text-2xl">🌟</span>
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Materials Section */}
          {activeSection === 'materials' && (
            <motion.div
              key="materials"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                      <span className="text-2xl">💖</span>
                      <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Materials Management
                      </span>
                    </h2>
                    <p className="text-gray-600 flex items-center gap-1">
                      Manage your ingredient inventory and costs <span className="text-2xl">✨</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setShowMaterialForm(true)}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Material <span className="text-2xl">✨</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <ExportButton
                        materials={materials}
                        variant="materials"
                        label="Export to Excel"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-sm border-pink-200/60 shadow-xl">
                  <CardContent className="p-6">
                    {materials.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Package className="w-20 h-20 text-pink-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                          No materials yet! 💕
                        </h3>
                        <p className="text-lg text-gray-600 mb-2">Ready to build your ingredient library?</p>
                        <p className="text-sm text-gray-500 mb-6">
                          Start adding your beauty ingredients and watch the magic happen! ✨
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setShowMaterialForm(true)}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Your First Material <span className="text-2xl">🌟</span>
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      <RawMaterialList
                        materials={materials}
                        onEdit={handleEditMaterial}
                        onDelete={handleDeleteMaterial}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Recipes Section */}
          {activeSection === 'recipes' && (
            <motion.div
              key="recipes"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
              onAnimationStart={() => console.log('Rendering Recipes Section, recipes:', recipes)}
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                      <span className="text-2xl">🧪</span>
                      <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        Recipe Collection ({recipes.length})
                      </span>
                    </h2>
                    <p className="text-gray-600 flex items-center gap-1">
                      Create and manage your magical formulations <span className="text-2xl">❤️</span>
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowRecipeForm(true)}
                      disabled={materials.length === 0}
                      className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white disabled:opacity-50 shadow-lg"
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Create Recipe <span className="text-2xl">✨</span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl">
                  <CardContent className="p-6">
                    <div onLoad={() => console.log('Recipe display logic - materials:', materials.length, 'recipes:', recipes.length)}>
                    {materials.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ChefHat className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                          Add materials first! <span className="text-2xl">🌟</span>
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">You need ingredients before creating magical recipes</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setActiveSection('materials')}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            <Package className="w-5 h-5 mr-2" />
                            Go to Materials <span className="text-2xl">💕</span>
                          </Button>
                        </motion.div>
                      </div>
                    ) : recipes.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ChefHat className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                          No recipes yet! <span className="text-2xl">👩‍🍳</span>
                        </h3>
                        <p className="text-lg text-gray-600 mb-2">Ready to create your first masterpiece?</p>
                        <p className="text-sm text-gray-500 mb-6">
                          You have {materials.length} ingredient{materials.length > 1 ? 's' : ''} ready to use! <span className="text-2xl">✨</span>
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setShowRecipeForm(true)}
                            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Recipe <span className="text-2xl">🌟</span>
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      <RecipeList
                        recipes={recipes}
                        materials={materials}
                        onEdit={handleEditRecipe}
                        onDelete={handleDeleteRecipe}
                        onExport={handleExportRecipe}
                      />
                    )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Labels Section */}
          {activeSection === 'labels' && (
            <motion.div
              key="labels"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                      <span className="text-2xl">🏷️</span>
                      <span className="bg-gradient-to-r from-orchid-600 to-plum-600 bg-clip-text text-transparent">
                        Label Generation
                      </span>
                    </h2>
                    <p className="text-gray-600 flex items-center gap-1">
                      Generate labels for your products <span className="text-2xl">✨</span>
                    </p>
                  </div>
                  {recipes.length > 0 && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setSelectedRecipeForLabel(recipes[0])}
                        className="bg-gradient-to-r from-orchid-500 to-plum-500 hover:from-orchid-600 hover:to-plum-600 text-white shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Label <span className="text-2xl">✨</span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl">
                  <CardContent className="p-6">
                    {materials.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ChefHat className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                          No materials to generate labels for! <span className="text-2xl">🌟</span>
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">Add materials to generate labels</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setActiveSection('materials')}
                            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Go to Materials <span className="text-2xl">💕</span>
                          </Button>
                        </motion.div>
                      </div>
                    ) : recipes.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ChefHat className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                          No recipes to generate labels for! <span className="text-2xl">👩‍🍳</span>
                        </h3>
                        <p className="text-lg text-gray-600 mb-2">Ready to create recipes to generate labels?</p>
                        <p className="text-sm text-gray-500 mb-6">
                          You have {materials.length} ingredient{materials.length > 1 ? 's' : ''} ready to use! <span className="text-2xl">✨</span>
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setShowRecipeForm(true)}
                            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Recipes to Generate Labels <span className="text-2xl">🌟</span>
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-lg text-gray-600">Select a recipe to generate a label for:</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {recipes.map((recipe) => (
                            <motion.div
                              key={recipe.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                onClick={() => setSelectedRecipeForLabel(recipe)}
                                className="w-full h-full p-4 bg-white hover:bg-gray-50 border border-purple-200 rounded-lg text-left flex flex-col gap-2"
                                variant="outline"
                              >
                                <div className="font-semibold text-purple-700">{recipe.name}</div>
                                <div className="text-sm text-gray-600">
                                  {recipe.ingredients.length} ingredients
                                </div>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Inventory Section */}
          {activeSection === 'inventory' && (
            <motion.div
              key="inventory"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <div className="mt-4">
                  <InventoryManager />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Pricing Section */}
          {activeSection === 'pricing' && (
            <div className="space-y-6">
              <PricingCalculator hideHeader={false} />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Material Form Modal */}
      <AnimatePresence>
        {showMaterialForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              // Close modal when clicking backdrop
              if (e.target === e.currentTarget) {
                handleCancelEditMaterial();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {editingMaterial ? (<><span className="text-2xl">✨</span> Edit Material</>) : (<><span className="text-2xl">✨</span> Add New Material</>)}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEditMaterial}
                    className="text-gray-500 hover:text-gray-700 hover:bg-pink-100 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      ✕
                    </motion.div>
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <RawMaterialForm
                  material={editingMaterial}
                  onSave={handleSaveMaterial}
                  onCancel={handleCancelEditMaterial}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe Form Modal */}
      <AnimatePresence>
        {showRecipeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {editingRecipe ? (<><span className="text-2xl">🧪</span> Edit Recipe</>) : (<><span className="text-2xl">🧪</span> Create New Recipe</>)}
                  </h2>
                  <Button
                    onClick={handleCancelEditRecipe}
                    variant="outline"
                    className="text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span className="text-xl font-bold">✕</span>
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <RecipeForm
                  recipe={editingRecipe}
                  materials={materials}
                  onSave={handleSaveRecipe}
                  onCancel={handleCancelEditRecipe}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label Generator Modal */}
      <AnimatePresence>
        {selectedRecipeForLabel && (
          <LabelGenerator
            recipe={selectedRecipeForLabel}
            onClose={() => setSelectedRecipeForLabel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
