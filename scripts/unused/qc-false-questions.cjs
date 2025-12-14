#!/usr/bin/env node
const fs = require('fs');

/**
 * Quality Control for FALSE True/False Questions
 * Validates all 1,863 generated questions before database import
 */

function validateQuestion(q, index) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!q.type || q.type !== 'true-false') {
    errors.push(`Question ${index}: Invalid type "${q.type}"`);
  }

  if (!q.language || !['de', 'en', 'fr'].includes(q.language)) {
    errors.push(`Question ${index}: Invalid language "${q.language}"`);
  }

  if (!q.grade || q.grade < 1 || q.grade > 6) {
    errors.push(`Question ${index}: Invalid grade "${q.grade}"`);
  }

  if (!q.subject) {
    errors.push(`Question ${index}: Missing subject`);
  }

  if (!q.question || q.question.trim().length < 5) {
    errors.push(`Question ${index}: Question too short or missing`);
  }

  if (!q.correct_answer) {
    errors.push(`Question ${index}: Missing correct_answer`);
  }

  // Validate correct_answer is FALSE in the right language
  const validFalseAnswers = {
    de: ['Falsch', 'falsch', 'false'],
    en: ['False', 'false'],
    fr: ['Faux', 'faux', 'false']
  };

  if (q.language && q.correct_answer) {
    const validAnswers = validFalseAnswers[q.language] || [];
    if (!validAnswers.includes(q.correct_answer)) {
      errors.push(`Question ${index}: correct_answer "${q.correct_answer}" not valid for language "${q.language}". Expected one of: ${validAnswers.join(', ')}`);
    }
  }

  if (!q.explanation || q.explanation.trim().length < 10) {
    errors.push(`Question ${index}: Explanation too short or missing`);
  }

  if (!q.difficulty || q.difficulty < 1 || q.difficulty > 5) {
    errors.push(`Question ${index}: Invalid difficulty "${q.difficulty}"`);
  }

  if (!q.lehrplan21_topic) {
    warnings.push(`Question ${index}: Missing lehrplan21_topic`);
  }

  // Language-specific checks
  if (q.language === 'de') {
    // Check for Swiss German (should use 'ss' not 'ß')
    if (q.question.includes('ß') || q.explanation.includes('ß')) {
      warnings.push(`Question ${index}: Uses 'ß' instead of Swiss 'ss'`);
    }

    // Check explanation starts with "Falsch"
    if (!q.explanation.startsWith('Falsch')) {
      warnings.push(`Question ${index}: German explanation should start with "Falsch"`);
    }
  }

  if (q.language === 'en') {
    // Check explanation starts with "False"
    if (!q.explanation.startsWith('False')) {
      warnings.push(`Question ${index}: English explanation should start with "False"`);
    }
  }

  if (q.language === 'fr') {
    // Check explanation starts with "Faux"
    if (!q.explanation.startsWith('Faux')) {
      warnings.push(`Question ${index}: French explanation should start with "Faux"`);
    }

    // Check for Swiss French numbers
    if (q.question.match(/\b(soixante-dix|quatre-vingt|quatre-vingt-dix)\b/)) {
      warnings.push(`Question ${index}: Uses French numbers instead of Swiss (septante/huitante/nonante)`);
    }
  }

  return { errors, warnings };
}

function runQC() {
  console.log('=== Quality Control for FALSE True/False Questions ===\n');

  const filePath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/false-truefalse-questions.json';
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`Total questions to validate: ${questions.length}\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const errorLog = [];
  const warningLog = [];

  questions.forEach((q, idx) => {
    const { errors, warnings } = validateQuestion(q, idx + 1);

    if (errors.length > 0) {
      totalErrors += errors.length;
      errorLog.push(...errors);
    }

    if (warnings.length > 0) {
      totalWarnings += warnings.length;
      warningLog.push(...warnings);
    }
  });

  // Summary by language
  const byLang = questions.reduce((acc, q) => {
    if (!acc[q.language]) {
      acc[q.language] = { total: 0, subjects: {} };
    }
    acc[q.language].total++;
    acc[q.language].subjects[q.subject] = (acc[q.language].subjects[q.subject] || 0) + 1;
    return acc;
  }, {});

  console.log('=== Question Distribution ===');
  Object.entries(byLang).forEach(([lang, data]) => {
    console.log(`\n${lang.toUpperCase()}: ${data.total} questions`);
    Object.entries(data.subjects).forEach(([subject, count]) => {
      console.log(`  - ${subject}: ${count}`);
    });
  });

  console.log('\n=== QC Results ===');
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n=== ERRORS (First 20) ===');
    errorLog.slice(0, 20).forEach(err => console.log(`  ❌ ${err}`));
    if (errorLog.length > 20) {
      console.log(`  ... and ${errorLog.length - 20} more errors`);
    }
  }

  if (totalWarnings > 0) {
    console.log('\n=== WARNINGS (First 20) ===');
    warningLog.slice(0, 20).forEach(warn => console.log(`  ⚠️  ${warn}`));
    if (warningLog.length > 20) {
      console.log(`  ... and ${warningLog.length - 20} more warnings`);
    }
  }

  if (totalErrors === 0) {
    console.log('\n✅ All questions passed QC!');
    console.log('Ready for database import.');
    return true;
  } else {
    console.log('\n❌ QC FAILED - Fix errors before importing');
    return false;
  }
}

if (require.main === module) {
  const passed = runQC();
  process.exit(passed ? 0 : 1);
}

module.exports = { runQC, validateQuestion };
