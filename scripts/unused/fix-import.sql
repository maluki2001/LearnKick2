-- QUICK FIX for import - Add missing fields
-- Run this FIRST, then run the main import

-- Temporarily disable RLS for import
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Create a default school if it doesn't exist
INSERT INTO schools (id, name, domain, subscription_type, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo School', 'demo.edu', 'free', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create a default user if it doesn't exist  
INSERT INTO users (id, email, full_name, role, school_id, created_at, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'admin@demo.edu', 'Admin User', 'admin', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now modify the import to include required fields
-- This will be a sed command to fix the existing import file