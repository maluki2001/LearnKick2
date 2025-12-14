-- FIX GRADE 2 QUESTIONS - Make them age-appropriate
-- Run this in Supabase SQL Editor

-- 1. First, see what questions we currently have for Grade 2
SELECT 
  'Current Grade 2 questions:' as info,
  COUNT(*) as total_grade_2,
  subject,
  AVG(difficulty) as avg_difficulty
FROM questions 
WHERE grade = 2
GROUP BY subject
ORDER BY subject;

-- 2. See overall question distribution
SELECT 
  'Question distribution by grade:' as info,
  grade,
  COUNT(*) as question_count,
  AVG(difficulty) as avg_difficulty
FROM questions 
GROUP BY grade 
ORDER BY grade;

-- 3. TEMPORARY FIX: Lower difficulty for Grade 2 questions
-- This makes existing questions easier for Grade 2 students
UPDATE questions 
SET difficulty = LEAST(difficulty, 2)
WHERE grade = 2;

-- 4. Add some simple Grade 2 questions for immediate testing
INSERT INTO questions (
  school_id, created_by, type, subject, grade, difficulty, language,
  question, answers, correct_index, explanation, time_limit
) VALUES 
-- Math questions for Grade 2
(
  (SELECT id FROM schools LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'multiple-choice',
  'math',
  2,
  1,
  'en',
  'What is 2 + 3?',
  ARRAY['4', '5', '6', '7'],
  1,
  'Count: 2, 3, 4, 5. The answer is 5.',
  15000
),
(
  (SELECT id FROM schools LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'multiple-choice',
  'math',
  2,
  1,
  'en',
  'How many fingers do you have on one hand?',
  ARRAY['3', '4', '5', '6'],
  2,
  'Count your fingers: thumb, pointing finger, middle finger, ring finger, little finger. That is 5.',
  15000
),
(
  (SELECT id FROM schools LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'multiple-choice',
  'math',
  2,
  1,
  'en',
  'What is 10 - 2?',
  ARRAY['6', '7', '8', '9'],
  2,
  'Start with 10 and take away 2: 10 - 2 = 8',
  15000
),
-- Geography questions for Grade 2
(
  (SELECT id FROM schools LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'multiple-choice',
  'geography',
  2,
  1,
  'en',
  'What color is the sun?',
  ARRAY['Blue', 'Yellow', 'Green', 'Purple'],
  1,
  'The sun appears yellow in the sky.',
  15000
),
(
  (SELECT id FROM schools LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'multiple-choice',
  'geography',
  2,
  1,
  'en',
  'Where do fish live?',
  ARRAY['In trees', 'In water', 'In the sky', 'Underground'],
  1,
  'Fish live in water - in oceans, rivers, and lakes.',
  15000
);

-- 5. Verify the changes
SELECT 
  'After fix - Grade 2 questions:' as info,
  COUNT(*) as total_questions,
  subject,
  difficulty,
  question
FROM questions 
WHERE grade = 2
ORDER BY subject, difficulty;