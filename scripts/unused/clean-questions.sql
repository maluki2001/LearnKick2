-- Clean Questions Database Script
-- Run this script in your Supabase SQL Editor to remove all existing questions

-- Temporarily disable RLS for cleanup
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Delete all questions
DELETE FROM questions;

-- Reset the sequence if using SERIAL primary key
-- (This ensures new questions start from ID 1)
-- ALTER SEQUENCE questions_id_seq RESTART WITH 1;

-- Re-enable RLS after cleanup
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT COUNT(*) as total_questions_remaining FROM questions;

-- This should return 0 if cleanup was successful