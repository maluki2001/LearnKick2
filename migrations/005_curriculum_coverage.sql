-- Migration 005: Curriculum Coverage Tracking
-- Track question distribution across Lehrplan 21

CREATE TABLE IF NOT EXISTS curriculum_coverage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Curriculum identification
  curriculum_system TEXT NOT NULL, -- 'lehrplan21', 'plan-etudes-romand'
  curriculum_code TEXT NOT NULL, -- e.g., 'MA.1.A.2'
  subject TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  language TEXT CHECK (language IN ('de', 'en', 'fr')),

  -- Coverage metrics
  questions_count INTEGER DEFAULT 0,
  questions_approved INTEGER DEFAULT 0,
  target_count INTEGER DEFAULT 15, -- Minimum recommended

  -- Status
  coverage_status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN questions_approved >= target_count THEN 'complete'
      WHEN questions_approved >= (target_count / 2) THEN 'partial'
      ELSE 'insufficient'
    END
  ) STORED,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(curriculum_code, language)
);

-- Indexes
CREATE INDEX idx_curriculum_coverage_status
  ON curriculum_coverage(coverage_status);

CREATE INDEX idx_curriculum_coverage_subject_grade
  ON curriculum_coverage(subject, grade, language);

-- Function to update coverage counts
CREATE OR REPLACE FUNCTION update_curriculum_coverage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO curriculum_coverage (
    curriculum_system, curriculum_code, subject, grade, language,
    questions_count, questions_approved
  )
  SELECT
    'lehrplan21',
    NEW.lehrplan21_code,
    NEW.subject,
    NEW.grade,
    NEW.language,
    1,
    CASE WHEN NEW.validation_status = 'approved' THEN 1 ELSE 0 END
  ON CONFLICT (curriculum_code, language)
  DO UPDATE SET
    questions_count = curriculum_coverage.questions_count + 1,
    questions_approved = curriculum_coverage.questions_approved +
      CASE WHEN NEW.validation_status = 'approved' THEN 1 ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_curriculum_coverage
  AFTER INSERT OR UPDATE ON questions
  FOR EACH ROW
  WHEN (NEW.lehrplan21_code IS NOT NULL)
  EXECUTE FUNCTION update_curriculum_coverage();

COMMENT ON TABLE curriculum_coverage IS
  'Tracks Lehrplan 21 coverage to identify gaps';
