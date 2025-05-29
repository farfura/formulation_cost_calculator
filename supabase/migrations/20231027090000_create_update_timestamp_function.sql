-- supabase/migrations/20231027090000_create_update_timestamp_function.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- This function is generic and can be used by multiple tables.
-- Triggers for specific tables (recipes, raw_materials, packaging_items) will be in their respective schema migration files. 