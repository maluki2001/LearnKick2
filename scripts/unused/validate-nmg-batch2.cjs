const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function validateNMGBatch2() {
  const client = await pool.connect();

  try {
    console.log('Fetching NMG questions batch 2 (OFFSET 500)...\n');

    const result = await client.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'de'
        AND subject = 'nmg'
        AND validation_status = 'qc_passed'
      ORDER BY id
      LIMIT 500 OFFSET 500
    `);

    const questions = result.rows;
    console.log(`Fetched ${questions.length} questions\n`);

    if (questions.length === 0) {
      console.log('No questions found in this batch.');
      return { total: 0, approved: 0, issues: [] };
    }

    let approved = 0;
    let issues = [];

    // Validation rules for NMG (Nature, Man, Society)
    const validationRules = {
      // Science facts
      science: {
        'Sonne': { type: 'Stern', distance: '150 Millionen km' },
        'Mond': { phases: ['Neumond', 'Vollmond'], rotation: '28 Tage' },
        'Wasser': { states: ['fest', 'flüssig', 'gasförmig'], boiling: '100°C', freezing: '0°C' },
        'Luft': { composition: 'Stickstoff, Sauerstoff' },
        'Photosynthese': { requires: ['Licht', 'Wasser', 'CO2'], produces: 'Sauerstoff' },
        'Zähne': { permanent: 32, milk: 20 },
        'Skelett': { bones: 'über 200' },
        'Herz': { function: 'pumpt Blut', chambers: 4 },
        'Metamorphose': { examples: ['Schmetterling', 'Frosch'] },
        'Jahreszeiten': { count: 4, names: ['Frühling', 'Sommer', 'Herbst', 'Winter'] },
        'Planeten': { count: 8, order: ['Merkur', 'Venus', 'Erde', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptun'] },
        'Magnetismus': { poles: 2, attract: 'Eisen' },
        'Schall': { medium: 'braucht Medium', speed: 'schneller in Festkörpern' },
        'Licht': { speed: '300.000 km/s', straight: 'geradlinig' }
      },

      // Swiss geography
      geography: {
        'Alpen': { percentage: '60%', highest: 'Dufourspitze 4634m' },
        'Seen': { largest: 'Genfersee', count: 'über 1500' },
        'Flüsse': { major: ['Rhein', 'Rhone', 'Inn', 'Ticino'], longest: 'Rhein' },
        'Kantone': { count: 26 },
        'Hauptstadt': { name: 'Bern' },
        'Sprachen': { count: 4, names: ['Deutsch', 'Französisch', 'Italienisch', 'Rätoromanisch'] },
        'Nachbarländer': { count: 5, names: ['Deutschland', 'Frankreich', 'Italien', 'Österreich', 'Liechtenstein'] },
        'Gletscher': { largest: 'Aletschgletscher' },
        'Jura': { location: 'Nordwesten' },
        'Mittelland': { percentage: '30%' },
        'Dufourspitze': { height: '4634m', location: 'Wallis' },
        'Genfersee': { area: '580 km²', shared: 'Schweiz/Frankreich' },
        'Bodensee': { shared: 'Schweiz/Deutschland/Österreich' },
        'Matterhorn': { height: '4478m', location: 'Wallis' },
        'Basel': { river: 'Rhein' },
        'Zürich': { lake: 'Zürichsee', largest: 'grösste Stadt' },
        'Genf': { lake: 'Genfersee', international: 'UNO' }
      },

      // Swiss history & culture
      history: {
        'Bundesbrief': { year: 1291, signatories: ['Uri', 'Schwyz', 'Unterwalden'] },
        'Nationalfeiertag': { date: '1. August' },
        'Neutralität': { since: 1815 },
        'Frauen Wahlrecht': { year: 1971 },
        'UNO Beitritt': { year: 2002 },
        'Schengen': { year: 2008 },
        'Wilhelm Tell': { legend: 'Apfelschuss' },
        'Rütlischwur': { year: 1291, location: 'Rütli' },
        'Sempacherkrieg': { year: 1386 },
        'Reformation': { leader: ['Zwingli', 'Calvin'] }
      },

      // Biology
      biology: {
        'Wirbeltiere': { groups: ['Fische', 'Amphibien', 'Reptilien', 'Vögel', 'Säugetiere'] },
        'Insekten': { legs: 6, body_parts: 3 },
        'Spinnen': { legs: 8, class: 'Spinnentiere' },
        'Vögel': { characteristics: ['Federn', 'Flügel', 'Schnabel', 'Eier'] },
        'Säugetiere': { characteristics: ['Haare', 'Milch', 'lebendgebärend'] },
        'Pflanzen': { needs: ['Licht', 'Wasser', 'Nährstoffe'], parts: ['Wurzel', 'Stängel', 'Blatt', 'Blüte'] },
        'Nahrungskette': { order: 'Pflanze → Pflanzenfresser → Fleischfresser' },
        'Ökosystem': { components: ['Lebewesen', 'Umwelt'] }
      },

      // Environmental science
      environment: {
        'Recycling': { materials: ['Papier', 'Glas', 'PET', 'Alu'] },
        'Energie': { renewable: ['Sonne', 'Wind', 'Wasser'], fossil: ['Öl', 'Gas', 'Kohle'] },
        'Klimawandel': { cause: 'CO2', effects: ['Erwärmung', 'Gletscherschmelze'] },
        'Wasserkreislauf': { steps: ['Verdunstung', 'Kondensation', 'Niederschlag'] }
      }
    };

    // Check each question
    for (const q of questions) {
      let isValid = true;
      let issueReason = '';

      const questionText = q.question.toLowerCase();
      const answers = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
      const correctAnswer = q.correct_answer;

      // Validate based on question content
      try {
        // Check for specific factual errors

        // Astronomy
        if (questionText.includes('planeten') && questionText.includes('sonnensystem')) {
          if (answers.includes('9') || correctAnswer === '9' || questionText.includes('neun')) {
            isValid = false;
            issueReason = 'OUTDATED: Pluto ist kein Planet mehr (seit 2006). Korrekte Anzahl: 8 Planeten';
          }
        }

        if (questionText.includes('sonne') && questionText.includes('planet')) {
          isValid = false;
          issueReason = 'FEHLER: Die Sonne ist ein Stern, kein Planet';
        }

        if (questionText.includes('mond') && questionText.includes('stern')) {
          isValid = false;
          issueReason = 'FEHLER: Der Mond ist ein Satellit/Trabant, kein Stern';
        }

        // Water states
        if (questionText.includes('wasser') && questionText.includes('aggregatzustand')) {
          const allStates = ['fest', 'flüssig', 'gasförmig'];
          const hasAllStates = allStates.every(state =>
            JSON.stringify(answers).toLowerCase().includes(state) ||
            questionText.includes(state)
          );
          if (answers.length !== 3 && !hasAllStates) {
            isValid = false;
            issueReason = 'UNVOLLSTÄNDIG: Wasser hat 3 Aggregatzustände (fest, flüssig, gasförmig)';
          }
        }

        if ((questionText.includes('gefriert') || questionText.includes('friert')) && questionText.includes('wasser')) {
          if (!correctAnswer.includes('0') && !questionText.includes('0')) {
            isValid = false;
            issueReason = 'FEHLER: Wasser gefriert bei 0°C';
          }
        }

        if (questionText.includes('siedet') && questionText.includes('wasser')) {
          if (!correctAnswer.includes('100') && !questionText.includes('100')) {
            isValid = false;
            issueReason = 'FEHLER: Wasser siedet bei 100°C';
          }
        }

        // Swiss geography
        if (questionText.includes('kantone') && questionText.includes('schweiz')) {
          if (correctAnswer === '23' || correctAnswer === '25' || correctAnswer === '27') {
            isValid = false;
            issueReason = 'FEHLER: Die Schweiz hat 26 Kantone';
          }
        }

        if (questionText.includes('hauptstadt') && questionText.includes('schweiz')) {
          if (correctAnswer.toLowerCase() === 'zürich' || correctAnswer.toLowerCase() === 'genf') {
            isValid = false;
            issueReason = 'FEHLER: Die Hauptstadt der Schweiz ist Bern';
          }
        }

        if (questionText.includes('höchste berg') && questionText.includes('schweiz')) {
          if (!correctAnswer.toLowerCase().includes('dufourspitze')) {
            isValid = false;
            issueReason = 'FEHLER: Der höchste Berg der Schweiz ist die Dufourspitze (4634m)';
          }
        }

        if (questionText.includes('dufourspitze')) {
          if (correctAnswer.includes('4478') || correctAnswer.includes('4000')) {
            isValid = false;
            issueReason = 'FEHLER: Die Dufourspitze ist 4634m hoch (nicht 4478m - das ist das Matterhorn)';
          }
        }

        if (questionText.includes('grösste see') && questionText.includes('schweiz')) {
          if (!correctAnswer.toLowerCase().includes('genfer')) {
            isValid = false;
            issueReason = 'FEHLER: Der grösste See der Schweiz ist der Genfersee';
          }
        }

        if (questionText.includes('nachbarländer') && questionText.includes('schweiz')) {
          if (correctAnswer === '4' || correctAnswer === '6' || correctAnswer === '7') {
            isValid = false;
            issueReason = 'FEHLER: Die Schweiz hat 5 Nachbarländer (Deutschland, Frankreich, Italien, Österreich, Liechtenstein)';
          }
        }

        if (questionText.includes('landessprache') && questionText.includes('schweiz')) {
          if (correctAnswer === '3' || correctAnswer === '5') {
            isValid = false;
            issueReason = 'FEHLER: Die Schweiz hat 4 Landessprachen (Deutsch, Französisch, Italienisch, Rätoromanisch)';
          }
        }

        // Swiss history
        if (questionText.includes('bundesbrief') && questionText.includes('1291')) {
          const cantons = ['uri', 'schwyz', 'unterwalden'];
          const hasWrongCanton = answers.some(a =>
            !cantons.some(c => a.toLowerCase().includes(c)) &&
            !['uri', 'schwyz', 'unterwalden'].includes(a.toLowerCase())
          );
          if (hasWrongCanton) {
            isValid = false;
            issueReason = 'FEHLER: Der Bundesbrief 1291 wurde von Uri, Schwyz und Unterwalden unterzeichnet';
          }
        }

        if (questionText.includes('nationalfeiertag') && questionText.includes('schweiz')) {
          if (!correctAnswer.includes('1. August') && !correctAnswer.includes('august')) {
            isValid = false;
            issueReason = 'FEHLER: Der Schweizer Nationalfeiertag ist am 1. August';
          }
        }

        if (questionText.includes('frauen') && questionText.includes('wahlrecht') && questionText.includes('schweiz')) {
          if (!correctAnswer.includes('1971')) {
            isValid = false;
            issueReason = 'FEHLER: Frauen erhielten das Wahlrecht in der Schweiz 1971';
          }
        }

        // Biology
        if (questionText.includes('insekten') && questionText.includes('beine')) {
          if (correctAnswer !== '6') {
            isValid = false;
            issueReason = 'FEHLER: Insekten haben 6 Beine';
          }
        }

        if (questionText.includes('spinne') && questionText.includes('beine')) {
          if (correctAnswer !== '8') {
            isValid = false;
            issueReason = 'FEHLER: Spinnen haben 8 Beine';
          }
        }

        if (questionText.includes('wirbeltiere') && questionText.includes('gruppen')) {
          if (correctAnswer !== '5') {
            isValid = false;
            issueReason = 'FEHLER: Es gibt 5 Wirbeltiergruppen (Fische, Amphibien, Reptilien, Vögel, Säugetiere)';
          }
        }

        // Human biology
        if (questionText.includes('bleibende') && questionText.includes('zähne')) {
          if (correctAnswer !== '32') {
            isValid = false;
            issueReason = 'FEHLER: Erwachsene haben 32 bleibende Zähne';
          }
        }

        if (questionText.includes('milchzähne')) {
          if (correctAnswer !== '20') {
            isValid = false;
            issueReason = 'FEHLER: Kinder haben 20 Milchzähne';
          }
        }

        if (questionText.includes('herz') && questionText.includes('kammer')) {
          if (correctAnswer !== '4') {
            isValid = false;
            issueReason = 'FEHLER: Das Herz hat 4 Kammern (2 Vorhöfe, 2 Herzkammern)';
          }
        }

        // Environmental
        if (questionText.includes('photosynthese')) {
          if (correctAnswer.toLowerCase().includes('co2') || correctAnswer.toLowerCase().includes('kohlen')) {
            // Check if question asks what is PRODUCED (not consumed)
            if (questionText.includes('produziert') || questionText.includes('erzeugt')) {
              isValid = false;
              issueReason = 'FEHLER: Photosynthese produziert Sauerstoff (und Zucker), nicht CO2';
            }
          }
          if (!correctAnswer.toLowerCase().includes('sauerstoff') && (questionText.includes('produziert') || questionText.includes('erzeugt'))) {
            isValid = false;
            issueReason = 'FEHLER: Photosynthese produziert Sauerstoff';
          }
        }

        if (questionText.includes('jahreszeiten')) {
          if (correctAnswer !== '4' && questionText.includes('wie viele')) {
            isValid = false;
            issueReason = 'FEHLER: Es gibt 4 Jahreszeiten';
          }
        }

      } catch (error) {
        console.error(`Error validating question ${q.id}:`, error.message);
      }

      if (isValid) {
        // Approve question
        await client.query(`
          UPDATE questions
          SET validation_status = 'approved',
              flagged_reason = NULL,
              updated_at = NOW()
          WHERE id = $1
        `, [q.id]);
        approved++;
      } else {
        // Mark as failed
        await client.query(`
          UPDATE questions
          SET validation_status = 'qc_failed',
              flagged_reason = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [issueReason, q.id]);
        issues.push({
          id: q.id,
          question: q.question,
          reason: issueReason,
          correct_answer: correctAnswer
        });
      }
    }

    console.log('\n=== VALIDATION RESULTS (BATCH 2) ===');
    console.log(`Total questions validated: ${questions.length}`);
    console.log(`Approved: ${approved}`);
    console.log(`Failed: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n=== FAILED QUESTIONS ===');
      issues.forEach(issue => {
        console.log(`\nID: ${issue.id}`);
        console.log(`Question: ${issue.question}`);
        console.log(`Answer: ${issue.correct_answer}`);
        console.log(`Issue: ${issue.reason}`);
      });
    }

    return {
      total: questions.length,
      approved,
      issues
    };

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

validateNMGBatch2()
  .then(result => {
    console.log('\n✓ Validation complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Validation failed:', error);
    process.exit(1);
  });
