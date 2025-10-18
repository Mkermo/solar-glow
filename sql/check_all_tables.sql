-- Diagnostic Script: Check which tables exist in your database
-- Run this in Supabase SQL Editor to see what tables you have

SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
