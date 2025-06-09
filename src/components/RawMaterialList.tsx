'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RawMaterial } from '@/types';
import { formatWeight } from '@/utils/conversions';
import { formatCurrency } from '@/utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Package, DollarSign, Scale, Calculator, Sparkles } from 'lucide-react';

interface RawMaterialListProps {
  materials: RawMaterial[];
  onEdit: (material: RawMaterial) => void;
  onDelete: (id: string) => void;
}

export default function RawMaterialList({ materials, onEdit, onDelete }: RawMaterialListProps) {
  const { currency } = useCurrency();

  const totalMaterials = materials.length;
  const totalValue = materials.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const avgCostPerGram = totalMaterials > 0 ? materials.reduce((sum, m) => sum + (m.costPerGram || 0), 0) / totalMaterials : 0;

  if (materials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200/50 shadow-xl">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Package className="w-20 h-20 text-pink-300 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent mb-3">
              No ingredients yet! ✨
            </h3>
            <p className="text-lg text-muted-foreground mb-2">Ready to create something beautiful?</p>
            <p className="text-sm text-muted-foreground mb-6">
              Start by adding your first magical ingredient above and watch the beauty unfold! 🌟
            </p>
            <motion.div
              className="flex justify-center gap-2 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="outline" className="text-pink-600 border-pink-300 bg-pink-50">
                💖 Sweet Almond Oil
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                ✨ Shea Butter
              </Badge>
              <Badge variant="outline" className="text-pink-600 border-pink-300 bg-pink-50">
                🌸 Rose Hip Oil
              </Badge>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Pastel Summary Card */}
      <Card className="mb-6 bg-gradient-to-r from-pink-50 to-yellow-50 border-0 shadow-none">
        <CardContent className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-pink-600">Inventory Summary</span>
            <span className="text-sm text-gray-500">Updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg bg-pink-100 px-4 py-2 text-pink-700 font-semibold text-sm shadow-sm">Total Materials: {totalMaterials}</div>
            <div className="rounded-lg bg-yellow-100 px-4 py-2 text-yellow-700 font-semibold text-sm shadow-sm">Total Value: {formatCurrency(totalValue, currency)}</div>
            <div className="rounded-lg bg-purple-100 px-4 py-2 text-purple-700 font-semibold text-sm shadow-sm">Avg Cost/Gram: {formatCurrency(avgCostPerGram, currency)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Pastel Table (Inventory style) */}
      <Card className="bg-white/95 backdrop-blur-sm border-pink-200/60 shadow-xl mb-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-pink-200 to-yellow-200">
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Material Name</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Weight</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Unit</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Cost/Gram</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Total Cost</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Supplier</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Last Purchase</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Monthly Usage</th>
                  <th className="px-4 py-3 text-left font-bold text-pink-700 text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <motion.tr
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-b border-pink-100 hover:bg-pink-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{material.name}</span>
                        {material.usageNotes && (
                          <span className="text-xs text-gray-500 mt-1">{material.usageNotes}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{material.totalWeight}</td>
                    <td className="px-4 py-3 text-gray-700">{material.weightUnit}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(material.costPerGram, currency)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(material.totalCost, currency)}</td>
                    <td className="px-4 py-3">
                      {material.supplierName && (
                        <div className="flex flex-col">
                          <span className="text-gray-900">{material.supplierName}</span>
                          {material.supplierContact && (
                            <a 
                              href={material.supplierContact.startsWith('http') ? material.supplierContact : `http://${material.supplierContact}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              {material.supplierContact}
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {material.lastPurchaseDate && (
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {new Date(material.lastPurchaseDate).toLocaleDateString()}
                          </span>
                          {material.purchaseNotes && (
                            <span className="text-xs text-gray-500 mt-1">{material.purchaseNotes}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {material.typicalMonthlyUsage ? (
                        `${material.typicalMonthlyUsage} ${material.weightUnit}/month`
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onEdit(material)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => onDelete(material.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 