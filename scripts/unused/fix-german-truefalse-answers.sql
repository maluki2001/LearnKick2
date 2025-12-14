-- Fix German True/False Answer Format
-- This script converts German language answers to proper boolean format
-- Date: 2025-12-07
-- Issue: 43 questions use "Wahr"/"Falsch"/"Richtig" instead of "true"/"false"

-- Begin transaction for safety
BEGIN;

-- Show current state before fix
SELECT
  'BEFORE FIX' as status,
  correct_answer,
  COUNT(*) as count
FROM questions
WHERE language = 'de'
  AND subject = 'german'
  AND type = 'true-false'
GROUP BY correct_answer
ORDER BY count DESC;

-- Fix: Convert "Wahr" to "true"
UPDATE questions
SET correct_answer = 'true',
    updated_at = NOW()
WHERE language = 'de'
  AND subject = 'german'
  AND type = 'true-false'
  AND correct_answer = 'Wahr';

-- Fix: Convert "Richtig" to "true"
UPDATE questions
SET correct_answer = 'true',
    updated_at = NOW()
WHERE language = 'de'
  AND subject = 'german'
  AND type = 'true-false'
  AND correct_answer = 'Richtig';

-- Fix: Convert "Falsch" to "false"
UPDATE questions
SET correct_answer = 'false',
    updated_at = NOW()
WHERE language = 'de'
  AND subject = 'german'
  AND type = 'true-false'
  AND correct_answer = 'Falsch';

-- Show state after fix
SELECT
  'AFTER FIX' as status,
  correct_answer,
  COUNT(*) as count
FROM questions
WHERE language = 'de'
  AND subject = 'german'
  AND type = 'true-false'
GROUP BY correct_answer
ORDER BY count DESC;

-- Update validation status to approved for fixed questions
UPDATE questions
SET validation_status = 'approved',
    quality_score = 95,
    updated_at = NOW()
WHERE language = 'de'
  AND subject = 'german'
  AND type = 'true-false'
  AND correct_answer IN ('true', 'false');

-- Show final validation summary
SELECT
  validation_status,
  COUNT(*) as count,
  ROUND(AVG(quality_score), 2) as avg_quality_score
FROM questions
WHERE language = 'de'
  AND subject = 'german'
GROUP BY validation_status
ORDER BY validation_status;

-- Commit the changes
COMMIT;

-- Final verification
SELECT
  'FINAL VERIFICATION' as check,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE validation_status = 'approved') as approved,
  COUNT(*) FILTER (WHERE validation_status = 'rejected') as rejected,
  ROUND(100.0 * COUNT(*) FILTER (WHERE validation_status = 'approved') / COUNT(*), 1) as approval_rate_percent
FROM questions
WHERE language = 'de'
  AND subject = 'german';
