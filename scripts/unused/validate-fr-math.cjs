const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Swiss French number validation
const swissFrenchNumbers = {
  70: 'septante',
  71: 'septante et un',
  72: 'septante-deux',
  79: 'septante-neuf',
  80: 'huitante',
  81: 'huitante et un',
  82: 'huitante-deux',
  89: 'huitante-neuf',
  90: 'nonante',
  91: 'nonante et un',
  92: 'nonante-deux',
  99: 'nonante-neuf'
};

// Banned France French numbers
const franceFrenchNumbers = ['soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function checkSwissFrench(text) {
  const issues = [];

  // Check for France French numbers
  for (const banned of franceFrenchNumbers) {
    if (text.toLowerCase().includes(banned)) {
      issues.push(`Uses France French "${banned}" instead of Swiss French`);
    }
  }

  return issues;
}

function evaluateMathExpression(expr) {
  try {
    // Safe math evaluation - only allow numbers and basic operators
    const sanitized = expr.replace(/[^0-9+\-*/().,\s]/g, '');
    if (sanitized !== expr) return null;

    // Replace comma with dot for decimal
    const normalized = sanitized.replace(',', '.');

    // Use Function constructor for safe evaluation
    return new Function(`'use strict'; return (${normalized})`)();
  } catch (e) {
    return null;
  }
}

function extractNumberFromText(text) {
  // Try to extract a number from answer text
  const match = text.match(/[-+]?\d+[.,]?\d*/);
  if (match) {
    return parseFloat(match[0].replace(',', '.'));
  }
  return null;
}

function validateMathQuestion(question) {
  const issues = [];
  const warnings = [];

  try {
    const { question: questionText, answers, correct_answer, grade, difficulty } = question;

    // Validate basic structure
    if (!answers || !Array.isArray(answers)) {
      issues.push('Answers is not an array');
      return { issues, warnings, status: 'FAIL' };
    }

    if (correct_answer === null || correct_answer === undefined || correct_answer === '') {
      issues.push(`Correct answer index is invalid: "${correct_answer}"`);
      return { issues, warnings, status: 'FAIL' };
    }

    const correctAnswerIndex = parseInt(correct_answer);
    if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= answers.length) {
      issues.push(`Correct answer index ${correct_answer} out of bounds (only ${answers.length} answers)`);
      return { issues, warnings, status: 'FAIL' };
    }

    // Check Swiss French compliance
    const swissFrenchIssues = checkSwissFrench(questionText);
    issues.push(...swissFrenchIssues);

    answers.forEach(answer => {
      const answerIssues = checkSwissFrench(answer);
      issues.push(...answerIssues);
    });

    // Parse correct answer
    const correctAnswerText = answers[correctAnswerIndex];
    if (!correctAnswerText) {
      issues.push(`Correct answer at index ${correctAnswerIndex} is empty or null`);
      return { issues, warnings, status: 'FAIL' };
    }

    // Extract mathematical content from question
    const questionLower = questionText.toLowerCase();

    // Check for basic arithmetic patterns
    const additionMatch = questionText.match(/(\d+)\s*\+\s*(\d+)/);
    const subtractionMatch = questionText.match(/(\d+)\s*[-−–]\s*(\d+)/);
    const multiplicationMatch = questionText.match(/(\d+)\s*[×x*]\s*(\d+)/);
    const divisionMatch = questionText.match(/(\d+)\s*[÷:/]\s*(\d+)/);

    let expectedAnswer = null;
    let operation = null;

    if (additionMatch) {
      operation = 'addition';
      expectedAnswer = parseInt(additionMatch[1]) + parseInt(additionMatch[2]);
    } else if (subtractionMatch) {
      operation = 'subtraction';
      expectedAnswer = parseInt(subtractionMatch[1]) - parseInt(subtractionMatch[2]);
    } else if (multiplicationMatch) {
      operation = 'multiplication';
      expectedAnswer = parseInt(multiplicationMatch[1]) * parseInt(multiplicationMatch[2]);
    } else if (divisionMatch) {
      operation = 'division';
      const dividend = parseInt(divisionMatch[1]);
      const divisor = parseInt(divisionMatch[2]);
      if (divisor !== 0) {
        expectedAnswer = dividend / divisor;
      } else {
        issues.push('Division by zero detected');
        return { issues, warnings, status: 'FAIL' };
      }
    }

    if (expectedAnswer !== null) {
      // Extract number from correct answer
      const correctNum = extractNumberFromText(correctAnswerText);

      if (correctNum === null) {
        warnings.push(`Could not extract number from correct answer: "${correctAnswerText}"`);
      } else if (Math.abs(correctNum - expectedAnswer) > 0.01) {
        issues.push(`${operation} error: ${questionText} - Expected ${expectedAnswer}, but correct answer is ${correctNum}`);
      }

      // Validate wrong answers are actually wrong
      answers.forEach((answer, idx) => {
        if (idx !== correctAnswerIndex) {
          const wrongNum = extractNumberFromText(answer);
          if (wrongNum !== null && Math.abs(wrongNum - expectedAnswer) < 0.01) {
            issues.push(`Wrong answer "${answer}" (index ${idx}) equals the correct answer ${expectedAnswer}`);
          }
        }
      });
    } else {
      // More complex question - check for word problems
      if (questionLower.includes('combien') || questionLower.includes('quel') ||
          questionLower.includes('calcul') || questionLower.includes('résultat')) {
        warnings.push('Complex word problem - manual verification recommended');
      }
    }

    // Check answer array structure
    if (answers.length !== 4) {
      warnings.push(`Unusual answer count: ${answers.length} (expected 4)`);
    }

    // Check for duplicate answers
    const uniqueAnswers = new Set(answers);
    if (uniqueAnswers.size !== answers.length) {
      issues.push('Duplicate answers detected');
    }

    // Validate grade appropriateness (basic check)
    if (operation === 'multiplication' && grade < 3) {
      warnings.push(`Multiplication in Grade ${grade} - verify age appropriateness`);
    }
    if (operation === 'division' && grade < 3) {
      warnings.push(`Division in Grade ${grade} - verify age appropriateness`);
    }

  } catch (error) {
    issues.push(`Validation error: ${error.message}`);
  }

  const status = issues.length > 0 ? 'FAIL' : 'PASS';
  return { issues, warnings, status };
}

async function main() {
  console.log('Starting French Math Question Validation...\n');

  const results = {
    timestamp: new Date().toISOString(),
    total: 0,
    passed: 0,
    failed: 0,
    questions: []
  };

  try {
    // Query 100 random French math questions
    const query = `
      SELECT id, question, answers, correct_answer, grade, difficulty, subject, language
      FROM questions
      WHERE language = 'fr' AND subject = 'math'
      ORDER BY RANDOM()
      LIMIT 100
    `;

    console.log('Querying database for French math questions...');
    const { rows } = await pool.query(query);
    console.log(`Found ${rows.length} questions to validate\n`);

    results.total = rows.length;

    // Validate each question
    for (let i = 0; i < rows.length; i++) {
      const question = rows[i];
      const validation = validateMathQuestion(question);

      // Safely get correct answer text
      let correctAnswerText = null;
      try {
        const correctIdx = parseInt(question.correct_answer);
        if (!isNaN(correctIdx) && question.answers && correctIdx >= 0 && correctIdx < question.answers.length) {
          correctAnswerText = question.answers[correctIdx];
        }
      } catch (e) {
        // Invalid correct_answer
      }

      const questionResult = {
        id: question.id,
        grade: question.grade,
        difficulty: question.difficulty,
        question: question.question,
        answers: question.answers,
        correct_answer: question.correct_answer,
        correct_answer_text: correctAnswerText,
        status: validation.status,
        issues: validation.issues,
        warnings: validation.warnings
      };

      results.questions.push(questionResult);

      if (validation.status === 'PASS') {
        results.passed++;
        console.log(`✓ ${i + 1}/${rows.length} - PASS - ID: ${question.id}`);
        if (validation.warnings.length > 0) {
          console.log(`  Warnings: ${validation.warnings.join(', ')}`);
        }
      } else {
        results.failed++;
        console.log(`✗ ${i + 1}/${rows.length} - FAIL - ID: ${question.id}`);
        console.log(`  Issues: ${validation.issues.join(', ')}`);

        // Update validation_status to 'rejected' for failed questions
        try {
          await pool.query(
            'UPDATE questions SET validation_status = $1 WHERE id = $2',
            ['rejected', question.id]
          );
          console.log(`  Updated validation_status to 'rejected'`);
        } catch (updateError) {
          console.log(`  Warning: Could not update validation_status: ${updateError.message}`);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions: ${results.total}`);
    console.log(`Passed: ${results.passed} (${(results.passed/results.total*100).toFixed(1)}%)`);
    console.log(`Failed: ${results.failed} (${(results.failed/results.total*100).toFixed(1)}%)`);
    console.log('='.repeat(60));

    // Show sample failures
    const failures = results.questions.filter(q => q.status === 'FAIL');
    if (failures.length > 0) {
      console.log('\nSAMPLE FAILURES (first 5):');
      failures.slice(0, 5).forEach((q, idx) => {
        console.log(`\n${idx + 1}. ID: ${q.id} - Grade ${q.grade}`);
        console.log(`   Q: ${q.question}`);
        console.log(`   Correct: ${q.correct_answer_text}`);
        console.log(`   Issues: ${q.issues.join('; ')}`);
      });
    }

    // Write results to file
    const fs = require('fs');
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-fr-math.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nResults written to: ${outputPath}`);

  } catch (error) {
    console.error('Error during validation:', error);
    results.error = error.message;
  } finally {
    await pool.end();
  }
}

main();
