-- Create Products Table RPC
-- This stored procedure creates the products table if it doesn't exist
-- Call with: supabase.rpc('create_products_table')

CREATE OR REPLACE FUNCTION create_products_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if products table already exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Table exists, nothing to do
    RETURN true;
  END IF;

  -- Create the products table
  CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    features TEXT[] DEFAULT '{}'::TEXT[]
  );

  -- Add RLS policies
  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

  -- Allow anon/public read access
  CREATE POLICY "Allow public read access" 
    ON public.products
    FOR SELECT 
    TO anon, authenticated
    USING (true);

  -- Allow authenticated users to insert
  CREATE POLICY "Allow authenticated insert" 
    ON public.products
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

  RETURN true;
END;
$$;