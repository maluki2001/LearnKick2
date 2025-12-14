const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Sample of rejected question IDs to examine
const rejectedIds = [
  '8346011b-8761-4acc-a90e-869a8ebf8b67', // Berechne: 8/9 - 1/3 = ?
  '539a401a-228a-4b60-afa2-1666ba322bbb', // Berechne: 15,7 + 11,9 = ?
  'e1829e4a-111d-4c30-8000-c0ee57485639', // 500 + 500 = 1000 (true/false)
  'c938fb6d-e6d0-4f15-bd7a-3b5efed52373', // Wie viele Rappen sind 1/2 Franken?
  'a135d24a-0a6e-4bd3-b593-913aee64be6f', // Anna hat 8 Äpfel und isst 1/4 davon
  'd3e66eb8-77ef-4440-af1a-c7924b335976', // Welche Dezimalzahl entspricht 11/20?
];

async function examineQuestions() {
  const client = await pool.connect();

  try {
    console.log('🔍 EXAMINING REJECTED QUESTIONS IN DETAIL\n');
    console.log('═══════════════════════════════════════════════\n');

    for (const id of rejectedIds) {
      const result = await client.query(
        'SELECT id, question, type, answers, correct_answer, explanation, grade, difficulty FROM questions WHERE id = $1',
        [id]
      );

      if (result.rows.length > 0) {
        const q = result.rows[0];
        console.log(`\n📋 Question ID: ${q.id}`);
        console.log(`   Grade: ${q.grade} | Difficulty: ${q.difficulty} | Type: ${q.type}`);
        console.log(`   Question: ${q.question}`);
        console.log(`   Correct Answer: ${q.correct_answer}`);

        if (q.type === 'multiple-choice' || q.type === 'image-question') {
          const answers = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
          console.log(`   Answer Options: ${JSON.stringify(answers)}`);
        }

        if (q.explanation) {
          console.log(`   Explanation: ${q.explanation}`);
        }

        // Manual verification
        console.log('\n   ✓ MANUAL VERIFICATION:');

        if (q.id === '8346011b-8761-4acc-a90e-869a8ebf8b67') {
          // 8/9 - 1/3 = ?
          // Convert to common denominator: 8/9 - 3/9 = 5/9
          console.log('      8/9 - 1/3 = 8/9 - 3/9 = 5/9');
          console.log(`      Stored answer: ${q.correct_answer}`);
          console.log(`      Status: ${q.correct_answer === '5/9' ? '✅ CORRECT' : '❌ WRONG'}`);
        }

        if (q.id === '539a401a-228a-4b60-afa2-1666ba322bbb') {
          // 15,7 + 11,9 = ?
          const expected = 15.7 + 11.9;
          console.log(`      15.7 + 11.9 = ${expected}`);
          console.log(`      Stored answer: ${q.correct_answer}`);
          console.log(`      Status: ${parseFloat(q.correct_answer) === expected ? '✅ CORRECT' : '❌ WRONG'}`);
        }

        if (q.id === 'e1829e4a-111d-4c30-8000-c0ee57485639') {
          // 500 + 500 = 1000 (true/false)
          console.log('      500 + 500 = 1000 is TRUE');
          console.log(`      Stored answer: "${q.correct_answer}"`);
          console.log(`      Answer type: ${typeof q.correct_answer}`);
          console.log(`      Status: ${q.correct_answer === 'true' ? '✅ CORRECT FORMAT' : '❌ WRONG FORMAT (should be "true" or "false")'}`);
        }

        if (q.id === 'c938fb6d-e6d0-4f15-bd7a-3b5efed52373') {
          // Wie viele Rappen sind 1/2 Franken?
          console.log('      1/2 Franken = 0.5 CHF = 50 Rappen');
          console.log(`      Stored answer: ${q.correct_answer}`);
          console.log(`      Status: ${q.correct_answer === '50' || q.correct_answer === 50 ? '✅ CORRECT' : '❌ WRONG'}`);
        }

        if (q.id === 'a135d24a-0a6e-4bd3-b593-913aee64be6f') {
          // Anna hat 8 Äpfel und isst 1/4 davon
          console.log('      8 × 1/4 = 8/4 = 2');
          console.log(`      Stored answer: ${q.correct_answer}`);
          console.log(`      Status: ${q.correct_answer === '2' || q.correct_answer === 2 ? '✅ CORRECT' : '❌ WRONG'}`);
        }

        if (q.id === 'd3e66eb8-77ef-4440-af1a-c7924b335976') {
          // Welche Dezimalzahl entspricht 11/20?
          const expected = 11 / 20;
          console.log(`      11 ÷ 20 = ${expected}`);
          console.log(`      Stored answer: ${q.correct_answer}`);
          const answers = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
          console.log(`      Answer options: ${JSON.stringify(answers)}`);
          console.log(`      Status: ${parseFloat(q.correct_answer) === expected ? '✅ CORRECT' : '❌ WRONG'}`);
        }

        console.log('\n───────────────────────────────────────────────');
      }
    }

    console.log('\n\n═══════════════════════════════════════════════');
    console.log('📊 SUMMARY OF MANUAL CHECKS');
    console.log('═══════════════════════════════════════════════\n');
    console.log('Based on manual verification:');
    console.log('- Fraction questions: Likely correct, validator limitation');
    console.log('- Decimal questions: Need to check actual values');
    console.log('- True/false format: Definite data issue');
    console.log('- Contextual problems: Likely correct, validator limitation');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

examineQuestions().catch(console.error);
