'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RawMaterial } from '@/types';
import { formatCurrency, formatWeight } from '@/utils/conversions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Package, Sparkles, DollarSign, Scale } from 'lucide-react';

interface RawMaterialListProps {
  materials: RawMaterial[];
  onEdit: (material: RawMaterial) => void;
  onDelete: (id: string) => void;
}

export default function RawMaterialList({ materials, onEdit, onDelete }: RawMaterialListProps) {
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
            <p className="text-sm text-muted-foreground">
              Start by adding your first raw material above and watch the magic happen! 🌟
            </p>
            <motion.div
              className="mt-6 flex justify-center gap-2"
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
      <Card className="bg-white/90 backdrop-blur-sm border-pink-200/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-pink-500/10 to-yellow-500/10 border-b border-pink-200/30">
          <CardTitle className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white"
            >
              <Package className="w-5 h-5" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                💖 Raw Materials Collection
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground font-normal">
                  Your beautiful ingredient library
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {materials.length} {materials.length === 1 ? 'ingredient' : 'ingredients'} ✨
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {materials.map((material, index) => (
                <motion.div
                  key={material.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                  layout
                  className="group"
                >
                  <Card className="border-pink-200/50 hover:border-pink-300/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-white to-pink-50/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div
                              className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            />
                            <h4 className="text-xl font-bold text-primary">{material.name}</h4>
                            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span>Total: <span className="font-semibold text-primary">
                                {formatCurrency(material.totalCost)}
                              </span></span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Scale className="w-4 h-4 text-blue-500" />
                              <span>Weight: <span className="font-semibold text-primary">
                                {formatWeight(material.totalWeight, material.weightUnit)}
                              </span></span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-yellow-100 text-primary border-pink-200">
                                {formatCurrency(material.costPerGram)}/g ✨
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => onEdit(material)}
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-pink-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${material.name}"? 💔`)) {
                                  onDelete(material.id);
                                }
                              }}
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 