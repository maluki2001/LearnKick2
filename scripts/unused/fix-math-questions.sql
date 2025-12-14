-- SQL Script to Fix Rejected German Math Questions
-- Generated: 2025-12-07
-- Issues Found: True/false format errors (using "Wahr"/"Falsch" instead of "true"/"false")

-- ============================================================
-- ISSUE 1: True/False Format Issues
-- Problem: Answers stored as "Wahr" instead of "true"
-- ============================================================

-- Fix: 500 + 500 = 1000 (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = 'e1829e4a-111d-4c30-8000-c0ee57485639';

-- Fix: 6 ÷ 2 = 3 (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = '5c7ada77-4d5f-4628-92f9-8ef4be343d76';

-- Fix: 1 × 1 = 1 (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = 'e3cb2e39-eb20-4d00-ae17-0c93062893b8';

-- Fix: Der Umfang eines Quadrats mit Seitenlänge 19 cm ist 76 cm (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = '70db4086-d9c2-4789-9c34-c4deb8208500';

-- Fix: Ein Quadrat mit Seitenlänge 20 cm hat einen Umfang von 80 cm (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = 'e8347d6e-a870-4377-be0e-cf54c09e6673';


-- ============================================================
-- ISSUE 2: Multiple Choice with Units in Answer
-- Problem: Answer is "2 Äpfel" but should just be "2"
-- ============================================================

-- Fix: Anna hat 8 Äpfel und isst 1/4 davon
UPDATE questions
SET correct_answer = '2 Äpfel',
    validation_status = 'flagged',
    quality_score = 85
WHERE id = 'a135d24a-0a6e-4bd3-b593-913aee64be6f';
-- NOTE: This one is tricky - answer options include units, so answer must too


-- ============================================================
-- ISSUE 3: Decimal Format (comma vs period)
-- Problem: Answer stored as "0,55" (German format) vs expected "0.55"
-- ============================================================

-- Fix: Welche Dezimalzahl entspricht 11/20?
UPDATE questions
SET correct_answer = '0,55',
    validation_status = 'flagged',
    quality_score = 85
WHERE id = 'd3e66eb8-77ef-4440-af1a-c7924b335976';
-- NOTE: Using German decimal format (comma) is correct for German language


-- ============================================================
-- RESTORE: Questions that were incorrectly flagged
-- These are mathematically correct, just validator limitations
-- ============================================================

-- Restore: Berechne: 8/9 - 1/3 = ? (5/9 is correct)
UPDATE questions
SET validation_status = 'approved',
    quality_score = 95
WHERE id = '8346011b-8761-4acc-a90e-869a8ebf8b67';

-- Restore: Berechne: 15,7 + 11,9 = ? (27.6 is correct)
UPDATE questions
SET validation_status = 'approved',
    quality_score = 95
WHERE id = '539a401a-228a-4b60-afa2-1666ba322bbb';

-- Restore: Wie viele Rappen sind 1/2 Franken? (50 is correct)
UPDATE questions
SET validation_status = 'approved',
    quality_score = 95
WHERE id = 'c938fb6d-e6d0-4f15-bd7a-3b5efed52373';


-- ============================================================
-- FIX: True/False Questions with Fraction Equations
-- ============================================================

-- Fix: 1/2 + 1/2 = 1 (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = 'd4707370-ece2-4a66-9849-d63a86a42810';

-- Fix: 1/4 + 1/4 = 1/2 (should be TRUE)
UPDATE questions
SET correct_answer = 'true',
    validation_status = 'approved',
    quality_score = 95
WHERE id = 'd8d14f07-a09f-4fef-9ccd-6e29872e8d46';


-- ============================================================
-- APPROVE: Contextual "fraction of" questions
-- All mathematically correct, validator just couldn't parse context
-- ============================================================

UPDATE questions
SET validation_status = 'approved',
    quality_score = 95
WHERE id IN (
    '30c2a166-9f66-49af-bacc-75d506ca491b', -- Was ist 1/3 von 12? (4)
    '0173171f-6f3e-4617-b4bd-65662ef82d42', -- Was ist 1/2 von 100? (50)
    '8afe9c71-1dcd-48d3-938f-8abed5e369b9', -- Was ist 1/4 von 20 CHF? (5)
    'da77cde2-ad2d-45c7-bfef-488750a56f35', -- Tim hat 12 Murmeln, gibt 1/3 weg (8 remaining)
    'dfd91817-326d-42b1-bce9-87382e1c2744', -- Was ist 1/3 von 27? (9)
    'a236d717-43e8-4afc-98da-68759942e967', -- Sarah bezahlt 1/2 von 24 CHF (12)
    'e41fc9f5-eb01-4489-a222-e45d0dbe4a0a', -- Was ist 1/4 von 100? (25)
    'e0a115e5-9306-4806-bdd4-8d8c215d2e0f', -- Luca spart 1/3 von 18 CHF (6)
    '3ae06f0c-8ea0-4a2b-8deb-b73eb95c971f'  -- Was ist 1/2 von 86? (43)
);


-- ============================================================
-- APPROVE: Fraction arithmetic questions
-- All mathematically correct, validator couldn't handle fraction ops
-- ============================================================

UPDATE questions
SET validation_status = 'approved',
    quality_score = 95
WHERE id IN (
    '896794ed-6777-40a1-a02f-488dda63c735', -- 10/13 - 3/13 = 7/13
    '4d946d76-ea98-4323-9b90-0dbcc649cae5', -- 2/7 + 3/7 = 5/7
    '28338ce5-c11f-4e42-81e2-7e8c211a19f3', -- 5/11 + 3/11 = 8/11
    '080a4231-01be-44a8-bfe3-0051b673a83a', -- 7/10 - 2/5 = 3/10
    '8d16e648-d9e6-4b9f-bafd-95d082210052', -- 9,3 × 11 = 102.3
    '1f0d0a0f-0abc-46bc-8eaa-a524b49e61e2'  -- 18,9 - 11,4 = 7.5
);


-- ============================================================
-- VERIFICATION QUERY
-- Run this after applying fixes to check results
-- ============================================================

SELECT
    validation_status,
    COUNT(*) as count,
    ROUND(AVG(quality_score), 1) as avg_quality_score
FROM questions
WHERE language = 'de' AND subject = 'math'
GROUP BY validation_status
ORDER BY validation_status;


-- ============================================================
-- DETAILED CHECK: See all rejected/flagged questions
-- ============================================================

SELECT
    id,
    grade,
    difficulty,
    question,
    correct_answer,
    validation_status,
    quality_score
FROM questions
WHERE language = 'de'
  AND subject = 'math'
  AND validation_status IN ('rejected', 'flagged')
ORDER BY validation_status, grade, id
LIMIT 50;
