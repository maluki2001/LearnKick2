-- Migration 008: Offline Question Packs
-- Support for PWA offline question bundles

CREATE TABLE IF NOT EXISTS question_packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id),

  -- Pack identification
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL, -- Semantic versioning (e.g., '1.0.0')

  -- Pack criteria
  language TEXT NOT NULL CHECK (language IN ('de', 'en', 'fr')),
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  subjects TEXT[], -- Array of subject slugs

  -- Pack contents
  question_ids UUID[], -- Array of question IDs
  question_count INTEGER,
  pack_size_bytes INTEGER,

  -- Metadata
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for pack lookups
CREATE INDEX idx_question_packs_language_grade
  ON question_packs(language, grade, is_published);

CREATE INDEX idx_question_packs_school
  ON question_packs(school_id, is_published);

-- Table for pack download tracking
CREATE TABLE IF NOT EXISTS question_pack_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pack_id UUID REFERENCES question_packs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pack_downloads_user
  ON question_pack_downloads(user_id, downloaded_at DESC);

COMMENT ON TABLE question_packs IS
  'Pre-built question bundles for offline PWA gameplay';
