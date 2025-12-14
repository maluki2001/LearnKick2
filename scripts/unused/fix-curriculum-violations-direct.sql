-- SQL Script to fix Lehrplan 21 Math Curriculum Violations
-- These questions have operations/numbers exceeding their grade level limits
-- According to Swiss Lehrplan 21 math curriculum

-- Start transaction
BEGIN;

-- 1. EN: "What is 999 + 111?" (sum=1110) Grade 3 -> 4
-- Grade 3 max sum is 1000, Grade 4 max sum is 10000
UPDATE questions
SET grade = 4, updated_at = NOW()
WHERE id = '71160901-0e31-4e23-ba04-2c9b0fe93d02'
  AND grade = 3;

-- 2. EN: "What is 125 + 75?" (sum=200) Grade 2 -> 3
-- Grade 2 max sum is 100, Grade 3 max sum is 1000
UPDATE questions
SET grade = 3, updated_at = NOW()
WHERE id = '474cc6f6-0d3c-4322-aa46-59de4d1b11cb'
  AND grade = 2;

-- 3. FR: "Combien font 1500 - 756 ?" (minuend=1500) Grade 3 -> 4
-- Grade 3 max minuend is 1000, Grade 4 max minuend is 10000
UPDATE questions
SET grade = 4, updated_at = NOW()
WHERE id = '9115534d-858b-4915-8de7-301d594532b5'
  AND grade = 3;

-- 4. FR: "Combien font 856 + 379 + 248 ?" (sum=1483) Grade 3 -> 4
-- Grade 3 max sum is 1000, Grade 4 max sum is 10000
UPDATE questions
SET grade = 4, updated_at = NOW()
WHERE id = '9ea396c8-bf94-4543-8aaa-5d645f421ae1'
  AND grade = 3;

-- 5. FR: "Combien font 739 + 486 ?" (sum=1225) Grade 3 -> 4
-- Grade 3 max sum is 1000, Grade 4 max sum is 10000
UPDATE questions
SET grade = 4, updated_at = NOW()
WHERE id = '8b6194c9-380f-4db6-a3b3-3753046ae71a'
  AND grade = 3;

-- 6. FR: "Combien font 647 + 358 ?" (sum=1005) Grade 3 -> 4
-- Grade 3 max sum is 1000, Grade 4 max sum is 10000
UPDATE questions
SET grade = 4, updated_at = NOW()
WHERE id = '3dd5aff6-d8c5-4fc8-9392-d1a4873bb8e4'
  AND grade = 3;

-- Show results
SELECT id, question, grade, language, updated_at
FROM questions
WHERE id IN (
  '71160901-0e31-4e23-ba04-2c9b0fe93d02',
  '474cc6f6-0d3c-4322-aa46-59de4d1b11cb',
  '9115534d-858b-4915-8de7-301d594532b5',
  '9ea396c8-bf94-4543-8aaa-5d645f421ae1',
  '8b6194c9-380f-4db6-a3b3-3753046ae71a',
  '3dd5aff6-d8c5-4fc8-9392-d1a4873bb8e4'
);

-- Commit the changes
COMMIT;
