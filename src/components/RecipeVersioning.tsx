import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RecipeVersion {
  id: string;
  version_number: number;
  name: string;
  description: string;
  created_at: string;
  changes_description: string;
  is_current: boolean;
}

interface RecipeVersioningProps {
  recipeId: string;
  currentRecipe: any;
  onVersionChange: (versionId: string) => void;
}

export const RecipeVersioning: React.FC<RecipeVersioningProps> = ({
  recipeId,
  currentRecipe,
  onVersionChange,
}) => {
  const { supabase } = useSupabase();
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    name: '',
    description: '',
    changes_description: '',
  });

  useEffect(() => {
    loadVersions();
  }, [recipeId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_versions')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      toast.error('Failed to load recipe versions');
    }
  };

  const createNewVersion = async () => {
    try {
      // Get the latest version number
      const latestVersion = versions[0]?.version_number || 0;
      
      // Create new version record
      const { data: versionData, error: versionError } = await supabase
        .from('recipe_versions')
        .insert([
          {
            recipe_id: recipeId,
            version_number: latestVersion + 1,
            name: newVersionData.name,
            description: newVersionData.description,
            changes_description: newVersionData.changes_description,
            total_cost: currentRecipe.total_cost,
            serving_size: currentRecipe.serving_size,
          },
        ])
        .select()
        .single();

      if (versionError) throw versionError;

      // Copy current recipe ingredients to new version
      const { data: currentIngredients } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId);

      if (currentIngredients) {
        const versionIngredients = currentIngredients.map((ingredient) => ({
          recipe_version_id: versionData.id,
          raw_material_id: ingredient.raw_material_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          cost: ingredient.cost,
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_version_ingredients')
          .insert(versionIngredients);

        if (ingredientsError) throw ingredientsError;
      }

      toast.success('New version created successfully');
      setIsCreateVersionOpen(false);
      loadVersions();
    } catch (error) {
      toast.error('Failed to create new version');
    }
  };

  const revertToVersion = async (versionId: string) => {
    try {
      // Get version ingredients
      const { data: versionIngredients, error: ingredientsError } = await supabase
        .from('recipe_version_ingredients')
        .select('*')
        .eq('recipe_version_id', versionId);

      if (ingredientsError) throw ingredientsError;

      // Update current recipe with version data
      const { data: versionData, error: versionError } = await supabase
        .from('recipe_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Update recipe ingredients
      if (versionIngredients) {
        // Delete current ingredients
        await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId);

        // Insert version ingredients as current ingredients
        const currentIngredients = versionIngredients.map((ingredient) => ({
          recipe_id: recipeId,
          raw_material_id: ingredient.raw_material_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          cost: ingredient.cost,
        }));

        await supabase
          .from('recipe_ingredients')
          .insert(currentIngredients);
      }

      toast.success('Successfully reverted to selected version');
      onVersionChange(versionId);
    } catch (error) {
      toast.error('Failed to revert to version');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recipe Versions</h3>
        <Dialog open={isCreateVersionOpen} onOpenChange={setIsCreateVersionOpen}>
          <DialogTrigger asChild>
            <Button>Create New Version</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Version Name</Label>
                <Input
                  id="name"
                  value={newVersionData.name}
                  onChange={(e) =>
                    setNewVersionData({ ...newVersionData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVersionData.description}
                  onChange={(e) =>
                    setNewVersionData({
                      ...newVersionData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="changes">Changes Made</Label>
                <Textarea
                  id="changes"
                  value={newVersionData.changes_description}
                  onChange={(e) =>
                    setNewVersionData({
                      ...newVersionData,
                      changes_description: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={createNewVersion}>Create Version</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {versions.map((version) => (
          <Card key={version.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {version.name} (v{version.version_number})
                {version.is_current && (
                  <span className="ml-2 text-sm text-green-500">Current</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{version.description}</p>
                <p className="text-sm text-gray-500">
                  Changes: {version.changes_description}
                </p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(version.created_at).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revertToVersion(version.id)}
                >
                  Revert to This Version
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 