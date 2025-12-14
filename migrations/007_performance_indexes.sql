-- Migration 007: Performance Indexes for 8,000+ Questions
-- Optimize query performance for large question bank

-- Composite index for adaptive question selection (most common query)
CREATE INDEX IF NOT EXISTS idx_questions_adaptive_selection
  ON questions(language, grade, subject, difficulty, validation_status)
  WHERE validation_status = 'approved' AND is_active = true;

-- Index for random question selection
CREATE INDEX IF NOT EXISTS idx_questions_random_approved
  ON questions(id)
  WHERE validation_status = 'approved' AND is_active = true;

-- Index for QC pipeline queries
CREATE INDEX IF NOT EXISTS idx_questions_qc_pipeline
  ON questions(validation_status, language, created_at DESC)
  WHERE validation_status IN ('draft', 'pending_qc', 'flagged');

-- Index for subject-based queries
CREATE INDEX IF NOT EXISTS idx_questions_subject_language
  ON questions(subject, language, grade)
  WHERE is_active = true;

-- Index for school isolation (critical for multi-tenancy)
CREATE INDEX IF NOT EXISTS idx_questions_school_isolation
  ON questions(school_id, validation_status);

-- Partial index for high-quality questions
CREATE INDEX IF NOT EXISTS idx_questions_high_quality
  ON questions(quality_score DESC, language, subject)
  WHERE quality_score >= 90 AND validation_status = 'approved';

-- Index for Lehrplan 21 lookups
CREATE INDEX IF NOT EXISTS idx_questions_curriculum_lookup
  ON questions(lehrplan21_code, language, grade);

-- Statistics for query planner
ANALYZE questions;
ANALYZE question_performance;
ANALYZE question_validation_log;

COMMENT ON INDEX idx_questions_adaptive_selection IS
  'Optimizes ELO-based adaptive question retrieval';
COMMENT ON INDEX idx_questions_qc_pipeline IS
  'Speeds up QC dashboard and review queue queries';
