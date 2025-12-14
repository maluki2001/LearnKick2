-- LearnKick Database Schema for PostgreSQL (Neon)
-- This is a simplified version without Supabase auth dependencies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  admin_user_id UUID,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  max_students INTEGER DEFAULT 50,
  max_teachers INTEGER DEFAULT 3,
  settings JSONB DEFAULT '{
    "allow_parent_signup": true,
    "require_approval": false,
    "game_time_limits": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (simplified, no Supabase auth dependency)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent', 'student')),
  school_id UUID REFERENCES schools(id),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (simplified - no subject_id reference)
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  created_by UUID REFERENCES users(id),

  -- Question content
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'number-input', 'image-question')),
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  language TEXT NOT NULL CHECK (language IN ('en', 'de', 'fr')),

  -- Question data
  question TEXT,
  statement TEXT,
  answers TEXT[], -- Array for multiple choice answers
  correct_index INTEGER,
  correct_answer TEXT, -- For number input or text answers
  explanation TEXT,
  unit TEXT,
  image_url TEXT,
  tags TEXT[],

  -- Metadata
  time_limit INTEGER DEFAULT 15000, -- milliseconds
  lehrplan21_topic TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  student_id UUID REFERENCES users(id),

  -- Game configuration
  subject TEXT,
  grade INTEGER,
  difficulty INTEGER,
  language TEXT DEFAULT 'en',

  -- Session data
  questions_data JSONB, -- Store the questions for this session
  current_question INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- in seconds

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question answers tracking
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,

  -- Answer data
  user_answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER, -- milliseconds

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_school_subject_grade ON questions(school_id, subject, grade);
CREATE INDEX IF NOT EXISTS idx_questions_subject_grade_lang ON questions(subject, grade, language);
CREATE INDEX IF NOT EXISTS idx_game_sessions_student ON game_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_session ON question_answers(session_id);

-- Insert a default school for development
INSERT INTO schools (name, code, admin_user_id, subscription_plan)
VALUES ('Demo School', 'DEMO001', NULL, 'free')
ON CONFLICT (code) DO NOTHING;

-- Insert a default admin user for development
INSERT INTO users (email, full_name, role, school_id)
VALUES ('admin@demo.com', 'Demo Admin', 'admin', (SELECT id FROM schools WHERE code = 'DEMO001'))
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'LearnKick PostgreSQL schema created successfully!';
  RAISE NOTICE 'Default school created with code: DEMO001';
  RAISE NOTICE 'Default admin user: admin@demo.com';
END $$;
