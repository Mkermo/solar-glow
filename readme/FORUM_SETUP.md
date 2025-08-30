# Forum Setup for Solar Glow

This document provides instructions for setting up the forum functionality in Solar Glow.

## Database Setup

You need to run the following SQL script in the Supabase dashboard to create the necessary tables:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the "SQL Editor" in the left navigation
4. Create a new query and paste the following SQL:

```sql
-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_sticky BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

-- Create basic RLS policies
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Allow public read access for categories"
  ON forum_categories FOR SELECT USING (true);

-- Public read access for topics
CREATE POLICY "Allow public read access for topics"
  ON forum_topics FOR SELECT USING (true);

-- Authenticated users can create topics
CREATE POLICY "Allow authenticated users to create topics"
  ON forum_topics FOR INSERT TO authenticated USING (true);

-- Public read access for comments
CREATE POLICY "Allow public read access for comments"
  ON forum_comments FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Allow authenticated users to create comments"
  ON forum_comments FOR INSERT TO authenticated USING (true);
```

5. Click "Run" to execute the script

This will create the following tables:

- `forum_categories` - For forum categories
- `forum_topics` - For forum topics/posts
- `forum_comments` - For comments on topics

## Storage Buckets

The application will automatically try to create these storage buckets when it starts:

- `products` - For product images
- `avatars` - For user profile images
- `forum-attachments` - For forum post attachments

If you encounter errors related to storage buckets, you might need to:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Storage" in the left navigation
4. Click "Create bucket" and create each of the buckets mentioned above
5. For each bucket:
   - Click on the bucket name
   - Go to the "Policies" tab
   - Add policies to allow public access if needed

## Troubleshooting

If you still encounter issues with the forum:

1. Check the browser console for specific error messages
2. Verify that your Supabase URL and Key are correct in `src/lib/supabase.ts`
3. Make sure the RLS policies are properly set up to allow access to the forum tables
4. Ensure that the user is properly authenticated when trying to create topics

For the 404 error when creating a new topic, make sure you're using the correct URL format:

- `/forum/new-topic` - For creating a new topic (general)
- `/forum/new-topic/:categoryId` - For creating a topic in a specific category
