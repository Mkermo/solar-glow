-- Advanced fix for forum tables with proper foreign key relationships
-- Run this in the SQL Editor in Supabase dashboard

-- Create or replace the RPC function for getting column information
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

-- Update the profiles table to ensure proper linking with auth.users
-- This is the most important fix for the 400 errors in joins
DO $$
BEGIN
  -- Drop the profiles table if it exists to recreate with proper relationships
  DROP TABLE IF EXISTS public.profiles CASCADE;
  
  -- Create the profiles table properly linked to auth.users
  CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Populate profiles from existing users if empty
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    INSERT INTO public.profiles (id, email)
    SELECT id, email FROM auth.users
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Fix the forum_topics table to ensure proper relationships with profiles and categories
DO $$
BEGIN
  -- First create a temporary backup of forum topics if they exist
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_topics AS
  SELECT * FROM public.forum_topics;
  
  -- Drop existing forum_topics table with potentially broken relationships
  DROP TABLE IF EXISTS public.forum_topics CASCADE;
  
  -- Recreate forum_topics with proper relationships
  CREATE TABLE public.forum_topics (
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
  
  -- Restore topics data if backup exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'temp_topics') THEN
    INSERT INTO public.forum_topics
    SELECT * FROM temp_topics
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Fix the forum_comments table to ensure proper relationships
DO $$
BEGIN
  -- First create a temporary backup of comments if they exist
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_comments AS
  SELECT * FROM public.forum_comments;
  
  -- Drop existing forum_comments table
  DROP TABLE IF EXISTS public.forum_comments CASCADE;
  
  -- Recreate forum_comments with proper relationships
  CREATE TABLE public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true
  );
  
  -- Restore comments data if backup exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'temp_comments') THEN
    INSERT INTO public.forum_comments
    SELECT * FROM temp_comments
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create proper RLS policies
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies before creating new ones
DROP POLICY IF EXISTS "Allow public read access to forum_categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow authenticated users to create forum_categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow users to update their own forum_categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow admins to manage forum_categories" ON public.forum_categories;

DROP POLICY IF EXISTS "Allow public read access to approved forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow authenticated users to create forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow users to update their own forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow admins to manage all forum_topics" ON public.forum_topics;

DROP POLICY IF EXISTS "Allow public read access to forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow authenticated users to create forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow users to update their own forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow admins to manage all forum_comments" ON public.forum_comments;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;

-- Create policies for profiles
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for forum_categories
CREATE POLICY "Allow public read access to forum_categories" 
ON public.forum_categories FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum_categories" 
ON public.forum_categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for forum_topics
CREATE POLICY "Allow public read access to forum_topics" 
ON public.forum_topics FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum_topics" 
ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own forum_topics" 
ON public.forum_topics FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own forum_topics" 
ON public.forum_topics FOR DELETE USING (auth.uid() = user_id);

-- Create policies for forum_comments
CREATE POLICY "Allow public read access to forum_comments" 
ON public.forum_comments FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum_comments" 
ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own forum_comments" 
ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own forum_comments" 
ON public.forum_comments FOR DELETE USING (auth.uid() = user_id);

-- Fix the Forum.tsx error with joins by adding proper foreign key references to Supabase
-- This creates explicit foreign key references in PostgREST
COMMENT ON CONSTRAINT "profiles_id_fkey" ON public.profiles IS 
  E'@foreignKey (id) references auth.users(id)\n@relationName user';

COMMENT ON CONSTRAINT "forum_topics_user_id_fkey" ON public.forum_topics IS 
  E'@foreignKey (user_id) references profiles(id)\n@relationName authoredTopics';

COMMENT ON CONSTRAINT "forum_topics_category_id_fkey" ON public.forum_topics IS 
  E'@foreignKey (category_id) references forum_categories(id)\n@relationName categoryTopics';

COMMENT ON CONSTRAINT "forum_comments_user_id_fkey" ON public.forum_comments IS 
  E'@foreignKey (user_id) references profiles(id)\n@relationName authoredComments';

COMMENT ON CONSTRAINT "forum_comments_topic_id_fkey" ON public.forum_comments IS 
  E'@foreignKey (topic_id) references forum_topics(id)\n@relationName topicComments';
