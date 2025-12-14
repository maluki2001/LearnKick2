/**
 * Import extra English and French questions to reach 8,000 target
 */
const { Pool } = require('pg');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const files = [
  'en-math-extra.json',
  'en-english-extra.json',
  'en-science-extra.json',
  'en-geography-extra.json',
  'fr-math-extra.json',
  'fr-french-extra.json',
  'fr-science-extra.json',
  'fr-geography-extra.json'
];

function parseQuestions(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(content);

    // Handle different formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    } else if (typeof data === 'object') {
      // Try to find an array property
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    return [];
  } catch (e) {
    console.log(`  Error parsing ${filePath}: ${e.message}`);
    return [];
  }
}

async function importQuestions() {
  const client = await pool.connect();

  try {
    // Get school and user IDs
    const schoolResult = await client.query('SELECT id FROM schools LIMIT 1');
    const userResult = await client.query('SELECT id FROM users LIMIT 1');

    const schoolId = schoolResult.rows[0]?.id || crypto.randomUUID();
    const userId = userResult.rows[0]?.id || crypto.randomUUID();

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('     IMPORTING EXTRA QUESTIONS (Target: 8,000)');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    let totalImported = 0;
    let totalSkipped = 0;
    let missingFiles = [];

    for (const file of files) {
      const filePath = `/Users/arisejupi/Desktop/LearnKick-LeanMVP/${file}`;

      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
        continue;
      }

      const questions = parseQuestions(filePath);

      if (questions.length === 0) {
        console.log(`  ${file}: No questions found`);
        continue;
      }

      let imported = 0;
      let skipped = 0;

      for (const q of questions) {
        try {
          // Normalize field names
          const question = q.question || q.text || '';
          const type = q.type || 'multiple-choice';
          const subject = q.subject || 'science';
          const grade = parseInt(q.grade) || 3;
          const difficulty = parseInt(q.difficulty) || 2;
          const language = q.language || (file.startsWith('en-') ? 'en' : 'fr');
          const correctAnswer = q.correctAnswer || q.correct_answer || q.answer || '';
          const options = q.options || q.answers || [];

          if (!question || question.length < 5) {
            skipped++;
            continue;
          }

          // Check for duplicate
          const existing = await client.query(
            'SELECT id FROM questions WHERE question = $1 AND language = $2 LIMIT 1',
            [question, language]
          );

          if (existing.rows.length > 0) {
            skipped++;
            continue;
          }

          // Insert question
          await client.query(`
            INSERT INTO questions (
              id, school_id, created_by, type, subject, grade, difficulty, language,
              question, answers, correct_answer, validation_status, quality_score,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', 90, NOW(), NOW()
            )
          `, [
            crypto.randomUUID(),
            schoolId,
            userId,
            type,
            subject,
            grade,
            difficulty,
            language,
            question,
            options.length > 0 ? options : null,
            correctAnswer
          ]);

          imported++;
        } catch (e) {
          skipped++;
        }
      }

      console.log(`  ${file}: ${imported} imported, ${skipped} skipped`);
      totalImported += imported;
      totalSkipped += skipped;
    }

    if (missingFiles.length > 0) {
      console.log(`\nMissing files (not yet generated):`);
      missingFiles.forEach(f => console.log(`  - ${f}`));
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('                 IMPORT COMPLETE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Total Imported: ${totalImported}`);
    console.log(`  Total Skipped: ${totalSkipped}`);

    // Get final counts
    const counts = await client.query(`
      SELECT language, COUNT(*) as count
      FROM questions
      GROUP BY language
      ORDER BY count DESC
    `);

    console.log('');
    console.log('Database totals:');
    let total = 0;
    counts.rows.forEach(r => {
      console.log(`  ${r.language.toUpperCase()}: ${r.count}`);
      total += parseInt(r.count);
    });
    console.log(`  ─────────────`);
    console.log(`  TOTAL: ${total}`);
    console.log('');

  } finally {
    client.release();
    await pool.end();
  }
}

importQuestions().catch(console.error);
