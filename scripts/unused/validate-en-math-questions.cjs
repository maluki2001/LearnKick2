const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// QC Validation Logic
class MathQCValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      issues: []
    };
  }

  // Evaluate mathematical expression safely
  evaluateExpression(expr) {
    try {
      // Remove any non-math characters for safety
      const sanitized = expr.toString().replace(/[^0-9+\-*/().\s]/g, '');
      // Use Function instead of eval for safer evaluation
      return Function('"use strict"; return (' + sanitized + ')')();
    } catch (e) {
      return null;
    }
  }

  // Check if answer is mathematically correct
  validateMathAnswer(question, correctAnswer, allAnswers) {
    const issues = [];

    // Parse question text to extract the mathematical problem
    const questionText = question.toLowerCase();

    // Common patterns for math questions
    const additionMatch = questionText.match(/(\d+)\s*\+\s*(\d+)/);
    const subtractionMatch = questionText.match(/(\d+)\s*-\s*(\d+)/);
    const multiplicationMatch = questionText.match(/(\d+)\s*[×x*]\s*(\d+)/);
    const divisionMatch = questionText.match(/(\d+)\s*[÷/:]\s*(\d+)/);

    let expectedAnswer = null;
    let operation = null;

    if (additionMatch) {
      expectedAnswer = parseInt(additionMatch[1]) + parseInt(additionMatch[2]);
      operation = 'addition';
    } else if (subtractionMatch) {
      expectedAnswer = parseInt(subtractionMatch[1]) - parseInt(subtractionMatch[2]);
      operation = 'subtraction';
    } else if (multiplicationMatch) {
      expectedAnswer = parseInt(multiplicationMatch[1]) * parseInt(multiplicationMatch[2]);
      operation = 'multiplication';
    } else if (divisionMatch) {
      const dividend = parseInt(divisionMatch[1]);
      const divisor = parseInt(divisionMatch[2]);
      if (divisor !== 0) {
        expectedAnswer = dividend / divisor;
        operation = 'division';
      }
    }

    // Additional patterns for word problems
    if (!expectedAnswer) {
      // "How many total" type questions
      if (questionText.includes('how many') || questionText.includes('total')) {
        const numbers = questionText.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          if (questionText.includes('more') || questionText.includes('altogether') || questionText.includes('total')) {
            expectedAnswer = numbers.reduce((sum, num) => sum + parseInt(num), 0);
            operation = 'word problem (addition)';
          } else if (questionText.includes('left') || questionText.includes('remaining') || questionText.includes('fewer')) {
            expectedAnswer = parseInt(numbers[0]) - parseInt(numbers[1]);
            operation = 'word problem (subtraction)';
          }
        }
      }
    }

    // Validate correct answer
    if (expectedAnswer !== null) {
      const correctAnswerNum = parseFloat(correctAnswer);
      if (Math.abs(correctAnswerNum - expectedAnswer) > 0.01) {
        issues.push({
          type: 'INCORRECT_ANSWER',
          severity: 'CRITICAL',
          message: `Correct answer is ${correctAnswer}, but expected ${expectedAnswer} for ${operation}`,
          question: question
        });
      }

      // Validate wrong answers are actually wrong
      allAnswers.forEach((answer, idx) => {
        const answerNum = parseFloat(answer);
        if (idx.toString() !== correctAnswer.toString() && Math.abs(answerNum - expectedAnswer) < 0.01) {
          issues.push({
            type: 'WRONG_ANSWER_IS_CORRECT',
            severity: 'CRITICAL',
            message: `Answer option "${answer}" is marked as wrong but equals the expected answer ${expectedAnswer}`,
            question: question
          });
        }
      });
    }

    return issues;
  }

  // Check grade-level appropriateness
  validateGradeLevel(question, grade, operation) {
    const issues = [];
    const numbers = question.match(/\d+/g)?.map(n => parseInt(n)) || [];
    const maxNum = Math.max(...numbers);

    // Grade-appropriate number ranges (Swiss Lehrplan 21 aligned)
    const gradeRanges = {
      1: { max: 20, operations: ['addition', 'subtraction'] },
      2: { max: 100, operations: ['addition', 'subtraction'] },
      3: { max: 1000, operations: ['addition', 'subtraction', 'multiplication'] },
      4: { max: 10000, operations: ['addition', 'subtraction', 'multiplication', 'division'] },
      5: { max: 100000, operations: ['addition', 'subtraction', 'multiplication', 'division'] },
      6: { max: 1000000, operations: ['addition', 'subtraction', 'multiplication', 'division'] }
    };

    const gradeSpec = gradeRanges[grade];
    if (gradeSpec && maxNum > gradeSpec.max) {
      issues.push({
        type: 'INAPPROPRIATE_NUMBER_RANGE',
        severity: 'MEDIUM',
        message: `Number ${maxNum} exceeds grade ${grade} maximum of ${gradeSpec.max}`,
        question: question
      });
    }

    return issues;
  }

  // Main validation function
  async validateQuestion(row) {
    this.results.total++;
    const { id, question, answers, correct_answer, grade, difficulty } = row;

    let questionIssues = [];

    try {
      // Parse answers (assuming JSON array or JSON object)
      let answerArray;
      if (typeof answers === 'string') {
        const parsed = JSON.parse(answers);
        answerArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
      } else if (Array.isArray(answers)) {
        answerArray = answers;
      } else if (typeof answers === 'object') {
        answerArray = Object.values(answers);
      } else {
        questionIssues.push({
          type: 'INVALID_ANSWER_FORMAT',
          severity: 'CRITICAL',
          message: 'Cannot parse answers',
          question: question
        });
        answerArray = [];
      }

      // Validate mathematical correctness
      const mathIssues = this.validateMathAnswer(question, correct_answer, answerArray);
      questionIssues = questionIssues.concat(mathIssues);

      // Validate grade level
      const gradeIssues = this.validateGradeLevel(question, grade, 'general');
      questionIssues = questionIssues.concat(gradeIssues);

      // Check if correct_answer index is valid
      if (Array.isArray(answerArray)) {
        const correctIdx = parseInt(correct_answer);
        if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= answerArray.length) {
          questionIssues.push({
            type: 'INVALID_CORRECT_ANSWER_INDEX',
            severity: 'CRITICAL',
            message: `Correct answer index ${correct_answer} is out of bounds for ${answerArray.length} answers`,
            question: question
          });
        }
      }

      // Determine pass/fail
      const hasCriticalIssues = questionIssues.some(issue => issue.severity === 'CRITICAL');

      if (hasCriticalIssues || questionIssues.length > 0) {
        this.results.failed++;
        this.results.issues.push({
          id,
          question,
          answers: answerArray,
          correct_answer,
          grade,
          difficulty,
          status: 'FAIL',
          issues: questionIssues
        });
        return { id, status: 'FAIL', issues: questionIssues };
      } else {
        this.results.passed++;
        return { id, status: 'PASS', issues: [] };
      }

    } catch (error) {
      this.results.failed++;
      questionIssues.push({
        type: 'VALIDATION_ERROR',
        severity: 'CRITICAL',
        message: error.message,
        question: question
      });
      this.results.issues.push({
        id,
        question,
        status: 'FAIL',
        issues: questionIssues
      });
      return { id, status: 'FAIL', issues: questionIssues };
    }
  }

  getSummary() {
    return {
      total: this.results.total,
      passed: this.results.passed,
      failed: this.results.failed,
      passRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%',
      issues: this.results.issues
    };
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting English Math QC Validation...\n');

  const validator = new MathQCValidator();

  try {
    // Query 100 random English math questions
    const query = `
      SELECT id, question, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'en' AND subject = 'math'
      ORDER BY RANDOM()
      LIMIT 100
    `;

    console.log('📊 Fetching 100 English math questions from database...');
    const result = await pool.query(query);
    console.log(`✓ Retrieved ${result.rows.length} questions\n`);

    // Validate each question
    const failedIds = [];

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];
      process.stdout.write(`\rValidating question ${i + 1}/${result.rows.length}...`);

      const validationResult = await validator.validateQuestion(row);

      if (validationResult.status === 'FAIL') {
        failedIds.push(validationResult.id);
      }
    }

    console.log('\n');

    // Update failed questions in database
    if (failedIds.length > 0) {
      console.log(`\n❌ Updating ${failedIds.length} failed questions with validation_status = 'rejected'...`);

      for (const id of failedIds) {
        await pool.query(
          `UPDATE questions SET validation_status = 'rejected' WHERE id = $1`,
          [id]
        );
      }
      console.log('✓ Database updated\n');
    }

    // Get summary
    const summary = validator.getSummary();

    // Print summary
    console.log('═══════════════════════════════════════════════════');
    console.log('                 QC VALIDATION REPORT              ');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total Questions Validated: ${summary.total}`);
    console.log(`✓ Passed: ${summary.passed}`);
    console.log(`✗ Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate}`);
    console.log('═══════════════════════════════════════════════════\n');

    if (summary.failed > 0) {
      console.log('Failed Questions Summary:');
      summary.issues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. Question ID: ${issue.id}`);
        console.log(`   Grade: ${issue.grade}, Difficulty: ${issue.difficulty}`);
        console.log(`   Question: "${issue.question}"`);
        console.log(`   Issues:`);
        issue.issues.forEach(i => {
          console.log(`   - [${i.severity}] ${i.type}: ${i.message}`);
        });
      });
    }

    // Write results to JSON file
    const outputPath = '/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-en-math.json';
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`\n📝 Results written to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the validation
main().catch(console.error);
