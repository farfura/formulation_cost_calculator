-- Drop existing tables if they exist
DROP TABLE IF EXISTS raw_materials CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS packaging_items CASCADE;

-- Create raw_materials table
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_cost DECIMAL NOT NULL,
    total_weight DECIMAL NOT NULL,
    weight_unit TEXT NOT NULL,
    cost_per_gram DECIMAL NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create recipes table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cost DECIMAL NOT NULL DEFAULT 0,
    batch_size DECIMAL,
    number_of_units INTEGER,
    cost_per_unit DECIMAL,
    original_batch_size DECIMAL,
    packaging JSONB DEFAULT '[]'::jsonb,
    total_packaging_cost DECIMAL DEFAULT 0,
    category TEXT,
    description TEXT,
    instructions TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create packaging_items table
CREATE TABLE packaging_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cost DECIMAL NOT NULL,
    description TEXT,
    supplier TEXT,
    category TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_raw_materials_user_id ON raw_materials(user_id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_packaging_items_user_id ON packaging_items(user_id);

-- Enable Row Level Security
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for raw_materials
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

-- Create RLS policies for recipes
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

-- Create RLS policies for packaging_items
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

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_raw_materials_updated_at
    BEFORE UPDATE ON raw_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packaging_items_updated_at
    BEFORE UPDATE ON packaging_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 