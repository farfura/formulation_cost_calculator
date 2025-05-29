-- Add user_id column to raw_materials
ALTER TABLE raw_materials
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to recipes
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to packaging_items
ALTER TABLE packaging_items
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_user_id ON raw_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_packaging_items_user_id ON packaging_items(user_id);

-- Create Row Level Security (RLS) policies
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_items ENABLE ROW LEVEL SECURITY;

-- Create policies for raw_materials
CREATE POLICY "Users can view their own raw materials"
  ON raw_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own raw materials"
  ON raw_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own raw materials"
  ON raw_materials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own raw materials"
  ON raw_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for recipes
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for packaging_items
CREATE POLICY "Users can view their own packaging items"
  ON packaging_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packaging items"
  ON packaging_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packaging items"
  ON packaging_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packaging items"
  ON packaging_items FOR DELETE
  USING (auth.uid() = user_id); 