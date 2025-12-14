-- Migration: 009_global_questions.sql
-- Purpose: Allow global questions (school_id IS NULL) for system-wide question bank
-- Date: 2025-12-07

-- ===========================================
-- Step 1: Alter questions table to allow NULL school_id
-- ===========================================

-- Drop the NOT NULL constraint on school_id
ALTER TABLE questions ALTER COLUMN school_id DROP NOT NULL;

-- Drop the NOT NULL constraint on created_by if it exists
ALTER TABLE questions ALTER COLUMN created_by DROP NOT NULL;

-- ===========================================
-- Step 2: Create index for global questions
-- ===========================================

-- Add index for efficient querying of global questions
CREATE INDEX IF NOT EXISTS idx_questions_global ON questions(school_id) WHERE school_id IS NULL;

-- Add index for combined subject/grade/language queries on global questions
CREATE INDEX IF NOT EXISTS idx_questions_global_filters ON questions(subject, grade, language) WHERE school_id IS NULL;

-- ===========================================
-- Step 3: Update RLS policies for global questions (if using RLS)
-- ===========================================

-- Note: If you're using RLS, you may need to update policies to allow access to global questions
-- The following policies allow all authenticated users to read global questions

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view global questions" ON questions;

-- Create policy for viewing global questions
CREATE POLICY "Users can view global questions" ON questions
  FOR SELECT USING (school_id IS NULL);

-- ===========================================
-- Step 4: Insert sample global questions (optional)
-- ===========================================

-- Sample Math Question (Global)
INSERT INTO questions (
  id, school_id, created_by, type, subject, grade, difficulty, language,
  question, answers, correct_index, explanation, tags, time_limit
) VALUES (
  'global-math-sample-001',
  NULL,  -- Global question
  NULL,  -- No specific creator
  'multiple-choice',
  'math',
  3,
  2,
  'de',
  'Was ist 7 + 8?',
  ARRAY['13', '14', '15', '16'],
  2,
  '7 + 8 = 15',
  ARRAY['addition', 'grundrechnen'],
  15000
) ON CONFLICT (id) DO NOTHING;

-- Sample German Question (Global)
INSERT INTO questions (
  id, school_id, created_by, type, subject, grade, difficulty, language,
  question, statement, answers, correct_index, explanation, tags, time_limit
) VALUES (
  'global-german-sample-001',
  NULL,
  NULL,
  'true-false',
  'language',
  2,
  1,
  'de',
  NULL,
  'Ein Nomen wird immer gross geschrieben.',
  NULL,
  NULL,
  'Im Deutschen werden Nomen (Substantive) immer grossgeschrieben.',
  ARRAY['grammatik', 'nomen', 'rechtschreibung'],
  15000
) ON CONFLICT (id) DO NOTHING;

-- Sample Geography Question (Global)
INSERT INTO questions (
  id, school_id, created_by, type, subject, grade, difficulty, language,
  question, answers, correct_index, explanation, tags, time_limit
) VALUES (
  'global-geo-sample-001',
  NULL,
  NULL,
  'multiple-choice',
  'geography',
  4,
  2,
  'de',
  'Wie heisst die Hauptstadt der Schweiz?',
  ARRAY['Zürich', 'Bern', 'Genf', 'Basel'],
  1,
  'Bern ist die Bundesstadt (Hauptstadt) der Schweiz.',
  ARRAY['schweiz', 'hauptstadt', 'kantone'],
  15000
) ON CONFLICT (id) DO NOTHING;

COMMENT ON COLUMN questions.school_id IS 'NULL for global questions, UUID for school-specific questions';
