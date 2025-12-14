// Fix Grade 2 multiplication violations based on CORRECT Lehrplan 21 rules
// Grade 2 should ONLY have: 2x, 5x, and 10x multiplication tables
// All other multiplication (3x, 4x, 6x, 7x, 8x, 9x, etc.) must be moved to Grade 3

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

// CORRECT Lehrplan 21 Grade 2 multiplication rules:
// Only 2x, 5x, and 10x tables are allowed
const ALLOWED_GRADE2_TABLES = [2, 5, 10];

// Check if a multiplication pair is valid for Grade 2
// At least ONE factor must be 2, 5, or 10 for it to be a valid Grade 2 question
function isValidGrade2Multiplication(factor1, factor2) {
  return ALLOWED_GRADE2_TABLES.includes(factor1) || ALLOWED_GRADE2_TABLES.includes(factor2);
}

// Extract multiplication factors from question text
// Handles: 9 x 6, 9 * 6, 9 * 6, 9 mal 6, 9 fois 6, 9 times 6, etc.
function extractMultiplicationFactors(questionText) {
  const text = questionText || '';

  // Multiple patterns for different multiplication formats
  // Note: Using unicode multiplication sign (U+00D7) and regular x/X/* characters
  const patterns = [
    /(\d+)\s*[x*\u00D7]\s*(\d+)/i,     // 9 x 6, 9 * 6, 9 * 6
    /(\d+)\s*mal\s*(\d+)/i,             // German: 9 mal 6
    /(\d+)\s*fois\s*(\d+)/i,            // French: 9 fois 6
    /(\d+)\s*times\s*(\d+)/i,           // English: 9 times 6
    /multiply\s*(\d+)\s*(?:and|by)\s*(\d+)/i,  // multiply 9 by 6
    /multipliziere\s*(\d+)\s*(?:und|mit)\s*(\d+)/i,  // German
    /combien\s*font\s*(\d+)\s*[x*\u00D7]\s*(\d+)/i,  // French: Combien font 9 x 6
    /was\s*ist\s*(\d+)\s*[x*\u00D7]\s*(\d+)/i,       // German: Was ist 9 x 6
    /what\s*is\s*(\d+)\s*[x*\u00D7]\s*(\d+)/i,       // English: What is 9 x 6
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        factor1: parseInt(match[1]),
        factor2: parseInt(match[2])
      };
    }
  }

  return null;
}

async function main() {
  console.log('='.repeat(70));
  console.log('LEHRPLAN 21 GRADE 2 MULTIPLICATION FIXER (v2)');
  console.log('='.repeat(70));
  console.log('');
  console.log('CORRECT RULE: Grade 2 only allows 2x, 5x, and 10x tables');
  console.log('A question is VALID if at least ONE factor is 2, 5, or 10');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  VALID:   9 x 2 (2 is allowed), 5 x 7 (5 is allowed), 10 x 8 (10 is allowed)');
  console.log('  INVALID: 3 x 4 (neither is 2, 5, or 10), 6 x 7, 8 x 9, etc.');
  console.log('');

  const databaseUrl = loadDatabaseUrl();
  console.log('Connecting to database...');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully!\n');

    // Fetch ALL Grade 2 math questions (not just those with x/*)
    console.log('Fetching ALL Grade 2 math questions...');

    const result = await client.query(`
      SELECT id, question, grade, language, subject
      FROM questions
      WHERE grade = 2
        AND subject = 'math'
      ORDER BY language, id
    `);

    console.log(`Found ${result.rows.length} Grade 2 math questions total\n`);

    // Find violations
    const violations = [];
    const validMultiplications = [];
    const nonMultiplications = [];

    for (const q of result.rows) {
      const factors = extractMultiplicationFactors(q.question);

      if (factors) {
        if (!isValidGrade2Multiplication(factors.factor1, factors.factor2)) {
          violations.push({
            ...q,
            factors,
            reason: `${factors.factor1} x ${factors.factor2} - neither factor is 2, 5, or 10`
          });
        } else {
          const validTable = ALLOWED_GRADE2_TABLES.find(t => t === factors.factor1 || t === factors.factor2);
          validMultiplications.push({
            ...q,
            factors,
            validTable
          });
        }
      } else {
        nonMultiplications.push(q);
      }
    }

    console.log('='.repeat(70));
    console.log('ANALYSIS RESULTS');
    console.log('='.repeat(70));
    console.log(`Total Grade 2 math questions: ${result.rows.length}`);
    console.log(`Non-multiplication questions: ${nonMultiplications.length}`);
    console.log(`Valid multiplication (uses 2x, 5x, or 10x): ${validMultiplications.length}`);
    console.log(`VIOLATIONS (must move to Grade 3): ${violations.length}`);
    console.log('');

    // Show sample valid multiplications
    console.log('Sample VALID Grade 2 multiplications (first 5):');
    validMultiplications.slice(0, 5).forEach(v => {
      console.log(`  [${v.language}] ${v.factors.factor1} x ${v.factors.factor2} (uses ${v.validTable}x table)`);
    });
    console.log('');

    if (violations.length === 0) {
      console.log('No violations found! All Grade 2 multiplication questions are correct.');
      client.release();
      await pool.end();
      return;
    }

    // Summary by language
    const byLang = {};
    violations.forEach(v => {
      if (!byLang[v.language]) byLang[v.language] = 0;
      byLang[v.language]++;
    });
    console.log('Violations by Language:');
    Object.keys(byLang).sort().forEach(lang => {
      console.log(`  ${lang.toUpperCase()}: ${byLang[lang]} questions`);
    });
    console.log('');

    // Summary by factor pairs
    const byFactors = {};
    violations.forEach(v => {
      const key = `${Math.min(v.factors.factor1, v.factors.factor2)}x${Math.max(v.factors.factor1, v.factors.factor2)}`;
      if (!byFactors[key]) byFactors[key] = 0;
      byFactors[key]++;
    });
    console.log('Violations by Factor Pairs (top 20):');
    Object.entries(byFactors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([pair, count]) => {
        console.log(`  ${pair}: ${count} questions`);
      });
    console.log('');

    // Show sample violations
    console.log('='.repeat(70));
    console.log('SAMPLE VIOLATIONS (first 15):');
    console.log('='.repeat(70));

    violations.slice(0, 15).forEach((v, i) => {
      console.log(`\n${i + 1}. [${v.language.toUpperCase()}] "${v.question.substring(0, 60)}..."`);
      console.log(`   Factors: ${v.factors.factor1} x ${v.factors.factor2} = ${v.factors.factor1 * v.factors.factor2}`);
      console.log(`   Reason: ${v.reason}`);
    });
    console.log('');

    // Apply fixes
    console.log('='.repeat(70));
    console.log('APPLYING FIXES (moving to Grade 3)...');
    console.log('='.repeat(70));
    console.log('');

    let fixed = 0;
    let failed = 0;

    for (const v of violations) {
      try {
        const updateResult = await client.query(
          `UPDATE questions
           SET grade = 3, updated_at = NOW()
           WHERE id = $1 AND grade = 2
           RETURNING id`,
          [v.id]
        );

        if (updateResult.rowCount > 0) {
          fixed++;
          if (fixed <= 30 || fixed % 50 === 0) {
            console.log(`[${fixed}/${violations.length}] Fixed: ${v.factors.factor1} x ${v.factors.factor2} (${v.language.toUpperCase()})`);
          }
        } else {
          failed++;
          console.log(`FAILED: ${v.id} - question not found or already changed`);
        }
      } catch (err) {
        failed++;
        console.log(`ERROR fixing ${v.id}: ${err.message}`);
      }
    }

    if (fixed > 30) {
      console.log(`... (${fixed - 30} more fixed)`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('VERIFICATION - Grade 2 Multiplication Questions After Fix');
    console.log('='.repeat(70));

    // Verify no violations remain
    const verifyResult = await client.query(`
      SELECT id, question, language
      FROM questions
      WHERE grade = 2 AND subject = 'math'
    `);

    let remainingViolations = 0;
    const remainingList = [];

    for (const q of verifyResult.rows) {
      const factors = extractMultiplicationFactors(q.question);
      if (factors && !isValidGrade2Multiplication(factors.factor1, factors.factor2)) {
        remainingViolations++;
        if (remainingList.length < 5) {
          remainingList.push(`[${q.language}] ${factors.factor1} x ${factors.factor2}: ${q.question.substring(0, 40)}...`);
        }
      }
    }

    if (remainingList.length > 0) {
      console.log('Still violating:');
      remainingList.forEach(r => console.log(`  ${r}`));
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('FIX SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total violations found: ${violations.length}`);
    console.log(`Successfully fixed: ${fixed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Remaining violations: ${remainingViolations}`);
    console.log('');

    if (remainingViolations === 0) {
      console.log('SUCCESS! All Grade 2 multiplication questions now comply with Lehrplan 21:');
      console.log('  - Only 2x, 5x, and 10x multiplication tables');
      console.log('  - All other multiplication moved to Grade 3');
      console.log('');
      console.log('Nina (Grade 2) will no longer see questions like 3 x 9!');
    } else {
      console.log(`WARNING: ${remainingViolations} violations still remain!`);
    }

    client.release();
  } catch (err) {
    console.error('Database error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
