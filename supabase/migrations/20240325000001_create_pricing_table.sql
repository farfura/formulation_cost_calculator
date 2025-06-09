
-- Drop existing table if it exists
DROP TABLE IF EXISTS public.pricing;

-- Create pricing table
CREATE TABLE public.pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    batch_size DECIMAL NOT NULL,
    total_cost DECIMAL NOT NULL,
    cost_per_unit DECIMAL NOT NULL,
    selling_price_per_unit DECIMAL NOT NULL,
    profit_per_unit DECIMAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster searches
CREATE INDEX pricing_product_name_idx ON public.pricing(product_name);

-- Temporarily disable RLS for development
ALTER TABLE public.pricing DISABLE ROW LEVEL SECURITY;

-- Grant access to public
GRANT ALL ON public.pricing TO anon;
GRANT ALL ON public.pricing TO authenticated;
GRANT ALL ON public.pricing TO service_role; 