-- Fix for the is_approved column issue
-- Run this in your Supabase SQL Editor

-- STEP 1: Check if is_approved exists in your current schema
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'forum_topics' 
  AND column_name = 'is_approved'
) as has_is_approved_column;

-- STEP 2: Make the schema consistent by adding is_approved if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE forum_topics ADD COLUMN is_approved BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_approved column to forum_topics table';
  ELSE
    RAISE NOTICE 'is_approved column already exists in forum_topics table';
  END IF;
END $$;

-- STEP 3: Verify topic count with and without the filter
SELECT COUNT(*) as total_topics FROM forum_topics;
SELECT COUNT(*) as approved_topics FROM forum_topics WHERE is_approved = true;
SELECT COUNT(*) as unapproved_topics FROM forum_topics WHERE is_approved = false OR is_approved IS NULL;

-- STEP 4: Check if any topics are being filtered out by is_approved
SELECT 
  id, 
  title, 
  created_at, 
  is_approved
FROM forum_topics 
WHERE is_approved = false OR is_approved IS NULL
ORDER BY created_at DESC;

-- STEP 5: Update all topics to approved if needed
UPDATE forum_topics
SET is_approved = true
WHERE is_approved = false OR is_approved IS NULL;

RAISE NOTICE 'All forum topics have been set to is_approved = true';

-- Done! This ensures our column exists and all topics are visible
