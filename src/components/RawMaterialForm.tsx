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
import { Plus, Edit2, Sparkles, DollarSign, Scale } from 'lucide-react';

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

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        totalCost: material.totalCost,
        totalWeight: material.totalWeight,
        weightUnit: material.weightUnit,
      });
    }
  }, [material]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.totalCost <= 0 || formData.totalWeight <= 0) {
      alert('Please fill in all fields with valid values ✨');
      return;
    }

    const costPerGram = calculateCostPerGram(
      formData.totalCost,
      formData.totalWeight,
      formData.weightUnit
    );

    const newMaterial: RawMaterial = {
      id: material?.id || Date.now().toString(),
      name: formData.name,
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
    }
  };

  const costPerGram = formData.totalCost > 0 && formData.totalWeight > 0 
    ? calculateCostPerGram(formData.totalCost, formData.totalWeight, formData.weightUnit)
    : 0;

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
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                {material ? '✏️ Edit Raw Material' : '✨ Add Raw Material'}
              </h3>
              <p className="text-sm text-muted-foreground font-normal">
                {material ? 'Update your ingredient details' : 'Add a new ingredient to your collection'}
              </p>
            </div>
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
              <Label htmlFor="name" className="text-base font-medium text-primary">
                Material Name ✨
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 border-pink-200 focus:border-pink-500 focus:ring-pink-500/20"
                placeholder="e.g., Sweet Almond Oil, Shea Butter..."
                required
              />
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
                  Total Cost
                </Label>
                <Input
                  type="number"
                  id="totalCost"
                  value={formData.totalCost || ''}
                  onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                  className="h-12 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500/20"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="text-base font-medium text-primary flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Total Weight
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.totalWeight || ''}
                    onChange={(e) => setFormData({ ...formData, totalWeight: parseFloat(e.target.value) || 0 })}
                    className="flex-1 h-12 border-pink-200 focus:border-pink-500 focus:ring-pink-500/20"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    required
                  />
                  <Select
                    value={formData.weightUnit}
                    onValueChange={(value: WeightUnit) => setFormData({ ...formData, weightUnit: value })}
                  >
                    <SelectTrigger className="w-20 h-12 border-pink-200 focus:border-pink-500 focus:ring-pink-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </div>

            {costPerGram > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-r from-pink-50 to-yellow-50 border border-pink-200/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cost per gram</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                      ${costPerGram.toFixed(4)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800">
                    Auto-calculated ✨
                  </Badge>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3 pt-4"
            >
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  {material ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {material ? 'Update Material ✨' : 'Add Material 🎉'}
                </motion.div>
              </Button>
              {material && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="px-6 h-12 border-pink-200 hover:border-pink-300 hover:bg-pink-50"
                  size="lg"
                >
                  Cancel
                </Button>
              )}
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 