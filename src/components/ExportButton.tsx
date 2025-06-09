'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, RawMaterial, PriceBreakdown } from '@/types';
import { exportToCSV, exportToExcel, exportMultipleRecipesToExcel, exportRawMaterialsToExcel, exportPricingHistoryToExcel } from '@/utils/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText, Sparkles, Package, Database, FileDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Badge } from '@/components/ui/badge';

interface ExportButtonProps {
  recipe?: Recipe;
  recipes?: Recipe[];
  materials?: RawMaterial[];
  pricingHistory?: PriceBreakdown[];
  className?: string;
  variant?: 'recipe' | 'recipes' | 'materials' | 'all' | 'pricing';
  label?: string;
  iconPosition?: 'left' | 'right';
}

export default function ExportButton({ 
  recipe, 
  recipes, 
  materials,
  pricingHistory,
  className = '', 
  variant = 'materials',
  label = 'Export Materials',
  iconPosition = 'left',
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { currency } = useCurrency();

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
      exportToCSV(recipe, currency);
    }
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    if (recipe) {
      exportToExcel(recipe, currency, materials);
    }
    setIsOpen(false);
  };

  const handleExportAllExcel = () => {
    if (recipes && recipes.length > 0) {
      exportMultipleRecipesToExcel(recipes, materials, currency);
    }
    setIsOpen(false);
  };

  const handleExportMaterialsExcel = () => {
    if (materials && materials.length > 0) {
      exportRawMaterialsToExcel(materials, currency);
    }
    setIsOpen(false);
  };

  const handleExportPricingHistoryExcel = () => {
    if (pricingHistory && pricingHistory.length > 0) {
      exportPricingHistoryToExcel(pricingHistory, currency);
    }
    setIsOpen(false);
  };

  const handleClick = () => {
    switch (variant) {
      case 'recipe':
        if (recipe) {
          exportToExcel(recipe, currency, materials);
        }
        break;
      case 'recipes':
        if (recipes && recipes.length > 0) {
          exportMultipleRecipesToExcel(recipes, materials, currency);
        }
        break;
      case 'materials':
        if (materials && materials.length > 0) {
          exportRawMaterialsToExcel(materials, currency);
        }
        break;
      case 'pricing':
        if (pricingHistory && pricingHistory.length > 0) {
          exportPricingHistoryToExcel(pricingHistory, currency);
        }
        break;
    }
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
            className="h-[32px] w-[150px] px-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-solid border-green-700 shadow-sm transition-all duration-300 text-sm font-medium rounded-[10px]"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Export to Excel</span>
            </div>
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

  if (variant === 'recipes' && recipes && recipes.length > 0) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        <Button
          onClick={handleExportAllExcel}
          className="h-[32px] w-[150px] px-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-solid border-green-700 shadow-sm transition-all duration-300 text-sm font-medium rounded-[10px]"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>{label || 'Export All Recipes'}</span>
          </div>
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
          className="h-[36px] w-[180.97px] px-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-solid border-green-700 shadow-sm text-sm font-medium rounded-[10px]"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>{label || 'Export to Excel'}</span>
          </div>
        </Button>
      </motion.div>
    );
  }

  // Pricing history export
  if (variant === 'pricing' && pricingHistory && pricingHistory.length > 0) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        <Button
          onClick={handleExportPricingHistoryExcel}
          className="h-[32px] w-[150px] px-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-solid border-green-700 shadow-sm  text-sm font-medium rounded-[10px]"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>{label || 'Export Pricing History'}</span>
          </div>
        </Button>
      </motion.div>
    );
  }

  if (variant === 'all') {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className="h-[32px] w-[150px] px-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-solid border-green-700 shadow-sm  text-sm font-medium rounded-[10px]"
    >
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4" />
        <span>{label}</span>
      </div>
    </Button>
  );
} 