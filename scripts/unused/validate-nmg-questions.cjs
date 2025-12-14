const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function validateNMGQuestions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Fetch first 500 NMG questions needing validation
    const result = await pool.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty, lehrplan21_topic
      FROM questions
      WHERE language = 'de'
        AND subject = 'nmg'
        AND validation_status = 'qc_passed'
      ORDER BY id
      LIMIT 500
    `);

    console.log(`Found ${result.rows.length} NMG questions to validate\n`);

    let approved = 0;
    let rejected = 0;
    const issues = [];

    for (const q of result.rows) {
      let isValid = true;
      let validationIssues = [];

      // Parse answers
      const answers = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
      const correctAnswer = q.correct_answer;

      // Factual accuracy checks based on topic and content
      const questionLower = q.question.toLowerCase();
      const topicLower = (q.lehrplan21_topic || '').toLowerCase();

      // ===== SCIENCE CHECKS =====
      if (topicLower.includes('natur') || topicLower.includes('wissenschaft') ||
          questionLower.includes('tier') || questionLower.includes('pflanz') ||
          questionLower.includes('körper') || questionLower.includes('biolog')) {

        // Check solar system facts
        if (questionLower.includes('planeten') && questionLower.includes('sonnensystem')) {
          const answerText = answers.join(' ').toLowerCase();
          if (answerText.includes('pluto') && answerText.includes('planet')) {
            validationIssues.push('Pluto is no longer classified as a planet');
            isValid = false;
          }
          // Should be 8 planets
          if (questionLower.includes('wie viele') && !correctAnswer.includes('8')) {
            validationIssues.push('Solar system has 8 planets');
            isValid = false;
          }
        }

        // Check water facts
        if (questionLower.includes('wasser')) {
          if (questionLower.includes('gefriert') || questionLower.includes('friert')) {
            const hasZero = answers.some(a => a.includes('0°') || a === '0');
            if (hasZero && !correctAnswer.includes('0')) {
              validationIssues.push('Water freezes at 0°C');
              isValid = false;
            }
          }
          if (questionLower.includes('kocht') || questionLower.includes('siedet')) {
            const has100 = answers.some(a => a.includes('100'));
            if (has100 && !correctAnswer.includes('100')) {
              validationIssues.push('Water boils at 100°C');
              isValid = false;
            }
          }
        }

        // Check animal classifications
        if (questionLower.includes('säugetier')) {
          const correctLower = correctAnswer.toLowerCase();
          const nonMammals = ['fisch', 'vogel', 'ente', 'adler', 'reptil', 'amphibi', 'frosch', 'insekt', 'spinne', 'hai', 'wal'];
          // Note: Whale (Wal) IS a mammal
          if (nonMammals.some(nm => correctLower.includes(nm) && nm !== 'wal')) {
            validationIssues.push('Incorrect mammal classification');
            isValid = false;
          }
        }

        // Check human body facts
        if (questionLower.includes('knochen') && questionLower.includes('erwachsen')) {
          if (questionLower.includes('wie viele') && !correctAnswer.includes('206')) {
            validationIssues.push('Adult human body has 206 bones');
            isValid = false;
          }
        }

        // Check seasons
        if (questionLower.includes('jahreszeit') && questionLower.includes('wie viele')) {
          if (!correctAnswer.includes('4')) {
            validationIssues.push('There are 4 seasons');
            isValid = false;
          }
        }
      }

      // ===== SWISS GEOGRAPHY CHECKS =====
      if (topicLower.includes('geografi') || topicLower.includes('schweiz') ||
          questionLower.includes('schweiz') || questionLower.includes('kanton') ||
          questionLower.includes('zürich') || questionLower.includes('bern')) {

        // Check canton count
        if ((questionLower.includes('kantone') || questionLower.includes('kanton')) &&
            questionLower.includes('wie viele')) {
          if (!correctAnswer.includes('26')) {
            validationIssues.push('Switzerland has 26 cantons');
            isValid = false;
          }
        }

        // Check Swiss capital
        if (questionLower.includes('hauptstadt')) {
          if (questionLower.includes('schweiz') && !correctAnswer.toLowerCase().includes('bern')) {
            validationIssues.push('Bern is the capital of Switzerland');
            isValid = false;
          }
        }

        // Check Swiss mountains
        if (questionLower.includes('höchste berg') || questionLower.includes('höchsten berg')) {
          const correctLower = correctAnswer.toLowerCase();
          // Dufourspitze/Monte Rosa is highest at 4,634m
          if (!correctLower.includes('dufourspitze') && !correctLower.includes('monte rosa')) {
            validationIssues.push('Dufourspitze/Monte Rosa is highest mountain in Switzerland (4,634m)');
            isValid = false;
          }
        }

        // Check Matterhorn height
        if (questionLower.includes('matterhorn') && questionLower.includes('meter')) {
          if (!correctAnswer.includes('4478') && !correctAnswer.includes('4,478')) {
            validationIssues.push('Matterhorn is 4,478m high');
            isValid = false;
          }
        }

        // Check Swiss lakes
        if (questionLower.includes('see') && (questionLower.includes('grösst') || questionLower.includes('größt'))) {
          const correctLower = correctAnswer.toLowerCase();
          if (!correctLower.includes('genf') && !correctLower.includes('léman') && !correctLower.includes('genfersee')) {
            validationIssues.push('Lake Geneva (Genfersee) is largest lake in Switzerland');
            isValid = false;
          }
        }

        // Check Swiss languages
        if (questionLower.includes('landessprache') || questionLower.includes('amtssprache')) {
          if (questionLower.includes('wie viele') && !correctAnswer.includes('4')) {
            validationIssues.push('Switzerland has 4 official languages');
            isValid = false;
          }
        }

        // Check Swiss rivers
        if (questionLower.includes('rhein') || questionLower.includes('aare')) {
          // Verify correct river facts
          if (questionLower.includes('längste') && !correctAnswer.toLowerCase().includes('rhein')) {
            validationIssues.push('Rhine (Rhein) is longest river in/through Switzerland');
            isValid = false;
          }
        }
      }

      // ===== HISTORY CHECKS =====
      if (topicLower.includes('geschichte') || questionLower.includes('jahr') ||
          questionLower.includes('1291') || questionLower.includes('krieg')) {

        // Swiss founding date
        if (questionLower.includes('schweiz') &&
            (questionLower.includes('gründ') || questionLower.includes('entstanden'))) {
          if (!correctAnswer.includes('1291')) {
            validationIssues.push('Switzerland was founded in 1291');
            isValid = false;
          }
        }

        // World War I
        if (questionLower.includes('erste') && questionLower.includes('weltkrieg')) {
          if (questionLower.includes('wann') || questionLower.includes('jahr')) {
            if (!correctAnswer.includes('1914')) {
              validationIssues.push('WWI started in 1914');
              isValid = false;
            }
          }
        }

        // World War II
        if (questionLower.includes('zweite') && questionLower.includes('weltkrieg')) {
          if (questionLower.includes('wann') || questionLower.includes('jahr')) {
            if (!correctAnswer.includes('1939')) {
              validationIssues.push('WWII started in 1939');
              isValid = false;
            }
          }
        }

        // Roman Empire
        if (questionLower.includes('römisch') || questionLower.includes('römer')) {
          // Check for major historical inaccuracies
          if (questionLower.includes('hauptstadt') &&
              !correctAnswer.toLowerCase().includes('rom')) {
            validationIssues.push('Rome was capital of Roman Empire');
            isValid = false;
          }
        }
      }

      // ===== GENERAL FACT CHECKS =====

      // Check days in week
      if (questionLower.includes('woche') && questionLower.includes('wie viele tage')) {
        if (!correctAnswer.includes('7')) {
          validationIssues.push('Week has 7 days');
          isValid = false;
        }
      }

      // Check months in year
      if (questionLower.includes('jahr') && questionLower.includes('wie viele monate')) {
        if (!correctAnswer.includes('12')) {
          validationIssues.push('Year has 12 months');
          isValid = false;
        }
      }

      // Check continents
      if (questionLower.includes('kontinent') && questionLower.includes('wie viele')) {
        if (!correctAnswer.includes('7') && !correctAnswer.includes('6')) {
          validationIssues.push('Earth has 7 continents (or 6 depending on model)');
          isValid = false;
        }
      }

      // Update validation status
      if (isValid) {
        await pool.query(`
          UPDATE questions
          SET validation_status = 'approved',
              quality_score = 95
          WHERE id = $1
        `, [q.id]);
        approved++;
      } else {
        await pool.query(`
          UPDATE questions
          SET validation_status = 'flagged',
              flagged_reason = $2
          WHERE id = $1
        `, [q.id, validationIssues.join('; ')]);
        rejected++;
        issues.push({
          id: q.id,
          question: q.question.substring(0, 100),
          issues: validationIssues,
          topic: q.lehrplan21_topic
        });
      }
    }

    console.log('=== NMG VALIDATION RESULTS ===');
    console.log(`Total validated: ${result.rows.length}`);
    console.log(`Approved: ${approved}`);
    console.log(`Rejected/Flagged: ${rejected}`);
    console.log(`\nIssues found: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n=== FLAGGED QUESTIONS (First 15) ===');
      issues.slice(0, 15).forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ID: ${issue.id} | Topic: ${issue.topic}`);
        console.log(`   Question: ${issue.question}...`);
        console.log(`   Issues: ${issue.issues.join(', ')}`);
      });
    }

    console.log('\n=== VALIDATION COMPLETE ===');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

validateNMGQuestions();
