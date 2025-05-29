'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface PriceBreakdown {
  recipeCost: number;
  packagingCost: number;
  totalCost: number;
  profitAmount: number;
  finalPrice: number;
}

export const PricingCalculator: React.FC = () => {
  const [recipeName, setRecipeName] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [packagingCost, setPackagingCost] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  const calculatePrice = () => {
    const recipeCost = parseFloat(actualCost) || 0;
    const packaging = parseFloat(packagingCost) || 0;
    const margin = parseFloat(profitMargin) || 0;

    const totalCost = recipeCost + packaging;
    const profitAmount = (totalCost * (margin / 100));
    const finalPrice = totalCost + profitAmount;

    setPriceBreakdown({
      recipeCost,
      packagingCost: packaging,
      totalCost,
      profitAmount,
      finalPrice
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2 text-purple-600">
          <span className="text-2xl">💰</span> Product Pricing
        </h2>
        <p className="text-gray-600">Calculate your product costs and profit margins</p>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-pink-600">Recipe Name</Label>
              <Input
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Enter recipe name"
              />
            </div>
            <div>
              <Label className="text-pink-600">Actual Cost ($)</Label>
              <Input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="40"
              />
            </div>
            <div>
              <Label className="text-pink-600">Packaging Cost ($)</Label>
              <Input
                type="number"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <Label className="text-pink-600">Profit Margin (%)</Label>
              <Input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <Button 
            className="w-full mt-6 bg-purple-500 hover:bg-purple-600"
            onClick={calculatePrice}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Price
          </Button>
        </CardContent>
      </Card>

      {priceBreakdown && (
        <Card className="bg-white/95 backdrop-blur-sm border-purple-200/60 shadow-xl">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">Price Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-pink-600">
                <span>Recipe Cost:</span>
                <span className="font-semibold">${priceBreakdown.recipeCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-pink-600">
                <span>Packaging Cost:</span>
                <span className="font-semibold">${priceBreakdown.packagingCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-pink-600 border-t pt-2">
                <span>Total Cost:</span>
                <span className="font-semibold">${priceBreakdown.totalCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-pink-600">
                <span>Profit Margin ({profitMargin}%):</span>
                <span className="font-semibold">${priceBreakdown.profitAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg font-bold text-purple-800 border-t border-purple-200 pt-3 mt-4">
                <span>Final Price:</span>
                <span>${priceBreakdown.finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 