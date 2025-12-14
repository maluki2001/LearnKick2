#!/usr/bin/env python3
"""Fix the import SQL file to include required school_id and created_by fields"""

import re

# Read the original import file
with open('import-questions.sql', 'r') as f:
    content = f.read()

# Add the setup SQL at the beginning
setup_sql = """-- FIXED LearnKick Questions Import
-- Run this script in your Supabase SQL Editor

-- Temporarily disable RLS for import
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Create default school and user
INSERT INTO schools (id, name, domain, subscription_type, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo School', 'demo.edu', 'free', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, full_name, role, school_id, created_at, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'admin@demo.edu', 'Admin User', 'admin', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

"""

# Fix the INSERT statements
# Replace the column list
content = content.replace(
    'INSERT INTO questions (type, subject, grade, difficulty, language, question, statement, answers, correct_index, correct_answer, explanation, unit, image_url, tags, time_limit, created_at, updated_at)',
    'INSERT INTO questions (school_id, created_by, type, subject, grade, difficulty, language, question, statement, answers, correct_index, correct_answer, explanation, unit, image_url, tags, time_limit, created_at, updated_at)'
)

# Fix the VALUES clauses - add UUID values at the beginning of each row
content = re.sub(
    r'VALUES\n\(',
    "VALUES\n(\n    '11111111-1111-1111-1111-111111111111',\n    '22222222-2222-2222-2222-222222222222',",
    content
)

# Also fix individual value rows in multi-insert statements
content = re.sub(
    r',\n\(',
    ",\n(\n    '11111111-1111-1111-1111-111111111111',\n    '22222222-2222-2222-2222-222222222222',",
    content
)

# Replace the header
content = content.replace('-- LearnKick Questions Import', '-- FIXED LearnKick Questions Import')
content = content.replace('-- Temporarily disable RLS for import\nALTER TABLE questions DISABLE ROW LEVEL SECURITY;\n\n', '')

# Write the fixed file
with open('import-questions-FIXED.sql', 'w') as f:
    f.write(setup_sql + content)

print('✅ Created fixed import file: import-questions-FIXED.sql')
print('📁 File size:', len(setup_sql + content), 'characters')
print('🎯 Now copy and paste this file contents into Supabase SQL Editor')