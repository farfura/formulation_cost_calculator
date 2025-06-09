-- Add new columns for supplier information and usage tracking
ALTER TABLE raw_materials
ADD COLUMN supplier_name TEXT,
ADD COLUMN supplier_contact TEXT,
ADD COLUMN last_purchase_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN purchase_notes TEXT,
ADD COLUMN usage_notes TEXT,
ADD COLUMN typical_monthly_usage DECIMAL;

-- Add indexes for commonly queried fields
CREATE INDEX idx_raw_materials_supplier_name ON raw_materials(supplier_name);
CREATE INDEX idx_raw_materials_last_purchase_date ON raw_materials(last_purchase_date); 