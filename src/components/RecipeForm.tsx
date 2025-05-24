'use client';

import { useState, useEffect } from 'react';
import { Recipe, RawMaterial, RecipeIngredient, WeightUnit } from '@/types';
import { convertToGrams, calculateCost, formatCurrency, formatWeight } from '@/utils/conversions';
import { Plus, Minus, ChefHat, Edit2 } from 'lucide-react';

interface RecipeFormProps {
  recipe?: Recipe;
  materials: RawMaterial[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export default function RecipeForm({ recipe, materials, onSave, onCancel }: RecipeFormProps) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [batchSize, setBatchSize] = useState<number | undefined>();
  const [numberOfUnits, setNumberOfUnits] = useState<number | undefined>();

  useEffect(() => {
    if (recipe) {
      setRecipeName(recipe.name);
      setIngredients(recipe.ingredients);
      setBatchSize(recipe.batchSize);
      setNumberOfUnits(recipe.numberOfUnits);
    }
  }, [recipe]);

  const addIngredient = () => {
    if (materials.length === 0) {
      alert('Please add raw materials first');
      return;
    }

    const firstMaterial = materials[0];
    const newIngredient: RecipeIngredient = {
      materialId: firstMaterial.id,
      materialName: firstMaterial.name,
      amount: 0,
      unit: 'g',
      amountInGrams: 0,
      cost: 0,
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients];
    const ingredient = { ...updated[index] };
    
    if (field === 'materialId') {
      const material = materials.find(m => m.id === value);
      if (material) {
        ingredient.materialId = value as string;
        ingredient.materialName = material.name;
        ingredient.amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);
        ingredient.cost = calculateCost(ingredient.amountInGrams, material.costPerGram);
      }
    } else if (field === 'amount' || field === 'unit') {
      (ingredient as any)[field] = value;
      const material = materials.find(m => m.id === ingredient.materialId);
      if (material) {
        ingredient.amountInGrams = convertToGrams(ingredient.amount, ingredient.unit);
        ingredient.cost = calculateCost(ingredient.amountInGrams, material.costPerGram);
      }
    } else {
      (ingredient as any)[field] = value;
    }

    updated[index] = ingredient;
    setIngredients(updated);
  };

  const totalCost = ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
  const costPerUnit = numberOfUnits && numberOfUnits > 0 ? totalCost / numberOfUnits : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeName || ingredients.length === 0) {
      alert('Please provide a recipe name and at least one ingredient');
      return;
    }

    const hasInvalidIngredients = ingredients.some(ing => ing.amount <= 0);
    if (hasInvalidIngredients) {
      alert('Please ensure all ingredients have valid amounts');
      return;
    }

    const newRecipe: Recipe = {
      id: recipe?.id || Date.now().toString(),
      name: recipeName,
      ingredients,
      totalCost,
      batchSize,
      numberOfUnits,
      costPerUnit,
      originalBatchSize: recipe?.originalBatchSize || batchSize || ingredients.reduce((sum, ing) => sum + ing.amountInGrams, 0),
    };

    onSave(newRecipe);
    
    if (!recipe) {
      setRecipeName('');
      setIngredients([]);
      setBatchSize(undefined);
      setNumberOfUnits(undefined);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        {recipe ? <Edit2 className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
        <h3 className="text-lg font-semibold">
          {recipe ? 'Edit Recipe' : 'Create New Recipe'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            id="recipeName"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Moisturizing Face Cream"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Ingredients</h4>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={materials.length === 0}
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </button>
          </div>

          {materials.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-700">
                No raw materials available. Please add raw materials first.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <select
                      value={ingredient.materialId}
                      onChange={(e) => updateIngredient(index, 'materialId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={ingredient.amount || ''}
                      onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value as WeightUnit)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-gray-600">
                      {formatWeight(ingredient.amountInGrams, 'g')} = {formatCurrency(ingredient.cost)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size (optional)
            </label>
            <input
              type="number"
              id="batchSize"
              value={batchSize || ''}
              onChange={(e) => setBatchSize(parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="numberOfUnits" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Units (optional)
            </label>
            <input
              type="number"
              id="numberOfUnits"
              value={numberOfUnits || ''}
              onChange={(e) => setNumberOfUnits(parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 10"
              min="1"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Total Recipe Cost:</span>
              <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
            </div>
            {costPerUnit && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cost per Unit:</span>
                <span>{formatCurrency(costPerUnit)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {recipe ? 'Update Recipe' : 'Save Recipe'}
          </button>
          {recipe && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 