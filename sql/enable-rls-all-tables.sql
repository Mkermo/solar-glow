-- Enable RLS on all tables to fix security warnings

-- 1. Enable RLS on products table (if not already enabled)
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Create public read policy for products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
USING (true);

-- 2. Enable RLS on forum_categories
ALTER TABLE IF EXISTS public.forum_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on forum_categories" ON public.forum_categories;
CREATE POLICY "Allow public read on forum_categories"
ON public.forum_categories
FOR SELECT
USING (true);

-- 3. Enable RLS on forum_topics
ALTER TABLE IF EXISTS public.forum_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on forum_topics" ON public.forum_topics;
CREATE POLICY "Allow public read on forum_topics"
ON public.forum_topics
FOR SELECT
USING (is_approved = true);

-- 4. Enable RLS on forum_comments
ALTER TABLE IF EXISTS public.forum_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on forum_comments" ON public.forum_comments;
CREATE POLICY "Allow public read on forum_comments"
ON public.forum_comments
FOR SELECT
USING (true);

-- 5. Enable RLS on forum_replies
ALTER TABLE IF EXISTS public.forum_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on forum_replies" ON public.forum_replies;
CREATE POLICY "Allow public read on forum_replies"
ON public.forum_replies
FOR SELECT
USING (true);

-- 6. Enable RLS on profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Verify all policies are in place
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show all RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;