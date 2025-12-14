/**
 * QC Validation Script for LearnKick Questions
 * Validates all questions in the database against QC criteria
 * Updates validation_status and generates QC report
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Validation rules by language
const VALID_TYPES = ['multiple-choice', 'true-false', 'number-input'];
const VALID_SUBJECTS = ['math', 'german', 'nmg', 'english', 'french', 'science'];
const VALID_LANGUAGES = ['de', 'en', 'fr'];

// Swiss German: ss instead of ß
const GERMAN_SS_PATTERN = /ß/;

// American English patterns to reject
const AMERICAN_SPELLINGS = [
  /\bcolor\b/i, /\bfavor\b/i, /\bfavorite\b/i,
  /\bmeter\b/i, /\bcenter\b/i, /\borganize\b/i,
  /\btraveled\b/i, /\bgray\b/i
];

// France French numbers (should use Swiss: septante, huitante, nonante)
const FRANCE_FRENCH_NUMBERS = [
  /soixante-dix/i, /quatre-vingts?(?!-dix)/i, /quatre-vingt-dix/i
];

// QC Results tracking
const qcResults = {
  total: 0,
  passed: 0,
  failed: 0,
  flagged: 0,
  errors: [],
  warnings: [],
  byLanguage: {
    de: { total: 0, passed: 0, failed: 0, flagged: 0 },
    en: { total: 0, passed: 0, failed: 0, flagged: 0 },
    fr: { total: 0, passed: 0, failed: 0, flagged: 0 }
  },
  bySubject: {},
  byGrade: {}
};

/**
 * Validate a single question
 */
function validateQuestion(q) {
  const errors = [];
  const warnings = [];

  // 1. STRUCTURE VALIDATION

  // Required fields
  if (!q.question || q.question.trim().length < 5) {
    errors.push({ field: 'question', error: 'Question text missing or too short', severity: 'critical' });
  }

  if (!q.type || !VALID_TYPES.includes(q.type)) {
    errors.push({ field: 'type', error: `Invalid type: ${q.type}`, severity: 'critical' });
  }

  if (!q.subject || !VALID_SUBJECTS.includes(q.subject)) {
    errors.push({ field: 'subject', error: `Invalid subject: ${q.subject}`, severity: 'critical' });
  }

  if (!q.language || !VALID_LANGUAGES.includes(q.language)) {
    errors.push({ field: 'language', error: `Invalid language: ${q.language}`, severity: 'critical' });
  }

  // Grade validation (1-6)
  if (!q.grade || q.grade < 1 || q.grade > 6) {
    errors.push({ field: 'grade', error: `Grade out of range: ${q.grade}`, severity: 'critical' });
  }

  // Difficulty validation (1-4)
  if (!q.difficulty || q.difficulty < 1 || q.difficulty > 4) {
    errors.push({ field: 'difficulty', error: `Difficulty out of range: ${q.difficulty}`, severity: 'critical' });
  }

  // 2. ANSWER VALIDATION

  if (!q.correct_answer || q.correct_answer.trim().length === 0) {
    errors.push({ field: 'correct_answer', error: 'Correct answer missing', severity: 'critical' });
  }

  // Multiple choice must have 4 options
  if (q.type === 'multiple-choice') {
    if (!q.answers || q.answers.length !== 4) {
      errors.push({ field: 'answers', error: `Multiple choice needs exactly 4 options, has ${q.answers?.length || 0}`, severity: 'critical' });
    } else {
      // Check if correct answer is in options
      const correctInOptions = q.answers.some(a =>
        a.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()
      );
      if (!correctInOptions) {
        errors.push({ field: 'correct_answer', error: 'Correct answer not found in options', severity: 'critical' });
      }
    }
  }

  // 3. LANGUAGE-SPECIFIC VALIDATION

  if (q.language === 'de') {
    // Swiss German: no ß, use ss
    if (GERMAN_SS_PATTERN.test(q.question)) {
      errors.push({ field: 'question', error: 'Swiss German uses "ss" not "ß"', severity: 'critical' });
    }
    if (q.answers) {
      q.answers.forEach((a, i) => {
        if (GERMAN_SS_PATTERN.test(a)) {
          errors.push({ field: `answers[${i}]`, error: 'Swiss German uses "ss" not "ß"', severity: 'critical' });
        }
      });
    }
  }

  if (q.language === 'en') {
    // British English: no American spellings
    AMERICAN_SPELLINGS.forEach(pattern => {
      if (pattern.test(q.question)) {
        warnings.push({ field: 'question', warning: `Possible American spelling detected: ${q.question.match(pattern)?.[0]}`, severity: 'warning' });
      }
    });
  }

  if (q.language === 'fr') {
    // Swiss French: use septante/huitante/nonante
    FRANCE_FRENCH_NUMBERS.forEach(pattern => {
      if (pattern.test(q.question)) {
        errors.push({ field: 'question', error: 'Use Swiss French numbers (septante, huitante, nonante)', severity: 'critical' });
      }
    });
  }

  // 4. CONSISTENCY VALIDATION

  // Difficulty should be appropriate for grade
  if (q.grade <= 2 && q.difficulty === 4) {
    warnings.push({ field: 'difficulty', warning: `Difficulty 4 is unusual for grade ${q.grade}`, severity: 'warning' });
  }

  // Check for placeholder text (exclude Roman numerals and legitimate ellipsis)
  const placeholderPatterns = [
    /\[FILL\]/i,
    /\bTODO\b/i,
    /\bPLACEHOLDER\b/i,
    /(?<![IVXLCDM])XXX(?![IVXLCDM])/i  // XXX not surrounded by Roman numeral chars
  ];
  placeholderPatterns.forEach(pattern => {
    if (pattern.test(q.question)) {
      errors.push({ field: 'question', error: 'Placeholder text detected', severity: 'critical' });
    }
  });

  // Determine status (using database constraint values)
  // Allowed: 'draft', 'pending_qc', 'qc_passed', 'qc_failed', 'flagged', 'approved', 'rejected'
  let status = 'qc_passed';
  let qualityScore = 100;

  if (errors.length > 0) {
    status = 'qc_failed';
    qualityScore = Math.max(0, 100 - (errors.length * 25));
  } else if (warnings.length > 0) {
    status = 'flagged';
    qualityScore = Math.max(50, 100 - (warnings.length * 10));
  }

  return {
    id: q.id,
    status,
    qualityScore,
    errors,
    warnings
  };
}

/**
 * Main QC function
 */
async function runQC() {
  const client = await pool.connect();

  try {
    console.log('🔍 Starting QC Validation on all questions...\n');

    // Fetch all questions
    const result = await client.query(`
      SELECT id, question, type, subject, grade, difficulty, language,
             answers, correct_answer, correct_index, tags, validation_status
      FROM questions
      ORDER BY language, subject, grade
    `);

    const questions = result.rows;
    console.log(`📊 Found ${questions.length} questions to validate\n`);

    qcResults.total = questions.length;

    // Validate each question
    const updates = [];

    for (const q of questions) {
      const validation = validateQuestion(q);

      // Track results
      qcResults.byLanguage[q.language] = qcResults.byLanguage[q.language] || { total: 0, passed: 0, failed: 0, flagged: 0 };
      qcResults.byLanguage[q.language].total++;

      qcResults.bySubject[q.subject] = qcResults.bySubject[q.subject] || { total: 0, passed: 0, failed: 0, flagged: 0 };
      qcResults.bySubject[q.subject].total++;

      qcResults.byGrade[q.grade] = qcResults.byGrade[q.grade] || { total: 0, passed: 0, failed: 0, flagged: 0 };
      qcResults.byGrade[q.grade].total++;

      if (validation.status === 'qc_passed') {
        qcResults.passed++;
        qcResults.byLanguage[q.language].passed++;
        qcResults.bySubject[q.subject].passed++;
        qcResults.byGrade[q.grade].passed++;
      } else if (validation.status === 'qc_failed') {
        qcResults.failed++;
        qcResults.byLanguage[q.language].failed++;
        qcResults.bySubject[q.subject].failed++;
        qcResults.byGrade[q.grade].failed++;
        qcResults.errors.push({
          id: q.id,
          question: q.question.substring(0, 50) + '...',
          errors: validation.errors
        });
      } else {
        qcResults.flagged++;
        qcResults.byLanguage[q.language].flagged++;
        qcResults.bySubject[q.subject].flagged++;
        qcResults.byGrade[q.grade].flagged++;
        qcResults.warnings.push({
          id: q.id,
          question: q.question.substring(0, 50) + '...',
          warnings: validation.warnings
        });
      }

      // Prepare update
      updates.push({
        id: q.id,
        status: validation.status,
        score: validation.qualityScore
      });
    }

    // Update database with validation results
    console.log('📝 Updating validation status in database...\n');

    let updateCount = 0;
    for (const update of updates) {
      await client.query(`
        UPDATE questions
        SET validation_status = $1, quality_score = $2, updated_at = NOW()
        WHERE id = $3
      `, [update.status, update.score, update.id]);
      updateCount++;

      if (updateCount % 500 === 0) {
        console.log(`   Updated ${updateCount}/${updates.length} questions...`);
      }
    }

    console.log(`✅ Updated ${updateCount} questions\n`);

    // Print QC Report
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    QC VALIDATION REPORT                    ');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 OVERALL RESULTS');
    console.log('───────────────────────────────────────────────────────────');
    console.log(`   Total Questions:  ${qcResults.total}`);
    console.log(`   ✅ Passed:        ${qcResults.passed} (${(qcResults.passed/qcResults.total*100).toFixed(1)}%)`);
    console.log(`   ❌ Failed:        ${qcResults.failed} (${(qcResults.failed/qcResults.total*100).toFixed(1)}%)`);
    console.log(`   ⚠️  Flagged:       ${qcResults.flagged} (${(qcResults.flagged/qcResults.total*100).toFixed(1)}%)`);
    console.log('');

    console.log('📊 BY LANGUAGE');
    console.log('───────────────────────────────────────────────────────────');
    for (const [lang, stats] of Object.entries(qcResults.byLanguage)) {
      if (stats.total > 0) {
        const langName = { de: 'German', en: 'English', fr: 'French' }[lang] || lang;
        console.log(`   ${langName}: ${stats.total} total | ✅ ${stats.passed} | ❌ ${stats.failed} | ⚠️ ${stats.flagged}`);
      }
    }
    console.log('');

    console.log('📊 BY SUBJECT');
    console.log('───────────────────────────────────────────────────────────');
    for (const [subject, stats] of Object.entries(qcResults.bySubject)) {
      console.log(`   ${subject.padEnd(10)}: ${stats.total.toString().padStart(4)} total | ✅ ${stats.passed.toString().padStart(4)} | ❌ ${stats.failed.toString().padStart(3)} | ⚠️ ${stats.flagged.toString().padStart(3)}`);
    }
    console.log('');

    console.log('📊 BY GRADE');
    console.log('───────────────────────────────────────────────────────────');
    for (let grade = 1; grade <= 6; grade++) {
      const stats = qcResults.byGrade[grade] || { total: 0, passed: 0, failed: 0, flagged: 0 };
      console.log(`   Grade ${grade}: ${stats.total.toString().padStart(4)} total | ✅ ${stats.passed.toString().padStart(4)} | ❌ ${stats.failed.toString().padStart(3)} | ⚠️ ${stats.flagged.toString().padStart(3)}`);
    }
    console.log('');

    // Show sample errors
    if (qcResults.errors.length > 0) {
      console.log('❌ SAMPLE ERRORS (first 10)');
      console.log('───────────────────────────────────────────────────────────');
      qcResults.errors.slice(0, 10).forEach((e, i) => {
        console.log(`   ${i+1}. ${e.question}`);
        e.errors.forEach(err => {
          console.log(`      → ${err.field}: ${err.error}`);
        });
      });
      console.log('');
    }

    // Show sample warnings
    if (qcResults.warnings.length > 0) {
      console.log('⚠️  SAMPLE WARNINGS (first 10)');
      console.log('───────────────────────────────────────────────────────────');
      qcResults.warnings.slice(0, 10).forEach((w, i) => {
        console.log(`   ${i+1}. ${w.question}`);
        w.warnings.forEach(warn => {
          console.log(`      → ${warn.field}: ${warn.warning}`);
        });
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    QC VALIDATION COMPLETE                  ');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: qcResults.total,
        passed: qcResults.passed,
        failed: qcResults.failed,
        flagged: qcResults.flagged,
        passRate: (qcResults.passed/qcResults.total*100).toFixed(2) + '%'
      },
      byLanguage: qcResults.byLanguage,
      bySubject: qcResults.bySubject,
      byGrade: qcResults.byGrade,
      errors: qcResults.errors,
      warnings: qcResults.warnings
    };

    const fs = require('fs');
    fs.writeFileSync('qc-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to qc-report.json');

  } catch (error) {
    console.error('❌ QC Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run QC
runQC().catch(console.error);
