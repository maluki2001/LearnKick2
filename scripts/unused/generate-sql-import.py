#!/usr/bin/env python3
"""
Generate SQL INSERT statements for importing questions directly into Supabase
"""

import csv
import json
import uuid
from datetime import datetime

def escape_sql_string(s):
    """Escape string for SQL"""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"

def main():
    input_file = './learnkick-questions-simple.csv'
    output_file = './import-questions.sql'
    
    print("🔄 Generating SQL import script...")
    
    sql_statements = []
    
    # Add header
    sql_statements.append("-- LearnKick Questions Import")
    sql_statements.append("-- Run this script in your Supabase SQL Editor")
    sql_statements.append("-- Generated on: " + datetime.now().isoformat())
    sql_statements.append("")
    
    # Disable RLS temporarily for import
    sql_statements.append("-- Temporarily disable RLS for import")
    sql_statements.append("ALTER TABLE questions DISABLE ROW LEVEL SECURITY;")
    sql_statements.append("")
    
    questions_count = 0
    batch_size = 50
    current_batch = []
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        for row in reader:
            questions_count += 1
            
            # Parse JSON fields safely
            answers = 'NULL'
            if row['answers'] and row['answers'].strip():
                try:
                    answers_list = json.loads(row['answers'])
                    # Convert to PostgreSQL array format
                    answers = "ARRAY[" + ','.join([escape_sql_string(a) for a in answers_list]) + "]"
                except:
                    answers = 'NULL'
            
            tags = 'NULL'
            if row['tags'] and row['tags'].strip():
                try:
                    tags_list = json.loads(row['tags'])
                    # Convert to PostgreSQL array format
                    tags = "ARRAY[" + ','.join([escape_sql_string(t) for t in tags_list]) + "]"
                except:
                    tags = 'NULL'
            
            # Handle correct_index
            correct_index = 'NULL'
            if row['correct_index'] and row['correct_index'].strip():
                try:
                    correct_index = str(int(row['correct_index']))
                except:
                    correct_index = 'NULL'
            
            # Handle time_limit
            time_limit = '15000'  # default
            if row['time_limit'] and row['time_limit'].strip():
                try:
                    time_limit = str(int(row['time_limit']))
                except:
                    time_limit = '15000'
            
            # Build values string
            values = f"""(
    {escape_sql_string(row['type'])},
    {escape_sql_string(row['subject'])},
    {int(row['grade'])},
    {int(row['difficulty'])},
    {escape_sql_string(row['language'])},
    {escape_sql_string(row['question'])},
    {escape_sql_string(row['statement'])},
    {answers},
    {correct_index},
    {escape_sql_string(row['correct_answer'])},
    {escape_sql_string(row['explanation'])},
    {escape_sql_string(row['unit'])},
    {escape_sql_string(row['image_url'])},
    {tags},
    {time_limit},
    NOW(),
    NOW()
)"""
            
            current_batch.append(values)
            
            # Write batch when it's full
            if len(current_batch) >= batch_size:
                sql_statements.append(f"-- Batch {len(sql_statements)//3}")
                sql_statements.append(f"INSERT INTO questions (type, subject, grade, difficulty, language, question, statement, answers, correct_index, correct_answer, explanation, unit, image_url, tags, time_limit, created_at, updated_at)")
                sql_statements.append("VALUES")
                sql_statements.append(',\n'.join(current_batch) + ';')
                sql_statements.append("")
                current_batch = []
    
    # Write remaining batch
    if current_batch:
        sql_statements.append(f"-- Final batch")
        sql_statements.append(f"INSERT INTO questions (type, subject, grade, difficulty, language, question, statement, answers, correct_index, correct_answer, explanation, unit, image_url, tags, time_limit, created_at, updated_at)")
        sql_statements.append("VALUES")
        sql_statements.append(',\n'.join(current_batch) + ';')
        sql_statements.append("")
    
    # Re-enable RLS
    sql_statements.append("-- Re-enable RLS after import")
    sql_statements.append("ALTER TABLE questions ENABLE ROW LEVEL SECURITY;")
    sql_statements.append("")
    sql_statements.append(f"-- Import complete: {questions_count} questions added")
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write('\n'.join(sql_statements))
    
    print(f"✅ Generated SQL import script with {questions_count} questions")
    print(f"📁 Saved to: {output_file}")
    print(f"📝 File size: {len('\n'.join(sql_statements))} characters")
    print("\n🔧 To import:")
    print("1. Open your Supabase SQL Editor")
    print("2. Copy and paste the generated SQL script")
    print("3. Run the script")
    print("4. Your 1000 questions will be imported!")

if __name__ == '__main__':
    main()