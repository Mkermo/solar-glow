# Quick Fix: RLS Policies for Products Table

If products are still not loading, the issue is likely **Row Level Security (RLS) policies** blocking anonymous access.

## Fix in Supabase Dashboard:

### Step 1: Disable RLS on products table (simplest fix)

Run this in Supabase SQL Editor:

```sql
-- Disable RLS on products table to allow public read
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
```

### Step 2: OR Create proper RLS policies (more secure)

Run this instead:

```sql
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

-- Create new policy for public read
CREATE POLICY "Allow public read access"
ON public.products
FOR SELECT
USING (true);

-- Test that it works
SELECT * FROM public.products LIMIT 1;
```

### Step 3: Check if policies are working

Run this to verify:

```sql
-- See what policies exist
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'products';

-- Test direct query
SELECT COUNT(*) FROM public.products;
```

## What to Do:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy and paste ONE of the SQL commands above
6. Click **Run**
7. Go back to your browser and refresh

The products should load immediately after!

## If Still Not Working:

Run this diagnostic query:

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'products';

-- See all policies on the table
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Try a simple select to see actual error
SELECT * FROM products LIMIT 1;
```

Copy the error message and share it with me.
