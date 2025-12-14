-- SQL Script to Fix English Science Questions Data Integrity Issues
-- Generated: December 7, 2025
-- Purpose: Fix missing correct_answer, missing answers arrays, and language mismatches

-- =====================================================
-- SECTION 1: Fix Language Mismatches
-- Replace German answers with English for true/false questions
-- =====================================================

UPDATE questions
SET answers = ARRAY['True', 'False']
WHERE language = 'en'
  AND subject = 'science'
  AND (
    answers::text LIKE '%Richtig%'
    OR answers::text LIKE '%Falsch%'
  );

-- =====================================================
-- SECTION 2: Fix Missing answers Arrays for True/False Questions
-- Questions with correct_answer = 'true' or 'false' but null answers
-- =====================================================

UPDATE questions
SET answers = ARRAY['True', 'False']
WHERE language = 'en'
  AND subject = 'science'
  AND answers IS NULL
  AND (LOWER(correct_answer) = 'true' OR LOWER(correct_answer) = 'false');

-- =====================================================
-- SECTION 3: Mark Questions with Missing Data for Manual Review
-- These need human review to determine correct answers
-- =====================================================

UPDATE questions
SET validation_status = 'needs_review',
    notes = 'Missing correct_answer - requires manual review'
WHERE language = 'en'
  AND subject = 'science'
  AND (correct_answer IS NULL OR correct_answer = '')
  AND answers IS NOT NULL;

-- =====================================================
-- SECTION 4: Suggested Manual Fixes for Common Questions
-- These are common questions where correct answer is obvious
-- =====================================================

-- Question: "Which weather condition can be dangerous with strong winds and heavy rain?"
UPDATE questions
SET correct_answer = 'Storm'
WHERE id = '0551bb0a-03e2-45f3-95cb-b5fed504d16c';

-- Question: "How do bees help plants?"
UPDATE questions
SET correct_answer = 'By pollinating flowers'
WHERE id = '26381656-1b73-4f3b-9960-0af795bc4f5b';

-- Question: "Which tool measures temperature?"
UPDATE questions
SET correct_answer = 'Thermometer'
WHERE id = 'fd3915c4-b5df-47ff-84cf-10a7ac11b8de';

-- Question: "What is the largest organ in your body?"
UPDATE questions
SET correct_answer = 'Skin'
WHERE id = 'ff163cdb-2810-4a2b-85b9-f5308312cfae';

-- Question: "What do bees collect from flowers?"
UPDATE questions
SET correct_answer = 'Nectar'
WHERE id = '3142a2e5-65cf-4c17-aa8e-99ab9a3a7d54';

-- Question: "In which season do flowers bloom and baby animals are born?"
UPDATE questions
SET correct_answer = 'Spring'
WHERE id = 'fb5ed92c-5594-4e33-9893-0c7b0c3d73a0';

-- Question: "Which organ helps you breathe?"
UPDATE questions
SET correct_answer = 'Lungs'
WHERE id = '32a93455-b5a5-441b-8d77-ca74745c2f6e';

-- Question: "What happens to water when it freezes?"
UPDATE questions
SET correct_answer = 'It turns to ice'
WHERE id = 'e3af6b3d-aeb5-444e-8418-246b68264eb7';

-- Question: "Which state of matter takes the shape of its container?"
UPDATE questions
SET correct_answer = 'Liquid'
WHERE id = '8d8ab6c0-8cac-42cb-ab52-bfbb34844990';

-- Question: "Which sense do you use to hear sounds?"
UPDATE questions
SET correct_answer = 'Hearing'
WHERE id = '289c1d8e-3467-4f8c-b198-75048aebf555';

-- Question: "Which animal can live both on land and in water?"
UPDATE questions
SET correct_answer = 'Frog'
WHERE id = '082a70ce-363c-4cfd-a25e-941a9f7a1b72';

-- Question: "Which animal is the tallest in the world?"
UPDATE questions
SET correct_answer = 'Giraffe'
WHERE id = '3d8c2a15-4f65-43ad-b6a2-2cb01d68758a';

-- =====================================================
-- SECTION 5: Generate answers arrays for numeric questions
-- =====================================================

-- Question: "How many legs does a spider have?"
UPDATE questions
SET answers = ARRAY['8', '6', '4', '10']
WHERE id = '74a9f6f8-2b3a-40e4-b571-5bb21452d001';

-- Question: "How many continents are there on Earth?"
UPDATE questions
SET answers = ARRAY['7', '5', '6', '8']
WHERE id = '3fe9d6ed-2c2e-4102-9796-673696e16e55';

-- Question: "How many languages are official in Switzerland?"
UPDATE questions
SET answers = ARRAY['4', '2', '3', '5']
WHERE id = '3d42d2b2-23fd-4eb0-998f-0c7034096d19';

-- =====================================================
-- SECTION 6: Reset validation status for fixed questions
-- =====================================================

UPDATE questions
SET validation_status = 'approved'
WHERE language = 'en'
  AND subject = 'science'
  AND correct_answer IS NOT NULL
  AND correct_answer != ''
  AND answers IS NOT NULL
  AND array_length(answers, 1) >= 2
  AND validation_status = 'rejected';

-- =====================================================
-- SECTION 7: Verification Queries
-- Run these after applying fixes to verify results
-- =====================================================

-- Check remaining issues
SELECT
  'Missing correct_answer' as issue_type,
  COUNT(*) as count
FROM questions
WHERE language = 'en' AND subject = 'science'
  AND (correct_answer IS NULL OR correct_answer = '')

UNION ALL

SELECT
  'Missing answers array' as issue_type,
  COUNT(*) as count
FROM questions
WHERE language = 'en' AND subject = 'science'
  AND answers IS NULL

UNION ALL

SELECT
  'Language mismatch' as issue_type,
  COUNT(*) as count
FROM questions
WHERE language = 'en' AND subject = 'science'
  AND (answers::text LIKE '%Richtig%' OR answers::text LIKE '%Falsch%')

UNION ALL

SELECT
  'Total approved questions' as issue_type,
  COUNT(*) as count
FROM questions
WHERE language = 'en' AND subject = 'science'
  AND validation_status = 'approved';

-- =====================================================
-- NOTES:
-- 1. Run SECTION 1-2 first to fix automated issues
-- 2. Review questions marked 'needs_review' manually
-- 3. Apply SECTION 4-5 for known good fixes
-- 4. Run SECTION 6 to approve fixed questions
-- 5. Run SECTION 7 to verify all fixes
-- =====================================================
