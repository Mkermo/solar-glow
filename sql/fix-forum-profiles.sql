-- Forum fix script to address common issues
-- Execute this in your Supabase SQL Editor

-- Step 1: Create profiles for users that are missing them
DO $$ 
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
  
  RAISE NOTICE 'Created % missing user profiles', missing_profiles_count;
END $$;

-- Step 2: Ensure view_count and views fields are synchronized
UPDATE forum_topics 
SET views = view_count
WHERE views IS NULL OR views != view_count;

UPDATE forum_topics 
SET view_count = views
WHERE view_count IS NULL OR view_count != views;

-- Step 3: Make sure forums_topics has the necessary columns
DO $$ 
BEGIN 
  -- Add view_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add views column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'views'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
END $$;

-- Step 4: Verify all topics have valid category IDs
DO $$ 
DECLARE
  invalid_category_count INT := 0;
BEGIN
  -- Check for topics with invalid category IDs
  SELECT COUNT(*)
  INTO invalid_category_count
  FROM forum_topics t
  LEFT JOIN forum_categories c ON t.category_id = c.id
  WHERE c.id IS NULL;
  
  IF invalid_category_count > 0 THEN
    RAISE NOTICE 'Found % topics with invalid category IDs', invalid_category_count;
    
    -- Get the first valid category to use as a fallback
    DECLARE
      fallback_category UUID;
    BEGIN
      SELECT id INTO fallback_category
      FROM forum_categories
      LIMIT 1;
      
      IF fallback_category IS NOT NULL THEN
        -- Fix topics with invalid category IDs
        UPDATE forum_topics
        SET category_id = fallback_category
        WHERE category_id IN (
          SELECT t.category_id
          FROM forum_topics t
          LEFT JOIN forum_categories c ON t.category_id = c.id
          WHERE c.id IS NULL
        );
        
        RAISE NOTICE 'Fixed % topics with invalid category IDs', invalid_category_count;
      ELSE
        RAISE NOTICE 'No valid categories found to fix topics with invalid category IDs';
      END IF;
    END;
  END IF;
END $$;

-- Final verification
SELECT
  (SELECT COUNT(*) FROM forum_topics) AS total_topics,
  (SELECT COUNT(*) FROM forum_categories) AS total_categories,
  (SELECT COUNT(*) FROM forum_comments) AS total_comments,
  (SELECT COUNT(DISTINCT user_id) FROM forum_topics) AS unique_topic_authors,
  (SELECT COUNT(*) FROM profiles) AS total_profiles;

-- Report any topics with missing users
SELECT t.id, t.title, t.user_id
FROM forum_topics t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL;
