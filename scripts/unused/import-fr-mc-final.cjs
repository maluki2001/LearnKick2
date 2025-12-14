#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function importQuestions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Read the JSON file
    const filePath = path.join(__dirname, 'fr-mc-final.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(jsonData);

    console.log(`📚 Found ${questions.length} questions to import`);

    let successCount = 0;
    let errorCount = 0;

    for (const q of questions) {
      try {
        // Map difficulty text to numbers: easy=1, medium=3, hard=5
        const difficultyMap = { 'easy': 1, 'medium': 3, 'hard': 5 };
        const difficultyValue = difficultyMap[q.difficulty] || 3;

        await pool.query(
          `INSERT INTO questions (
            type,
            language,
            grade,
            subject,
            question,
            answers,
            correct_answer,
            explanation,
            difficulty,
            school_id,
            created_by,
            validation_status
          ) VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10, $11, $12)`,
          [
            q.question_type,  // type (e.g., 'multiple-choice')
            q.language,       // language (e.g., 'fr')
            q.grade_level,    // grade (1-6)
            q.subject,        // subject (e.g., 'math', 'french', 'science', 'geography')
            q.question,       // question text
            q.options,        // answers array (PostgreSQL text[])
            q.correct_answer, // correct_answer
            q.explanation || null,  // explanation
            difficultyValue,  // difficulty (1, 3, or 5)
            null,            // school_id (NULL for global questions)
            null,            // created_by (NULL for system-generated)
            'approved'       // validation_status
          ]
        );
        successCount++;
        console.log(`✅ Imported: ${q.question.substring(0, 50)}...`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Error importing question: ${err.message}`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${questions.length}`);

    // Get total count in database
    const result = await pool.query(
      `SELECT COUNT(*) as total FROM questions WHERE language = 'fr'`
    );
    console.log(`\n🇫🇷 Total French questions in database: ${result.rows[0].total}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await pool.end();
  }
}

importQuestions();
