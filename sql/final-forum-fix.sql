-- Final fix for forum table relationships
-- This script will properly rebuild the tables with explicit foreign key relationships for PostgREST

-- Drop all affected tables and recreate them in the correct order
-- First create backup tables to preserve data
CREATE TABLE IF NOT EXISTS backup_forum_categories AS SELECT * FROM public.forum_categories;
CREATE TABLE IF NOT EXISTS backup_forum_topics AS SELECT * FROM public.forum_topics;
CREATE TABLE IF NOT EXISTS backup_forum_comments AS SELECT * FROM public.forum_comments;
CREATE TABLE IF NOT EXISTS backup_profiles AS SELECT * FROM public.profiles;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.forum_comments CASCADE;
DROP TABLE IF EXISTS public.forum_topics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;

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

-- First, recreate the categories table
CREATE TABLE public.forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Next, create the profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add explicit comment for PostgREST to recognize the relationship
COMMENT ON TABLE public.profiles IS 'User profiles for the application';
COMMENT ON CONSTRAINT profiles_id_fkey ON public.profiles IS 
  'User profiles belong to authentication users';

-- Now create the topics table with explicit references
CREATE TABLE public.forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  view_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_sticky BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT forum_topics_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT forum_topics_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES public.forum_categories(id) ON DELETE CASCADE
);

-- Add explicit comments for PostgREST to recognize the relationships
COMMENT ON TABLE public.forum_topics IS 'Forum topics/discussions';
COMMENT ON CONSTRAINT forum_topics_user_id_fkey ON public.forum_topics IS 
  'Forum topics are created by users';
COMMENT ON CONSTRAINT forum_topics_category_id_fkey ON public.forum_topics IS 
  'Forum topics belong to categories';

-- Finally create the comments table with explicit references
CREATE TABLE public.forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT forum_comments_topic_id_fkey FOREIGN KEY (topic_id)
    REFERENCES public.forum_topics(id) ON DELETE CASCADE
);

-- Add explicit comments for PostgREST to recognize the relationships
COMMENT ON TABLE public.forum_comments IS 'Comments on forum topics';
COMMENT ON CONSTRAINT forum_comments_user_id_fkey ON public.forum_comments IS 
  'Forum comments are created by users';
COMMENT ON CONSTRAINT forum_comments_topic_id_fkey ON public.forum_comments IS 
  'Forum comments belong to topics';

-- Restore data from backups if they exist
INSERT INTO public.forum_categories 
SELECT * FROM backup_forum_categories
ON CONFLICT (id) DO NOTHING;

-- Restore profiles, and add any missing profiles from auth.users
INSERT INTO public.profiles (id, username, email, updated_at)
SELECT id, email, email, NOW() FROM auth.users
WHERE id NOT IN (SELECT id FROM backup_profiles)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles
SELECT * FROM backup_profiles
ON CONFLICT (id) DO NOTHING;

-- Restore topics
INSERT INTO public.forum_topics
SELECT * FROM backup_forum_topics
ON CONFLICT (id) DO NOTHING;

-- Restore comments
INSERT INTO public.forum_comments
SELECT * FROM backup_forum_comments
ON CONFLICT (id) DO NOTHING;

-- Set up row-level security (RLS) policies
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified access policies
DROP POLICY IF EXISTS "Allow public read access to forum_categories" ON public.forum_categories;
CREATE POLICY "Allow public read access to forum_categories" 
ON public.forum_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to forum_topics" ON public.forum_topics;
CREATE POLICY "Allow public read access to forum_topics" 
ON public.forum_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to forum_comments" ON public.forum_comments;
CREATE POLICY "Allow public read access to forum_comments" 
ON public.forum_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create forum_topics" ON public.forum_topics;
CREATE POLICY "Allow authenticated users to create forum_topics" 
ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to create forum_comments" ON public.forum_comments;
CREATE POLICY "Allow authenticated users to create forum_comments" 
ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create triggers to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON forum_topics;
CREATE TRIGGER update_forum_topics_updated_at
BEFORE UPDATE ON forum_topics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_comments_updated_at ON forum_comments;
CREATE TRIGGER update_forum_comments_updated_at
BEFORE UPDATE ON forum_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add missing profiles for any existing users
INSERT INTO public.profiles (id, username, email)
SELECT id, email, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
