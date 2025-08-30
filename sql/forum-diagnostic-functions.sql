-- SQL functions for forum diagnostics
-- Run this in your Supabase SQL Editor

-- Function to create missing profiles
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  topic_user_id UUID;
  user_exists BOOLEAN;
  missing_profiles_count INT := 0;
BEGIN
  -- Get all distinct user IDs from forum_topics that might need profiles
  FOR topic_user_id IN 
    SELECT DISTINCT user_id 
    FROM forum_topics
  LOOP
    -- Check if the user has a profile
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE id = topic_user_id
    ) INTO user_exists;
    
    -- If no profile exists, create one
    IF NOT user_exists THEN
      INSERT INTO profiles (
        id, 
        username, 
        updated_at
      ) VALUES (
        topic_user_id,
        'User_' || SUBSTRING(topic_user_id::text, 1, 6),
        NOW()
      );
      missing_profiles_count := missing_profiles_count + 1;
    END IF;
  END LOOP;
  
  -- Also check comment authors
  FOR topic_user_id IN 
    SELECT DISTINCT user_id 
    FROM forum_comments
    WHERE user_id NOT IN (SELECT id FROM profiles)
  LOOP
    -- Check if the user has a profile
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE id = topic_user_id
    ) INTO user_exists;
    
    -- If no profile exists, create one
    IF NOT user_exists THEN
      INSERT INTO profiles (
        id, 
        username, 
        updated_at
      ) VALUES (
        topic_user_id,
        'User_' || SUBSTRING(topic_user_id::text, 1, 6),
        NOW()
      );
      missing_profiles_count := missing_profiles_count + 1;
    END IF;
  END LOOP;
END $$;

-- Function to synchronize view counts
CREATE OR REPLACE FUNCTION sync_forum_view_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Make sure view_count column exists
  BEGIN
    -- Try updating view_count from views
    UPDATE forum_topics 
    SET view_count = views
    WHERE view_count IS NULL OR view_count != views;
  EXCEPTION 
    WHEN undefined_column THEN
      -- Add view_count column if it doesn't exist
      ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
  END;

  -- Make sure views column exists
  BEGIN
    -- Try updating views from view_count
    UPDATE forum_topics 
    SET views = view_count
    WHERE views IS NULL OR views != view_count;
  EXCEPTION 
    WHEN undefined_column THEN
      -- Add views column if it doesn't exist
      ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
  END;
END $$;
