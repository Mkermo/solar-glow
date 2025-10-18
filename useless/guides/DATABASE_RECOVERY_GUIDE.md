# Solar-Glow Database Recovery Guide

## Current Status

You're getting a timeout error when trying to load products (8-12 second timeout). **This means the `products` table does NOT exist in your database.**

The application shows:

- `Error fetching products: Error: Operation timed out after 8000ms`
- `Rendering Index with products: Array(0)` - empty array

This is expected because:

1. The database was offline for 2 months
2. The products table was likely dropped or lost
3. You need to recreate it

## Tables You Should Have

Your Solar-Glow application requires these 6 main tables:

1. **products** - Main product catalog ⚠️ **MISSING - This is why you get timeout**

   - Stores solar panels, inverters, batteries, mounting systems, and accessories
   - Columns: id, name, description, price, sale_price, category, image_url, stock_quantity, sold_quantity, is_hidden, is_on_sale, created_at, updated_at

2. **product_sales** - Sales history tracking

   - Records each sale transaction
   - Columns: id, product_id, quantity, sale_price, sale_date

3. **forum_categories** - Forum discussion categories

   - Categories like "General Discussion", "Solar Panels", "Inverters", etc.
   - Columns: id, name, name_ar (Arabic), description, description_ar, created_at

4. **forum_topics** - Forum discussion topics

   - User-created topics within categories
   - Columns: id, title, content, user_id, category_id, view_count, is_approved, is_sticky, created_at, updated_at

5. **forum_comments** - Comments on forum topics

   - User responses to topics
   - Columns: id, content, user_id, topic_id, created_at, updated_at

6. **chat_messages** - Chat messages
   - For real-time messaging features
   - Columns: id, content, user_id, created_at

## URGENT: What to Do NOW

### Step 1: Verify the Products Table is Missing

Run this SQL query in Supabase SQL Editor:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

**If you don't see `products` in the list, proceed to Step 2 immediately.**

### 2. If Products Table is Missing

Run the complete setup script:

### Step 2: Run the Setup Script

1. Go to https://app.supabase.com and log in
2. Select your Solar-Glow project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the ENTIRE content from `sql/complete-database-setup.sql` file
6. Paste it into the SQL Editor
7. Click the **Run** button

This will create all tables, set up security, and insert sample data.

### Step 3: After Running the Script

Go back to your browser and refresh the page. The products should now load without timeout.

## Troubleshooting Steps

If you still get timeout:

1. **Check Browser Console** (F12)

   - Look for specific error messages
   - Note any 403 or permission errors

2. **Check Supabase SQL Editor**

   - Run: `SELECT COUNT(*) FROM public.products;`
   - Should return a number (not an error)

3. **Check Environment Variables**

   - Verify `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - These should match your Supabase project credentials

4. **Check Network Tab**
   - In browser DevTools, look at Network tab
   - See if Supabase API calls are being made
   - Look for 403 Forbidden or other auth errors

## Quick Diagnostic Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- 1. Check if products table exists
SELECT COUNT(*) FROM pg_tables WHERE tablename = 'products';

-- 2. Check if products table has data
SELECT COUNT(*) as total_products FROM public.products;

-- 3. See all products
SELECT id, name, category, price FROM public.products;

-- 4. Check RLS policies
SELECT policyname FROM pg_policies WHERE tablename = 'products';
```

## Key Files

- **Setup Script**: `sql/complete-database-setup.sql` ← **Run this in Supabase SQL Editor**
- **Diagnostic Script**: `sql/check_all_tables.sql` ← Run this to see what tables exist
- **Frontend Fix**: Updated `src/pages/Index.tsx` to handle missing tables gracefully

## Expected Result

After running the complete setup script and refreshing the browser:

- Page should load within 2-3 seconds
- Products should display in featured section
- Forum categories should be visible
- No timeout errors in console
- Products should display in the featured section
- No timeout warnings in console
- Forum categories should be accessible
