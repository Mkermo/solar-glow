-- Forum tables setup for Solar Glow - FIXED VERSION
-- Run this in the SQL Editor in Supabase dashboard

-- Create admin_users table first to avoid FK reference errors
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace RPC function for getting column information
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text
) LANGUAGE sql AS $$
  SELECT column_name::text, data_type::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1;
$$;

-- Create forum_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN 
  -- Add name_ar column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_categories' 
    AND column_name = 'name_ar'
  ) THEN
    ALTER TABLE public.forum_categories ADD COLUMN name_ar TEXT;
  END IF;
  
  -- Add description_ar column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_categories' 
    AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE public.forum_categories ADD COLUMN description_ar TEXT;
  END IF;
END $$;

-- Create forum_topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_sticky BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add view_count column or rename views to view_count if necessary
DO $$
BEGIN
  -- Make sure both view_count and views exist for compatibility
  -- Add view_count if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add views if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'views'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
  
  -- Sync the two columns to have the same values
  UPDATE public.forum_topics SET view_count = views WHERE view_count IS NULL OR view_count = 0;
  UPDATE public.forum_topics SET views = view_count WHERE views IS NULL OR views = 0;
END $$;

-- Create forum_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

-- Create profiles table if it doesn't exist (for user info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if name_ar and description_ar columns exist before inserting
DO $$ 
BEGIN
  -- Insert sample categories if they don't exist already
  IF NOT EXISTS (SELECT 1 FROM public.forum_categories LIMIT 1) THEN
    INSERT INTO public.forum_categories (name, name_ar, description, description_ar)
    VALUES 
      ('General Discussion', 'النقاش العام', 'General topics related to solar energy', 'مواضيع عامة تتعلق بالطاقة الشمسية'),
      ('Solar Panels', 'الألواح الشمسية', 'Discussion about solar panels', 'نقاش حول الألواح الشمسية'),
      ('Inverters', 'المحولات', 'All about solar inverters', 'كل ما يتعلق بمحولات الطاقة الشمسية'),
      ('Batteries', 'البطاريات', 'Battery storage systems', 'أنظمة تخزين البطاريات');
  END IF;
END $$;

-- Add RLS policies for proper security (if needed)
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies before creating new ones to avoid errors
DROP POLICY IF EXISTS "Allow public read access to forum_categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow admins to manage forum_categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow public read access to approved forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow authenticated users to create forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow users to update their own forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow admins to manage all forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow public read access to forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow authenticated users to create forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow users to update their own forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow admins to manage all forum_comments" ON public.forum_comments;

-- Create policies for forum_categories
CREATE POLICY "Allow public read access to forum_categories" 
ON public.forum_categories FOR SELECT USING (true);

-- Modified policy that doesn't depend on admin_users table
CREATE POLICY "Allow admins to manage forum_categories" 
ON public.forum_categories FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%@company.com'
));

-- Create policies for forum_topics
CREATE POLICY "Allow public read access to approved forum_topics" 
ON public.forum_topics FOR SELECT 
USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create forum_topics" 
ON public.forum_topics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own forum_topics" 
ON public.forum_topics FOR UPDATE 
USING (auth.uid() = user_id);

-- Modified policy that doesn't depend on admin_users table
CREATE POLICY "Allow admins to manage all forum_topics" 
ON public.forum_topics FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%@company.com'
));

-- Create policies for forum_comments
CREATE POLICY "Allow public read access to forum_comments" 
ON public.forum_comments FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum_comments" 
ON public.forum_comments FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own forum_comments" 
ON public.forum_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Modified policy that doesn't depend on admin_users table
CREATE POLICY "Allow admins to manage all forum_comments" 
ON public.forum_comments FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%@company.com'
));

-- Create policies for profiles
CREATE POLICY "Allow users to view profiles" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a test topic for debugging if none exist
DO $$ 
DECLARE
  category_id UUID;
  first_user_id UUID;
BEGIN
  -- Get topic count
  IF NOT EXISTS (SELECT 1 FROM public.forum_topics LIMIT 1) THEN
    -- Get first category
    SELECT id INTO category_id FROM public.forum_categories ORDER BY created_at LIMIT 1;
    
    -- Get first user
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- Only proceed if we have both a category and a user
    IF category_id IS NOT NULL AND first_user_id IS NOT NULL THEN
      -- Insert a test topic
      INSERT INTO public.forum_topics (
        title, 
        content, 
        user_id, 
        category_id, 
        view_count,
        views,
        is_approved
      ) VALUES (
        'Test Topic (Debug)', 
        'This is an automatically generated test topic for debugging purposes.', 
        first_user_id, 
        category_id, 
        0,
        0,
        true
      );
      
      RAISE NOTICE 'Created test topic for debugging';
    END IF;
  END IF;
END $$;
