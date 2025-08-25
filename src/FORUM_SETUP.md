# Forum Setup for Solar Glow

This document provides instructions for setting up the forum functionality in Solar Glow.

## Database Setup

You need to run the SQL script in the Supabase dashboard to create the necessary tables:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the "SQL Editor" in the left navigation
4. Open the file `src/scripts/setup-forum-tables.sql` in your local project
5. Copy and paste the entire script into the SQL Editor
6. Click "Run" to execute the script

This will create the following tables:

- `forum_categories` - For forum categories
- `forum_topics` - For forum topics/posts
- `forum_replies` - For replies to topics

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
