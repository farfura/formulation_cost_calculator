-- supabase/migrations/20231027100002_update_packaging_items_schema.sql
CREATE TABLE IF NOT EXISTS packaging_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  description TEXT,
  supplier TEXT,
  category TEXT NOT NULL CHECK (category IN ('container', 'label', 'cap', 'pump', 'box', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  -- user_id UUID will be added later
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_packaging_items_updated_at ON packaging_items;
CREATE TRIGGER update_packaging_items_updated_at
  BEFORE UPDATE ON packaging_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 