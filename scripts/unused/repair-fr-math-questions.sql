-- ============================================================
-- French Math Questions Data Repair Script
-- ============================================================
-- Purpose: Fix incorrect correct_answer values in French math questions
-- Issue: correct_answer contains answer VALUES instead of INDICES (0-3)
-- Generated: 2025-12-07
-- ============================================================

-- BACKUP: Create backup table before making changes
CREATE TABLE IF NOT EXISTS questions_backup_20251207 AS
SELECT * FROM questions WHERE language = 'fr' AND subject = 'math';

-- ============================================================
-- REPAIR STRATEGY:
-- For each question, find the position of correct_answer value
-- in the answers array and update correct_answer to that index
-- ============================================================

-- Step 1: Fix questions where correct_answer is a numeric value in the answers array
-- This handles cases like correct_answer='50' where answers=['45','48','50','52']
UPDATE questions
SET correct_answer = (
  SELECT (idx - 1)::text
  FROM unnest(answers) WITH ORDINALITY AS t(val, idx)
  WHERE val = correct_answer
  LIMIT 1
)
WHERE language = 'fr'
  AND subject = 'math'
  AND validation_status = 'rejected'
  AND answers IS NOT NULL
  AND correct_answer IS NOT NULL
  AND correct_answer != ''
  AND (
    -- Only update if correct_answer is NOT already a valid index (0-3)
    correct_answer NOT IN ('0', '1', '2', '3')
    OR
    -- Or if it IS 0-3 but doesn't match the expected pattern
    (correct_answer IN ('0', '1', '2', '3') AND correct_answer::int >= array_length(answers, 1))
  );

-- Step 2: Manual fixes for known mathematical errors
-- Fix: 3/4 in decimals = 0.75, not 0.25
UPDATE questions
SET correct_answer = '2'  -- Index of "0.75"
WHERE id = '1cf35590-3a4b-477b-96c3-fbffe5878713'
  AND language = 'fr'
  AND subject = 'math';

-- Fix: 10 - 7 = 3, not 5
UPDATE questions
SET correct_answer = '1'  -- Index of "3"
WHERE id = 'b3029689-36a5-45ee-b618-11c1f4618082'
  AND language = 'fr'
  AND subject = 'math';

-- Step 3: Fix empty correct_answer fields
-- For these, we need to calculate the correct answer and find its index
-- Example: "Un carré a une aire de 49 cm². Quelle est la longueur d'un côté?"
-- Answer: sqrt(49) = 7, so find index of "7 cm"
UPDATE questions
SET correct_answer = (
  SELECT (idx - 1)::text
  FROM unnest(answers) WITH ORDINALITY AS t(val, idx)
  WHERE val ILIKE '%7%'  -- Find answer containing 7
  LIMIT 1
)
WHERE id = '333fbb04-a22d-4c8f-8af6-e38a2007360f'
  AND language = 'fr'
  AND subject = 'math';

-- Step 4: Fix true/false questions stored with null answers
-- These need to be converted to proper multiple choice or marked for deletion
UPDATE questions
SET
  answers = ARRAY['Vrai', 'Faux']::text[],
  correct_answer = CASE
    WHEN correct_answer = 'true' THEN '0'
    WHEN correct_answer = 'false' THEN '1'
    ELSE '0'
  END
WHERE language = 'fr'
  AND subject = 'math'
  AND answers IS NULL
  AND correct_answer IN ('true', 'false');

-- Step 5: Delete questions that cannot be repaired
-- These are questions with empty correct_answer and no way to determine the right answer
DELETE FROM questions
WHERE language = 'fr'
  AND subject = 'math'
  AND validation_status = 'rejected'
  AND (correct_answer IS NULL OR correct_answer = '')
  AND id NOT IN (
    -- Keep questions we manually fixed in Step 3
    '333fbb04-a22d-4c8f-8af6-e38a2007360f'
  );

-- ============================================================
-- VALIDATION: Check repair results
-- ============================================================

-- Count questions by validation status
SELECT
  validation_status,
  COUNT(*) as count
FROM questions
WHERE language = 'fr' AND subject = 'math'
GROUP BY validation_status;

-- Check for any remaining invalid indices
SELECT
  id,
  question,
  answers,
  correct_answer,
  CASE
    WHEN correct_answer ~ '^[0-3]$' THEN 'VALID'
    ELSE 'INVALID'
  END as index_status
FROM questions
WHERE language = 'fr'
  AND subject = 'math'
  AND validation_status != 'rejected'
ORDER BY index_status, id
LIMIT 20;

-- ============================================================
-- POST-REPAIR: Reset validation status for repaired questions
-- ============================================================

UPDATE questions
SET validation_status = 'pending'
WHERE language = 'fr'
  AND subject = 'math'
  AND validation_status = 'rejected'
  AND correct_answer ~ '^[0-3]$'  -- Valid index
  AND answers IS NOT NULL
  AND array_length(answers, 1) = 4;  -- Has 4 answers

-- ============================================================
-- REPORT: Final statistics
-- ============================================================

SELECT
  'Total French Math Questions' as metric,
  COUNT(*) as value
FROM questions
WHERE language = 'fr' AND subject = 'math'

UNION ALL

SELECT
  'Repaired Questions',
  COUNT(*)
FROM questions
WHERE language = 'fr'
  AND subject = 'math'
  AND validation_status = 'pending'
  AND correct_answer ~ '^[0-3]$'

UNION ALL

SELECT
  'Still Rejected',
  COUNT(*)
FROM questions
WHERE language = 'fr'
  AND subject = 'math'
  AND validation_status = 'rejected'

UNION ALL

SELECT
  'Deleted (Unrecoverable)',
  (SELECT COUNT(*) FROM questions_backup_20251207) - COUNT(*)
FROM questions
WHERE language = 'fr' AND subject = 'math';

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- If this repair fails, restore from backup:
-- DELETE FROM questions WHERE language = 'fr' AND subject = 'math';
-- INSERT INTO questions SELECT * FROM questions_backup_20251207;
-- DROP TABLE questions_backup_20251207;
-- ============================================================
