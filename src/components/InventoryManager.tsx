'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Package, Download, Search, AlertTriangle, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/contexts/SupabaseProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx-js-style';
import { applyCellStyle, styles } from '@/utils/export';
import { Badge } from '@/components/ui/badge';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minimum_level: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export const InventoryManager: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    quantity: 0,
    unit: '',
    minimum_level: 0,
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  // Load inventory data from Supabase
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      console.log('Loading inventory...');
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: error.message
        });
        return;
      }

      console.log('Inventory loaded:', data);
      setInventory(data || []);
    } catch (error) {
      console.error('Error in loadInventory:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inventory data. Please check console for details."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Adding new item:', newItem);

      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          ...newItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: error.message
        });
        return;
      }

      console.log('Item added:', data);
      setInventory([data, ...inventory]);
      setNewItem({
        name: '',
        quantity: 0,
        unit: '',
        minimum_level: 0,
        notes: ''
      });

      toast({
        title: "✨ Success",
        description: "Item added to inventory"
      });
    } catch (error) {
      console.error('Error in handleAddItem:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item. Please check console for details."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      console.log('Deleting item:', id);

      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: error.message
        });
        return;
      }

      console.log('Item deleted:', id);
      setInventory(inventory.filter(item => item.id !== id));
      toast({
        title: "🗑️ Deleted",
        description: "Item removed from inventory"
      });
    } catch (error) {
      console.error('Error in handleDeleteItem:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item. Please check console for details."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setNewItem(item);
  };

  const handleExportToExcel = () => {
    if (inventory.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    // Calculate statistics
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const avgQuantity = totalItems > 0 ? totalQuantity / totalItems : 0;

    // Overview data
    const overviewData = [
      ['📦 INVENTORY OVERVIEW', '', '', '', ''],
      [''],
      ['Inventory Summary', '', '', '', ''],
      ['Generated on:', new Date().toLocaleString(), '', '', ''],
      ['Total Items:', totalItems.toString(), '', '', ''],
      ['Total Quantity:', totalQuantity.toString(), '', '', ''],
      ['Average Quantity:', avgQuantity.toFixed(2), '', '', ''],
      [''],
      ['Material Name', 'Quantity', 'Unit', 'Minimum Level', 'Notes']
    ];

    inventory.forEach(item => {
      overviewData.push([
        item.name,
        item.quantity.toString(),
        item.unit,
        item.minimum_level.toString(),
        item.notes || ''
      ]);
    });

    const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
    overviewWs['!cols'] = [
      { wch: 40 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 30 }
    ];
    overviewWs['!rows'] = [
      { hpt: 35 }, // Main header
      { hpt: 22 }, // Empty row
      { hpt: 28 }, // Section header
      ...Array(4).fill({ hpt: 25 }), // Info rows
      { hpt: 22 }, // Empty row
      { hpt: 26 }, // Column headers
      ...Array(inventory.length).fill({ hpt: 24 }) // Item rows
    ];

    // Apply pastel styling
    applyCellStyle(overviewWs, 'A1', styles.mainHeader);
    applyCellStyle(overviewWs, 'A3', styles.sectionHeader);
    for (let col = 0; col < 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 8, c: col });
      applyCellStyle(overviewWs, cellRef, styles.columnHeader);
    }
    for (let i = 0; i < inventory.length; i++) {
      const row = 9 + i;
      const isAlternateRow = i % 2 === 1;
      for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (col === 0 || col === 2) {
          applyCellStyle(overviewWs, cellRef, isAlternateRow ? styles.dataRowAlternate : styles.dataCell);
        } else {
          applyCellStyle(overviewWs, cellRef, isAlternateRow ? styles.numberRowAlternate : styles.numberCell);
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Inventory Overview');
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Inventory_${timestamp}.xlsx`);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="text-[#E75A8B]">Inventory Management</span>
          </h2>
          <p className="text-gray-600">Track your raw materials and stock levels</p>
        </div>
        {inventory.length > 0 && (
          <Button
            onClick={handleExportToExcel}
            className="bg-gradient-to-r from-green-200 to-green-400 hover:from-green-300 hover:to-green-500 text-green-900 border-none shadow-md"
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        )}
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-pink-200/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-pink-500">➕</span> Add New Item
            <div className="text-sm font-normal text-gray-500">
              (Set minimum level to get alerts when stock is low)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Material Name</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter material name"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="g, kg, oz, etc."
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>
                  <span className="flex items-center gap-2">
                    Minimum Level
                    <span className="text-sm text-gray-500">(Alert threshold)</span>
                  </span>
                </Label>
                <Input
                  type="number"
                  value={newItem.minimum_level}
                  onChange={(e) => setNewItem({ ...newItem, minimum_level: parseFloat(e.target.value) })}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Add any notes about this material"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-300 to-pink-500 hover:from-pink-400 hover:to-pink-600 text-pink-900 border-none shadow-md"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Inventory
            </Button>
          </form>
        </CardContent>
      </Card>

      {inventory.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Label className="text-pink-600 font-semibold mb-2 block">Search Inventory</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-pink-300" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by material name..."
                    className="pl-10 bg-white/80 border border-yellow-200 rounded-xl focus:border-pink-300 focus:ring-pink-100 text-pink-700"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50/30 overflow-x-auto shadow-md">
              <table className="min-w-full text-pink-800">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-100 to-yellow-100 rounded-t-2xl">
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Material Name</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Quantity</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Unit</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Minimum Level</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Notes</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                      <td className="px-6 py-3 font-semibold text-pink-900 rounded-l-xl">{item.name}</td>
                      <td className="px-6 py-3">{item.quantity}</td>
                      <td className="px-6 py-3">{item.unit}</td>
                      <td className="px-6 py-3">{item.minimum_level}</td>
                      <td className="px-6 py-3">
                        {item.quantity <= item.minimum_level ? (
                          <Badge variant="destructive" className="flex items-center gap-1 bg-red-100 text-red-800 rounded-full px-4 py-1 text-sm">Out of Stock</Badge>
                        ) : (
                          <span className="inline-block bg-green-100 text-green-700 rounded-full px-4 py-1 text-sm font-semibold shadow-sm">In Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-3">{item.notes}</td>
                      <td className="px-6 py-3 rounded-r-xl">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            disabled={loading}
                            className="border-pink-200 text-pink-600 bg-white rounded-full px-3 py-1 hover:bg-pink-50 shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={loading}
                            className="bg-pink-200 text-pink-900 rounded-full px-4 py-1 hover:bg-pink-400 border-none shadow-sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {inventory.length === 0 && (
        <Card className="bg-pink-50 text-center p-8">
          <Package className="w-12 h-12 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-pink-600 mb-2">No items in inventory</h3>
          <p className="text-pink-400">Add your first item to start tracking inventory!</p>
        </Card>
      )}
    </div>
  );
}; 