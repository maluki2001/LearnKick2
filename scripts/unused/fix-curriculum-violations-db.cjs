// Direct database script to fix Lehrplan 21 curriculum violations
// This script connects directly to PostgreSQL and fixes the 6 violations

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env.local
function loadDatabaseUrl() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
  if (!match) {
    console.error('ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  return match[1];
}

// The 6 curriculum violations to fix
const violations = [
  {
    id: '71160901-0e31-4e23-ba04-2c9b0fe93d02',
    currentGrade: 3,
    newGrade: 4,
    language: 'en',
    reason: 'What is 999 + 111? (sum=1110 > 1000, exceeds Grade 3 limit)'
  },
  {
    id: '474cc6f6-0d3c-4322-aa46-59de4d1b11cb',
    currentGrade: 2,
    newGrade: 3,
    language: 'en',
    reason: 'What is 125 + 75? (sum=200 > 100, exceeds Grade 2 limit)'
  },
  {
    id: '9115534d-858b-4915-8de7-301d594532b5',
    currentGrade: 3,
    newGrade: 4,
    language: 'fr',
    reason: 'Combien font 1500 - 756? (minuend=1500 > 1000, exceeds Grade 3 limit)'
  },
  {
    id: '9ea396c8-bf94-4543-8aaa-5d645f421ae1',
    currentGrade: 3,
    newGrade: 4,
    language: 'fr',
    reason: 'Combien font 856 + 379 + 248? (sum=1483 > 1000, exceeds Grade 3 limit)'
  },
  {
    id: '8b6194c9-380f-4db6-a3b3-3753046ae71a',
    currentGrade: 3,
    newGrade: 4,
    language: 'fr',
    reason: 'Combien font 739 + 486? (sum=1225 > 1000, exceeds Grade 3 limit)'
  },
  {
    id: '3dd5aff6-d8c5-4fc8-9392-d1a4873bb8e4',
    currentGrade: 3,
    newGrade: 4,
    language: 'fr',
    reason: 'Combien font 647 + 358? (sum=1005 > 1000, exceeds Grade 3 limit)'
  }
];

async function main() {
  console.log('='.repeat(70));
  console.log('LEHRPLAN 21 CURRICULUM VIOLATION FIXER - DIRECT DATABASE');
  console.log('='.repeat(70));
  console.log('');

  const databaseUrl = loadDatabaseUrl();
  console.log('Connecting to database...');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('Connected successfully!\n');

    // First, verify the questions exist and show their current state
    console.log('='.repeat(70));
    console.log('VERIFYING QUESTIONS BEFORE FIX');
    console.log('='.repeat(70));
    console.log('');

    for (const v of violations) {
      const result = await client.query(
        'SELECT id, question, grade, language FROM questions WHERE id = $1',
        [v.id]
      );

      if (result.rows.length > 0) {
        const q = result.rows[0];
        console.log(`[${q.language.toUpperCase()}] Grade ${q.grade}: "${q.question?.substring(0, 50)}..."`);
        console.log(`   ID: ${q.id}`);
        console.log(`   Expected: Grade ${v.currentGrade} -> ${v.newGrade}`);
        console.log('');
      } else {
        console.log(`WARNING: Question ${v.id} not found!`);
      }
    }

    // Apply the fixes
    console.log('='.repeat(70));
    console.log('APPLYING FIXES');
    console.log('='.repeat(70));
    console.log('');

    let fixed = 0;
    let failed = 0;

    for (const v of violations) {
      process.stdout.write(`Fixing ${v.id.substring(0, 8)}... `);

      try {
        const result = await client.query(
          `UPDATE questions
           SET grade = $1, updated_at = NOW()
           WHERE id = $2 AND grade = $3
           RETURNING id, question, grade`,
          [v.newGrade, v.id, v.currentGrade]
        );

        if (result.rowCount > 0) {
          console.log(`OK (Grade ${v.currentGrade} -> ${v.newGrade})`);
          fixed++;
        } else {
          // Check if question exists but has different grade
          const check = await client.query(
            'SELECT grade FROM questions WHERE id = $1',
            [v.id]
          );
          if (check.rows.length > 0) {
            const currentGrade = check.rows[0].grade;
            if (currentGrade === v.newGrade) {
              console.log(`SKIPPED (already at Grade ${v.newGrade})`);
              fixed++; // Count as success since it's already correct
            } else {
              console.log(`FAILED (current grade is ${currentGrade}, expected ${v.currentGrade})`);
              failed++;
            }
          } else {
            console.log('FAILED (question not found)');
            failed++;
          }
        }
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        failed++;
      }
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('VERIFYING QUESTIONS AFTER FIX');
    console.log('='.repeat(70));
    console.log('');

    for (const v of violations) {
      const result = await client.query(
        'SELECT id, question, grade, language FROM questions WHERE id = $1',
        [v.id]
      );

      if (result.rows.length > 0) {
        const q = result.rows[0];
        const status = q.grade === v.newGrade ? '✅' : '❌';
        console.log(`${status} [${q.language.toUpperCase()}] Grade ${q.grade}: "${q.question?.substring(0, 50)}..."`);
      }
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('FIX SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total violations: ${violations.length}`);
    console.log(`Successfully fixed: ${fixed}`);
    console.log(`Failed: ${failed}`);
    console.log('');

    if (failed === 0) {
      console.log('All curriculum violations have been fixed!');
      console.log('Questions now comply with Swiss Lehrplan 21 math standards.');
    }

    client.release();
  } catch (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
