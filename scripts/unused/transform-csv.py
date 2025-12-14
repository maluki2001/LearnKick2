#!/usr/bin/env python3
"""
LearnKick CSV Transformation Script
Transforms the original 1000 questions CSV to match the current database schema

Author: Senior Database Administrator
Date: 2025-09-06
"""

import csv
import json
import uuid
from datetime import datetime

# Subject mapping from CSV to database UUIDs
SUBJECT_MAPPING = {
    'general-knowledge': {
        'id': str(uuid.uuid4()),
        'name': 'General Knowledge',
        'slug': 'general-knowledge'
    },
    'math': {
        'id': str(uuid.uuid4()),
        'name': 'Mathematics', 
        'slug': 'math'
    },
    'geography': {
        'id': str(uuid.uuid4()),
        'name': 'Geography',
        'slug': 'geography'
    },
    'language': {
        'id': str(uuid.uuid4()),
        'name': 'Language',
        'slug': 'language'
    },
    'science': {
        'id': str(uuid.uuid4()),
        'name': 'Science',
        'slug': 'science'
    },
    'history': {
        'id': str(uuid.uuid4()),
        'name': 'History',
        'slug': 'history'
    },
    'art': {
        'id': str(uuid.uuid4()),
        'name': 'Art',
        'slug': 'art'
    }
}

# Placeholder UUIDs for required foreign keys
DEFAULT_SCHOOL_ID = str(uuid.uuid4())
DEFAULT_USER_ID = str(uuid.uuid4())

def calculate_time_limit(grade, difficulty):
    """Calculate time limit based on grade and difficulty"""
    # Base time decreases with grade, increases with difficulty
    base_time = max(8000, 20000 - (grade * 2000))  # 18s for grade 1, 8s for grade 6
    difficulty_multiplier = 0.5 + (difficulty * 0.3)  # 0.8x to 2.0x
    return int(base_time * difficulty_multiplier)

def generate_lehrplan21_topic(subject, grade):
    """Generate Lehrplan21 topic code"""
    topic_map = {
        'math': f"MA.{min(3, (grade + 1) // 2)}.A.{grade}",
        'geography': f"NMG.8.{min(4, grade)}",
        'language': f"D.{min(6, grade + 1)}.A.1",
        'general-knowledge': f"NMG.{min(12, grade + 1)}.1",
        'science': f"NMG.{min(6, grade + 1)}.1",
        'history': f"NMG.9.{min(4, grade)}",
        'art': f"BG.{min(3, (grade + 1) // 2)}.A.1"
    }
    return topic_map.get(subject, f"{subject.upper()}.{grade}.1")

def parse_tags(tags_string):
    """Convert semicolon-separated tags to array format"""
    if not tags_string:
        return []
    return [tag.strip() for tag in tags_string.split(';') if tag.strip()]

def build_answers_array(row):
    """Build answers array from individual answer columns"""
    answers = []
    for col in ['Answer A', 'Answer B', 'Answer C', 'Answer D']:
        if row[col].strip():
            answers.append(row[col].strip())
    return answers

def transform_row(row):
    """Transform a single CSV row to match database schema"""
    subject = row['Subject'].lower()
    grade = int(row['Grade'])
    difficulty = int(row['Difficulty'])
    
    # Get subject_id from mapping
    subject_id = SUBJECT_MAPPING.get(subject, SUBJECT_MAPPING['general-knowledge'])['id']
    
    # Build answers array for multiple choice and image questions
    answers = []
    if row['Type'] in ['multiple-choice', 'image-question']:
        answers = build_answers_array(row)
    
    # Parse correct index
    correct_index = None
    if row['Correct Index']:
        try:
            correct_index = int(float(row['Correct Index']))
        except (ValueError, TypeError):
            correct_index = None
    
    # Parse tags
    tags = parse_tags(row['Tags'])
    
    # Calculate time limit
    time_limit = calculate_time_limit(grade, difficulty)
    
    # Generate Lehrplan21 topic
    lehrplan21_topic = generate_lehrplan21_topic(subject, grade)
    
    # Build transformed row
    transformed = {
        'id': str(uuid.uuid4()) if row['ID'].startswith('q_') else row['ID'],
        'school_id': DEFAULT_SCHOOL_ID,
        'created_by': DEFAULT_USER_ID,
        'type': row['Type'],
        'subject_id': subject_id,
        'subject': subject,
        'grade': grade,
        'difficulty': difficulty,
        'language': row['Language'],
        'question': row['Question'] if row['Question'] else None,
        'statement': row['Statement'] if row['Statement'] else None,
        'answers': json.dumps(answers) if answers else None,
        'correct_index': correct_index,
        'correct_answer': row['Correct Answer'] if row['Correct Answer'] else None,
        'explanation': row['Explanation'] if row['Explanation'] else None,
        'unit': row['Unit'] if row['Unit'] else None,
        'image_url': row['Image URL'] if row['Image URL'] else None,
        'tags': json.dumps(tags) if tags else None,
        'time_limit': time_limit,
        'lehrplan21_topic': lehrplan21_topic,
        'is_active': True,
        'created_at': row['Created At'] if row['Created At'] else datetime.now().isoformat(),
        'updated_at': row['Updated At'] if row['Updated At'] else datetime.now().isoformat()
    }
    
    return transformed

def main():
    input_file = '/Users/arisejupi/Downloads/learnkick-questions-1000.csv'
    output_file = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/learnkick-questions-updated.csv'
    subjects_file = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/subjects-data.sql'
    
    print("🔄 Starting CSV transformation...")
    print(f"📖 Input file: {input_file}")
    print(f"💾 Output file: {output_file}")
    
    # Read input CSV and transform
    transformed_rows = []
    total_rows = 0
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        for row in reader:
            total_rows += 1
            try:
                transformed_row = transform_row(row)
                transformed_rows.append(transformed_row)
                
                if total_rows % 100 == 0:
                    print(f"✅ Processed {total_rows} rows...")
                    
            except Exception as e:
                print(f"❌ Error processing row {total_rows}: {e}")
                print(f"   Row data: {row}")
                continue
    
    # Write transformed CSV
    if transformed_rows:
        fieldnames = [
            'id', 'school_id', 'created_by', 'type', 'subject_id', 'subject',
            'grade', 'difficulty', 'language', 'question', 'statement', 
            'answers', 'correct_index', 'correct_answer', 'explanation',
            'unit', 'image_url', 'tags', 'time_limit', 'lehrplan21_topic',
            'is_active', 'created_at', 'updated_at'
        ]
        
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(transformed_rows)
    
    # Generate subjects SQL
    with open(subjects_file, 'w', encoding='utf-8') as sqlfile:
        sqlfile.write("-- Subjects data for LearnKick\n")
        sqlfile.write("-- Insert these subjects into your database first\n\n")
        
        sqlfile.write("-- Default school and user for import\n")
        sqlfile.write(f"-- DEFAULT_SCHOOL_ID: {DEFAULT_SCHOOL_ID}\n")
        sqlfile.write(f"-- DEFAULT_USER_ID: {DEFAULT_USER_ID}\n\n")
        
        for subject_slug, subject_data in SUBJECT_MAPPING.items():
            sqlfile.write(
                f"INSERT INTO subjects (id, name, slug, school_id) VALUES "
                f"('{subject_data['id']}', '{subject_data['name']}', '{subject_slug}', NULL) "
                f"ON CONFLICT (slug) DO NOTHING;\n"
            )
    
    print(f"✅ Transformation complete!")
    print(f"📊 Total rows processed: {total_rows}")
    print(f"💾 Rows successfully transformed: {len(transformed_rows)}")
    print(f"📁 Updated CSV saved to: {output_file}")
    print(f"🗄️ Subjects SQL saved to: {subjects_file}")
    
    # Summary of subjects found
    subjects_found = set()
    for row in transformed_rows:
        subjects_found.add(row['subject'])
    
    print(f"\n📚 Subjects in dataset: {', '.join(sorted(subjects_found))}")
    
    # Summary by question type
    type_counts = {}
    for row in transformed_rows:
        qtype = row['type']
        type_counts[qtype] = type_counts.get(qtype, 0) + 1
    
    print(f"📝 Question types:")
    for qtype, count in sorted(type_counts.items()):
        print(f"   {qtype}: {count} questions")

if __name__ == '__main__':
    main()