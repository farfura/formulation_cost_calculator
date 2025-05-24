# Web App Prompt: Formulation Cost Calculator

## Purpose

A browser-based tool for skincare or cosmetic formulators to calculate recipe costs based on raw materials input. It allows tracking raw materials (with weight and cost), building recipes (with ingredient amounts), converting weights, computing costs, and exporting results.

---

## Core Features

### 1. Raw Materials Management

* Add/edit/delete raw materials
* Fields per material:

  * Name
  * Total Cost (in any currency)
  * Total Weight (grams, kg, ounces, or pounds)
  * Unit of Weight (convert to grams internally)
  * **Cost per gram** (auto-calculated and stored)

### 2. Recipe Builder

* Create/edit/delete recipes
* For each recipe:

  * Add ingredients from the raw material list
  * Specify amount used (input + unit: g, kg, oz, lb)
  * Convert input to grams
  * Compute ingredient cost: `used_grams * cost_per_gram`
  * Sum total cost
  * Optionally input: total batch size, number of units, etc.
  * Optionally compute: cost per unit

### 3. Weight Conversion

* Support conversions:

  * 1 kg = 1000 g
  * 1 oz = 28.3495 g
  * 1 lb = 453.592 g
  * Always store and calculate internally in grams

### 4. Export Functionality

* Export a recipe cost breakdown to spreadsheet (CSV or XLSX)
* Fields in export:

  * Ingredient Name
  * Used Amount (with original unit)
  * Converted to Grams
  * Cost per Gram
  * Total Cost
  * Recipe Total Cost
  * Optional: Cost per Unit

---

## Technical Stack

### Frontend

* React + Tailwind CSS
* Component structure:

  * RawMaterialForm
  * RawMaterialList
  * RecipeForm
  * RecipeList
  * ExportButton

### Data Handling

* LocalStorage for persistent local use
* Optional: Firebase or Supabase for multi-device syncing

### Utilities

* `convertToGrams(weight, unit)` function
* `calculateCost(usedGrams, costPerGram)`
* `SheetJS` for Excel/CSV generation

---

## Optional Enhancements

* Packaging cost inclusion
* Stock quantity management
* Batch and profit margin calculation
* Label information generation (e.g., INCI list, percentages)

---

## MVP Goal

Create a clean, usable web app that runs locally in the browser with no login or backend, focused on:

* Entering raw material info with automatic unit conversion
* Building recipes and seeing accurate costs
* Exporting recipes to spreadsheet
