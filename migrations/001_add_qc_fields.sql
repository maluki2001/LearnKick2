-- Migration 001: Add Quality Control Fields to Questions Table
-- Enhances questions table for 8,000-question system with QC validation

-- Add QC and validation fields
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS validation_status TEXT
  CHECK (validation_status IN (
    'draft', 'pending_qc', 'qc_passed', 'qc_failed',
    'flagged', 'approved', 'rejected'
  )) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS quality_score INTEGER
  CHECK (quality_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS qc_agent_report JSONB,
ADD COLUMN IF NOT EXISTS generated_by TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS review_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS lehrplan21_code TEXT,
ADD COLUMN IF NOT EXISTS competency_level TEXT;

-- Add index for validation status queries
CREATE INDEX IF NOT EXISTS idx_questions_validation_status
  ON questions(validation_status);

-- Add index for quality score filtering
CREATE INDEX IF NOT EXISTS idx_questions_quality_score
  ON questions(quality_score DESC);

-- Add index for lehrplan21 queries
CREATE INDEX IF NOT EXISTS idx_questions_lehrplan21_code
  ON questions(lehrplan21_code);

-- Add comments for documentation
COMMENT ON COLUMN questions.validation_status IS
  'QC workflow status: draft → pending_qc → qc_passed/failed → approved/rejected';
COMMENT ON COLUMN questions.quality_score IS
  'QC agent quality rating (0-100), 90+ recommended for production';
COMMENT ON COLUMN questions.qc_agent_report IS
  'Full QC validation report with errors, warnings, suggestions';
COMMENT ON COLUMN questions.lehrplan21_code IS
  'Swiss curriculum code (e.g., MA.1.A.2 for Math Grade 1)';
