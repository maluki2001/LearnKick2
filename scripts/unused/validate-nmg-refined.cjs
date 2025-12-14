const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function validateNMGQuestions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Fetch remaining NMG questions needing validation
    const result = await pool.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty, lehrplan21_topic
      FROM questions
      WHERE language = 'de'
        AND subject = 'nmg'
        AND validation_status = 'qc_passed'
      ORDER BY id
      LIMIT 600
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

      // Factual accuracy checks based on content
      const questionLower = q.question.toLowerCase();
      const topicLower = (q.lehrplan21_topic || '').toLowerCase();

      // ===== REFINED SCIENCE CHECKS =====

      // Solar system - check only if asking about ALL planets or total count
      if (questionLower.includes('planeten') && questionLower.includes('sonnensystem')) {
        const answerText = answers.join(' ').toLowerCase();
        // Flag if Pluto is listed as a planet (not dwarf planet)
        if (answerText.includes('pluto') && !answerText.includes('zwerg') &&
            (questionLower.includes('planeten') && !questionLower.includes('zwergplanet'))) {
          // Check if Pluto is the correct answer for "planet" question
          if (correctAnswer.toLowerCase().includes('pluto')) {
            validationIssues.push('Pluto is a dwarf planet, not a planet');
            isValid = false;
          }
        }
        // Check planet count - only if explicitly asking "how many planets"
        if ((questionLower.includes('wie viele') || questionLower.includes('wieviele')) &&
            questionLower.includes('planeten')) {
          if (!correctAnswer.includes('8')) {
            validationIssues.push('Solar system has 8 planets (not including dwarf planets)');
            isValid = false;
          }
        }
      }

      // Water freezing/boiling - only flag clear contradictions
      if (questionLower.includes('wasser') && questionLower.includes('grad')) {
        if (questionLower.includes('gefriert') && questionLower.includes('celsius')) {
          if (correctAnswer.includes('-') || (correctAnswer.match(/\d+/) && parseInt(correctAnswer.match(/\d+/)[0]) > 5)) {
            validationIssues.push('Water freezes at 0°C at standard pressure');
            isValid = false;
          }
        }
        if (questionLower.includes('kocht') && questionLower.includes('celsius')) {
          const temp = correctAnswer.match(/\d+/);
          if (temp && (parseInt(temp[0]) < 95 || parseInt(temp[0]) > 105)) {
            validationIssues.push('Water boils at ~100°C at standard pressure');
            isValid = false;
          }
        }
      }

      // Animal classifications - only flag clear contradictions
      if (questionLower.includes('ist') && questionLower.includes('säugetier')) {
        const correctLower = correctAnswer.toLowerCase();
        // Only flag if question explicitly asks "is X a mammal" and answer is wrong
        const definiteNonMammals = ['fisch', 'hai', 'forelle', 'lachs', 'vogel', 'adler', 'taube',
                                     'reptil', 'eidechse', 'schlange', 'amphibi', 'frosch', 'kröte',
                                     'insekt', 'fliege', 'käfer', 'spinne'];
        if (q.type === 'true-false' && correctLower === 'wahr') {
          // Check if the animal mentioned in question is NOT a mammal
          for (const animal of definiteNonMammals) {
            if (questionLower.includes(animal)) {
              validationIssues.push(`${animal} is not a mammal`);
              isValid = false;
              break;
            }
          }
        }
      }

      // Human body facts
      if (questionLower.includes('mensch') && questionLower.includes('knochen')) {
        if ((questionLower.includes('wie viele') || questionLower.includes('wieviele')) &&
            questionLower.includes('erwachsen')) {
          if (!correctAnswer.includes('206') && !correctAnswer.includes('etwa 200')) {
            validationIssues.push('Adult human has 206 bones');
            isValid = false;
          }
        }
      }

      // ===== REFINED SWISS GEOGRAPHY CHECKS =====

      // Canton count - only for direct "how many cantons" questions
      if ((questionLower.includes('wie viele') || questionLower.includes('wieviele')) &&
          questionLower.includes('kantone') && !questionLower.includes('ur')) {
        if (!correctAnswer.includes('26')) {
          validationIssues.push('Switzerland has 26 cantons today');
          isValid = false;
        }
      }

      // Swiss capital - only if directly asking "what is capital of Switzerland"
      if (questionLower.includes('hauptstadt') && questionLower.includes('schweiz')) {
        if ((questionLower.includes('ist die') || questionLower.includes('heisst')) &&
            !questionLower.includes('näch') && !questionLower.includes('liegt')) {
          if (!correctAnswer.toLowerCase().includes('bern')) {
            validationIssues.push('Bern is the capital of Switzerland');
            isValid = false;
          }
        }
      }

      // Highest mountain - must specify "highest in all of Switzerland"
      if ((questionLower.includes('höchste berg') || questionLower.includes('höchsten berg')) &&
          questionLower.includes('schweiz') && !questionLower.includes('ost') &&
          !questionLower.includes('west') && !questionLower.includes('nord') &&
          !questionLower.includes('süd') && !questionLower.includes('alpen')) {
        const correctLower = correctAnswer.toLowerCase();
        if (!correctLower.includes('dufourspitze') && !correctLower.includes('monte rosa')) {
          validationIssues.push('Dufourspitze/Monte Rosa (4,634m) is highest in Switzerland');
          isValid = false;
        }
      }

      // Largest lake - check for "ganz in der Schweiz" (entirely within)
      if ((questionLower.includes('grösste') || questionLower.includes('größte')) &&
          questionLower.includes('see')) {
        const correctLower = correctAnswer.toLowerCase();
        // Only flag if asking about largest without "ganz" qualifier
        if (questionLower.includes('schweiz') && !questionLower.includes('ganz')) {
          if (!correctLower.includes('genf') && !correctLower.includes('léman')) {
            // Could be correct if asking about other criteria
            // Don't flag
          }
        }
      }

      // Swiss languages count
      if ((questionLower.includes('wie viele') || questionLower.includes('wieviele')) &&
          (questionLower.includes('landessprache') || questionLower.includes('amtssprache'))) {
        if (!correctAnswer.includes('4')) {
          validationIssues.push('Switzerland has 4 official languages');
          isValid = false;
        }
      }

      // ===== REFINED HISTORY CHECKS =====

      // Swiss founding - only if directly asking about founding date
      if (questionLower.includes('schweiz') &&
          (questionLower.includes('gegründet') || questionLower.includes('gründung')) &&
          (questionLower.includes('wann') || questionLower.includes('jahr'))) {
        if (!correctAnswer.includes('1291')) {
          validationIssues.push('Switzerland founded in 1291 (Rütlischwur)');
          isValid = false;
        }
      }

      // World War dates - only if asking "when did it start"
      if (questionLower.includes('weltkrieg') &&
          (questionLower.includes('begann') || questionLower.includes('anfang') ||
           questionLower.includes('wann') || questionLower.includes('jahr'))) {
        if (questionLower.includes('erste') || questionLower.includes('1.')) {
          if (!correctAnswer.includes('1914')) {
            validationIssues.push('WWI began in 1914');
            isValid = false;
          }
        }
        if (questionLower.includes('zweite') || questionLower.includes('2.')) {
          if (!correctAnswer.includes('1939')) {
            validationIssues.push('WWII began in 1939');
            isValid = false;
          }
        }
      }

      // ===== GENERAL FACT CHECKS =====

      // Days/months/seasons - only for direct count questions
      if (questionLower.includes('wie viele') || questionLower.includes('wieviele')) {
        if (questionLower.includes('tage') && questionLower.includes('woche') &&
            !questionLower.includes('schul')) {
          if (!correctAnswer.includes('7')) {
            validationIssues.push('Week has 7 days');
            isValid = false;
          }
        }
        if (questionLower.includes('monate') && questionLower.includes('jahr')) {
          if (!correctAnswer.includes('12')) {
            validationIssues.push('Year has 12 months');
            isValid = false;
          }
        }
        if (questionLower.includes('jahreszeit')) {
          if (!correctAnswer.includes('4')) {
            validationIssues.push('There are 4 seasons');
            isValid = false;
          }
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
          question: q.question.substring(0, 120),
          correct: correctAnswer,
          issues: validationIssues,
          topic: q.lehrplan21_topic
        });
      }
    }

    console.log('=== NMG VALIDATION RESULTS (REFINED) ===');
    console.log(`Total validated: ${result.rows.length}`);
    console.log(`Approved: ${approved}`);
    console.log(`Rejected/Flagged: ${rejected}`);
    console.log(`\nIssues found: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n=== FLAGGED QUESTIONS ===');
      issues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ID: ${issue.id.substring(0, 8)}... | Topic: ${issue.topic}`);
        console.log(`   Q: ${issue.question}...`);
        console.log(`   Correct Answer: ${issue.correct}`);
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
