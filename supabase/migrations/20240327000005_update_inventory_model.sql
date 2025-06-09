-- Drop existing columns
ALTER TABLE public.inventory
DROP COLUMN quantity,
DROP COLUMN unit,
DROP COLUMN minimum_level,
DROP COLUMN notes;

-- Add new columns
ALTER TABLE public.inventory
ADD COLUMN total_weight DECIMAL NOT NULL DEFAULT 0,
ADD COLUMN weight_unit TEXT NOT NULL DEFAULT 'g',
ADD COLUMN supplier_name TEXT,
ADD COLUMN supplier_contact TEXT,
ADD COLUMN last_purchase_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN purchase_notes TEXT,
ADD COLUMN usage_notes TEXT,
ADD COLUMN typical_monthly_usage DECIMAL;

-- Add indexes for commonly queried fields
CREATE INDEX idx_inventory_supplier_name ON public.inventory(supplier_name);
CREATE INDEX idx_inventory_last_purchase_date ON public.inventory(last_purchase_date); 