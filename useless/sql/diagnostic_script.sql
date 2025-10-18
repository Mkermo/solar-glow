-- Diagnostic script to check the supabase configuration
-- First, check if the table exists function works
SELECT check_table_exists('products') AS products_table_exists;

-- Check if any products exist
SELECT count(*) AS product_count FROM products;

-- Check if the RPCs are registered
SELECT 
    routine_name, 
    routine_schema,
    data_type AS return_type
FROM 
    information_schema.routines 
WHERE 
    routine_schema = 'public' AND 
    routine_name IN ('check_table_exists', 'create_products_table')
ORDER BY
    routine_name;