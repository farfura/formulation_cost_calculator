'use client';

import { motion } from 'framer-motion';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencyOptions, getCurrencySymbol } from '@/utils/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, Globe } from 'lucide-react';
import { Currency } from '@/types';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
}

export default function CurrencySelector({ className = '', showLabel = true }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();
  const currencyOptions = getCurrencyOptions();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 ${className}`}
    >
      {showLabel && (
        <Label htmlFor="currency-select" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" />
          Currency
        </Label>
      )}
      <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
        <SelectTrigger 
          id="currency-select"
          className="w-full h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300 transition-colors overflow-hidden text-ellipsis"
        >
          <div className="flex items-center gap-2">
            <SelectValue placeholder="Select currency" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-lg">{option.symbol}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
} 