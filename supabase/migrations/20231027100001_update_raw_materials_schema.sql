-- supabase/migrations/20231027100001_update_raw_materials_schema.sql
CREATE TABLE IF NOT EXISTS raw_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  total_weight DECIMAL(10, 2) NOT NULL,
  weight_unit TEXT NOT NULL, 
  cost_per_gram DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  -- user_id UUID will be added in a later migration when auth is set up
);

-- Create trigger for updated_at
-- Ensure the function update_updated_at_column() exists from a previous migration
DROP TRIGGER IF EXISTS update_raw_materials_updated_at ON raw_materials;
CREATE TRIGGER update_raw_materials_updated_at
  BEFORE UPDATE ON raw_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 