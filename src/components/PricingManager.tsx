import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Plus, Search } from 'lucide-react';
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
import * as XLSX from 'xlsx';

interface PricingItem {
  id: string;
  product_name: string;
  batch_size: number;
  total_cost: number;
  cost_per_unit: number;
  selling_price_per_unit: number;
  profit_per_unit: number;
  notes: string;
  created_at?: string;
}

export const PricingManager: React.FC = () => {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<PricingItem, 'id' | 'created_at'>>({
    product_name: '',
    batch_size: 0,
    total_cost: 0,
    cost_per_unit: 0,
    selling_price_per_unit: 0,
    profit_per_unit: 0,
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useSupabase();

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading pricing:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load pricing data"
        });
        return;
      }
      setPricing(data || []);
    } catch (error) {
      console.error('Error loading pricing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pricing data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing')
        .insert([{
          ...newItem,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      if (error) {
        console.error('Error adding item:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add pricing record"
        });
        return;
      }
      setPricing([data, ...pricing]);
      setNewItem({
        product_name: '',
        batch_size: 0,
        total_cost: 0,
        cost_per_unit: 0,
        selling_price_per_unit: 0,
        profit_per_unit: 0,
        notes: ''
      });
      toast({
        title: "✨ Success",
        description: "Pricing record added"
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add pricing record"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('pricing')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting item:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete pricing record"
        });
        return;
      }
      setPricing(pricing.filter(item => item.id !== id));
      toast({
        title: "🗑️ Deleted",
        description: "Pricing record removed"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete pricing record"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    const exportData = pricing.map(item => ({
      'Product Name': item.product_name,
      'Batch Size': item.batch_size,
      'Total Cost': item.total_cost,
      'Cost per Unit': item.cost_per_unit,
      'Selling Price per Unit': item.selling_price_per_unit,
      'Profit per Unit': item.profit_per_unit,
      'Notes': item.notes,
      'Created At': item.created_at ? new Date(item.created_at).toLocaleDateString() : ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pricing');
    XLSX.writeFile(wb, 'pricing.xlsx');
  };

  const filteredPricing = pricing.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate derived values when batch size or total cost changes
  const handleBatchSizeOrTotalCostChange = (
    field: 'batch_size' | 'total_cost',
    value: string
  ) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const updates = { ...newItem, [field]: numValue };

    // Calculate cost per unit if both batch size and total cost are available
    if (updates.batch_size > 0) {
      updates.cost_per_unit = Number((updates.total_cost / updates.batch_size).toFixed(2));
    } else {
      updates.cost_per_unit = 0;
    }

    // Calculate profit per unit if selling price is available
    if (updates.selling_price_per_unit > 0) {
      updates.profit_per_unit = Number((updates.selling_price_per_unit - updates.cost_per_unit).toFixed(2));
    } else {
      updates.profit_per_unit = 0;
    }

    setNewItem(updates);
  };

  // Handle selling price changes
  const handleSellingPriceChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const updates = {
      ...newItem,
      selling_price_per_unit: numValue,
      profit_per_unit: Number((numValue - newItem.cost_per_unit).toFixed(2))
    };
    setNewItem(updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
            💰 Pricing Management
          </h2>
          <p className="text-gray-600">Track your product pricing and profitability</p>
        </div>
        {pricing.length > 0 && (
          <Button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        )}
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-yellow-200/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Add New Pricing Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={newItem.product_name}
                  onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
                  placeholder="Enter product name"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Batch Size</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={newItem.batch_size || ''}
                  onChange={(e) => handleBatchSizeOrTotalCostChange('batch_size', e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Total Cost</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={newItem.total_cost || ''}
                  onChange={(e) => handleBatchSizeOrTotalCostChange('total_cost', e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Cost per Unit (Calculated)</Label>
                <Input
                  type="number"
                  value={newItem.cost_per_unit || ''}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Selling Price per Unit</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={newItem.selling_price_per_unit || ''}
                  onChange={(e) => handleSellingPriceChange(e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Profit per Unit (Calculated)</Label>
                <Input
                  type="number"
                  value={newItem.profit_per_unit || ''}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Add any notes about this product"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-yellow-500"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pricing Record
            </Button>
          </form>
        </CardContent>
      </Card>

      {pricing.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl">
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Batch Size</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Selling Price per Unit</TableHead>
                    <TableHead>Profit per Unit</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.batch_size}</TableCell>
                      <TableCell>{item.total_cost}</TableCell>
                      <TableCell>{item.cost_per_unit}</TableCell>
                      <TableCell>{item.selling_price_per_unit}</TableCell>
                      <TableCell>{item.profit_per_unit}</TableCell>
                      <TableCell>{item.notes}</TableCell>
                      <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {pricing.length === 0 && (
        <Card className="bg-gray-50 text-center p-8">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No pricing records found</h3>
          <p className="text-gray-500">Add your first pricing record to start tracking!</p>
        </Card>
      )}
    </div>
  );
}; 