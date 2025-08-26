# Forum Setup Guide

This guide will help you fix any issues with the forum system in Solar Glow.

## Quick Fix Instructions

If your forum isn't working properly, follow these steps:

1. Go to the **Forum Debug Page** at `/forum-debug`
2. Look at the table status to see which forum tables exist
3. Run the SQL setup scripts in your Supabase SQL Editor:
   - First run the "Setup Tables" SQL script
   - Then run the "Fix Existing Tables" SQL script
4. Return to the Forum Debug page and click "Check Tables" again
5. If all tables show as "Exists", try creating test data

## Common Issues & Solutions

### "Topic not found" after creating a topic

This happens when the database schema has issues. To fix:

1. Run the "Fix Existing Tables" SQL script
2. If that doesn't work, run the full "Setup Tables" SQL script

### No topics or categories showing on forum page

Possible causes:

1. **Missing tables**: Run the "Setup Tables" SQL script
2. **No data**: Create sample data using the "Create Sample Data" button on the Debug page
3. **Column name mismatch**: Run the "Fix Existing Tables" SQL script

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
