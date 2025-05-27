import { RawMaterial, Recipe, PackagingItem } from '@/types';

const RAW_MATERIALS_KEY = 'formulationCalculator_rawMaterials';
const RECIPES_KEY = 'formulationCalculator_recipes';
const PACKAGING_KEY = 'formulationCalculator_packaging';

/**
 * Raw Materials Storage
 */
export function getRawMaterials(): RawMaterial[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RAW_MATERIALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading raw materials:', error);
    return [];
  }
}

export function saveRawMaterials(materials: RawMaterial[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(RAW_MATERIALS_KEY, JSON.stringify(materials));
  } catch (error) {
    console.error('Error saving raw materials:', error);
  }
}

/**
 * Recipes Storage
 */
export function getRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECIPES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Error saving recipes:', error);
  }
}

// Packaging
export function getPackagingItems(): PackagingItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(PACKAGING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading packaging items:', error);
    return [];
  }
}

export function savePackagingItems(packaging: PackagingItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PACKAGING_KEY, JSON.stringify(packaging));
  } catch (error) {
    console.error('Error saving packaging items:', error);
  }
} 