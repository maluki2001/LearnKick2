#!/usr/bin/env python3
"""
Create a simplified CSV that matches the actual database schema
"""

import csv
import json
import uuid
from datetime import datetime

def main():
    input_file = '/Users/arisejupi/Downloads/learnkick-questions-1000.csv'
    output_file = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/learnkick-questions-simple.csv'
    
    print("🔄 Creating simplified CSV for current database schema...")
    
    questions = []
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        for row in reader:
            # Build answers array
            answers = []
            if row['Type'] in ['multiple-choice', 'image-question']:
                for col in ['Answer A', 'Answer B', 'Answer C', 'Answer D']:
                    if row[col].strip():
                        answers.append(row[col].strip())
            
            # Parse correct index
            correct_index = None
            if row['Correct Index']:
                try:
                    correct_index = int(float(row['Correct Index']))
                except (ValueError, TypeError):
                    correct_index = None
            
            # Parse tags
            tags = []
            if row['Tags']:
                tags = [tag.strip() for tag in row['Tags'].split(';') if tag.strip()]
            
            # Calculate time limit
            grade = int(row['Grade'])
            difficulty = int(row['Difficulty'])
            base_time = max(8000, 20000 - (grade * 2000))
            difficulty_multiplier = 0.5 + (difficulty * 0.3)
            time_limit = int(base_time * difficulty_multiplier)
            
            # Create simplified question
            question = {
                'type': row['Type'],
                'subject': row['Subject'].lower(),
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
                'created_at': row['Created At'] if row['Created At'] else datetime.now().isoformat(),
                'updated_at': row['Updated At'] if row['Updated At'] else datetime.now().isoformat()
            }
            
            questions.append(question)
    
    # Write simplified CSV
    fieldnames = [
        'type', 'subject', 'grade', 'difficulty', 'language', 'question', 
        'statement', 'answers', 'correct_index', 'correct_answer', 
        'explanation', 'unit', 'image_url', 'tags', 'time_limit',
        'created_at', 'updated_at'
    ]
    
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(questions)
    
    print(f"✅ Created simplified CSV with {len(questions)} questions")
    print(f"📁 Saved to: {output_file}")

if __name__ == '__main__':
    main()