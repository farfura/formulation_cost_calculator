'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, LabelData, LabelSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tag, Download, Palette, Type, Image, Eye, Settings, Sparkles } from 'lucide-react';

interface LabelGeneratorProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function LabelGenerator({ recipe, onClose }: LabelGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [labelData, setLabelData] = useState<LabelData>({
    productName: recipe.name,
    brandName: '',
    description: recipe.description || '',
    ingredients: [],
    netWeight: '',
    warnings: [],
    instructions: recipe.instructions || '',
    batchNumber: '',
    expiryDate: '',
    madeIn: ''
  });

  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    template: 'elegant',
    colorScheme: 'pink',
    fontSize: 'medium',
    showPercentages: true,
    showInci: false,
    logoUrl: '',
    dimensions: {
      width: 90,
      height: 50,
      unit: 'mm'
    }
  });

  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    // Calculate percentages and prepare ingredient data
    const totalWeight = recipe.ingredients.reduce((sum, ing) => sum + ing.amountInGrams, 0);
    const ingredients = recipe.ingredients.map(ing => ({
      name: ing.materialName,
      percentage: (ing.amountInGrams / totalWeight) * 100,
      inci: ing.materialName // You could add INCI names to your raw materials
    })).sort((a, b) => b.percentage - a.percentage);

    setLabelData(prev => ({
      ...prev,
      ingredients,
      netWeight: `${totalWeight.toFixed(0)}g`
    }));
  }, [recipe]);

  const templateStyles = {
    minimal: {
      container: 'bg-white border border-gray-300 p-6 mx-auto font-sans',
      productName: 'font-bold text-center mb-4',
      brandName: 'text-gray-600 text-center mb-2',
      description: 'text-gray-700 text-center mb-4 italic',
      section: 'mb-4',
      sectionTitle: 'font-semibold mb-2 uppercase tracking-wide',
      ingredient: 'mb-1',
      footer: 'text-gray-500 text-center border-t pt-2 mt-4'
    },
    elegant: {
      container: 'bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-8 mx-auto font-serif shadow-lg rounded-lg',
      productName: 'font-bold text-center mb-6 text-rose-800',
      brandName: 'text-rose-600 text-center mb-3 font-light',
      description: 'text-gray-700 text-center mb-6 italic leading-relaxed',
      section: 'mb-6',
      sectionTitle: 'font-semibold mb-3 uppercase tracking-widest text-rose-700 border-b border-rose-300 pb-1',
      ingredient: 'mb-2 text-gray-700',
      footer: 'text-gray-500 text-center border-t border-rose-200 pt-4 mt-6'
    },
    modern: {
      container: 'bg-gray-900 text-white p-8 mx-auto font-sans shadow-2xl',
      productName: 'font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent',
      brandName: 'text-gray-300 text-center mb-3 font-light',
      description: 'text-gray-300 text-center mb-6 leading-relaxed',
      section: 'mb-6',
      sectionTitle: 'font-bold mb-3 uppercase tracking-wide text-purple-400',
      ingredient: 'mb-2 text-gray-200',
      footer: 'text-gray-400 text-center border-t border-gray-700 pt-4 mt-6'
    },
    vintage: {
      container: 'bg-amber-50 border-4 border-amber-800 p-8 mx-auto font-serif shadow-lg',
      productName: 'font-bold text-center mb-6 text-amber-900 font-serif',
      brandName: 'text-amber-700 text-center mb-3',
      description: 'text-amber-800 text-center mb-6 italic',
      section: 'mb-6',
      sectionTitle: 'font-bold mb-3 text-amber-900 border-b-2 border-amber-800 pb-1',
      ingredient: 'mb-2 text-amber-800',
      footer: 'text-amber-700 text-center border-t-2 border-amber-800 pt-4 mt-6'
    }
  };

  const colorSchemes = {
    pink: { 
      accent: 'text-rose-600', 
      bg: 'from-rose-50 to-pink-50', 
      border: 'border-rose-200',
      container: 'bg-gradient-to-br from-rose-50 to-pink-50',
      text: 'text-rose-800'
    },
    purple: { 
      accent: 'text-purple-600', 
      bg: 'from-purple-50 to-violet-50', 
      border: 'border-purple-200',
      container: 'bg-gradient-to-br from-purple-50 to-violet-50',
      text: 'text-purple-800'
    },
    green: { 
      accent: 'text-green-600', 
      bg: 'from-green-50 to-emerald-50', 
      border: 'border-green-200',
      container: 'bg-gradient-to-br from-green-50 to-emerald-50',
      text: 'text-green-800'
    },
    blue: { 
      accent: 'text-blue-600', 
      bg: 'from-blue-50 to-cyan-50', 
      border: 'border-blue-200',
      container: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      text: 'text-blue-800'
    },
    gold: { 
      accent: 'text-yellow-600', 
      bg: 'from-yellow-50 to-amber-50', 
      border: 'border-yellow-200',
      container: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      text: 'text-yellow-800'
    }
  };

  // Calculate font scale based on label dimensions
  const calculateFontScale = () => {
    const width = labelSettings.dimensions.width;
    const height = labelSettings.dimensions.height;
    const unit = labelSettings.dimensions.unit;
    
    // Convert dimensions to mm for consistent calculation
    const widthInMm = unit === 'cm' ? width * 10 : unit === 'in' ? width * 25.4 : width;
    const heightInMm = unit === 'cm' ? height * 10 : unit === 'in' ? height * 25.4 : height;
    
    // Base scale on the smaller dimension
    const minDimension = Math.min(widthInMm, heightInMm);
    
    // Scale factors for different text elements
    return {
      productName: `${Math.max(0.8, Math.min(1.8, minDimension / 50))}rem`,
      brandName: `${Math.max(0.7, Math.min(1.4, minDimension / 60))}rem`,
      description: `${Math.max(0.6, Math.min(1, minDimension / 70))}rem`,
      sectionTitle: `${Math.max(0.6, Math.min(0.9, minDimension / 80))}rem`,
      ingredient: `${Math.max(0.5, Math.min(0.8, minDimension / 90))}rem`,
      footer: `${Math.max(0.5, Math.min(0.7, minDimension / 100))}rem`
    };
  };

  const fontScale = calculateFontScale();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && printRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${labelData.productName} - Product Label</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
              .label { page-break-inside: avoid; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="label">${printRef.current.innerHTML}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const currentTemplate = templateStyles[labelSettings.template];
  const currentColorScheme = colorSchemes[labelSettings.colorScheme];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Tag className="w-6 h-6 text-pink-600" />
                Label Generator
              </h2>
              <p className="text-gray-600">Create beautiful product labels for {recipe.name}</p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Settings Panel */}
          <div className="lg:w-1/3 p-6 border-r border-gray-200 bg-gray-50">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <Input
                      value={labelData.productName}
                      onChange={(e) => setLabelData({...labelData, productName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand Name</label>
                    <Input
                      value={labelData.brandName}
                      onChange={(e) => setLabelData({...labelData, brandName: e.target.value})}
                      placeholder="Your brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={labelData.description}
                      onChange={(e) => setLabelData({...labelData, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm h-20"
                      placeholder="Brief product description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Net Weight</label>
                      <Input
                        value={labelData.netWeight}
                        onChange={(e) => setLabelData({...labelData, netWeight: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Batch Number</label>
                      <Input
                        value={labelData.batchNumber}
                        onChange={(e) => setLabelData({...labelData, batchNumber: e.target.value})}
                        placeholder="B001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Style Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Style Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['minimal', 'elegant', 'modern', 'vintage'] as const).map(template => (
                        <Button
                          key={template}
                          variant={labelSettings.template === template ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLabelSettings({...labelSettings, template})}
                          className="h-8 text-xs"
                        >
                          {template}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Color Scheme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['pink', 'purple', 'green', 'blue', 'gold'] as const).map(color => (
                        <Button
                          key={color}
                          variant={labelSettings.colorScheme === color ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLabelSettings({...labelSettings, colorScheme: color})}
                          className={`h-8 text-xs ${colorSchemes[color].accent} hover:bg-gradient-to-r ${colorSchemes[color].bg}`}
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Label Dimensions</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Width</label>
                        <Input
                          type="number"
                          value={labelSettings.dimensions.width}
                          onChange={(e) => setLabelSettings({
                            ...labelSettings,
                            dimensions: {
                              ...labelSettings.dimensions,
                              width: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Height</label>
                        <Input
                          type="number"
                          value={labelSettings.dimensions.height}
                          onChange={(e) => setLabelSettings({
                            ...labelSettings,
                            dimensions: {
                              ...labelSettings.dimensions,
                              height: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit</label>
                        <select
                          value={labelSettings.dimensions.unit}
                          onChange={(e) => setLabelSettings({
                            ...labelSettings,
                            dimensions: {
                              ...labelSettings.dimensions,
                              unit: e.target.value as 'mm' | 'cm' | 'in'
                            }
                          })}
                          className="w-full h-8 rounded-md border border-gray-300 text-xs"
                        >
                          <option value="mm">mm</option>
                          <option value="cm">cm</option>
                          <option value="in">in</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={labelSettings.showPercentages}
                        onChange={(e) => setLabelSettings({...labelSettings, showPercentages: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm">Show Percentages</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={labelSettings.showInci}
                        onChange={(e) => setLabelSettings({...labelSettings, showInci: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm">Show INCI</span>
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handlePrint}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Label
                </Button>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:w-2/3 p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Label Preview</h3>
                <p className="text-sm text-gray-600">This is how your label will look when printed</p>
              </div>

              <div className="flex justify-center">
                <div 
                  ref={printRef} 
                  className={`${currentTemplate.container} ${currentColorScheme.container}`}
                  style={{
                    width: `${labelSettings.dimensions.width * (labelSettings.dimensions.unit === 'mm' ? 3.78 : labelSettings.dimensions.unit === 'cm' ? 37.8 : 96)}px`,
                    height: `${labelSettings.dimensions.height * (labelSettings.dimensions.unit === 'mm' ? 3.78 : labelSettings.dimensions.unit === 'cm' ? 37.8 : 96)}px`,
                    minWidth: '200px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div className="flex-1 overflow-auto" style={{ padding: `${fontScale.ingredient}` }}>
                    {/* Brand Name */}
                    {labelData.brandName && (
                      <div className={currentTemplate.brandName} style={{ fontSize: fontScale.brandName }}>
                        {labelData.brandName}
                      </div>
                    )}

                    {/* Product Name */}
                    <div className={currentTemplate.productName} style={{ fontSize: fontScale.productName }}>
                      {labelData.productName}
                    </div>

                    {/* Description */}
                    {labelData.description && (
                      <div className={currentTemplate.description} style={{ fontSize: fontScale.description }}>
                        {labelData.description}
                      </div>
                    )}

                    {/* Net Weight */}
                    {labelData.netWeight && (
                      <div className={currentTemplate.section}>
                        <div className={currentTemplate.sectionTitle} style={{ fontSize: fontScale.sectionTitle }}>
                          Net Weight
                        </div>
                        <div style={{ fontSize: fontScale.description }}>{labelData.netWeight}</div>
                      </div>
                    )}

                    {/* Ingredients */}
                    <div className={currentTemplate.section}>
                      <div className={currentTemplate.sectionTitle} style={{ fontSize: fontScale.sectionTitle }}>
                        Ingredients (INCI)
                      </div>
                      <div className="space-y-1">
                        {labelData.ingredients.map((ingredient, index) => (
                          <div key={index} className={currentTemplate.ingredient} style={{ fontSize: fontScale.ingredient }}>
                            {ingredient.name}
                            {labelSettings.showPercentages && (
                              <span className="font-semibold ml-1">
                                ({ingredient.percentage.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    {labelData.instructions && (
                      <div className={currentTemplate.section}>
                        <div className={currentTemplate.sectionTitle} style={{ fontSize: fontScale.sectionTitle }}>
                          Instructions
                        </div>
                        <div className={currentTemplate.ingredient} style={{ fontSize: fontScale.ingredient }}>
                          {labelData.instructions}
                        </div>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className={currentTemplate.footer}>
                      <div className="space-y-1" style={{ fontSize: fontScale.footer }}>
                        {labelData.batchNumber && (
                          <div>Batch: {labelData.batchNumber}</div>
                        )}
                        {labelData.expiryDate && (
                          <div>Best before: {labelData.expiryDate}</div>
                        )}
                        {labelData.madeIn && (
                          <div>Made in: {labelData.madeIn}</div>
                        )}
                        <div>Generated with Beauty Formula Calculator ✨</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 