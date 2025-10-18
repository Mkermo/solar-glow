# Forum Troubleshooting Guide

This guide will help you fix any issues with the forum system in Solar Glow.

## Quick Fix Instructions

If your forum isn't working properly, follow these steps:

1. Go to the **Forum Diagnostics Page** at `/forum/diagnostics`
2. Use the "Topic Diagnostics" tab to check if specific topics exist
3. Use the "Quick Fixes" tab to run automatic repair scripts
4. For more advanced fixes, run the SQL scripts from the `/sql` directory in your Supabase SQL Editor:
   - Run the `fix-forum-profiles.sql` script to fix profile relationships
   - Run the `forum-diagnostic-functions.sql` script to enable in-app fixes
5. Return to the Forum page and try viewing topics again

## Common Issues & Solutions

### "Topic not found" when clicking on a topic

This often happens due to missing user profiles or other relationship issues:

1. Use the Forum Diagnostics tool to check if the topic exists
2. Run the "Fix Profile Relationships" option in the diagnostics page
3. If that doesn't work, run the `fix-forum-profiles.sql` script from the `/sql` directory in your Supabase SQL Editor

### No topics or categories showing on forum page

Possible causes:

1. **Missing tables**: Go to the Forum Debug page (`/forum/debug`) to create necessary tables
2. **Missing profiles**: Run the profile fix script
3. **No data**: Create sample data using the "Create Sample Data" button on the Debug page
4. **Column name mismatch**: Run the "Fix Existing Tables" SQL script

### Error about "name_ar" column not existing

Run the "Fix Existing Tables" SQL script to add the missing column.

## Troubleshooting Database Issues

If you're still having issues:

1. Check the browser console for specific errors
2. Run the "Reset Forum Data" button on the Debug page (WARNING: deletes all forum data!)
3. Run both SQL scripts in sequence
4. Create fresh test data

## Making the Forum Work in Any Environment

The latest code includes automatic schema adaptation that should work with different database configurations. The system will:

- Detect whether to use "view_count" or "views" column names
- Adapt to either "forum_comments" or "forum_replies" table names
- Check for and handle missing Arabic language columns

## Advanced: SQL Commands

You can also run these individual SQL commands directly in Supabase SQL Editor to fix specific issues:

```sql
-- Add Arabic columns if missing
ALTER TABLE IF EXISTS public.forum_categories ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE IF EXISTS public.forum_categories ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Fix view count column name
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'forum_topics' AND column_name = 'views')
     AND NOT EXISTS (SELECT FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'forum_topics' AND column_name = 'view_count') THEN
    ALTER TABLE public.forum_topics RENAME COLUMN views TO view_count;
  END IF;
END $$;
```

## Getting Help

If you continue to have issues with the forum system, please:

1. Take screenshots of any error messages
2. Export your table structure from Supabase
3. Provide details of what you've tried so far
4. Contact support with these details
