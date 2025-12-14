// Script to fix Lehrplan 21 math curriculum violations in the database
// This script identifies incorrectly graded math questions and moves them to correct grades

const http = require('http');

// Lehrplan 21 Grade Rules for Mathematics
const GRADE_RULES = {
  1: {
    multiplication: { allowed: false },
    division: { allowed: false },
    addition: { maxSum: 20 },
    subtraction: { maxMinuend: 20 },
    numberRange: { max: 20 }
  },
  2: {
    multiplication: { allowed: true, maxFactor: 5 },
    division: { allowed: true, maxDividend: 25, maxDivisor: 5 },
    addition: { maxSum: 100 },
    subtraction: { maxMinuend: 100 },
    numberRange: { max: 100 }
  },
  3: {
    multiplication: { allowed: true, maxFactor: 10 },
    division: { allowed: true, maxDividend: 100, maxDivisor: 10 },
    addition: { maxSum: 1000 },
    subtraction: { maxMinuend: 1000 },
    numberRange: { max: 1000 }
  },
  4: {
    multiplication: { allowed: true, maxFactor: 12, twoDigitAllowed: true },
    division: { allowed: true, maxDividend: 1000, maxDivisor: 12 },
    addition: { maxSum: 10000 },
    subtraction: { maxMinuend: 10000 },
    numberRange: { max: 10000 }
  },
  5: {
    multiplication: { allowed: true, multiDigitAllowed: true },
    division: { allowed: true, longDivision: true },
    addition: { maxSum: 100000 },
    subtraction: { maxMinuend: 100000 },
    numberRange: { max: 100000 }
  },
  6: {
    multiplication: { allowed: true, multiDigitAllowed: true },
    division: { allowed: true, longDivision: true },
    addition: { maxSum: 1000000 },
    subtraction: { maxMinuend: 1000000 },
    numberRange: { max: 1000000 }
  }
};

// Detect operation type and extract numbers from question text
function analyzeQuestion(questionText) {
  const text = (questionText || '').toLowerCase();

  // Multiplication patterns
  const multPatterns = [
    /(\d+)\s*[x*]\s*(\d+)/i,
    /(\d+)\s*mal\s*(\d+)/i,
    /(\d+)\s*fois\s*(\d+)/i,
    /(\d+)\s*times\s*(\d+)/i,
    /multiply\s*(\d+)\s*(?:and|by)\s*(\d+)/i,
    /multipliziere\s*(\d+)\s*(?:und|mit)\s*(\d+)/i,
  ];

  for (const pattern of multPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        operation: 'multiplication',
        numbers: [parseInt(match[1]), parseInt(match[2])],
        maxFactor: Math.max(parseInt(match[1]), parseInt(match[2]))
      };
    }
  }

  // Division patterns
  const divPatterns = [
    /(\d+)\s*[:/]\s*(\d+)/,
    /(\d+)\s*geteilt\s*(?:durch)?\s*(\d+)/i,
    /(\d+)\s*divise\s*par\s*(\d+)/i,
    /(\d+)\s*divided\s*by\s*(\d+)/i,
  ];

  for (const pattern of divPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        operation: 'division',
        dividend: parseInt(match[1]),
        divisor: parseInt(match[2])
      };
    }
  }

  // Addition patterns
  const addPatterns = [
    /(\d+)\s*\+\s*(\d+)/,
    /(\d+)\s*plus\s*(\d+)/i,
    /addiere\s*(\d+)\s*(?:und|zu)\s*(\d+)/i,
  ];

  for (const pattern of addPatterns) {
    const match = text.match(pattern);
    if (match) {
      const a = parseInt(match[1]);
      const b = parseInt(match[2]);
      return {
        operation: 'addition',
        numbers: [a, b],
        sum: a + b
      };
    }
  }

  // Subtraction patterns
  const subPatterns = [
    /(\d+)\s*-\s*(\d+)/,
    /(\d+)\s*minus\s*(\d+)/i,
    /(\d+)\s*weniger\s*(\d+)/i,
  ];

  for (const pattern of subPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        operation: 'subtraction',
        minuend: parseInt(match[1]),
        subtrahend: parseInt(match[2])
      };
    }
  }

  return null;
}

// Determine correct grade for a math question based on Lehrplan 21
function getCorrectGrade(analysis, currentGrade) {
  if (!analysis) return currentGrade;

  switch (analysis.operation) {
    case 'multiplication': {
      const maxFactor = analysis.maxFactor;
      if (maxFactor <= 5) return Math.max(2, currentGrade); // Grade 2+
      if (maxFactor <= 10) return Math.max(3, currentGrade); // Grade 3+
      if (maxFactor <= 12) return Math.max(4, currentGrade); // Grade 4+
      return Math.max(5, currentGrade); // Grade 5+ for larger
    }

    case 'division': {
      const { dividend, divisor } = analysis;
      if (dividend <= 25 && divisor <= 5) return Math.max(2, currentGrade);
      if (dividend <= 100 && divisor <= 10) return Math.max(3, currentGrade);
      if (dividend <= 1000 && divisor <= 12) return Math.max(4, currentGrade);
      return Math.max(5, currentGrade);
    }

    case 'addition': {
      const sum = analysis.sum;
      if (sum <= 20) return 1;
      if (sum <= 100) return Math.max(2, currentGrade);
      if (sum <= 1000) return Math.max(3, currentGrade);
      if (sum <= 10000) return Math.max(4, currentGrade);
      if (sum <= 100000) return Math.max(5, currentGrade);
      return Math.max(6, currentGrade);
    }

    case 'subtraction': {
      const minuend = analysis.minuend;
      if (minuend <= 20) return 1;
      if (minuend <= 100) return Math.max(2, currentGrade);
      if (minuend <= 1000) return Math.max(3, currentGrade);
      if (minuend <= 10000) return Math.max(4, currentGrade);
      if (minuend <= 100000) return Math.max(5, currentGrade);
      return Math.max(6, currentGrade);
    }

    default:
      return currentGrade;
  }
}

// Check if question violates curriculum for its current grade
function isViolation(analysis, currentGrade) {
  if (!analysis) return false;

  const rules = GRADE_RULES[currentGrade];
  if (!rules) return false;

  switch (analysis.operation) {
    case 'multiplication':
      if (!rules.multiplication.allowed) return true;
      if (rules.multiplication.maxFactor && analysis.maxFactor > rules.multiplication.maxFactor) return true;
      return false;

    case 'division':
      if (!rules.division.allowed) return true;
      if (rules.division.maxDividend && analysis.dividend > rules.division.maxDividend) return true;
      if (rules.division.maxDivisor && analysis.divisor > rules.division.maxDivisor) return true;
      return false;

    case 'addition':
      if (rules.addition.maxSum && analysis.sum > rules.addition.maxSum) return true;
      return false;

    case 'subtraction':
      if (rules.subtraction.maxMinuend && analysis.minuend > rules.subtraction.maxMinuend) return true;
      return false;

    default:
      return false;
  }
}

// Fetch all math questions from API
async function fetchMathQuestions() {
  return new Promise((resolve, reject) => {
    const url = 'http://localhost:3000/api/questions?subject=math';
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.questions || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Update question grade via API
async function updateQuestionGrade(questionId, newGrade) {
  return new Promise((resolve, reject) => {
    // API expects: { questionId, updates, isGlobal: true } for global questions
    const postData = JSON.stringify({
      questionId: questionId,
      updates: { grade: newGrade },
      isGlobal: true  // These are global questions
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/questions',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('LEHRPLAN 21 MATH CURRICULUM VIOLATION FIXER');
  console.log('='.repeat(70));
  console.log('');

  try {
    console.log('Fetching all math questions from database...');
    const questions = await fetchMathQuestions();
    console.log(`Found ${questions.length} math questions total`);
    console.log('');

    // Analyze all questions and find violations
    const violations = [];
    const byGrade = {};

    for (const q of questions) {
      const analysis = analyzeQuestion(q.question || q.statement);
      if (analysis) {
        const currentGrade = parseInt(q.grade) || 1;
        if (isViolation(analysis, currentGrade)) {
          const correctGrade = getCorrectGrade(analysis, currentGrade);
          if (correctGrade !== currentGrade) {
            violations.push({
              id: q.id,
              question: q.question || q.statement,
              language: q.language,
              currentGrade,
              correctGrade,
              analysis,
              reason: `${analysis.operation}: ${JSON.stringify(analysis)}`
            });

            const key = `${currentGrade}->${correctGrade}`;
            if (!byGrade[key]) byGrade[key] = [];
            byGrade[key].push(q);
          }
        }
      }
    }

    console.log('='.repeat(70));
    console.log('VIOLATIONS FOUND:', violations.length);
    console.log('='.repeat(70));
    console.log('');

    if (violations.length === 0) {
      console.log('No curriculum violations found! All questions are correctly graded.');
      return;
    }

    // Summary by grade change
    console.log('Grade Changes Needed:');
    Object.keys(byGrade).sort().forEach(key => {
      console.log(`  ${key}: ${byGrade[key].length} questions`);
    });
    console.log('');

    // Summary by language
    const byLang = {};
    violations.forEach(v => {
      if (!byLang[v.language]) byLang[v.language] = 0;
      byLang[v.language]++;
    });
    console.log('By Language:');
    Object.keys(byLang).sort().forEach(lang => {
      console.log(`  ${lang.toUpperCase()}: ${byLang[lang]} questions`);
    });
    console.log('');

    // Show sample violations
    console.log('='.repeat(70));
    console.log('SAMPLE VIOLATIONS (first 10):');
    console.log('='.repeat(70));

    violations.slice(0, 10).forEach((v, i) => {
      console.log('');
      console.log(`${i + 1}. [${v.language.toUpperCase()}] Grade ${v.currentGrade} -> Grade ${v.correctGrade}`);
      console.log(`   Question: "${v.question.substring(0, 80)}${v.question.length > 80 ? '...' : ''}"`);
      console.log(`   Reason: ${v.reason}`);
      console.log(`   ID: ${v.id}`);
    });
    console.log('');

    // Apply fixes
    console.log('='.repeat(70));
    console.log('APPLYING FIXES...');
    console.log('='.repeat(70));
    console.log('');

    let fixed = 0;
    let failed = 0;

    for (const v of violations) {
      process.stdout.write(`Fixing ${v.id.substring(0, 8)}... `);
      try {
        const result = await updateQuestionGrade(v.id, v.correctGrade);
        if (result.success) {
          console.log(`OK (Grade ${v.currentGrade} -> ${v.correctGrade})`);
          fixed++;
        } else {
          console.log(`FAILED: ${result.error || 'Unknown error'}`);
          failed++;
        }
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
        failed++;
      }
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('FIX SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total violations found: ${violations.length}`);
    console.log(`Successfully fixed: ${fixed}`);
    console.log(`Failed to fix: ${failed}`);
    console.log('');

    if (fixed > 0) {
      console.log('All questions now comply with Swiss Lehrplan 21 math curriculum!');
    }

  } catch (e) {
    console.error('Error:', e.message);
    console.log('');
    console.log('Make sure the dev server is running on http://localhost:3000');
  }
}

main();
