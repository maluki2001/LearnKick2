#!/usr/bin/env node
/**
 * Validate Balance Questions
 * Ensures all generated questions meet quality standards
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'balance-questions-1804.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║          QUESTION VALIDATION & QUALITY CHECK              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const stats = {
  total: questions.length,
  byLanguage: { de: 0, en: 0, fr: 0 },
  byType: { 'multiple-choice': 0, 'true-false': 0 },
  byGrade: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  bySubject: {},
  tfAnswers: { en: { true: 0, false: 0 }, fr: { true: 0, false: 0 } },
  errors: []
};

// Validate each question
questions.forEach((q, index) => {
  // Count by language
  stats.byLanguage[q.language]++;

  // Count by type
  stats.byType[q.type]++;

  // Count by grade
  if (q.grade >= 1 && q.grade <= 6) {
    stats.byGrade[q.grade]++;
  } else {
    stats.errors.push(`Question ${q.id}: Invalid grade ${q.grade}`);
  }

  // Count by subject
  stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;

  // Count TF answers
  if (q.type === 'true-false') {
    if (q.language === 'en') {
      if (q.correctIndex === 0) stats.tfAnswers.en.true++;
      else if (q.correctIndex === 1) stats.tfAnswers.en.false++;
    } else if (q.language === 'fr') {
      if (q.correctIndex === 0) stats.tfAnswers.fr.true++;
      else if (q.correctIndex === 1) stats.tfAnswers.fr.false++;
    }
  }

  // Validation checks
  if (!q.id) {
    stats.errors.push(`Question ${index}: Missing ID`);
  }

  if (!q.question || q.question.length < 10) {
    stats.errors.push(`Question ${q.id}: Question text too short or missing`);
  }

  if (!Array.isArray(q.answers)) {
    stats.errors.push(`Question ${q.id}: Answers must be an array`);
  }

  if (q.type === 'multiple-choice') {
    if (q.answers.length !== 4) {
      stats.errors.push(`Question ${q.id}: MC must have exactly 4 answers (has ${q.answers.length})`);
    }
    if (q.correctIndex < 0 || q.correctIndex > 3) {
      stats.errors.push(`Question ${q.id}: correctIndex must be 0-3 for MC`);
    }
  }

  if (q.type === 'true-false') {
    if (q.answers.length !== 2) {
      stats.errors.push(`Question ${q.id}: TF must have exactly 2 answers`);
    }
    if (q.correctIndex !== 0 && q.correctIndex !== 1) {
      stats.errors.push(`Question ${q.id}: correctIndex must be 0 or 1 for TF`);
    }
  }

  if (!q.lehrplan21Code) {
    stats.errors.push(`Question ${q.id}: Missing Lehrplan 21 code`);
  }

  if (!q.tags || q.tags.length === 0) {
    stats.errors.push(`Question ${q.id}: Missing tags`);
  }

  // German-specific checks
  if (q.language === 'de') {
    if (q.question.includes('ß')) {
      stats.errors.push(`Question ${q.id}: Uses ß (should use ss in Swiss German)`);
    }
  }

  // English-specific checks
  if (q.language === 'en' && q.type === 'true-false') {
    if (q.answers[0] !== 'True' || q.answers[1] !== 'False') {
      stats.errors.push(`Question ${q.id}: English TF must use ['True', 'False']`);
    }
  }

  // French-specific checks
  if (q.language === 'fr' && q.type === 'true-false') {
    if (q.answers[0] !== 'Vrai' || q.answers[1] !== 'Faux') {
      stats.errors.push(`Question ${q.id}: French TF must use ['Vrai', 'Faux']`);
    }
  }
});

// Report
console.log('VALIDATION SUMMARY:\n');

console.log(`Total Questions: ${stats.total}\n`);

console.log('By Language:');
console.log(`  German (DE):  ${stats.byLanguage.de}`);
console.log(`  English (EN): ${stats.byLanguage.en}`);
console.log(`  French (FR):  ${stats.byLanguage.fr}\n`);

console.log('By Type:');
console.log(`  Multiple-choice: ${stats.byType['multiple-choice']}`);
console.log(`  True-false:      ${stats.byType['true-false']}\n`);

console.log('By Grade:');
for (let g = 1; g <= 6; g++) {
  console.log(`  Grade ${g}: ${stats.byGrade[g]}`);
}
console.log();

console.log('By Subject:');
Object.keys(stats.bySubject).sort().forEach(subject => {
  console.log(`  ${subject}: ${stats.bySubject[subject]}`);
});
console.log();

console.log('True/False Answer Distribution:');
console.log(`  English:  ${stats.tfAnswers.en.true} TRUE, ${stats.tfAnswers.en.false} FALSE`);
console.log(`  French:   ${stats.tfAnswers.fr.true} TRUE, ${stats.tfAnswers.fr.false} FALSE\n`);

// Check targets
console.log('TARGET VERIFICATION:\n');

const germanMCTarget = 625;
const englishTFTarget = 609;
const frenchTFTarget = 570;

const germanMC = questions.filter(q => q.language === 'de' && q.type === 'multiple-choice').length;
const englishTF = questions.filter(q => q.language === 'en' && q.type === 'true-false').length;
const frenchTF = questions.filter(q => q.language === 'fr' && q.type === 'true-false').length;

console.log(`German MC:  ${germanMC}/${germanMCTarget} ${germanMC === germanMCTarget ? '✓' : '✗'}`);
console.log(`English TF: ${englishTF}/${englishTFTarget} ${englishTF === englishTFTarget ? '✓' : '✗'}`);
console.log(`French TF:  ${frenchTF}/${frenchTFTarget} ${frenchTF === frenchTFTarget ? '✓' : '✗'}\n`);

// Check TF balance
const enTrueTarget = 305;
const enFalseTarget = 304;
const frTrueTarget = 285;
const frFalseTarget = 285;

console.log('TF BALANCE CHECK:\n');
console.log(`English TRUE:  ${stats.tfAnswers.en.true}/${enTrueTarget} ${stats.tfAnswers.en.true === enTrueTarget ? '✓' : '✗'}`);
console.log(`English FALSE: ${stats.tfAnswers.en.false}/${enFalseTarget} ${stats.tfAnswers.en.false === enFalseTarget ? '✓' : '✗'}`);
console.log(`French TRUE:   ${stats.tfAnswers.fr.true}/${frTrueTarget} ${stats.tfAnswers.fr.true === frTrueTarget ? '✓' : '✗'}`);
console.log(`French FALSE:  ${stats.tfAnswers.fr.false}/${frFalseTarget} ${stats.tfAnswers.fr.false === frFalseTarget ? '✓' : '✗'}\n`);

// Errors
if (stats.errors.length > 0) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    VALIDATION ERRORS                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  stats.errors.forEach(error => console.log(`  ✗ ${error}`));
  console.log(`\nTotal errors: ${stats.errors.length}\n`);
  process.exit(1);
} else {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║              ✓ ALL VALIDATIONS PASSED!                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('Questions are ready for database import.\n');
}
