-- Create the missing RPC function for getting column information
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text
) LANGUAGE sql AS $$
  SELECT column_name::text, data_type::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1;
$$;

-- Add Arabic language columns if they don't exist
ALTER TABLE IF EXISTS public.forum_categories 
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Fix view count column name issue (make sure both view_count and views exist)
ALTER TABLE IF EXISTS public.forum_topics 
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS public.forum_topics 
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Make sure we have consistent default values
UPDATE forum_topics 
SET view_count = 0 
WHERE view_count IS NULL;

UPDATE forum_topics 
SET views = view_count 
WHERE views IS NULL;

-- Fix foreign key relationships for proper joins between tables
-- First drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS public.forum_topics
  DROP CONSTRAINT IF EXISTS forum_topics_category_id_fkey;

ALTER TABLE IF EXISTS public.forum_topics
  DROP CONSTRAINT IF EXISTS forum_topics_user_id_fkey;

-- Then add them back correctly
ALTER TABLE IF EXISTS public.forum_topics
  ADD CONSTRAINT forum_topics_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;

-- Create proper foreign key for user_id in forum_topics
DO $$
BEGIN
  -- Check if the profiles table exists, create it if not
  IF NOT EXISTS (SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Create a basic profiles table linked to auth.users
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT,
      avatar_url TEXT,
      email TEXT
    );
  END IF;
END $$;

-- Ensure forum_topics has foreign key to profiles not auth.users
ALTER TABLE IF EXISTS public.forum_topics
  ADD CONSTRAINT forum_topics_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make sure the forum_comments table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'forum_comments') THEN
    CREATE TABLE public.forum_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      is_approved BOOLEAN DEFAULT true
    );
  END IF;
END $$;

-- Create RLS policies for access control if not already done
ALTER TABLE IF EXISTS public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Add or replace public read policies
DROP POLICY IF EXISTS "Allow public read access for categories" ON forum_categories;
CREATE POLICY "Allow public read access for categories"
  ON forum_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for topics" ON forum_topics;
CREATE POLICY "Allow public read access for topics"
  ON forum_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for comments" ON forum_comments;
CREATE POLICY "Allow public read access for comments"
  ON forum_comments FOR SELECT USING (true);

-- Allow authenticated users to create content
DROP POLICY IF EXISTS "Allow authenticated users to create topics" ON forum_topics;
CREATE POLICY "Allow authenticated users to create topics"
  ON forum_topics FOR INSERT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create comments" ON forum_comments;
CREATE POLICY "Allow authenticated users to create comments"
  ON forum_comments FOR INSERT TO authenticated USING (true);
