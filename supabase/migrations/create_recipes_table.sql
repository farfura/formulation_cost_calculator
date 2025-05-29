-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  batch_size DECIMAL(10, 2),
  number_of_units INTEGER,
  cost_per_unit DECIMAL(10, 4),
  original_batch_size DECIMAL(10, 2),
  packaging JSONB,
  total_packaging_cost DECIMAL(10, 2),
  category TEXT,
  description TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 