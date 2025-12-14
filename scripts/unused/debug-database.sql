-- Debug Database Script - Run these commands ONE BY ONE in Supabase SQL Editor

-- 1. Check if questions exist
SELECT COUNT(*) as total_questions FROM questions;

-- 2. Show sample questions (if any)
SELECT id, subject, grade, language, question FROM questions LIMIT 5;

-- 3. Check RLS status
SELECT relname as table_name, relrowsecurity as rls_enabled 
FROM pg_class 
WHERE relname = 'questions';

-- 4. Show RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'questions';

-- 5. TEMPORARILY disable RLS to test (CAREFUL!)
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- 6. Try the count again
SELECT COUNT(*) as questions_without_rls FROM questions;

-- 7. IMPORTANT: Re-enable RLS after testing
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;