'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RawMaterial, WeightUnit } from '@/types';
import { calculateCostPerGram } from '@/utils/conversions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, DollarSign, Scale, AlertCircle, Sparkles, Info, HelpCircle, Package } from 'lucide-react';

interface RawMaterialFormProps {
  material?: RawMaterial;
  onSave: (material: RawMaterial) => void;
  onCancel: () => void;
}

export default function RawMaterialForm({ material, onSave, onCancel }: RawMaterialFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    totalCost: 0,
    totalWeight: 0,
    weightUnit: 'g' as WeightUnit,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showTooltip, setShowTooltip] = useState<string>('');

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        totalCost: material.totalCost,
        totalWeight: material.totalWeight,
        weightUnit: material.weightUnit,
      });
    } else {
      setFormData({
        name: '',
        totalCost: 0,
        totalWeight: 0,
        weightUnit: 'g',
      });
    }
    setErrors({});
  }, [material]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter an ingredient name ✨';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name should be at least 2 characters long';
    }
    
    if (formData.totalCost <= 0) {
      newErrors.totalCost = 'Please enter the amount you paid 💰';
    } else if (formData.totalCost > 10000) {
      newErrors.totalCost = 'Cost seems unusually high. Please double-check!';
    }
    
    if (formData.totalWeight <= 0) {
      newErrors.totalWeight = 'Please enter how much you bought ⚖️';
    } else if (formData.totalWeight > 50000) {
      newErrors.totalWeight = 'Weight seems unusually high. Please double-check!';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const costPerGram = calculateCostPerGram(
      formData.totalCost,
      formData.totalWeight,
      formData.weightUnit
    );

    const newMaterial: RawMaterial = {
      id: material?.id || Date.now().toString(),
      name: formData.name.trim(),
      totalCost: formData.totalCost,
      totalWeight: formData.totalWeight,
      weightUnit: formData.weightUnit,
      costPerGram,
    };

    onSave(newMaterial);
    
    if (!material) {
      setFormData({
        name: '',
        totalCost: 0,
        totalWeight: 0,
        weightUnit: 'g',
      });
      setErrors({});
    }
  };

  const costPerGram = formData.totalCost > 0 && formData.totalWeight > 0 
    ? calculateCostPerGram(formData.totalCost, formData.totalWeight, formData.weightUnit)
    : 0;

  const getExampleText = () => {
    const examples = [
      { name: "Sweet Almond Oil", cost: 15.99, weight: 500, unit: "g" },
      { name: "Shea Butter", cost: 22.50, weight: 1, unit: "kg" },
      { name: "Rose Hip Oil", cost: 28.00, weight: 100, unit: "g" },
      { name: "Coconut Oil", cost: 12.99, weight: 16, unit: "oz" },
    ];
    const example = examples[Math.floor(Math.random() * examples.length)];
    return `Example: ${example.name} - $${example.cost} for ${example.weight}${example.unit}`;
  };

  const getWeightUnitTooltip = (unit: WeightUnit) => {
    const tooltips = {
      'g': 'Grams - Best for small quantities (oils, powders)',
      'kg': 'Kilograms - Good for larger purchases (1kg = 1000g)',
      'oz': 'Ounces - Common in US (1oz ≈ 28.35g)',
      'lb': 'Pounds - For bulk purchases (1lb ≈ 453.6g)'
    };
    return tooltips[unit];
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
              {material ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </motion.div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                {material ? '✏️ Edit Raw Material' : '✨ Add Raw Material'}
              </h3>
              <p className="text-sm text-muted-foreground font-normal">
                {material ? 'Update your magical ingredient details' : 'Enter your ingredient details to calculate cost per gram automatically'}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
              onMouseEnter={() => setShowTooltip('help')}
              onMouseLeave={() => setShowTooltip('')}
            >
              <Button variant="ghost" size="sm" className="text-pink-600 hover:bg-pink-50">
                <HelpCircle className="w-4 h-4" />
              </Button>
              {showTooltip === 'help' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-pink-200 rounded-lg shadow-lg p-3 text-xs text-gray-600 z-10"
                >
                  <div className="font-semibold text-pink-600 mb-1">💡 Quick Help:</div>
                  <div>{getExampleText()}</div>
                  <div className="mt-2 text-gray-500">The calculator will automatically compute the cost per gram for use in recipes!</div>
                </motion.div>
              )}
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="text-base font-medium text-primary flex items-center gap-2">
                <Package className="w-4 h-4" />
                Ingredient Name ✨
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`h-12 transition-all duration-300 ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-pink-200 focus:border-pink-500 focus:ring-pink-500/20 hover:border-pink-300'
                }`}
                placeholder="e.g., Sweet Almond Oil, Organic Shea Butter, Rose Hip Seed Oil..."
                required
              />
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </motion.div>
              )}
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Use the exact name from your purchase (helps with inventory tracking)
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="totalCost" className="text-base font-medium text-primary flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Cost You Paid 💰
                </Label>
                <Input
                  type="number"
                  id="totalCost"
                  value={formData.totalCost || ''}
                  onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                  className={`h-12 transition-all duration-300 ${
                    errors.totalCost 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500/20 hover:border-yellow-300'
                  }`}
                  placeholder="15.99"
                  step="0.01"
                  min="0"
                  required
                />
                {errors.totalCost && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-sm text-red-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.totalCost}
                  </motion.div>
                )}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Include tax and shipping if applicable
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="text-base font-medium text-primary flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Quantity You Received ⚖️
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.totalWeight || ''}
                    onChange={(e) => setFormData({ ...formData, totalWeight: parseFloat(e.target.value) || 0 })}
                    className={`flex-1 h-12 transition-all duration-300 ${
                      errors.totalWeight 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-pink-200 focus:border-pink-500 focus:ring-pink-500/20 hover:border-pink-300'
                    }`}
                    placeholder="500"
                    step="0.01"
                    min="0"
                    required
                  />
                  <div className="relative">
                    <Select
                      value={formData.weightUnit}
                      onValueChange={(value: WeightUnit) => setFormData({ ...formData, weightUnit: value })}
                    >
                      <SelectTrigger 
                        className="w-20 h-12 border-pink-200 focus:border-pink-500 focus:ring-pink-500/20 hover:border-pink-300"
                        onMouseEnter={() => setShowTooltip('unit')}
                        onMouseLeave={() => setShowTooltip('')}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                      </SelectContent>
                    </Select>
                    {showTooltip === 'unit' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white border border-pink-200 rounded-lg shadow-lg p-3 text-xs text-gray-600 z-10"
                      >
                        <div className="font-semibold text-pink-600 mb-2">Unit Guide:</div>
                        <div className="space-y-1">
                          <div><strong>g</strong> - {getWeightUnitTooltip('g')}</div>
                          <div><strong>kg</strong> - {getWeightUnitTooltip('kg')}</div>
                          <div><strong>oz</strong> - {getWeightUnitTooltip('oz')}</div>
                          <div><strong>lb</strong> - {getWeightUnitTooltip('lb')}</div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                {errors.totalWeight && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-sm text-red-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.totalWeight}
                  </motion.div>
                )}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Check the product label or receipt
                </div>
              </motion.div>
            </div>

            {costPerGram > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-r from-pink-50 to-yellow-50 border border-pink-200/50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-pink-500" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-pink-900 text-lg">Calculated Cost per Gram</h4>
                      <p className="text-sm text-pink-700">This magical number will be used for all your recipe calculations ✨</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-yellow-100 text-pink-800 border-pink-200 text-xl font-bold py-2 px-4">
                      ${costPerGram.toFixed(4)}/g ✨
                    </Badge>
                  </motion.div>
                </div>
                <div className="mt-3 text-sm text-pink-600">
                  💡 This means each gram of {formData.name || 'this ingredient'} costs ${costPerGram.toFixed(4)} in your recipes
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                  disabled={!formData.name || formData.totalCost <= 0 || formData.totalWeight <= 0}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ x: 2 }}
                  >
                    {material ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {material ? 'Save Changes ✨' : 'Add to Collection 🎉'}
                  </motion.div>
                </Button>
              </motion.div>
              {material && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="h-12 px-6 border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-pink-700 font-medium"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 