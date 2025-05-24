'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '@/types';
import { exportToCSV, exportToExcel, exportMultipleRecipesToExcel } from '@/utils/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonProps {
  recipe?: Recipe;
  recipes?: Recipe[];
  className?: string;
}

export default function ExportButton({ recipe, recipes, className = '' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  // Single recipe export
  if (recipe) {
    return (
      <div className={`relative ${className}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
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
                className="absolute right-0 mt-3 w-56 z-20"
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
  if (recipes && recipes.length > 0) {
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

  return null;
} 