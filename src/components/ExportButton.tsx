'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, RawMaterial } from '@/types';
import { exportToCSV, exportToExcel, exportMultipleRecipesToExcel, exportRawMaterialsToExcel } from '@/utils/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText, Sparkles, Package, Database } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ExportButtonProps {
  recipe?: Recipe;
  recipes?: Recipe[];
  materials?: RawMaterial[];
  className?: string;
  variant?: 'recipe' | 'recipes' | 'materials' | 'all';
}

export default function ExportButton({ 
  recipe, 
  recipes, 
  materials, 
  className = '', 
  variant = 'recipe' 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculate dropdown position when button is clicked
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buttonRef.current && !isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width - 256 // Align right edge, 256px is dropdown width
      });
    }
    
    setIsOpen(!isOpen);
  };

  const handleExportCSV = () => {
    if (recipe) {
      exportToCSV(recipe);
    }
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    if (recipe) {
      exportToExcel(recipe);
    }
    setIsOpen(false);
  };

  const handleExportAllExcel = () => {
    if (recipes && recipes.length > 0) {
      exportMultipleRecipesToExcel(recipes);
    }
    setIsOpen(false);
  };

  const handleExportMaterialsExcel = () => {
    if (materials && materials.length > 0) {
      exportRawMaterialsToExcel(materials);
    }
    setIsOpen(false);
  };

  // Single recipe export (with dropdown options)
  if (variant === 'recipe' && recipe) {
    return (
      <div className={`relative ${className}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleToggleDropdown}
            ref={buttonRef}
            className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Recipe ✨
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-56 z-50"
              >
                <Card className="bg-white/95 backdrop-blur-sm border-pink-200/50 shadow-xl">
                  <CardContent className="p-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleExportCSV}
                        variant="ghost"
                        className="w-full justify-start h-12 hover:bg-green-50 hover:text-green-700"
                      >
                        <FileText className="w-5 h-5 mr-3 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium">Export as CSV</p>
                          <p className="text-xs text-muted-foreground">Spreadsheet compatible</p>
                        </div>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleExportExcel}
                        variant="ghost"
                        className="w-full justify-start h-12 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <FileSpreadsheet className="w-5 h-5 mr-3 text-emerald-600" />
                        <div className="text-left">
                          <p className="font-medium">Export as Excel</p>
                          <p className="text-xs text-muted-foreground">Advanced formatting</p>
                        </div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Multiple recipes export
  if (variant === 'recipes' && recipes && recipes.length > 0) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        <Button
          onClick={handleExportAllExcel}
          className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <motion.div
            className="flex items-center gap-2"
            animate={{ 
              y: [0, -2, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Download className="w-5 h-5" />
            <span>Export All Recipes</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </motion.div>
        </Button>
      </motion.div>
    );
  }

  // Raw materials export
  if (variant === 'materials' && materials && materials.length > 0) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        <Button
          onClick={handleExportMaterialsExcel}
          className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <motion.div
            className="flex items-center gap-2"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Package className="w-5 h-5" />
            <span>Export Materials</span>
            <Database className="w-4 h-4 animate-pulse" />
          </motion.div>
        </Button>
      </motion.div>
    );
  }

  // All data export (both recipes and materials)
  if (variant === 'all') {
    const hasRecipes = recipes && recipes.length > 0;
    const hasMaterials = materials && materials.length > 0;
    const hasAnyData = hasRecipes || hasMaterials;

    // Portal dropdown component
    const DropdownPortal = () => {
      if (!isOpen || !hasAnyData || typeof document === 'undefined') return null;
      
      return createPortal(
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          ref={dropdownRef}
          className="fixed w-64"
          style={{ 
            zIndex: 999999,
            top: dropdownPosition.top,
            left: Math.max(8, dropdownPosition.left) // Ensure it doesn't go off screen
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white border border-gray-200 shadow-2xl">
            <CardContent className="p-2">
              {hasRecipes && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportAllExcel();
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-green-50 hover:text-green-700"
                  >
                    <FileSpreadsheet className="w-5 h-5 mr-3 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Export All Recipes</p>
                      <p className="text-xs text-muted-foreground">{recipes?.length} recipes</p>
                    </div>
                  </Button>
                </motion.div>
              )}
              {hasMaterials && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportMaterialsExcel();
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Package className="w-5 h-5 mr-3 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Export Materials</p>
                      <p className="text-xs text-muted-foreground">{materials?.length} materials</p>
                    </div>
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>,
        document.body
      );
    };

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <motion.div
          whileHover={{ scale: hasAnyData ? 1.05 : 1 }}
          whileTap={{ scale: hasAnyData ? 0.95 : 1 }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (hasAnyData) {
                handleToggleDropdown(e);
              }
            }}
            className={`h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
              hasAnyData 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
            disabled={!hasAnyData}
            ref={buttonRef}
          >
            <Download className={`w-5 h-5 mr-2 ${isOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
            Export All Data ⚡
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOpen && hasAnyData && (
            <DropdownPortal />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
} 