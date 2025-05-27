'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackagingItem } from '@/types';
import { getPackagingItems, savePackagingItems } from '@/utils/storage';
import { formatCurrency } from '@/utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Plus, Edit, Trash2, Box, Tag, Droplet, Pipette, Archive, Layers } from 'lucide-react';

interface PackagingManagerProps {
  onSelect?: (packaging: PackagingItem) => void;
  selectedItems?: PackagingItem[];
  showSelection?: boolean;
}

export default function PackagingManager({ onSelect, selectedItems = [], showSelection = false }: PackagingManagerProps) {
  const { currency } = useCurrency();
  const [packaging, setPackaging] = useState<PackagingItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PackagingItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    description: '',
    supplier: '',
    category: 'container' as PackagingItem['category']
  });

  useEffect(() => {
    setPackaging(getPackagingItems());
  }, []);

  const categoryIcons = {
    container: Box,
    label: Tag,
    cap: Droplet,
    pump: Pipette,
    box: Archive,
    other: Layers
  };

  const categoryColors = {
    container: 'bg-blue-100 text-blue-800',
    label: 'bg-green-100 text-green-800',
    cap: 'bg-purple-100 text-purple-800',
    pump: 'bg-pink-100 text-pink-800',
    box: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cost) return;

    const newItem: PackagingItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      cost: parseFloat(formData.cost),
      description: formData.description,
      supplier: formData.supplier,
      category: formData.category
    };

    let updatedPackaging;
    if (editingItem) {
      updatedPackaging = packaging.map(item => item.id === editingItem.id ? newItem : item);
    } else {
      updatedPackaging = [...packaging, newItem];
    }

    setPackaging(updatedPackaging);
    savePackagingItems(updatedPackaging);
    resetForm();
  };

  const handleEdit = (item: PackagingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      cost: item.cost.toString(),
      description: item.description || '',
      supplier: item.supplier || '',
      category: item.category
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedPackaging = packaging.filter(item => item.id !== id);
    setPackaging(updatedPackaging);
    savePackagingItems(updatedPackaging);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cost: '',
      description: '',
      supplier: '',
      category: 'container'
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const isSelected = (item: PackagingItem) => 
    selectedItems.some(selected => selected.id === item.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📦 Packaging Management
          </h3>
          <p className="text-gray-600">Manage containers, labels, and packaging costs</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Packaging
          </Button>
        </motion.div>
      </div>

      {/* Packaging Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">
                  {editingItem ? 'Edit Packaging Item' : 'Add New Packaging Item'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Glass Dropper Bottle 30ml"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cost *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as PackagingItem['category']})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="container">Container</option>
                        <option value="label">Label</option>
                        <option value="cap">Cap/Closure</option>
                        <option value="pump">Pump/Dispenser</option>
                        <option value="box">Box/Outer Packaging</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Supplier</label>
                      <Input
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        placeholder="Supplier name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Additional details..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      {editingItem ? 'Update' : 'Add'} Packaging
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packaging List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packaging.map((item, index) => {
          const Icon = categoryIcons[item.category];
          const selected = isSelected(item);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                } ${showSelection ? 'cursor-pointer' : ''}`}
                onClick={() => showSelection && onSelect && onSelect(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    </div>
                    {!showSelection && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(item.cost, currency)}
                      </span>
                      <Badge className={categoryColors[item.category]}>
                        {item.category}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    {item.supplier && (
                      <p className="text-xs text-gray-500">Supplier: {item.supplier}</p>
                    )}
                    {selected && showSelection && (
                      <div className="text-sm font-medium text-blue-600">✓ Selected</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {packaging.length === 0 && (
        <Card className="bg-gray-50">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No packaging items yet</h3>
            <p className="text-gray-500 mb-4">Add containers, labels, and other packaging to track costs</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Packaging Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 