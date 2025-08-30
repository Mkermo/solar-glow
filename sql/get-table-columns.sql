-- Create function to get table columns
-- This will help check which columns exist in a table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::text, c.data_type::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = $1;
END;
$$;
