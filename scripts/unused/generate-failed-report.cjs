const data = require('./qc-results-fr-science.json');
const fs = require('fs');

const failed = data.validationDetails.filter(v => v.status === 'FAIL');

let report = 'FAILED QUESTIONS - DETAILED TECHNICAL REPORT\n';
report += '='.repeat(80) + '\n\n';

failed.forEach((q, i) => {
  report += `${i+1}. ID: ${q.id}\n`;
  report += `   Question: ${q.question}\n`;
  report += `   Grade: ${q.grade} | Difficulty: ${q.difficulty}\n`;
  report += `   Answers: ${JSON.stringify(q.answers)}\n`;
  report += `   Correct Answer: "${q.correct_answer}"\n`;
  report += `   Failure Reason: ${q.reason}\n`;
  report += '\n';
});

report += '='.repeat(80) + '\n';
report += 'SUMMARY BY FAILURE TYPE:\n';
report += '='.repeat(80) + '\n\n';

const emptyAnswer = failed.filter(f => f.reason.includes('""'));
const formatMismatch = failed.filter(f => f.reason.includes('"true"'));

report += `Empty correct_answer: ${emptyAnswer.length} questions\n`;
report += `Format mismatch (true vs array): ${formatMismatch.length} questions\n\n`;

report += 'SQL UPDATE SCRIPT TO FIX ISSUES:\n';
report += '='.repeat(80) + '\n\n';

// Generate SQL updates
failed.forEach((q, i) => {
  if (q.reason.includes('""')) {
    report += `-- ${i+1}. ${q.question}\n`;
    report += `-- TODO: Determine correct answer from: ${JSON.stringify(q.answers)}\n`;
    report += `UPDATE questions SET correct_answer = '?' WHERE id = '${q.id}';\n\n`;
  } else if (q.reason.includes('"true"')) {
    report += `-- ${i+1}. ${q.question}\n`;
    report += `-- Convert "true" to index "0" (Vrai/True)\n`;
    report += `UPDATE questions SET correct_answer = '0' WHERE id = '${q.id}';\n\n`;
  }
});

// Write to file
fs.writeFileSync('qc-failed-questions-report.txt', report);
console.log('Report written to: qc-failed-questions-report.txt');
console.log('');
console.log(report);
