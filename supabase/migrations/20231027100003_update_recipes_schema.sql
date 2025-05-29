-- supabase/migrations/20231027100003_update_recipes_schema.sql

-- Add columns if they don't exist (idempotent)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS batch_size DECIMAL(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS number_of_units INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cost_per_unit DECIMAL(10, 4);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS original_batch_size DECIMAL(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS total_packaging_cost DECIMAL(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Rename columns from potential camelCase to snake_case.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='totalCost') THEN
    ALTER TABLE recipes RENAME COLUMN "totalCost" TO total_cost;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='batchSize') THEN
    ALTER TABLE recipes RENAME COLUMN "batchSize" TO batch_size;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='numberOfUnits') THEN
    ALTER TABLE recipes RENAME COLUMN "numberOfUnits" TO number_of_units;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='costPerUnit') THEN
    ALTER TABLE recipes RENAME COLUMN "costPerUnit" TO cost_per_unit;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='originalBatchSize') THEN
    ALTER TABLE recipes RENAME COLUMN "originalBatchSize" TO original_batch_size;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='totalPackagingCost') THEN
    ALTER TABLE recipes RENAME COLUMN "totalPackagingCost" TO total_packaging_cost;
  END IF;
  -- Ensure ingredients and packaging are JSONB, attempting conversion if they exist and are not already JSONB
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='ingredients') THEN
    ALTER TABLE recipes ALTER COLUMN ingredients TYPE JSONB USING ingredients::TEXT::JSONB;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='packaging') THEN
    ALTER TABLE recipes ALTER COLUMN packaging TYPE JSONB USING packaging::TEXT::JSONB;
  END IF;
END $$;

-- Ensure the trigger is correctly set up
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 