-- COMPLETE POLICY RESET - Run this in Supabase SQL Editor
-- This will completely remove all RLS policies and start fresh

-- 1. List and drop ALL policies on users table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
    END LOOP;
END $$;

-- 2. List and drop ALL policies on schools table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'schools'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON schools', policy_record.policyname);
    END LOOP;
END $$;

-- 3. Completely disable RLS for now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents DISABLE ROW LEVEL SECURITY;

-- 4. Verify no policies exist
SELECT 
    tablename, 
    policyname,
    cmd as policy_definition
FROM pg_policies 
WHERE tablename IN ('users', 'schools', 'questions', 'game_sessions', 'school_invites', 'student_parents');

-- This query should return NO ROWS if successful