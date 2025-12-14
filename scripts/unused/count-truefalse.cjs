#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of JSON files to check
const questionFiles = [
  'all-questions-800.json',
  'complete-question-bank.json',
  'german-questions-4000.json',
  'english-questions-200.json',
  'french-questions-200.json',
  'german-nmg-all.json',
  'german-math-g1-3.json',
  'german-math-g4-6.json',
  'german-deutsch-all.json',
  'de-math-g1.json',
  'de-math-g2.json',
  'de-math-g3.json',
  'de-math-g4.json',
  'de-math-g5.json',
  'de-math-g6.json',
  'de-deutsch-g1.json',
  'de-deutsch-g2.json',
  'de-deutsch-g3.json',
  'de-deutsch-g4.json',
  'de-deutsch-g5.json',
  'de-deutsch-g6.json',
  'de-nmg-geo-g1-3.json',
  'de-nmg-geo-g4-6.json',
  'de-nmg-nature-g1-3.json',
  'de-nmg-nature-g4-6.json',
  'de-nmg-history-g1-3.json',
  'de-nmg-history-g4-6.json',
  'de-nmg-econ-g1-3.json',
  'de-nmg-econ-g4-6.json',
  'de-nmg-health-g1-3.json',
  'de-nmg-health-g4-6.json',
  'de-nmg-tech-g1-3.json',
  'de-nmg-tech-g4-6.json',
  'de-nmg-tech-g4-6-fixed.json',
  'de-nmg-ethics-g1-3.json',
  'de-nmg-ethics-g4-6.json',
  'en-math-g1-3.json',
  'en-math-g4-6.json',
  'en-math-extra.json',
  'en-english-g1-3.json',
  'en-english-g4-6.json',
  'en-english-extra.json',
  'en-science-g1-3.json',
  'en-science-g4-6.json',
  'en-science-extra.json',
  'en-geography-g1-6.json',
  'en-geography-extra.json',
  'fr-math-g1-3.json',
  'fr-math-g4-6.json',
  'fr-math-extra.json',
  'fr-french-g1-3.json',
  'fr-french-g4-6.json',
  'fr-french-extra.json',
  'fr-science-g1-3.json',
  'fr-science-g4-6.json',
  'fr-science-extra.json',
  'fr-geography-g1-3.json',
  'fr-geography-g4-6.json',
  'fr-geography-extra.json'
];

const stats = {
  total: 0,
  byLanguage: {
    de: 0,
    en: 0,
    fr: 0,
    unknown: 0
  },
  bySubject: {},
  byGrade: {},
  byFile: {},
  uniqueIds: new Set()
};

function analyzeQuestions(questions, filename) {
  let count = 0;

  questions.forEach(q => {
    if (q.type === 'true-false' || q.type === 'true_false' || q.type === 'truefalse') {
      count++;

      // Track unique IDs to avoid double counting
      const qId = q.id || `${filename}-${q.question_text?.substring(0, 50)}`;
      if (!stats.uniqueIds.has(qId)) {
        stats.uniqueIds.add(qId);
        stats.total++;

        // By language
        const lang = q.language || 'unknown';
        stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;

        // By subject
        const subject = q.subject || 'unknown';
        stats.bySubject[subject] = (stats.bySubject[subject] || 0) + 1;

        // By grade
        const grade = q.grade_level || q.grade || 'unknown';
        stats.byGrade[grade] = (stats.byGrade[grade] || 0) + 1;
      }
    }
  });

  return count;
}

console.log('Counting true/false questions in LearnKick database...\n');
console.log('='.repeat(80));

questionFiles.forEach(filename => {
  const filepath = path.join(__dirname, filename);

  if (fs.existsSync(filepath)) {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const data = JSON.parse(content);

      let questions = [];
      if (Array.isArray(data)) {
        questions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        questions = data.questions;
      } else if (data.data && Array.isArray(data.data)) {
        questions = data.data;
      }

      const count = analyzeQuestions(questions, filename);
      if (count > 0) {
        stats.byFile[filename] = count;
        console.log(`${filename.padEnd(40)} ${count.toString().padStart(6)} true/false questions`);
      }
    } catch (err) {
      console.log(`${filename.padEnd(40)} ERROR: ${err.message}`);
    }
  }
});

console.log('='.repeat(80));
console.log('\n📊 SUMMARY\n');
console.log(`Total unique true/false questions: ${stats.total}`);
console.log('\n🌍 By Language:');
console.log(`  German (de):  ${stats.byLanguage.de || 0}`);
console.log(`  English (en): ${stats.byLanguage.en || 0}`);
console.log(`  French (fr):  ${stats.byLanguage.fr || 0}`);
console.log(`  Unknown:      ${stats.byLanguage.unknown || 0}`);

console.log('\n📚 By Subject:');
Object.entries(stats.bySubject)
  .sort((a, b) => b[1] - a[1])
  .forEach(([subject, count]) => {
    console.log(`  ${subject.padEnd(20)} ${count}`);
  });

console.log('\n🎓 By Grade:');
Object.entries(stats.byGrade)
  .sort((a, b) => {
    const gradeA = parseInt(a[0]) || 999;
    const gradeB = parseInt(b[0]) || 999;
    return gradeA - gradeB;
  })
  .forEach(([grade, count]) => {
    console.log(`  Grade ${grade.toString().padEnd(10)} ${count}`);
  });

console.log('\n📁 Top 10 Files by True/False Count:');
Object.entries(stats.byFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([file, count]) => {
    console.log(`  ${file.padEnd(40)} ${count}`);
  });

console.log('\n' + '='.repeat(80));
