-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a trigger function to set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user_id to raw_materials if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'raw_materials' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE raw_materials ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to recipes if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to packaging_items if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'packaging_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE packaging_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create triggers to automatically set user_id
CREATE TRIGGER set_raw_materials_user_id
  BEFORE INSERT ON raw_materials
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_recipes_user_id
  BEFORE INSERT ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_packaging_items_user_id
  BEFORE INSERT ON packaging_items
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Enable Row Level Security
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_items ENABLE ROW LEVEL SECURITY;

-- Create policies for raw_materials
CREATE POLICY "Users can view their own raw materials"
  ON raw_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own raw materials"
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

CREATE POLICY "Users can create their own recipes"
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

CREATE POLICY "Users can create their own packaging items"
  ON packaging_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packaging items"
  ON packaging_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packaging items"
  ON packaging_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_user_id ON raw_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_packaging_items_user_id ON packaging_items(user_id); 