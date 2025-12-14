const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Validation functions
function validateMultipleChoice(question, answers, correctAnswer, grade) {
  const errors = [];

  // Parse answers and correct answer
  let answerArray;
  try {
    answerArray = typeof answers === 'string' ? JSON.parse(answers) : answers;
  } catch (e) {
    errors.push('Invalid answers JSON format');
    return errors;
  }

  if (!Array.isArray(answerArray) || answerArray.length !== 4) {
    errors.push('Must have exactly 4 answer options');
  }

  const correctIndex = parseInt(correctAnswer);
  if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    errors.push('Invalid correct_answer index');
  }

  // Check for duplicates
  const uniqueAnswers = new Set(answerArray);
  if (uniqueAnswers.size !== answerArray.length) {
    errors.push('Duplicate answers found');
  }

  // Validate mathematical correctness based on question type
  const questionLower = question.toLowerCase();

  // Addition problems
  if (questionLower.includes('+') || questionLower.includes('plus')) {
    const match = question.match(/(\d+)\s*\+\s*(\d+)/);
    if (match) {
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      const expectedAnswer = num1 + num2;

      if (!answerArray.includes(expectedAnswer.toString()) && !answerArray.includes(expectedAnswer)) {
        errors.push(`Correct answer ${expectedAnswer} not in options`);
      }

      const correctOption = answerArray[correctIndex];
      if (parseInt(correctOption) !== expectedAnswer) {
        errors.push(`Marked answer ${correctOption} is incorrect, should be ${expectedAnswer}`);
      }
    }
  }

  // Subtraction problems
  if (questionLower.includes('-') || questionLower.includes('minus')) {
    const match = question.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      const expectedAnswer = num1 - num2;

      if (!answerArray.includes(expectedAnswer.toString()) && !answerArray.includes(expectedAnswer)) {
        errors.push(`Correct answer ${expectedAnswer} not in options`);
      }

      const correctOption = answerArray[correctIndex];
      if (parseInt(correctOption) !== expectedAnswer) {
        errors.push(`Marked answer ${correctOption} is incorrect, should be ${expectedAnswer}`);
      }
    }
  }

  // Multiplication problems
  if (questionLower.includes('×') || questionLower.includes('*') || questionLower.includes('mal')) {
    const match = question.match(/(\d+)\s*[×*]\s*(\d+)/) || question.match(/(\d+)\s+mal\s+(\d+)/);
    if (match) {
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      const expectedAnswer = num1 * num2;

      if (!answerArray.includes(expectedAnswer.toString()) && !answerArray.includes(expectedAnswer)) {
        errors.push(`Correct answer ${expectedAnswer} not in options`);
      }

      const correctOption = answerArray[correctIndex];
      if (parseInt(correctOption) !== expectedAnswer) {
        errors.push(`Marked answer ${correctOption} is incorrect, should be ${expectedAnswer}`);
      }
    }
  }

  // Division problems
  if (questionLower.includes('÷') || questionLower.includes('/') || questionLower.includes('geteilt')) {
    const match = question.match(/(\d+)\s*[÷/]\s*(\d+)/) || question.match(/(\d+)\s+geteilt\s+durch\s+(\d+)/);
    if (match) {
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      const expectedAnswer = num1 / num2;

      if (Number.isInteger(expectedAnswer)) {
        if (!answerArray.includes(expectedAnswer.toString()) && !answerArray.includes(expectedAnswer)) {
          errors.push(`Correct answer ${expectedAnswer} not in options`);
        }

        const correctOption = answerArray[correctIndex];
        if (parseInt(correctOption) !== expectedAnswer) {
          errors.push(`Marked answer ${correctOption} is incorrect, should be ${expectedAnswer}`);
        }
      }
    }
  }

  // Grade appropriateness
  const allNumbers = answerArray.map(a => parseInt(a)).filter(n => !isNaN(n));
  const maxNumber = Math.max(...allNumbers);

  if (grade === 1 && maxNumber > 20) {
    errors.push('Numbers too large for Grade 1 (max 20)');
  } else if (grade === 2 && maxNumber > 100) {
    errors.push('Numbers too large for Grade 2 (max 100)');
  }

  return errors;
}

function validateTrueFalse(question, correctAnswer) {
  const errors = [];

  if (correctAnswer !== 'true' && correctAnswer !== 'false') {
    errors.push('correct_answer must be "true" or "false"');
  }

  // Validate statement correctness
  const questionLower = question.toLowerCase();

  // Simple arithmetic validation
  if (questionLower.includes('=')) {
    const match = question.match(/(\d+)\s*([+\-×*/])\s*(\d+)\s*=\s*(\d+)/);
    if (match) {
      const num1 = parseInt(match[1]);
      const operator = match[2];
      const num2 = parseInt(match[3]);
      const result = parseInt(match[4]);

      let actualResult;
      switch(operator) {
        case '+': actualResult = num1 + num2; break;
        case '-': actualResult = num1 - num2; break;
        case '×': case '*': actualResult = num1 * num2; break;
        case '/': case '÷': actualResult = num1 / num2; break;
      }

      const isCorrectStatement = actualResult === result;
      const markedCorrect = correctAnswer === 'true';

      if (isCorrectStatement !== markedCorrect) {
        errors.push(`Statement is ${isCorrectStatement ? 'correct' : 'incorrect'} but marked as ${correctAnswer}`);
      }
    }
  }

  return errors;
}

function validateNumberInput(question, correctAnswer, grade) {
  const errors = [];

  const numAnswer = parseFloat(correctAnswer);
  if (isNaN(numAnswer)) {
    errors.push('correct_answer must be a valid number');
  }

  // Extract expected answer from question
  const questionLower = question.toLowerCase();

  // Addition
  if (questionLower.includes('+') || questionLower.includes('plus')) {
    const match = question.match(/(\d+)\s*\+\s*(\d+)/);
    if (match) {
      const expectedAnswer = parseInt(match[1]) + parseInt(match[2]);
      if (numAnswer !== expectedAnswer) {
        errors.push(`Answer ${numAnswer} is incorrect, should be ${expectedAnswer}`);
      }
    }
  }

  // Subtraction
  if (questionLower.includes('-') || questionLower.includes('minus')) {
    const match = question.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      const expectedAnswer = parseInt(match[1]) - parseInt(match[2]);
      if (numAnswer !== expectedAnswer) {
        errors.push(`Answer ${numAnswer} is incorrect, should be ${expectedAnswer}`);
      }
    }
  }

  // Multiplication
  if (questionLower.includes('×') || questionLower.includes('*') || questionLower.includes('mal')) {
    const match = question.match(/(\d+)\s*[×*]\s*(\d+)/) || question.match(/(\d+)\s+mal\s+(\d+)/);
    if (match) {
      const expectedAnswer = parseInt(match[1]) * parseInt(match[2]);
      if (numAnswer !== expectedAnswer) {
        errors.push(`Answer ${numAnswer} is incorrect, should be ${expectedAnswer}`);
      }
    }
  }

  // Grade appropriateness
  if (grade === 1 && numAnswer > 20) {
    errors.push('Answer too large for Grade 1 (max 20)');
  } else if (grade === 2 && numAnswer > 100) {
    errors.push('Answer too large for Grade 2 (max 100)');
  }

  return errors;
}

async function validateGermanMathQuestions() {
  const client = await pool.connect();

  try {
    console.log('🔍 Fetching German math questions with qc_passed status...\n');

    const result = await client.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'de'
        AND subject = 'math'
        AND validation_status = 'qc_passed'
      ORDER BY grade, id
    `);

    const questions = result.rows;
    console.log(`📊 Found ${questions.length} questions to validate\n`);

    if (questions.length === 0) {
      console.log('✅ No questions to validate');
      return { total: 0, approved: 0, rejected: 0, errors: [] };
    }

    let approved = 0;
    let rejected = 0;
    const rejectionDetails = [];

    console.log('Starting validation...\n');

    for (const q of questions) {
      const errors = [];

      // Validate based on question type
      switch(q.type) {
        case 'multiple-choice':
          errors.push(...validateMultipleChoice(q.question, q.answers, q.correct_answer, q.grade));
          break;
        case 'true-false':
          errors.push(...validateTrueFalse(q.question, q.correct_answer));
          break;
        case 'number-input':
          errors.push(...validateNumberInput(q.question, q.correct_answer, q.grade));
          break;
        default:
          errors.push(`Unknown question type: ${q.type}`);
      }

      // Update database based on validation
      if (errors.length === 0) {
        // Approve question
        await client.query(`
          UPDATE questions
          SET validation_status = 'approved',
              quality_score = 95,
              updated_at = NOW()
          WHERE id = $1
        `, [q.id]);

        approved++;
        console.log(`✅ ID ${q.id}: APPROVED (Grade ${q.grade}, ${q.type})`);
      } else {
        // Reject question
        await client.query(`
          UPDATE questions
          SET validation_status = 'rejected',
              quality_score = 30,
              updated_at = NOW()
          WHERE id = $1
        `, [q.id]);

        rejected++;
        rejectionDetails.push({
          id: q.id,
          grade: q.grade,
          type: q.type,
          question: q.question,
          errors: errors
        });

        console.log(`❌ ID ${q.id}: REJECTED - ${errors.join('; ')}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Validated: ${questions.length}`);
    console.log(`✅ Approved: ${approved} (${((approved/questions.length)*100).toFixed(1)}%)`);
    console.log(`❌ Rejected: ${rejected} (${((rejected/questions.length)*100).toFixed(1)}%)`);

    if (rejectionDetails.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('REJECTION DETAILS');
      console.log('='.repeat(80));

      rejectionDetails.forEach(detail => {
        console.log(`\nID ${detail.id} (Grade ${detail.grade}, ${detail.type}):`);
        console.log(`Question: ${detail.question}`);
        console.log(`Errors:`);
        detail.errors.forEach(err => console.log(`  - ${err}`));
      });
    }

    return {
      total: questions.length,
      approved,
      rejected,
      errors: rejectionDetails
    };

  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run validation
validateGermanMathQuestions()
  .then(result => {
    console.log('\n✅ Validation complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
