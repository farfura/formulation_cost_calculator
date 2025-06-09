'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Package, Download, Search, AlertTriangle, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { WeightUnit } from '@/types';
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
import ExportButton from '@/components/ExportButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InventoryItem {
  id: string;
  name: string;
  totalWeight: number;
  weightUnit: string;
  supplierName?: string;
  supplierContact?: string;
  lastPurchaseDate?: string;
  purchaseNotes?: string;
  usageNotes?: string;
  typicalMonthlyUsage?: number;
  created_at?: string;
  updated_at?: string;
}

export const InventoryManager: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    totalWeight: 0,
    weightUnit: 'g',
    supplierName: '',
    supplierContact: '',
    lastPurchaseDate: '',
    purchaseNotes: '',
    usageNotes: '',
    typicalMonthlyUsage: 0
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
        totalWeight: 0,
        weightUnit: 'g',
        supplierName: '',
        supplierContact: '',
        lastPurchaseDate: '',
        purchaseNotes: '',
        usageNotes: '',
        typicalMonthlyUsage: 0
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
    const totalQuantity = inventory.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
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
        item.totalWeight.toString(),
        item.weightUnit,
        '',
        ''
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
            <span className="text-[#E75A8B]">Raw Materials</span>
          </h2>
          <p className="text-gray-600">Track your raw materials and usage</p>
        </div>
        {inventory.length > 0 && (
          <ExportButton
            materials={inventory.map(item => ({
              id: item.id,
              name: item.name,
              totalWeight: item.totalWeight,
              weightUnit: item.weightUnit as WeightUnit,
              totalCost: 0, // Not tracked in inventory
              costPerGram: 0, // Not tracked in inventory
              supplierName: item.supplierName,
              supplierContact: item.supplierContact,
              lastPurchaseDate: item.lastPurchaseDate,
              purchaseNotes: item.purchaseNotes,
              usageNotes: item.usageNotes,
              typicalMonthlyUsage: item.typicalMonthlyUsage,
              created_at: item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString()
            }))}
            variant="materials"
            label="Export to Excel"
          />
        )}
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-pink-200/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-pink-500">➕</span> Add New Material
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
                <Label>Total Weight</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newItem.totalWeight}
                    onChange={(e) => setNewItem({ ...newItem, totalWeight: parseFloat(e.target.value) })}
                    placeholder="0"
                    required
                    disabled={loading}
                    className="flex-1"
                  />
                  <Select
                    value={newItem.weightUnit}
                    onValueChange={(value) => setNewItem({ ...newItem, weightUnit: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Supplier Name</Label>
                <Input
                  value={newItem.supplierName}
                  onChange={(e) => setNewItem({ ...newItem, supplierName: e.target.value })}
                  placeholder="e.g., Natural Supplies Co."
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Supplier Contact/Website</Label>
                <Input
                  value={newItem.supplierContact}
                  onChange={(e) => setNewItem({ ...newItem, supplierContact: e.target.value })}
                  placeholder="e.g., www.supplier.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Last Purchase Date</Label>
                <Input
                  type="date"
                  value={newItem.lastPurchaseDate}
                  onChange={(e) => setNewItem({ ...newItem, lastPurchaseDate: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Typical Monthly Usage ({newItem.weightUnit})</Label>
                <Input
                  type="number"
                  value={newItem.typicalMonthlyUsage}
                  onChange={(e) => setNewItem({ ...newItem, typicalMonthlyUsage: parseFloat(e.target.value) })}
                  placeholder="0"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Purchase Notes</Label>
                <Textarea
                  value={newItem.purchaseNotes}
                  onChange={(e) => setNewItem({ ...newItem, purchaseNotes: e.target.value })}
                  placeholder="Add any notes about purchasing (e.g., bulk discounts, minimum orders)"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Usage Notes</Label>
                <Textarea
                  value={newItem.usageNotes}
                  onChange={(e) => setNewItem({ ...newItem, usageNotes: e.target.value })}
                  placeholder="Add any notes about usage or storage requirements"
                  disabled={loading}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-300 to-pink-500 hover:from-pink-400 hover:to-pink-600 text-pink-900 border-none shadow-md"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </form>
        </CardContent>
      </Card>

      {inventory.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Label className="text-pink-600 font-semibold mb-2 block">Search Materials</Label>
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
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Weight</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Unit</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Supplier</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Last Purchase</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Monthly Usage</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Notes</th>
                    <th className="px-6 py-4 text-left font-bold text-pink-700 text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                      <td className="px-6 py-3 font-semibold text-pink-900 rounded-l-xl">{item.name}</td>
                      <td className="px-6 py-3">{item.totalWeight}</td>
                      <td className="px-6 py-3">{item.weightUnit}</td>
                      <td className="px-6 py-3">
                        {item.supplierName && (
                          <div className="flex flex-col">
                            <span>{item.supplierName}</span>
                            {item.supplierContact && (
                              <a 
                                href={item.supplierContact.startsWith('http') ? item.supplierContact : `http://${item.supplierContact}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {item.supplierContact}
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {item.lastPurchaseDate && (
                          <div className="flex flex-col">
                            <span>{new Date(item.lastPurchaseDate).toLocaleDateString()}</span>
                            {item.purchaseNotes && (
                              <span className="text-xs text-gray-500">{item.purchaseNotes}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {item.typicalMonthlyUsage ? (
                          `${item.typicalMonthlyUsage} ${item.weightUnit}/month`
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {item.usageNotes && (
                          <span className="text-sm text-gray-600">{item.usageNotes}</span>
                        )}
                      </td>
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
          <h3 className="text-lg font-semibold text-pink-600 mb-2">No materials added yet</h3>
          <p className="text-pink-400">Add your first material to start tracking!</p>
        </Card>
      )}
    </div>
  );
}; 