#!/usr/bin/env node
/**
 * Import Balance Questions to Database
 * Imports 1,804 questions to achieve 50/50 MC/TF balance
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function importQuestions() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          IMPORTING BALANCE QUESTIONS TO DATABASE         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const questionsPath = path.join(__dirname, 'balance-questions-1804.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  console.log(`Loading ${questions.length} questions...\n`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let imported = 0;
    let skipped = 0;
    const errors = [];

    // Get or create a default school and user for bulk imports
    const schoolResult = await client.query(`
      SELECT id FROM schools LIMIT 1
    `);

    const userResult = await client.query(`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `);

    const schoolId = schoolResult.rows[0]?.id;
    const userId = userResult.rows[0]?.id;

    if (!schoolId || !userId) {
      throw new Error('No school or admin user found in database. Please create them first.');
    }

    console.log(`Using school_id: ${schoolId}`);
    console.log(`Using created_by: ${userId}\n`);

    for (const q of questions) {
      try {
        // Check if question with this unique text already exists
        const existingCheck = await client.query(
          'SELECT id FROM questions WHERE question = $1 AND language = $2 AND type = $3',
          [q.question, q.language, q.type]
        );

        if (existingCheck.rows.length > 0) {
          skipped++;
          continue;
        }

        const insertQuery = `
          INSERT INTO questions (
            school_id, created_by, type, subject, grade, difficulty, language,
            lehrplan21_code, competency_level, question, answers,
            correct_index, explanation, tags, time_limit,
            validation_status, created_at, updated_at, is_active
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[],
            $12, $13, $14::text[], $15, $16, $17, $18, $19
          )
          RETURNING id
        `;

        await client.query(insertQuery, [
          schoolId,
          userId,
          q.type,
          q.subject,
          q.grade,
          q.difficulty,
          q.language,
          q.lehrplan21Code,
          q.competencyLevel?.toString() || '1',
          q.question,
          q.answers,
          q.correctIndex,
          q.explanation || '',
          q.tags,
          q.timeLimit,
          'approved',
          new Date(),
          new Date(),
          true
        ]);

        imported++;

        if (imported % 100 === 0) {
          console.log(`  Imported ${imported}/${questions.length} questions...`);
        }
      } catch (err) {
        skipped++;
        errors.push({ id: q.id, error: err.message });
      }
    }

    await client.query('COMMIT');

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                  IMPORT COMPLETE!                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped (errors):      ${skipped}\n`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('Errors encountered:');
      errors.forEach(e => console.log(`  ${e.id}: ${e.error}`));
      console.log();
    }

    // Verify database counts
    console.log('Verifying database counts...\n');

    const countQuery = `
      SELECT
        language,
        type,
        COUNT(*) as count
      FROM questions
      GROUP BY language, type
      ORDER BY language, type
    `;

    const result = await client.query(countQuery);

    console.log('DATABASE COUNTS BY LANGUAGE AND TYPE:');
    result.rows.forEach(row => {
      console.log(`  ${row.language.toUpperCase()} ${row.type}: ${row.count}`);
    });
    console.log();

    // Overall counts
    const overallQuery = `
      SELECT
        type,
        COUNT(*) as count
      FROM questions
      GROUP BY type
      ORDER BY type
    `;

    const overallResult = await client.query(overallQuery);

    console.log('OVERALL TYPE DISTRIBUTION:');
    overallResult.rows.forEach(row => {
      console.log(`  ${row.type}: ${row.count}`);
    });
    console.log();

    // Calculate balance
    const mcCount = overallResult.rows.find(r => r.type === 'multiple-choice')?.count || 0;
    const tfCount = overallResult.rows.find(r => r.type === 'true-false')?.count || 0;
    const total = parseInt(mcCount) + parseInt(tfCount);
    const mcPercent = ((mcCount / total) * 100).toFixed(2);
    const tfPercent = ((tfCount / total) * 100).toFixed(2);

    console.log('BALANCE ANALYSIS:');
    console.log(`  Total (excluding number-input): ${total}`);
    console.log(`  Multiple-choice: ${mcCount} (${mcPercent}%)`);
    console.log(`  True-false:      ${tfCount} (${tfPercent}%)`);
    console.log(`  Difference:      ${Math.abs(mcCount - tfCount)}`);
    console.log();

    if (Math.abs(mcCount - tfCount) <= 10) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║          ✓ 50/50 BALANCE ACHIEVED!                       ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
    } else {
      console.log(`Still need to balance: ${Math.abs(mcCount - tfCount)} questions\n`);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('IMPORT FAILED:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  console.error('Please set DATABASE_URL in .env.local');
  process.exit(1);
}

importQuestions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
