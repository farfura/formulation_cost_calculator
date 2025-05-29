'use client';

import { useState } from 'react';
import { createRecipe, getAllRecipes } from '@/lib/db';

export default function TestDB() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addTestRecipe = async () => {
    setError('');
    setLoading(true);
    try {
      const newRecipe = {
        name: "Test Chocolate Cake",
        ingredients: [
          { name: "Flour", quantity: 2, unit: "cups", cost: 1.50 },
          { name: "Sugar", quantity: 1.5, unit: "cups", cost: 1.00 },
          { name: "Cocoa Powder", quantity: 0.75, unit: "cups", cost: 2.00 },
          { name: "Eggs", quantity: 2, unit: "pieces", cost: 1.00 }
        ],
        total_cost: 5.50
      };

      console.log('Attempting to create recipe:', newRecipe);
      const result = await createRecipe(newRecipe);
      console.log('Created recipe:', result);
      loadRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(error instanceof Error ? error.message : 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('Fetching recipes...');
      const allRecipes = await getAllRecipes();
      console.log('Received recipes:', allRecipes);
      setRecipes(allRecipes || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError(error instanceof Error ? error.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Database Connection</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading...
        </div>
      )}

      <button
        onClick={addTestRecipe}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 disabled:bg-blue-300"
      >
        Add Test Recipe
      </button>

      <button
        onClick={loadRecipes}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 ml-4 hover:bg-green-600 disabled:bg-green-300"
      >
        Load All Recipes
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Stored Recipes:</h2>
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="border p-4 rounded">
              <h3 className="font-bold">{recipe.name}</h3>
              <p>Total Cost: ${recipe.total_cost}</p>
              <div className="mt-2">
                <h4 className="font-semibold">Ingredients:</h4>
                <ul className="list-disc pl-5">
                  {recipe.ingredients.map((ing: any, index: number) => (
                    <li key={index}>
                      {ing.name}: {ing.quantity} {ing.unit} (${ing.cost})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 