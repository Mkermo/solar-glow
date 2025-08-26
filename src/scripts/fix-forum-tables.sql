-- Forum tables repair script for Solar Glow
-- This script will fix any issues with existing forum tables

-- Fix forum_categories table
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
    RAISE NOTICE 'Added name_ar column to forum_categories';
  END IF;
  
  -- Add description_ar column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_categories' 
    AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE public.forum_categories ADD COLUMN description_ar TEXT;
    RAISE NOTICE 'Added description_ar column to forum_categories';
  END IF;
END $$;

-- Fix forum_topics table
DO $$
BEGIN
  -- If table has views column but not view_count column, rename it
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'views'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.forum_topics RENAME COLUMN views TO view_count;
    RAISE NOTICE 'Renamed views column to view_count in forum_topics';
  END IF;
  
  -- If there's no view_count column, add it
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN view_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added view_count column to forum_topics';
  END IF;
  
  -- If there's no is_approved column, add it
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN is_approved BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_approved column to forum_topics';
  END IF;
END $$;

-- Fix comments table (either forum_comments or forum_replies)
DO $$
BEGIN
  -- If forum_replies exists but forum_comments doesn't, create forum_comments from it
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'forum_replies'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'forum_comments'
  ) THEN
    CREATE TABLE public.forum_comments (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      content TEXT NOT NULL,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Copy data from forum_replies to forum_comments
    INSERT INTO public.forum_comments (id, content, user_id, topic_id, created_at, updated_at)
    SELECT id, content, user_id, topic_id, created_at, updated_at
    FROM public.forum_replies;
    
    RAISE NOTICE 'Created forum_comments table and copied data from forum_replies';
  END IF;
END $$;

-- Update categories with Arabic translations if they're missing
DO $$
BEGIN
  -- Only run if name_ar exists and there are categories without name_ar values
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_categories' 
    AND column_name = 'name_ar'
  ) AND EXISTS (
    SELECT FROM public.forum_categories
    WHERE name_ar IS NULL
  ) THEN
    -- Update General Discussion category
    UPDATE public.forum_categories
    SET name_ar = 'النقاش العام', description_ar = 'مواضيع عامة تتعلق بالطاقة الشمسية'
    WHERE name = 'General Discussion' AND name_ar IS NULL;
    
    -- Update Solar Panels category
    UPDATE public.forum_categories
    SET name_ar = 'الألواح الشمسية', description_ar = 'نقاش حول الألواح الشمسية'
    WHERE name = 'Solar Panels' AND name_ar IS NULL;
    
    -- Update Inverters category
    UPDATE public.forum_categories
    SET name_ar = 'المحولات', description_ar = 'كل ما يتعلق بمحولات الطاقة الشمسية'
    WHERE name = 'Inverters' AND name_ar IS NULL;
    
    -- Update Batteries category
    UPDATE public.forum_categories
    SET name_ar = 'البطاريات', description_ar = 'أنظمة تخزين البطاريات'
    WHERE name = 'Batteries' AND name_ar IS NULL;
    
    -- Update Installation category
    UPDATE public.forum_categories
    SET name_ar = 'التركيب', description_ar = 'نصائح وإرشادات للتركيب'
    WHERE name = 'Installation' AND name_ar IS NULL;
    
    -- Update Troubleshooting category
    UPDATE public.forum_categories
    SET name_ar = 'استكشاف الأخطاء وإصلاحها', description_ar = 'المساعدة في مشاكل النظام'
    WHERE name = 'Troubleshooting' AND name_ar IS NULL;
    
    RAISE NOTICE 'Updated categories with Arabic translations';
  END IF;
END $$;
