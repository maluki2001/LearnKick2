const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function validateGermanQuestions() {
  const client = await pool.connect();

  try {
    console.log('📚 Fetching German questions for AI validation...\n');

    // First, check what columns exist
    const columnsCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position
    `);
    console.log('Available columns:', columnsCheck.rows.map(r => r.column_name).join(', '));
    console.log();

    // Fetch questions that haven't been AI-validated yet
    const result = await client.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'qc_passed'
      LIMIT 200
    `);

    console.log(`Found ${result.rows.length} questions to validate\n`);

    if (result.rows.length === 0) {
      console.log('✅ No German questions found in database');
      return;
    }

    // Validation results
    const approved = [];
    const rejected = [];
    const issues = [];

    // Validate each question
    const rejectedWithReports = []; // Store { id, report } for rejected questions

    for (const q of result.rows) {
      const validationResult = validateQuestion(q);

      if (validationResult.isValid) {
        approved.push(q.id);
      } else {
        rejected.push(q.id);
        issues.push({
          id: q.id,
          question: q.question,
          issues: validationResult.issues
        });

        // Create QC report
        rejectedWithReports.push({
          id: q.id,
          report: {
            validation_passed: false,
            errors: validationResult.issues,
            validated_at: new Date().toISOString(),
            validator: 'ai_qc_agent_v1'
          }
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(80) + '\n');
    console.log(`✅ Approved: ${approved.length} questions`);
    console.log(`❌ Rejected: ${rejected.length} questions`);
    console.log(`📊 Total processed: ${result.rows.length} questions\n`);

    // Show issues found
    if (issues.length > 0) {
      console.log('='.repeat(80));
      console.log('ISSUES FOUND');
      console.log('='.repeat(80) + '\n');

      issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. Question ID: ${issue.id}`);
        console.log(`   Question: "${issue.question}"`);
        console.log(`   Issues:`);
        issue.issues.forEach(i => console.log(`     - ${i}`));
        console.log();
      });
    }

    // Check if validation columns exist
    const hasValidationColumns = columnsCheck.rows.some(r => r.column_name === 'validation_status');

    if (hasValidationColumns) {
      // Check if we have the extra validation columns
      const hasValidatedAt = columnsCheck.rows.some(r => r.column_name === 'validated_at');
      const hasValidatedBy = columnsCheck.rows.some(r => r.column_name === 'validated_by');

      // Update database
      if (approved.length > 0) {
        let updateQuery = `UPDATE questions SET validation_status = 'approved', quality_score = 95`;
        if (hasValidatedAt) updateQuery += `, review_date = NOW()`;
        if (hasValidatedBy) updateQuery += `, reviewed_by = NULL`; // AI validation, no user ID
        updateQuery += ` WHERE id = ANY($1::uuid[])`;

        await client.query(updateQuery, [approved]);
        console.log(`✅ Updated ${approved.length} questions to 'approved'\n`);
      }

      if (rejected.length > 0) {
        // Update each rejected question with its specific QC report
        for (const item of rejectedWithReports) {
          let updateQuery = `UPDATE questions SET validation_status = 'rejected', quality_score = 30, qc_agent_report = $2`;
          if (hasValidatedAt) updateQuery += `, review_date = NOW()`;
          if (hasValidatedBy) updateQuery += `, reviewed_by = NULL`; // AI validation, no user ID
          updateQuery += ` WHERE id = $1`;

          await client.query(updateQuery, [item.id, JSON.stringify(item.report)]);
        }
        console.log(`❌ Updated ${rejected.length} questions to 'rejected' with QC reports\n`);
      }

      // Final stats
      console.log('='.repeat(80));
      console.log('DATABASE UPDATED');
      console.log('='.repeat(80) + '\n');

      const finalStats = await client.query(`
        SELECT validation_status, COUNT(*) as count
        FROM questions
        WHERE language = 'de' AND subject = 'german'
        GROUP BY validation_status
        ORDER BY count DESC
      `);

      console.log('Updated validation statuses:');
      finalStats.rows.forEach(row => {
        console.log(`  ${row.validation_status || 'NULL'}: ${row.count} questions`);
      });
    } else {
      console.log('⚠️  WARNING: Database does not have validation_status columns');
      console.log('Please run the migration to add these columns:\n');
      console.log('ALTER TABLE questions ADD COLUMN validation_status TEXT;');
      console.log('ALTER TABLE questions ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE;');
      console.log('ALTER TABLE questions ADD COLUMN validated_by TEXT;\n');
      console.log('Results NOT saved to database.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

function validateQuestion(q) {
  const issues = [];

  // 1. Check for ß (should use ss in Swiss German)
  if (q.question && q.question.includes('ß')) {
    issues.push('Contains ß instead of Swiss German ss');
  }

  // Check answers for ß
  if (q.answers && Array.isArray(q.answers)) {
    q.answers.forEach(answer => {
      if (typeof answer === 'string' && answer.includes('ß')) {
        issues.push('Answer contains ß instead of Swiss German ss');
      }
    });
  }

  // 2. Basic grammar checks
  if (!q.question) {
    issues.push('Missing question text');
    return { isValid: false, issues };
  }

  // Check for double spaces
  if (q.question.includes('  ')) {
    issues.push('Contains double spaces');
  }

  // Check for proper punctuation
  if (!q.question.trim().match(/[.!?]$/)) {
    issues.push('Missing punctuation at end of question');
  }

  // 3. Check question structure
  if (q.question.length < 10) {
    issues.push('Question too short (less than 10 characters)');
  }

  if (q.question.length > 500) {
    issues.push('Question too long (more than 500 characters)');
  }

  // 4. Type-specific validation
  if (q.type === 'multiple-choice') {
    if (!q.answers || !Array.isArray(q.answers)) {
      issues.push('Multiple choice question missing answers array');
    } else {
      if (q.answers.length !== 4) {
        issues.push(`Multiple choice should have 4 answers, found ${q.answers.length}`);
      }

      // Check if correct_answer exists in answers array
      if (!q.answers.includes(q.correct_answer)) {
        issues.push(`correct_answer "${q.correct_answer}" not found in answers array: [${q.answers.join(', ')}]`);
      }

      // Check for duplicate answers
      const lowerAnswers = q.answers.map(a => (a || '').toString().toLowerCase().trim());
      const uniqueAnswers = new Set(lowerAnswers);
      if (uniqueAnswers.size !== lowerAnswers.length) {
        issues.push('Contains duplicate answers');
      }

      // Check for empty answers
      if (q.answers.some(a => !a || a.toString().trim() === '')) {
        issues.push('Contains empty answer options');
      }
    }
  }

  if (q.type === 'true-false') {
    // For true-false, answers should be ['Wahr', 'Falsch'] or similar
    // correct_answer should be one of the values in the array
    if (q.answers && Array.isArray(q.answers)) {
      if (!q.answers.includes(q.correct_answer)) {
        issues.push(`True/false correct_answer "${q.correct_answer}" not found in answers: [${q.answers.join(', ')}]`);
      }
    } else {
      issues.push('True/false question missing answers array');
    }
  }

  // 5. Grade appropriateness
  if (q.grade < 1 || q.grade > 6) {
    issues.push(`Invalid grade: ${q.grade} (should be 1-6)`);
  }

  // 6. Difficulty check (can be integer 1-5 or string easy/medium/hard)
  if (typeof q.difficulty === 'number') {
    if (q.difficulty < 1 || q.difficulty > 5) {
      issues.push(`Invalid difficulty: ${q.difficulty} (should be 1-5)`);
    }
  } else if (typeof q.difficulty === 'string') {
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      issues.push(`Invalid difficulty: ${q.difficulty}`);
    }
  } else {
    issues.push(`Invalid difficulty type: ${typeof q.difficulty}`);
  }

  // 7. Check for common German grammar issues
  // Check for proper capitalization of nouns (basic check)
  const commonNouns = ['Hund', 'Katze', 'Haus', 'Baum', 'Blume', 'Auto', 'Buch', 'Schule', 'Kind'];
  commonNouns.forEach(noun => {
    const lowerNoun = noun.toLowerCase();
    // Check if lowercase version appears not at sentence start
    const regex = new RegExp(`[^.!?]\\s+${lowerNoun}\\b`, 'g');
    if (regex.test(q.question)) {
      issues.push(`German noun "${noun}" should be capitalized`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues
  };
}

// Run validation
validateGermanQuestions();
