-- CLEAN QUESTIONS DATABASE - Run this in Supabase SQL Editor
-- This will remove all existing questions to prepare for fresh CSV import

-- 1. Check current question count
SELECT 
  'Current question count:' as info,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE grade = 1) as grade_1,
  COUNT(*) FILTER (WHERE grade = 2) as grade_2,
  COUNT(*) FILTER (WHERE grade = 3) as grade_3,
  COUNT(*) FILTER (WHERE grade = 4) as grade_4,
  COUNT(*) FILTER (WHERE grade = 5) as grade_5,
  COUNT(*) FILTER (WHERE grade = 6) as grade_6
FROM questions;

-- 2. Show breakdown by subject and grade
SELECT 
  subject,
  grade,
  COUNT(*) as question_count
FROM questions
GROUP BY subject, grade
ORDER BY subject, grade;

-- 3. DELETE ALL EXISTING QUESTIONS
-- Uncomment the line below when you're ready to delete everything
-- DELETE FROM questions;

-- 4. Verify empty table
SELECT 'After cleanup:' as info, COUNT(*) as remaining_questions FROM questions;

-- 5. Reset the sequence if needed (optional)
-- This ensures new questions start with clean IDs
-- TRUNCATE questions RESTART IDENTITY;

-- Instructions:
-- 1. Run sections 1-2 first to see what questions currently exist
-- 2. Uncomment the DELETE line when ready to clean everything
-- 3. Use the admin panel CSV import to upload your 1000-question file
-- 4. Verify the import worked by running section 1 again