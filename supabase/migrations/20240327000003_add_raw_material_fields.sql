-- Add new columns to raw_materials table
ALTER TABLE raw_materials
ADD COLUMN supplier_name TEXT,
ADD COLUMN supplier_contact TEXT,
ADD COLUMN last_purchase_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN purchase_notes TEXT,
ADD COLUMN usage_notes TEXT,
ADD COLUMN typical_monthly_usage DECIMAL; 