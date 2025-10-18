-- CRITICAL DATABASE FUNCTIONS FOR SOLAR-GLOW
-- Run this script in the Supabase SQL Editor to create all required functions
-- These functions are referenced in your application code

-- Function 1: Check if a table exists
-- This is used by your app to verify the products table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION public.check_table_exists TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.check_table_exists IS 'Checks if a table exists in the public schema';

-- Function 2: Get all table columns
-- This helps your app know what columns are available in a table
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public' 
    AND c.table_name = table_name;
END;
$$;

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION public.get_table_columns TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.get_table_columns IS 'Returns column information for a specified table';

-- Function 3: Initialize Products table with sample data (if empty)
-- This populates the products table with initial data if needed
CREATE OR REPLACE FUNCTION public.initialize_products_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_count integer;
BEGIN
  -- Check if products table exists
  IF NOT public.check_table_exists('products') THEN
    -- Create products table if it doesn't exist
    CREATE TABLE public.products (
      id TEXT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      sale_price DECIMAL(10,2),
      category VARCHAR(100) NOT NULL,
      image_url TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      sold_quantity INTEGER NOT NULL DEFAULT 0,
      is_hidden BOOLEAN DEFAULT false,
      is_on_sale BOOLEAN DEFAULT false,
      specifications JSONB,
      name_ar TEXT,
      description_ar TEXT,
      specifications_ar JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Enable RLS
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    
    -- Create policy
    CREATE POLICY "Allow public read access to products" 
    ON public.products FOR SELECT USING (true);
  END IF;

  -- Check if table is empty
  SELECT COUNT(*) INTO product_count FROM public.products;
  
  -- Only insert sample data if table is empty
  IF product_count = 0 THEN
    INSERT INTO public.products 
    (id, name, description, price, category, image_url, stock_quantity, is_hidden, specifications)
    VALUES
      ('sp-001', 'SolarG Premium 400W Solar Panel', 'High-efficiency monocrystalline solar panel with advanced cell technology', 299.99, 'panels', '/placeholder.svg', 50, false, 
          '{"Power Output": "400W", "Efficiency": "21.3%", "Cell Type": "Monocrystalline", "Dimensions": "1755 x 1038 x 35mm", "Weight": "19.8kg", "Warranty": "25 years"}'),
      ('sp-002', 'SolarG Professional 350W Solar Panel', 'Reliable poly panel for residential and commercial systems', 249.99, 'panels', '/placeholder.svg', 75, false,
          '{"Power Output": "350W", "Efficiency": "18.5%", "Cell Type": "Polycrystalline", "Dimensions": "1755 x 1038 x 35mm", "Weight": "19.5kg", "Warranty": "20 years"}'),
      ('inv-001', 'SolarG String Inverter 5kW', 'High-performance string inverter with WiFi monitoring', 899.99, 'inverters', '/placeholder.svg', 25, false,
          '{"Power Rating": "5kW", "Efficiency": "98.5%", "Input Voltage": "200-1000V", "Warranty": "10 years", "Monitoring": "WiFi + Mobile App"}'),
      ('inv-002', 'SolarG Hybrid Inverter 7.6kW', 'Smart hybrid inverter with battery storage capability', 1499.99, 'inverters', '/placeholder.svg', 20, false,
          '{"Power Rating": "7.6kW", "Battery Support": "Yes", "Efficiency": "97.5%", "Warranty": "15 years"}');
  END IF;
END;
$$;

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION public.initialize_products_table TO authenticated, service_role;
COMMENT ON FUNCTION public.initialize_products_table IS 'Creates and populates the products table if needed';

-- Function 4: Check product stock
CREATE OR REPLACE FUNCTION public.check_product_stock(product_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stock_qty integer;
BEGIN
  SELECT stock_quantity INTO stock_qty
  FROM public.products
  WHERE id = product_id;
  
  RETURN COALESCE(stock_qty, 0);
END;
$$;

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION public.check_product_stock TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.check_product_stock IS 'Returns the current stock quantity for a product';

-- Grant permissions to call the functions
GRANT EXECUTE ON FUNCTION public.check_table_exists TO anon;
GRANT EXECUTE ON FUNCTION public.get_table_columns TO anon;
GRANT EXECUTE ON FUNCTION public.check_product_stock TO anon;

-- Verification: Test functions work
SELECT 'Function test results:' AS test;
SELECT public.check_table_exists('products') AS products_table_exists;

-- If products table exists, check some columns
DO $$
BEGIN
  IF (SELECT public.check_table_exists('products')) THEN
    PERFORM public.get_table_columns('products');
  END IF;
END
$$;

-- Show message
SELECT 'Database functions have been created successfully!' AS result;