-- Enhanced fix specifically for the 400 error with forum topics and profiles
-- Execute this in your Supabase SQL Editor

-- Add comment for diagnostic info
COMMENT ON TABLE public.forum_topics IS 'Forum topics with relationships to users and categories';
COMMENT ON TABLE public.forum_comments IS 'Forum comments with relationships to users and topics';
COMMENT ON TABLE public.profiles IS 'User profiles with relationship to auth.users';

-- Step 1: Create a function that will add proper email information to profiles
CREATE OR REPLACE FUNCTION update_profile_emails()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  missing_email_count INT := 0;
  fixed_email_count INT := 0;
  profile_id UUID;
  user_email TEXT;
  result TEXT;
BEGIN
  -- Find profiles without emails
  FOR profile_id IN 
    SELECT p.id 
    FROM profiles p
    WHERE p.email IS NULL
  LOOP
    -- Get email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = profile_id;
    
    -- Update the profile with the email
    IF user_email IS NOT NULL THEN
      UPDATE profiles
      SET email = user_email
      WHERE id = profile_id;
      
      fixed_email_count := fixed_email_count + 1;
    END IF;
    
    missing_email_count := missing_email_count + 1;
  END LOOP;
  
  result := 'Found ' || missing_email_count || ' profiles missing emails. Fixed ' || fixed_email_count || ' profiles.';
  RETURN result;
END $$;

-- Step 2: Fix foreign key reference comments explicitly to help PostgREST
-- This is critical for the joins in the TopicView.tsx component to work correctly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS "profiles_id_fkey";
ALTER TABLE public.profiles ADD CONSTRAINT "profiles_id_fkey" 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT "profiles_id_fkey" ON public.profiles IS 
  E'@foreignKey (id) references auth.users(id)\n@relationName userProfile';

ALTER TABLE public.forum_topics DROP CONSTRAINT IF EXISTS "forum_topics_user_id_fkey";
ALTER TABLE public.forum_topics ADD CONSTRAINT "forum_topics_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT "forum_topics_user_id_fkey" ON public.forum_topics IS 
  E'@foreignKey (user_id) references auth.users(id)\n@relationName authoredTopics';

ALTER TABLE public.forum_topics DROP CONSTRAINT IF EXISTS "forum_topics_category_id_fkey";
ALTER TABLE public.forum_topics ADD CONSTRAINT "forum_topics_category_id_fkey" 
  FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT "forum_topics_category_id_fkey" ON public.forum_topics IS 
  E'@foreignKey (category_id) references forum_categories(id)\n@relationName categoryTopics';

-- Step 3: Run the email update function
SELECT update_profile_emails() as email_fix_result;

-- Step 4: Fix specific issue with 400 error in the TopicView.tsx component
-- The problem is that the JOIN syntax in TopicView.tsx is incompatible with the database
-- This provides an alternative view that will work with the current JOIN syntax
CREATE OR REPLACE VIEW forum_topics_with_profiles AS
SELECT 
  t.*,
  p.email as user_email,
  p.username as user_username,
  p.avatar_url as user_avatar,
  c.name as category_name,
  c.name_ar as category_name_ar
FROM 
  forum_topics t
LEFT JOIN 
  profiles p ON t.user_id = p.id
LEFT JOIN 
  forum_categories c ON t.category_id = c.id;

-- Step 5: Create a function to directly fix the specific topic that's failing
CREATE OR REPLACE FUNCTION fix_topic_by_id(topic_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  topic_record JSONB;
BEGIN
  -- Check if topic exists
  IF NOT EXISTS (SELECT 1 FROM forum_topics WHERE id = topic_id_param) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Topic not found');
  END IF;
  
  -- Ensure the topic has a valid user_id with a profile
  WITH topic_user AS (
    SELECT user_id FROM forum_topics WHERE id = topic_id_param
  )
  INSERT INTO profiles (id, username, updated_at)
  SELECT tu.user_id, 'User_' || SUBSTRING(tu.user_id::text, 1, 6), NOW()
  FROM topic_user tu
  WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = tu.user_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Ensure user email is present
  WITH topic_user AS (
    SELECT t.user_id, u.email
    FROM forum_topics t
    JOIN auth.users u ON t.user_id = u.id
    WHERE t.id = topic_id_param
  )
  UPDATE profiles p
  SET email = tu.email
  FROM topic_user tu
  WHERE p.id = tu.user_id AND (p.email IS NULL OR p.email = '');
  
  -- Get the fixed topic
  SELECT 
    jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'content', t.content,
      'user_id', t.user_id,
      'category_id', t.category_id,
      'view_count', t.view_count,
      'created_at', t.created_at,
      'updated_at', t.updated_at,
      'user_email', p.email,
      'username', p.username
    ) INTO topic_record
  FROM forum_topics t
  LEFT JOIN profiles p ON t.user_id = p.id
  WHERE t.id = topic_id_param;
  
  -- Return success result
  RETURN jsonb_build_object('success', true, 'data', topic_record);
END $$;
