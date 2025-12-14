/**
 * AI-Powered QC Validation Script for LearnKick Questions
 * Uses OpenAI GPT-4 to verify factual accuracy of questions and answers
 */

const OpenAI = require('openai');
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Configuration
const BATCH_SIZE = 10; // Questions per API call
const DELAY_BETWEEN_BATCHES = 500; // 0.5 second delay to respect rate limits
const MAX_QUESTIONS = process.env.QC_MAX_QUESTIONS ? parseInt(process.env.QC_MAX_QUESTIONS) : null;

// QC Results tracking
const qcResults = {
  total: 0,
  passed: 0,
  failed: 0,
  flagged: 0,
  errors: [],
  apiCalls: 0,
  startTime: null,
  endTime: null
};

/**
 * Build the QC prompt for a batch of questions
 */
function buildQCPrompt(questions, language) {
  const langName = { de: 'German', en: 'English', fr: 'French' }[language] || language;
  const langContext = {
    de: 'Swiss German (Lehrplan 21 curriculum, use "ss" not "ß", CHF currency, Swiss cities)',
    en: 'British English (colour not color, metre not meter, metric system)',
    fr: 'Swiss French (septante/huitante/nonante for 70/80/90, Plan d\'études romand)'
  }[language];

  return `You are a Quality Control expert for Swiss primary school educational questions (grades 1-6).

LANGUAGE CONTEXT: ${langContext}

For each question below, verify:
1. Is the marked correct answer ACTUALLY correct?
2. Are ALL other options ACTUALLY wrong?
3. Is there any ambiguity where multiple answers could be correct?
4. Are all facts (math, science, history, geography) accurate?
5. Is the content appropriate for the specified grade level?

QUESTIONS TO VERIFY:
${questions.map((q, i) => `
---QUESTION ${i + 1}---
ID: ${q.id}
Grade: ${q.grade}
Subject: ${q.subject}
Difficulty: ${q.difficulty}
Type: ${q.type}
Question: ${q.question}
${q.type === 'multiple-choice' ? `Options: ${q.answers?.join(' | ') || 'N/A'}` : ''}
Marked Correct Answer: ${q.correct_answer}
---END QUESTION ${i + 1}---
`).join('\n')}

Respond with a JSON array containing one object per question:
[
  {
    "id": "question_id",
    "status": "PASS" | "FAIL" | "FLAG_FOR_REVIEW",
    "correct_answer_valid": true | false,
    "wrong_answers_valid": true | false,
    "factually_accurate": true | false,
    "grade_appropriate": true | false,
    "issues": ["list of specific issues found, empty if none"],
    "suggested_fix": "suggested correction if needed, null if none",
    "confidence": 0.0-1.0
  }
]

IMPORTANT:
- Be strict about factual accuracy
- For math: verify calculations are correct
- For science/history/geography: verify facts are accurate
- PASS only if everything is correct
- FAIL if the correct answer is wrong or any other option could be correct
- FLAG_FOR_REVIEW if there's minor ambiguity or borderline issues
- Return ONLY valid JSON, no additional text`;
}

/**
 * Validate a batch of questions using OpenAI API
 */
async function validateBatchWithAI(questions, language) {
  const prompt = buildQCPrompt(questions, language);

  try {
    qcResults.apiCalls++;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a strict QC validator for educational content. Always respond with valid JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4096
    });

    const content = response.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response as JSON');
      return questions.map(q => ({
        id: q.id,
        status: 'FLAG_FOR_REVIEW',
        issues: ['AI response parsing failed'],
        confidence: 0.5
      }));
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI API Error:', error.message);
    return questions.map(q => ({
      id: q.id,
      status: 'FLAG_FOR_REVIEW',
      issues: [`API error: ${error.message}`],
      confidence: 0.5
    }));
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main AI QC function
 */
async function runAIQC() {
  const client = await pool.connect();
  qcResults.startTime = new Date();

  try {
    console.log('');
    console.log('='.repeat(60));
    console.log('   AI-POWERED QUALITY CONTROL VALIDATION');
    console.log('   Using OpenAI GPT-4o-mini for Factual Accuracy');
    console.log('='.repeat(60));
    console.log('');

    // Fetch questions grouped by language
    let query = `
      SELECT id, question, type, subject, grade, difficulty, language,
             answers, correct_answer, correct_index
      FROM questions
      ORDER BY language, subject, grade
    `;

    if (MAX_QUESTIONS) {
      console.log(`Note: Limited to ${MAX_QUESTIONS} questions for testing\n`);
    }

    const result = await client.query(query);
    let questions = result.rows;

    if (MAX_QUESTIONS) {
      questions = questions.slice(0, MAX_QUESTIONS);
    }

    console.log(`Found ${questions.length} questions to validate\n`);
    qcResults.total = questions.length;

    // Group questions by language
    const byLanguage = {
      de: questions.filter(q => q.language === 'de'),
      en: questions.filter(q => q.language === 'en'),
      fr: questions.filter(q => q.language === 'fr')
    };

    console.log('Distribution:');
    console.log(`  German:  ${byLanguage.de.length} questions`);
    console.log(`  English: ${byLanguage.en.length} questions`);
    console.log(`  French:  ${byLanguage.fr.length} questions`);
    console.log('');

    // Process each language
    const allResults = [];

    for (const [lang, langQuestions] of Object.entries(byLanguage)) {
      if (langQuestions.length === 0) continue;

      const langName = { de: 'German', en: 'English', fr: 'French' }[lang];
      console.log(`\nProcessing ${langName} questions...`);

      // Process in batches
      for (let i = 0; i < langQuestions.length; i += BATCH_SIZE) {
        const batch = langQuestions.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(langQuestions.length / BATCH_SIZE);

        process.stdout.write(`  Batch ${batchNum}/${totalBatches} (${batch.length} questions)... `);

        const batchResults = await validateBatchWithAI(batch, lang);
        allResults.push(...batchResults);

        // Count results
        batchResults.forEach(r => {
          if (r.status === 'PASS') qcResults.passed++;
          else if (r.status === 'FAIL') {
            qcResults.failed++;
            qcResults.errors.push({
              id: r.id,
              issues: r.issues,
              suggested_fix: r.suggested_fix
            });
          }
          else qcResults.flagged++;
        });

        console.log('done');

        // Rate limiting delay
        if (i + BATCH_SIZE < langQuestions.length) {
          await sleep(DELAY_BETWEEN_BATCHES);
        }
      }
    }

    // Update database with AI QC results
    console.log('\nUpdating database with AI QC results...');

    let updateCount = 0;
    for (const result of allResults) {
      const status = {
        'PASS': 'approved',
        'FAIL': 'rejected',
        'FLAG_FOR_REVIEW': 'flagged'
      }[result.status] || 'flagged';

      const score = Math.round((result.confidence || 0.5) * 100);

      await client.query(`
        UPDATE questions
        SET validation_status = $1,
            quality_score = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [status, score, result.id]);

      updateCount++;
      if (updateCount % 100 === 0) {
        process.stdout.write(`  Updated ${updateCount}/${allResults.length}...\r`);
      }
    }
    console.log(`  Updated ${updateCount} questions          `);

    qcResults.endTime = new Date();
    const duration = (qcResults.endTime - qcResults.startTime) / 1000;

    // Print report
    console.log('');
    console.log('='.repeat(60));
    console.log('                 AI QC VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log('');
    console.log('SUMMARY');
    console.log('-'.repeat(60));
    console.log(`  Total Questions:     ${qcResults.total}`);
    console.log(`  Passed (approved):   ${qcResults.passed} (${(qcResults.passed/qcResults.total*100).toFixed(1)}%)`);
    console.log(`  Failed (rejected):   ${qcResults.failed} (${(qcResults.failed/qcResults.total*100).toFixed(1)}%)`);
    console.log(`  Flagged for review:  ${qcResults.flagged} (${(qcResults.flagged/qcResults.total*100).toFixed(1)}%)`);
    console.log('');
    console.log('PERFORMANCE');
    console.log('-'.repeat(60));
    console.log(`  API Calls:           ${qcResults.apiCalls}`);
    console.log(`  Duration:            ${duration.toFixed(1)} seconds`);
    console.log(`  Questions/second:    ${(qcResults.total / duration).toFixed(1)}`);
    console.log('');

    // Show failed questions
    if (qcResults.errors.length > 0) {
      console.log('FAILED QUESTIONS (need correction)');
      console.log('-'.repeat(60));

      // Get question details for failed IDs
      const failedIds = qcResults.errors.map(e => e.id);
      const failedQuestions = await client.query(
        `SELECT id, question, correct_answer, subject, grade
         FROM questions WHERE id = ANY($1)`,
        [failedIds]
      );

      const questionsMap = new Map(failedQuestions.rows.map(q => [q.id, q]));

      qcResults.errors.slice(0, 20).forEach((e, i) => {
        const q = questionsMap.get(e.id);
        console.log(`\n${i + 1}. [${q?.subject}/G${q?.grade}] ${q?.question?.substring(0, 55)}...`);
        console.log(`   Current answer: ${q?.correct_answer}`);
        console.log(`   Issues: ${e.issues?.join(', ')}`);
        if (e.suggested_fix) {
          console.log(`   Fix: ${e.suggested_fix}`);
        }
      });

      if (qcResults.errors.length > 20) {
        console.log(`\n... and ${qcResults.errors.length - 20} more failed questions`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('                 AI QC VALIDATION COMPLETE');
    console.log('='.repeat(60));
    console.log('');

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: qcResults.total,
        passed: qcResults.passed,
        failed: qcResults.failed,
        flagged: qcResults.flagged,
        passRate: (qcResults.passed / qcResults.total * 100).toFixed(2) + '%'
      },
      performance: {
        apiCalls: qcResults.apiCalls,
        durationSeconds: duration,
        questionsPerSecond: (qcResults.total / duration).toFixed(2)
      },
      failedQuestions: qcResults.errors,
      allResults: allResults
    };

    fs.writeFileSync('ai-qc-report.json', JSON.stringify(report, null, 2));
    console.log('Detailed report saved to ai-qc-report.json');

  } catch (error) {
    console.error('AI QC Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error('');
  console.error('ERROR: OPENAI_API_KEY not found in environment');
  console.error('');
  process.exit(1);
}

// Run AI QC
runAIQC().catch(console.error);
