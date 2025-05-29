-- Drop existing table if it exists
DROP TABLE IF EXISTS public.inventory;

-- Create inventory table
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    quantity DECIMAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    minimum_level DECIMAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster searches
CREATE INDEX inventory_name_idx ON public.inventory(name);

-- Temporarily disable RLS for development
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;

-- Grant access to public
GRANT ALL ON public.inventory TO anon;
GRANT ALL ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role; 