import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Edit, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useToast } from '@/components/ui/use-toast';
import { PricingCalculator } from './PricingCalculator';

interface PriceRow {
  id?: string;
  recipeName: string;
  actualCost: number;
  packagingCost: number;
  profitMargin: number;
  finalPrice: number;
}

export function PricingManager() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const { supabase } = useSupabase();
  const { toast } = useToast();

  // Load existing pricing rows when component mounts
  useEffect(() => {
    loadPricingRows();
  }, []);

  // Load pricing rows from the database
  const loadPricingRows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRows = (data || []).map((row: any) => ({
        id: row.id,
        recipeName: row.product_name,
        actualCost: Number(row.total_cost) - Number(row.packaging_cost || 0),
        packagingCost: Number(row.packaging_cost || 0),
        profitMargin: Number(row.profit_margin || 0),
        finalPrice: Number(row.selling_price_per_unit || row.final_price || 0),
      }));

      setRows(formattedRows);
    } catch (error: any) {
      toast({
        title: 'Error loading pricing data',
        description: error.message || 'Failed to load pricing data',
        variant: 'destructive',
      });
    }
  };

  // Handle adding a new price calculation
  const handleAddPrice = async (priceData: PriceRow) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing')
        .insert([
          {
            product_name: priceData.recipeName,
            total_cost: priceData.actualCost + priceData.packagingCost,
            packaging_cost: priceData.packagingCost,
            profit_margin: priceData.profitMargin,
            selling_price_per_unit: priceData.finalPrice,
            profit_per_unit: priceData.finalPrice - (priceData.actualCost + priceData.packagingCost),
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the local state with the new row
      setRows(prevRows => [{
        id: data.id,
        recipeName: priceData.recipeName,
        actualCost: priceData.actualCost,
        packagingCost: priceData.packagingCost,
        profitMargin: priceData.profitMargin,
        finalPrice: priceData.finalPrice,
      }, ...prevRows]);

      toast({
        title: 'Success',
        description: 'Price calculation added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error adding price',
        description: error.message || 'Failed to add price calculation',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the calculator component
    }
  };

  // Handle deleting a price calculation
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRows(prevRows => prevRows.filter(row => row.id !== id));
      toast({
        title: 'Success',
        description: 'Price calculation deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting price',
        description: error.message || 'Failed to delete price calculation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <PricingCalculator onAddPrice={handleAddPrice} />
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/30 overflow-hidden shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-pink-100 to-yellow-100 hover:bg-none">
                  <TableHead className="text-pink-700 font-bold">Recipe Name</TableHead>
                  <TableHead className="text-pink-700 font-bold text-right">Actual Cost</TableHead>
                  <TableHead className="text-pink-700 font-bold text-right">Packaging Cost</TableHead>
                  <TableHead className="text-pink-700 font-bold text-right">Profit Margin (%)</TableHead>
                  <TableHead className="text-pink-700 font-bold text-right">Final Price</TableHead>
                  <TableHead className="text-pink-700 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.id || i} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50/50' : 'bg-yellow-50/50 hover:bg-yellow-100/50'}>
                    <TableCell className="font-semibold text-pink-900">{row.recipeName}</TableCell>
                    <TableCell className="text-right">${row.actualCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${row.packagingCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{row.profitMargin}%</TableCell>
                    <TableCell className="text-right">${row.finalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-pink-200 text-pink-600 bg-white rounded-full px-3 py-1 hover:bg-pink-50 shadow-sm" disabled>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="bg-pink-200 text-pink-900 rounded-full px-4 py-1 hover:bg-pink-400 border-none shadow-sm"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 