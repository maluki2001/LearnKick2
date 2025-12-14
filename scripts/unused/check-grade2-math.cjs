// Script to find Grade 2 multiplication questions that violate Swiss Lehrplan 21
// According to Lehrplan 21, Grade 2 should only have multiplication up to 5×5

const https = require('https');
const http = require('http');

const url = 'http://localhost:3000/api/questions?grade=2&subject=math';

http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (!json.questions || json.questions.length === 0) {
        console.log('No Grade 2 math questions found in database');
        return;
      }

      console.log('='.repeat(60));
      console.log('GRADE 2 MULTIPLICATION CURRICULUM AUDIT');
      console.log('Swiss Lehrplan 21: Grade 2 should only have factors ≤ 5');
      console.log('='.repeat(60));
      console.log('');
      console.log('Total Grade 2 math questions:', json.questions.length);
      console.log('');

      // Find multiplication questions with factors > 5
      const badQuestions = [];

      json.questions.forEach(q => {
        const text = (q.question || q.statement || '').toLowerCase();

        // Match multiplication patterns in various languages
        const patterns = [
          /(\d+)\s*[×x\*]\s*(\d+)/i,      // 9 × 3, 9 x 3, 9 * 3
          /(\d+)\s*mal\s*(\d+)/i,          // 9 mal 3 (German)
          /(\d+)\s*fois\s*(\d+)/i,         // 9 fois 3 (French)
          /(\d+)\s*times\s*(\d+)/i,        // 9 times 3 (English)
          /multiply\s*(\d+)\s*(?:and|by)\s*(\d+)/i,  // multiply 9 and 3
          /multipliziere\s*(\d+)\s*(?:und|mit)\s*(\d+)/i,  // German
        ];

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            const a = parseInt(match[1]);
            const b = parseInt(match[2]);
            // Grade 2 should only have factors up to 5
            if (a > 5 || b > 5) {
              badQuestions.push({
                id: q.id,
                language: q.language || 'unknown',
                question: q.question || q.statement,
                factors: [a, b],
                type: q.type
              });
            }
            break;
          }
        }
      });

      if (badQuestions.length === 0) {
        console.log('✅ No curriculum violations found!');
        console.log('All multiplication questions use factors ≤ 5');
        return;
      }

      console.log('❌ CURRICULUM VIOLATIONS FOUND:', badQuestions.length);
      console.log('');

      // Group by language
      const byLang = {};
      badQuestions.forEach(q => {
        if (!byLang[q.language]) byLang[q.language] = [];
        byLang[q.language].push(q);
      });

      console.log('By Language:');
      Object.keys(byLang).sort().forEach(lang => {
        console.log(`  ${lang.toUpperCase()}: ${byLang[lang].length} questions`);
      });
      console.log('');

      // Group by factor pairs
      const byFactors = {};
      badQuestions.forEach(q => {
        const key = q.factors.sort((a,b) => a-b).join('×');
        if (!byFactors[key]) byFactors[key] = 0;
        byFactors[key]++;
      });

      console.log('By Factor Pairs (sorted by count):');
      Object.entries(byFactors)
        .sort((a, b) => b[1] - a[1])
        .forEach(([factors, count]) => {
          console.log(`  ${factors}: ${count} questions`);
        });
      console.log('');

      console.log('='.repeat(60));
      console.log('SAMPLE VIOLATIONS (first 15):');
      console.log('='.repeat(60));

      badQuestions.slice(0, 15).forEach((q, i) => {
        console.log('');
        console.log(`${i + 1}. [${q.language.toUpperCase()}] ${q.factors.join(' × ')} = ${q.factors[0] * q.factors[1]}`);
        console.log(`   Question: "${q.question}"`);
        console.log(`   ID: ${q.id}`);
        console.log(`   ⚠️  Should be Grade 3 or 4 (factors > 5)`);
      });

      console.log('');
      console.log('='.repeat(60));
      console.log('RECOMMENDED ACTION:');
      console.log('='.repeat(60));
      console.log('');
      console.log('These questions should be moved to higher grades:');
      console.log('- Factors 6-7: Move to Grade 3');
      console.log('- Factors 8-10: Move to Grade 4');
      console.log('');
      console.log('Swiss Lehrplan 21 multiplication progression:');
      console.log('  Grade 2: 1×1 to 5×5 (Einmaleins bis 5)');
      console.log('  Grade 3: 1×1 to 10×10 (das kleine Einmaleins)');
      console.log('  Grade 4: Extended multiplication, mental math');

    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.log('Request failed:', e.message);
  console.log('Make sure the dev server is running on http://localhost:3000');
});
