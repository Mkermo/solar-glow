-- IMPORTANT: Run this in Supabase SQL Editor if products won't load
-- This fixes RLS policies blocking anonymous access

-- Option 1: SIMPLEST FIX - Disable RLS entirely (fastest)
-- Good for public e-commerce where products are meant to be public
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policy for public read access (more secure)
-- Uncomment below if you want this instead of Option 1
/*
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

-- Create new policy allowing anyone to read
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
USING (true);
*/

-- Verify it worked
SELECT 'Products table RLS status:' as test;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'products';

-- Test the query that was failing
SELECT COUNT(*) as total_products FROM public.products;
SELECT COUNT(*) as hidden_count FROM public.products WHERE is_hidden = true;
SELECT COUNT(*) as visible_count FROM public.products WHERE is_hidden = false;