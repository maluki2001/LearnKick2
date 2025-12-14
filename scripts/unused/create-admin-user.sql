-- CREATE ADMIN USER - Run this in Supabase SQL Editor if you need a new admin account
-- This will create a test admin user for immediate access

-- First, let's see what users currently exist
SELECT 'Current users in database:' as info;
SELECT email, role, full_name, created_at FROM users ORDER BY created_at;

-- Check if we have any schools
SELECT 'Current schools:' as info;
SELECT name, code, admin_user_id FROM schools;

-- TO CREATE A NEW ADMIN USER:
-- 1. First sign up through Supabase Auth Dashboard or use the admin signup form
-- 2. Then run this to make them an admin (replace the email):

/*
-- Update an existing user to be admin (replace 'your-email@example.com' with actual email)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- If you need to create a school for them:
INSERT INTO schools (name, code, admin_user_id, subscription_plan)
VALUES (
  'Test School',
  'TEST01',
  (SELECT id FROM users WHERE email = 'your-email@example.com'),
  'free'
);

-- Update the user with school_id
UPDATE users 
SET school_id = (SELECT id FROM schools WHERE code = 'TEST01')
WHERE email = 'your-email@example.com';
*/

-- ALTERNATIVE: Create a quick bypass for testing (temporary)
-- This creates a demo admin that bypasses normal auth
/*
INSERT INTO users (id, email, full_name, role, school_id)
VALUES (
  'demo-admin-123',
  'admin@demo.test',
  'Demo Administrator',
  'admin',
  (SELECT id FROM schools LIMIT 1)
);
*/