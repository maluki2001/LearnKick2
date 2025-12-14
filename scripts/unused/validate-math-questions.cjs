const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Validation results tracking
const validationResults = {
  total: 0,
  approved: 0,
  rejected: 0,
  errors: []
};

/**
 * Convert Roman numeral to decimal
 */
function romanToDecimal(roman) {
  const romanMap = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50,
    'C': 100, 'D': 500, 'M': 1000
  };

  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = romanMap[roman[i]];
    const next = romanMap[roman[i + 1]];

    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

/**
 * Convert decimal to Roman numeral
 */
function decimalToRoman(num) {
  const romanMap = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  let result = '';
  for (const [value, symbol] of romanMap) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

/**
 * Validate a single question's mathematical accuracy
 */
function validateQuestion(question) {
  const { id, question: text, type, answers, correct_answer, grade, difficulty } = question;

  try {
    // TRUE-FALSE QUESTIONS
    if (type === 'true-false') {
      // Check fraction addition
      if (text.includes('/') && text.includes('+')) {
        const match = text.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)\s*=\s*(\d+)/);
        if (match) {
          const n1 = parseInt(match[1]);
          const d1 = parseInt(match[2]);
          const n2 = parseInt(match[3]);
          const d2 = parseInt(match[4]);
          const result = parseInt(match[5]);
          const sum = n1/d1 + n2/d2;
          const expectedResult = result;
          const isCorrect = Math.abs(sum - expectedResult) < 0.0001;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Fraction addition incorrect: ${sum} ≠ ${expectedResult}` };
          }
        }
      }

      // Check area calculations (square)
      if (text.includes('Quadrat') && text.includes('Seitenlänge') && text.includes('Fläche')) {
        const sideMatch = text.match(/Seitenlänge (\d+)/);
        const areaMatch = text.match(/Fläche von (\d+)/);
        if (sideMatch && areaMatch) {
          const side = parseInt(sideMatch[1]);
          const area = parseInt(areaMatch[1]);
          const calculatedArea = side * side;
          const isCorrect = calculatedArea === area;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Square area incorrect: ${side}² = ${calculatedArea} but states ${area}` };
          }
        }
      }

      // Check area calculations (rectangle)
      if (text.includes('Rechteck') && text.includes('Länge') && text.includes('Breite') && text.includes('Fläche')) {
        const lengthMatch = text.match(/Länge (\d+)/);
        const widthMatch = text.match(/Breite (\d+)/);
        const areaMatch = text.match(/Fläche von (\d+)/);
        if (lengthMatch && widthMatch && areaMatch) {
          const length = parseInt(lengthMatch[1]);
          const width = parseInt(widthMatch[1]);
          const area = parseInt(areaMatch[1]);
          const calculatedArea = length * width;
          const isCorrect = calculatedArea === area;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Rectangle area incorrect: ${length}×${width} = ${calculatedArea} but states ${area}` };
          }
        }
      }

      // Check fraction equivalence
      if (text.includes('ist das Gleiche wie')) {
        const match = text.match(/(\d+)\/(\d+)\s+ist das Gleiche wie\s+(\d+)\/(\d+)/);
        if (match) {
          const n1 = parseInt(match[1]);
          const d1 = parseInt(match[2]);
          const n2 = parseInt(match[3]);
          const d2 = parseInt(match[4]);
          const frac1 = n1 / d1;
          const frac2 = n2 / d2;
          const isCorrect = Math.abs(frac1 - frac2) < 0.0001;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Fraction equivalence incorrect: ${n1}/${d1} = ${frac1} vs ${n2}/${d2} = ${frac2}` };
          }
        }
      }

      // Check fraction comparisons
      if (text.includes('kleiner als') || text.includes('grösser als')) {
        const match = text.match(/(\d+)\/(\d+)\s+ist\s+(kleiner|grösser)\s+als\s+(\d+)\/(\d+)/);
        if (match) {
          const n1 = parseInt(match[1]);
          const d1 = parseInt(match[2]);
          const comparison = match[3];
          const n2 = parseInt(match[4]);
          const d2 = parseInt(match[5]);
          const frac1 = n1 / d1;
          const frac2 = n2 / d2;
          const isSmaller = frac1 < frac2;
          const isGreater = frac1 > frac2;

          let isCorrect = false;
          if (comparison === 'kleiner' && isSmaller) isCorrect = true;
          if (comparison === 'grösser' && isGreater) isCorrect = true;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Fraction comparison incorrect: ${n1}/${d1} (${frac1}) vs ${n2}/${d2} (${frac2})` };
          }
        }
      }

      // Check Roman numeral statements
      if (text.includes('römische Zahl') && text.includes('bedeutet')) {
        const match = text.match(/römische Zahl ([IVXLCDM]+) bedeutet (\d+)/);
        if (match) {
          const roman = match[1];
          const decimal = parseInt(match[2]);
          const calculatedDecimal = romanToDecimal(roman);
          const expectedDecimal = decimal;
          const isCorrect = calculatedDecimal === expectedDecimal;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Roman numeral incorrect: ${roman} = ${calculatedDecimal} but states ${decimal}` };
          }
        }
      }

      // Check fraction of number statements
      if (text.match(/(\d+)\/(\d+)\s+von\s+(\d+)\s+ist\s+(\d+)/)) {
        const match = text.match(/(\d+)\/(\d+)\s+von\s+(\d+)\s+ist\s+(\d+)/);
        if (match) {
          const numerator = parseInt(match[1]);
          const denominator = parseInt(match[2]);
          const number = parseInt(match[3]);
          const result = parseInt(match[4]);
          const calculated = (numerator / denominator) * number;
          const expected = result;
          const isCorrect = Math.abs(calculated - expected) < 0.0001;

          if ((isCorrect && correct_answer !== 'true') || (!isCorrect && correct_answer !== 'false')) {
            return { valid: false, error: `Fraction of number incorrect: ${numerator}/${denominator} × ${number} = ${calculated} but states ${result}` };
          }
        }
      }
    }

    // NUMBER-INPUT QUESTIONS
    if (type === 'number-input') {
      const expectedAnswer = parseFloat(correct_answer);

      // Check basic arithmetic (addition)
      if (text.match(/(\d+)\s*\+\s*(\d+)/)) {
        const match = text.match(/(\d+)\s*\+\s*(\d+)/);
        if (match) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          const calculated = num1 + num2;
          if (calculated !== expectedAnswer) {
            return { valid: false, error: `Addition incorrect: ${num1} + ${num2} = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }

      // Check basic arithmetic (subtraction)
      if (text.match(/(\d+)\s*-\s*(\d+)/) && !text.includes('(')) {
        const match = text.match(/(\d+)\s*-\s*(\d+)/);
        if (match) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          const calculated = num1 - num2;
          if (calculated !== expectedAnswer) {
            return { valid: false, error: `Subtraction incorrect: ${num1} - ${num2} = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }

      // Check basic arithmetic (multiplication)
      if (text.match(/(\d+)\s*×\s*(\d+)/)) {
        const match = text.match(/(\d+)\s*×\s*(\d+)/);
        if (match) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          const calculated = num1 * num2;
          if (calculated !== expectedAnswer) {
            return { valid: false, error: `Multiplication incorrect: ${num1} × ${num2} = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }

      // Check negative number operations
      if (text.includes('+ (') && text.includes(')')) {
        const match = text.match(/(\d+)\s*\+\s*\((-?\d+)\)/);
        if (match) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          const calculated = num1 + num2;
          if (calculated !== expectedAnswer) {
            return { valid: false, error: `Negative addition incorrect: ${num1} + (${num2}) = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }

      // Check fraction of number
      if (text.match(/(\d+)\/(\d+)\s+von\s+(\d+)/)) {
        const match = text.match(/(\d+)\/(\d+)\s+von\s+(\d+)/);
        if (match) {
          const numerator = parseInt(match[1]);
          const denominator = parseInt(match[2]);
          const number = parseInt(match[3]);
          const calculated = (numerator / denominator) * number;
          if (Math.abs(calculated - expectedAnswer) > 0.0001) {
            return { valid: false, error: `Fraction of number incorrect: ${numerator}/${denominator} × ${number} = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }

      // Check Roman numeral conversion
      if (text.includes('römische') && (text.includes('bedeutet') || text.includes('Was bedeutet'))) {
        const match = text.match(/römische.*?([IVXLCDM]+)/);
        if (match) {
          const roman = match[1];
          const calculated = romanToDecimal(roman);
          if (calculated !== expectedAnswer) {
            return { valid: false, error: `Roman to decimal incorrect: ${roman} = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }

      // Check linear equations (3x + 8 = 35)
      if (text.match(/(\d+)x\s*\+\s*(\d+)\s*=\s*(\d+)/)) {
        const match = text.match(/(\d+)x\s*\+\s*(\d+)\s*=\s*(\d+)/);
        if (match) {
          const coefficient = parseInt(match[1]);
          const constant = parseInt(match[2]);
          const result = parseInt(match[3]);
          const calculated = (result - constant) / coefficient;
          if (Math.abs(calculated - expectedAnswer) > 0.0001) {
            return { valid: false, error: `Linear equation incorrect: ${coefficient}x + ${constant} = ${result}, x = ${calculated} but answer is ${expectedAnswer}` };
          }
        }
      }
    }

    // MULTIPLE-CHOICE QUESTIONS
    if (type === 'multiple-choice') {
      if (!answers || !Array.isArray(answers)) {
        return { valid: false, error: 'Missing or invalid answers array' };
      }

      if (!answers.includes(correct_answer)) {
        return { valid: false, error: `Correct answer "${correct_answer}" not in answers array` };
      }

      // Check Roman numeral conversion
      if (text.match(/Wie schreibt man (\d+) in römischen Zahlen/)) {
        const match = text.match(/Wie schreibt man (\d+) in römischen Zahlen/);
        if (match) {
          const decimal = parseInt(match[1]);
          const calculated = decimalToRoman(decimal);
          if (calculated !== correct_answer) {
            return { valid: false, error: `Roman numeral conversion incorrect: ${decimal} = ${calculated} but answer is ${correct_answer}` };
          }
        }
      }

      // Check fraction of price calculations
      if (text.match(/kostet\s+([\d.]+)\s+CHF.*?(\d+)\/(\d+)\s+davon/)) {
        const match = text.match(/kostet\s+([\d.]+)\s+CHF.*?(\d+)\/(\d+)\s+davon/);
        if (match) {
          const price = parseFloat(match[1]);
          const numerator = parseInt(match[2]);
          const denominator = parseInt(match[3]);
          const calculated = (price * numerator) / denominator;
          const expectedValue = parseFloat(correct_answer.replace(/[^\d.]/g, ''));
          if (Math.abs(calculated - expectedValue) > 0.01) {
            return { valid: false, error: `Price fraction incorrect: ${price} × ${numerator}/${denominator} = ${calculated.toFixed(2)} but answer is ${expectedValue}` };
          }
        }
      }

      // Check division word problems
      if (text.includes('teilt') && text.includes('gleiche Teile')) {
        const match = text.match(/(\d+)\s+\w+\s+.*?(\d+)\s+\w+\s+in\s+(\d+)\s+gleiche Teile/);
        if (match) {
          const total = parseInt(match[1]);
          const parts = parseInt(match[3]);
          const calculated = total / parts;
          const expectedValue = parseInt(correct_answer.replace(/[^\d]/g, ''));
          if (Math.abs(calculated - expectedValue) > 0.0001) {
            return { valid: false, error: `Division problem incorrect: ${total} ÷ ${parts} = ${calculated} but answer is ${expectedValue}` };
          }
        }
      }

      // Check area calculations
      if (text.match(/(\d+)\s+m\s+lang.*?(\d+)\s+m\s+breit.*?Fläche/)) {
        const match = text.match(/(\d+)\s+m\s+lang.*?(\d+)\s+m\s+breit/);
        if (match) {
          const length = parseInt(match[1]);
          const width = parseInt(match[2]);
          const calculated = length * width;
          const expectedValue = parseInt(correct_answer.replace(/[^\d]/g, ''));
          if (calculated !== expectedValue) {
            return { valid: false, error: `Area calculation incorrect: ${length} × ${width} = ${calculated} but answer is ${expectedValue}` };
          }
        }
      }

      // Check area calculations (cm)
      if (text.match(/(\d+)\s+cm\s+lang.*?(\d+)\s+cm\s+breit.*?Fläche/)) {
        const match = text.match(/(\d+)\s+cm\s+lang.*?(\d+)\s+cm\s+breit/);
        if (match) {
          const length = parseInt(match[1]);
          const width = parseInt(match[2]);
          const calculated = length * width;
          const expectedValue = parseInt(correct_answer.replace(/[^\d]/g, ''));
          if (calculated !== expectedValue) {
            return { valid: false, error: `Area calculation (cm) incorrect: ${length} × ${width} = ${calculated} but answer is ${expectedValue}` };
          }
        }
      }

      // Check simple multiplication in word problems
      if (text.match(/(\d+)\s+\w+\s+für\s+je\s+([\d.]+)\s+CHF/)) {
        const match = text.match(/(\d+)\s+\w+\s+für\s+je\s+([\d.]+)\s+CHF/);
        if (match) {
          const quantity = parseInt(match[1]);
          const price = parseFloat(match[2]);
          const calculated = quantity * price;
          const expectedValue = parseFloat(correct_answer.replace(/[^\d.]/g, ''));
          if (Math.abs(calculated - expectedValue) > 0.01) {
            return { valid: false, error: `Price multiplication incorrect: ${quantity} × ${price} = ${calculated} but answer is ${expectedValue}` };
          }
        }
      }

      // Check fraction of quantity
      if (text.match(/hat\s+(\d+)\s+\w+.*?(\d+)\/(\d+)\s+davon/)) {
        const match = text.match(/hat\s+(\d+)\s+\w+.*?(\d+)\/(\d+)\s+davon/);
        if (match) {
          const total = parseInt(match[1]);
          const numerator = parseInt(match[2]);
          const denominator = parseInt(match[3]);
          const calculated = (total * numerator) / denominator;
          const expectedValue = parseInt(correct_answer.replace(/[^\d]/g, ''));
          if (Math.abs(calculated - expectedValue) > 0.0001) {
            return { valid: false, error: `Fraction of quantity incorrect: ${total} × ${numerator}/${denominator} = ${calculated} but answer is ${expectedValue}` };
          }
        }
      }

      // Check fraction simplification in cake problems
      if (text.includes('geschnitten') && text.includes('isst') && text.includes('Stücke')) {
        const match = text.match(/in\s+(\d+)\s+gleiche Teile.*?isst\s+(\d+)\s+Stücke/);
        if (match) {
          const total = parseInt(match[1]);
          const eaten = parseInt(match[2]);
          const numerator = eaten;
          const denominator = total;

          // Simplify fraction
          const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
          const divisor = gcd(numerator, denominator);
          const simplifiedNum = numerator / divisor;
          const simplifiedDen = denominator / divisor;
          const expectedFraction = `${simplifiedNum}/${simplifiedDen}`;

          if (correct_answer !== expectedFraction) {
            return { valid: false, error: `Fraction simplification incorrect: ${numerator}/${denominator} = ${expectedFraction} but answer is ${correct_answer}` };
          }
        }
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

/**
 * Main validation function
 */
async function validateQuestions() {
  try {
    console.log('Fetching questions from database...\n');

    const result = await pool.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty, subject
      FROM questions
      WHERE language = 'de'
        AND subject = 'math'
        AND validation_status = 'qc_passed'
      LIMIT 200
    `);

    const questions = result.rows;
    validationResults.total = questions.length;

    console.log(`Found ${questions.length} questions to validate\n`);
    console.log('Starting validation...\n');

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const validation = validateQuestion(question);

      if (validation.valid) {
        // Approve question
        await pool.query(`
          UPDATE questions
          SET validation_status = 'approved',
              quality_score = 95
          WHERE id = $1
        `, [question.id]);

        validationResults.approved++;
        console.log(`✓ [${i + 1}/${questions.length}] Approved: ${question.question.substring(0, 60)}...`);
      } else {
        // Reject question
        await pool.query(`
          UPDATE questions
          SET validation_status = 'rejected',
              quality_score = 30
          WHERE id = $1
        `, [question.id]);

        validationResults.rejected++;
        validationResults.errors.push({
          id: question.id,
          question: question.question,
          error: validation.error
        });

        console.log(`✗ [${i + 1}/${questions.length}] Rejected: ${question.question.substring(0, 60)}...`);
        console.log(`  Error: ${validation.error}\n`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total questions validated: ${validationResults.total}`);
    console.log(`Approved: ${validationResults.approved} (${((validationResults.approved/validationResults.total)*100).toFixed(1)}%)`);
    console.log(`Rejected: ${validationResults.rejected} (${((validationResults.rejected/validationResults.total)*100).toFixed(1)}%)`);

    if (validationResults.rejected > 0) {
      console.log('\n' + '-'.repeat(80));
      console.log('REJECTED QUESTIONS:');
      console.log('-'.repeat(80));
      validationResults.errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. Question: ${err.question}`);
        console.log(`   ID: ${err.id}`);
        console.log(`   Error: ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Run validation
validateQuestions();
