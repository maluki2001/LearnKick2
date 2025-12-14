-- Fix for infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- 1. Drop all problematic policies
DROP POLICY IF EXISTS "Users can view users in their school" ON users;
DROP POLICY IF EXISTS "Admins and teachers can view all users in their school" ON users;
DROP POLICY IF EXISTS "Users can view their own school" ON schools;
DROP POLICY IF EXISTS "School admins can update their school" ON schools;

-- 2. Temporarily disable RLS for setup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- 3. Create simple, non-recursive policies
CREATE POLICY "Allow all operations during development" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all operations during development" ON schools
  FOR ALL USING (true);

-- 4. Re-enable RLS with simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Note: These are permissive policies for development.
-- In production, you'd want more restrictive policies.