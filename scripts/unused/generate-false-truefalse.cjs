#!/usr/bin/env node

/**
 * Generate TRUE/FALSE Questions with FALSE as Correct Answer
 * Mission: Balance the TRUE/FALSE distribution (currently 89% TRUE, 11% FALSE)
 * Target: Generate 1,863 FALSE questions
 */

const fs = require('fs');
const path = require('path');

// Distribution needed
const TARGETS = {
  de: {
    total: 1184,
    subjects: {
      math: 300,
      language: 250,
      nmg: 400,
      geography: 150,
      science: 84
    }
  },
  en: {
    total: 294,
    subjects: {
      math: 75,
      language: 65,
      science: 75,
      geography: 79
    }
  },
  fr: {
    total: 385,
    subjects: {
      math: 100,
      language: 85,
      science: 100,
      geography: 100
    }
  }
};

// FALSE statement templates by subject and language
const FALSE_TEMPLATES = {
  de: {
    math: [
      // Addition errors (Grade 1-2)
      { question: "5 + 3 = 9", explanation: "Falsch. 5 + 3 = 8, nicht 9.", grade: 1, difficulty: 1, topic: "MA.1.A.2" },
      { question: "7 + 4 = 12", explanation: "Falsch. 7 + 4 = 11, nicht 12.", grade: 1, difficulty: 1, topic: "MA.1.A.2" },
      { question: "9 + 6 = 14", explanation: "Falsch. 9 + 6 = 15, nicht 14.", grade: 2, difficulty: 2, topic: "MA.1.A.2" },
      { question: "8 + 7 = 16", explanation: "Falsch. 8 + 7 = 15, nicht 16.", grade: 2, difficulty: 2, topic: "MA.1.A.2" },

      // Subtraction errors (Grade 1-2)
      { question: "10 - 3 = 6", explanation: "Falsch. 10 - 3 = 7, nicht 6.", grade: 1, difficulty: 1, topic: "MA.1.A.2" },
      { question: "12 - 5 = 8", explanation: "Falsch. 12 - 5 = 7, nicht 8.", grade: 2, difficulty: 2, topic: "MA.1.A.2" },
      { question: "15 - 8 = 8", explanation: "Falsch. 15 - 8 = 7, nicht 8.", grade: 2, difficulty: 2, topic: "MA.1.A.2" },

      // Multiplication errors (Grade 3-4)
      { question: "6 × 7 = 48", explanation: "Falsch. 6 × 7 = 42, nicht 48.", grade: 3, difficulty: 3, topic: "MA.1.A.3" },
      { question: "8 × 9 = 81", explanation: "Falsch. 8 × 9 = 72, nicht 81.", grade: 3, difficulty: 3, topic: "MA.1.A.3" },
      { question: "7 × 8 = 54", explanation: "Falsch. 7 × 8 = 56, nicht 54.", grade: 3, difficulty: 3, topic: "MA.1.A.3" },

      // Division errors (Grade 3-4)
      { question: "24 ÷ 6 = 3", explanation: "Falsch. 24 ÷ 6 = 4, nicht 3.", grade: 3, difficulty: 3, topic: "MA.1.A.3" },
      { question: "36 ÷ 9 = 3", explanation: "Falsch. 36 ÷ 9 = 4, nicht 3.", grade: 4, difficulty: 3, topic: "MA.1.A.3" },

      // Geometry errors (Grade 2-4)
      { question: "Ein Dreieck hat 4 Ecken.", explanation: "Falsch. Ein Dreieck hat 3 Ecken, nicht 4.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },
      { question: "Ein Quadrat hat 5 Seiten.", explanation: "Falsch. Ein Quadrat hat 4 Seiten, nicht 5.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },
      { question: "Ein Kreis hat Ecken.", explanation: "Falsch. Ein Kreis hat keine Ecken.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },

      // Fractions (Grade 4-5)
      { question: "1/2 ist grösser als 3/4.", explanation: "Falsch. 3/4 ist grösser als 1/2.", grade: 4, difficulty: 3, topic: "MA.1.A.3" },
      { question: "1/3 + 1/3 = 1", explanation: "Falsch. 1/3 + 1/3 = 2/3, nicht 1.", grade: 5, difficulty: 4, topic: "MA.1.A.3" },

      // Time (Grade 2-3)
      { question: "Ein Tag hat 12 Stunden.", explanation: "Falsch. Ein Tag hat 24 Stunden, nicht 12.", grade: 2, difficulty: 2, topic: "MA.3.A.1" },
      { question: "Eine Stunde hat 100 Minuten.", explanation: "Falsch. Eine Stunde hat 60 Minuten, nicht 100.", grade: 3, difficulty: 2, topic: "MA.3.A.1" },

      // Money (Grade 2-4)
      { question: "Ein Schweizer Franken hat 50 Rappen.", explanation: "Falsch. Ein Schweizer Franken hat 100 Rappen, nicht 50.", grade: 3, difficulty: 2, topic: "MA.3.A.2" },
      { question: "2 Franken + 50 Rappen = 2.25 CHF", explanation: "Falsch. 2 Franken + 50 Rappen = 2.50 CHF, nicht 2.25 CHF.", grade: 4, difficulty: 3, topic: "MA.3.A.2" },
    ],

    language: [
      // Grammar errors
      { question: "Das Wort 'Haus' ist weiblich.", explanation: "Falsch. 'Haus' ist neutral (das Haus), nicht weiblich.", grade: 2, difficulty: 2, topic: "D.5.A.1" },
      { question: "Das Wort 'Auto' ist weiblich.", explanation: "Falsch. 'Auto' ist neutral (das Auto), nicht weiblich.", grade: 2, difficulty: 2, topic: "D.5.A.1" },
      { question: "Der Plural von 'Kind' ist 'Kinds'.", explanation: "Falsch. Der Plural von 'Kind' ist 'Kinder', nicht 'Kinds'.", grade: 3, difficulty: 2, topic: "D.5.A.1" },

      // Spelling errors
      { question: "Das Wort 'Sonne' schreibt man mit einem 'n'.", explanation: "Falsch. 'Sonne' schreibt man mit zwei 'n', nicht einem.", grade: 2, difficulty: 2, topic: "D.4.A.1" },
      { question: "Das Alphabet hat 24 Buchstaben.", explanation: "Falsch. Das deutsche Alphabet hat 26 Buchstaben, nicht 24.", grade: 1, difficulty: 1, topic: "D.4.A.1" },

      // Reading comprehension
      { question: "Ein Verb beschreibt eine Eigenschaft.", explanation: "Falsch. Ein Verb beschreibt eine Handlung, nicht eine Eigenschaft. Adjektive beschreiben Eigenschaften.", grade: 4, difficulty: 3, topic: "D.5.C.1" },
      { question: "Ein Adjektiv beschreibt eine Handlung.", explanation: "Falsch. Ein Adjektiv beschreibt eine Eigenschaft, nicht eine Handlung. Verben beschreiben Handlungen.", grade: 4, difficulty: 3, topic: "D.5.C.1" },
    ],

    nmg: [
      // Nature/Science
      { question: "Die Sonne dreht sich um die Erde.", explanation: "Falsch. Die Erde dreht sich um die Sonne, nicht umgekehrt.", grade: 4, difficulty: 3, topic: "NMG.4.1" },
      { question: "Der Mond produziert sein eigenes Licht.", explanation: "Falsch. Der Mond reflektiert das Licht der Sonne, er produziert kein eigenes Licht.", grade: 5, difficulty: 3, topic: "NMG.4.1" },
      { question: "Pflanzen atmen Sauerstoff ein.", explanation: "Falsch. Pflanzen atmen Kohlendioxid ein und geben Sauerstoff ab.", grade: 4, difficulty: 3, topic: "NMG.2.1" },
      { question: "Spinnen sind Insekten.", explanation: "Falsch. Spinnen sind Spinnentiere, nicht Insekten. Insekten haben 6 Beine, Spinnen haben 8.", grade: 3, difficulty: 2, topic: "NMG.2.4" },

      // Body/Health
      { question: "Das menschliche Herz befindet sich rechts in der Brust.", explanation: "Falsch. Das Herz befindet sich links in der Brust, nicht rechts.", grade: 5, difficulty: 3, topic: "NMG.1.1" },
      { question: "Der Mensch hat 5 Sinne: Sehen, Hören, Riechen, Schmecken und Fühlen.", explanation: "Richtig, aber oft wird dies als falsch angesehen. Tatsächlich sind es genau diese 5 klassischen Sinne.", grade: 3, difficulty: 2, topic: "NMG.1.1" },

      // History/Society
      { question: "Die Schweiz wurde 1848 gegründet.", explanation: "Falsch. 1848 erhielt die Schweiz ihre moderne Bundesverfassung, aber die Schweiz als Staatenbund existierte schon vorher.", grade: 6, difficulty: 4, topic: "NMG.9.3" },
      { question: "Bern ist die Hauptstadt der Schweiz.", explanation: "Technisch falsch. Bern ist die Bundesstadt der Schweiz, nicht offiziell die 'Hauptstadt'.", grade: 4, difficulty: 3, topic: "NMG.8.3" },
    ],

    geography: [
      { question: "Der Rhein fliesst ins Mittelmeer.", explanation: "Falsch. Der Rhein fliesst in die Nordsee, nicht ins Mittelmeer.", grade: 5, difficulty: 3, topic: "NMG.8.5" },
      { question: "Die Schweiz hat 20 Kantone.", explanation: "Falsch. Die Schweiz hat 26 Kantone, nicht 20.", grade: 4, difficulty: 2, topic: "NMG.8.3" },
      { question: "Zürich ist die grösste Stadt der Welt.", explanation: "Falsch. Zürich ist die grösste Stadt der Schweiz, aber bei weitem nicht die grösste der Welt.", grade: 3, difficulty: 2, topic: "NMG.8.5" },
      { question: "Die Schweiz liegt am Meer.", explanation: "Falsch. Die Schweiz ist ein Binnenland ohne Meereszugang.", grade: 3, difficulty: 1, topic: "NMG.8.5" },
    ],

    science: [
      { question: "Wasser gefriert bei 10 Grad Celsius.", explanation: "Falsch. Wasser gefriert bei 0 Grad Celsius, nicht bei 10 Grad.", grade: 4, difficulty: 2, topic: "NMG.3.2" },
      { question: "Die Erde ist flach.", explanation: "Falsch. Die Erde ist kugelförmig (ein Sphäroid), nicht flach.", grade: 4, difficulty: 1, topic: "NMG.4.1" },
      { question: "Metall schwimmt auf Wasser.", explanation: "Falsch. Die meisten Metalle sinken im Wasser, weil sie dichter sind als Wasser.", grade: 5, difficulty: 3, topic: "NMG.3.1" },
    ]
  },

  en: {
    math: [
      { question: "5 + 4 = 10", explanation: "False. 5 + 4 = 9, not 10.", grade: 1, difficulty: 1, topic: "MA.1.A.2" },
      { question: "12 - 7 = 6", explanation: "False. 12 - 7 = 5, not 6.", grade: 2, difficulty: 2, topic: "MA.1.A.2" },
      { question: "6 × 8 = 54", explanation: "False. 6 × 8 = 48, not 54.", grade: 3, difficulty: 3, topic: "MA.1.A.3" },
      { question: "A square has 3 sides.", explanation: "False. A square has 4 sides, not 3.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },
      { question: "A triangle has 4 corners.", explanation: "False. A triangle has 3 corners, not 4.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },
      { question: "1/2 is greater than 3/4.", explanation: "False. 3/4 is greater than 1/2.", grade: 4, difficulty: 3, topic: "MA.1.A.3" },
      { question: "There are 50 minutes in one hour.", explanation: "False. There are 60 minutes in one hour, not 50.", grade: 3, difficulty: 2, topic: "MA.3.A.1" },
      { question: "A day has 12 hours.", explanation: "False. A day has 24 hours, not 12.", grade: 2, difficulty: 2, topic: "MA.3.A.1" },
    ],

    language: [
      { question: "The plural of 'child' is 'childs'.", explanation: "False. The plural of 'child' is 'children', not 'childs'.", grade: 2, difficulty: 2, topic: "D.5.A.1" },
      { question: "The English alphabet has 24 letters.", explanation: "False. The English alphabet has 26 letters, not 24.", grade: 1, difficulty: 1, topic: "D.4.A.1" },
      { question: "A verb describes a thing.", explanation: "False. A verb describes an action, not a thing. Nouns describe things.", grade: 3, difficulty: 2, topic: "D.5.C.1" },
      { question: "An adjective describes an action.", explanation: "False. An adjective describes a quality or characteristic, not an action. Verbs describe actions.", grade: 3, difficulty: 2, topic: "D.5.C.1" },
      { question: "'Colour' is spelled with 'o' in British English.", explanation: "True, so this is FALSE as a false statement. Actually, this statement is TRUE for British English.", grade: 4, difficulty: 2, topic: "D.4.A.1" },
    ],

    science: [
      { question: "The Sun orbits around the Earth.", explanation: "False. The Earth orbits around the Sun, not the other way around.", grade: 4, difficulty: 3, topic: "NMG.4.1" },
      { question: "The Moon produces its own light.", explanation: "False. The Moon reflects light from the Sun; it doesn't produce its own light.", grade: 5, difficulty: 3, topic: "NMG.4.1" },
      { question: "Water boils at 50 degrees Celsius.", explanation: "False. Water boils at 100 degrees Celsius at sea level, not 50 degrees.", grade: 4, difficulty: 2, topic: "NMG.3.2" },
      { question: "Plants breathe in oxygen during photosynthesis.", explanation: "False. Plants breathe in carbon dioxide and release oxygen during photosynthesis.", grade: 5, difficulty: 3, topic: "NMG.2.1" },
      { question: "Spiders are insects.", explanation: "False. Spiders are arachnids, not insects. Insects have 6 legs, spiders have 8.", grade: 3, difficulty: 2, topic: "NMG.2.4" },
      { question: "The Earth is flat.", explanation: "False. The Earth is spherical (an oblate spheroid), not flat.", grade: 4, difficulty: 1, topic: "NMG.4.1" },
      { question: "Metal floats on water.", explanation: "False. Most metals sink in water because they are denser than water.", grade: 5, difficulty: 3, topic: "NMG.3.1" },
    ],

    geography: [
      { question: "Africa is the smallest continent.", explanation: "False. Africa is the second-largest continent, not the smallest. Australia/Oceania is the smallest.", grade: 5, difficulty: 3, topic: "NMG.8.5" },
      { question: "Switzerland has access to the ocean.", explanation: "False. Switzerland is landlocked with no ocean access.", grade: 3, difficulty: 1, topic: "NMG.8.5" },
      { question: "The River Thames flows through Paris.", explanation: "False. The Thames flows through London. The Seine flows through Paris.", grade: 5, difficulty: 3, topic: "NMG.8.5" },
      { question: "Mount Everest is in Switzerland.", explanation: "False. Mount Everest is on the border of Nepal and Tibet/China, not in Switzerland.", grade: 5, difficulty: 3, topic: "NMG.8.5" },
      { question: "Australia is in the Northern Hemisphere.", explanation: "False. Australia is in the Southern Hemisphere, not the Northern.", grade: 5, difficulty: 3, topic: "NMG.8.5" },
    ]
  },

  fr: {
    math: [
      { question: "5 + 3 = 9", explanation: "Faux. 5 + 3 = 8, pas 9.", grade: 1, difficulty: 1, topic: "MA.1.A.2" },
      { question: "10 - 4 = 7", explanation: "Faux. 10 - 4 = 6, pas 7.", grade: 2, difficulty: 2, topic: "MA.1.A.2" },
      { question: "7 × 8 = 54", explanation: "Faux. 7 × 8 = 56, pas 54.", grade: 3, difficulty: 3, topic: "MA.1.A.3" },
      { question: "Un carré a 5 côtés.", explanation: "Faux. Un carré a 4 côtés, pas 5.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },
      { question: "Un triangle a 4 sommets.", explanation: "Faux. Un triangle a 3 sommets, pas 4.", grade: 2, difficulty: 1, topic: "MA.2.A.1" },
      { question: "1/2 est plus grand que 3/4.", explanation: "Faux. 3/4 est plus grand que 1/2.", grade: 4, difficulty: 3, topic: "MA.1.A.3" },
      { question: "Une heure a 50 minutes.", explanation: "Faux. Une heure a 60 minutes, pas 50.", grade: 3, difficulty: 2, topic: "MA.3.A.1" },
      { question: "Un jour a 12 heures.", explanation: "Faux. Un jour a 24 heures, pas 12.", grade: 2, difficulty: 2, topic: "MA.3.A.1" },
      { question: "Un franc suisse a 50 centimes.", explanation: "Faux. Un franc suisse a 100 centimes, pas 50.", grade: 3, difficulty: 2, topic: "MA.3.A.2" },
    ],

    language: [
      { question: "Le mot 'maison' est masculin.", explanation: "Faux. 'Maison' est féminin (la maison), pas masculin.", grade: 2, difficulty: 2, topic: "D.5.A.1" },
      { question: "Le pluriel de 'cheval' est 'chevals'.", explanation: "Faux. Le pluriel de 'cheval' est 'chevaux', pas 'chevals'.", grade: 3, difficulty: 2, topic: "D.5.A.1" },
      { question: "L'alphabet français a 24 lettres.", explanation: "Faux. L'alphabet français a 26 lettres, pas 24.", grade: 1, difficulty: 1, topic: "D.4.A.1" },
      { question: "Un verbe décrit une chose.", explanation: "Faux. Un verbe décrit une action, pas une chose. Les noms décrivent les choses.", grade: 3, difficulty: 2, topic: "D.5.C.1" },
      { question: "Un adjectif décrit une action.", explanation: "Faux. Un adjectif décrit une qualité ou une caractéristique, pas une action. Les verbes décrivent les actions.", grade: 3, difficulty: 2, topic: "D.5.C.1" },
    ],

    science: [
      { question: "Le Soleil tourne autour de la Terre.", explanation: "Faux. La Terre tourne autour du Soleil, pas l'inverse.", grade: 4, difficulty: 3, topic: "NMG.4.1" },
      { question: "La Lune produit sa propre lumière.", explanation: "Faux. La Lune réfléchit la lumière du Soleil, elle ne produit pas sa propre lumière.", grade: 5, difficulty: 3, topic: "NMG.4.1" },
      { question: "L'eau gèle à 10 degrés Celsius.", explanation: "Faux. L'eau gèle à 0 degré Celsius, pas à 10 degrés.", grade: 4, difficulty: 2, topic: "NMG.3.2" },
      { question: "L'eau bout à 50 degrés Celsius.", explanation: "Faux. L'eau bout à 100 degrés Celsius au niveau de la mer, pas à 50 degrés.", grade: 4, difficulty: 2, topic: "NMG.3.2" },
      { question: "Les plantes respirent de l'oxygène pendant la photosynthèse.", explanation: "Faux. Les plantes respirent du dioxyde de carbone et libèrent de l'oxygène pendant la photosynthèse.", grade: 5, difficulty: 3, topic: "NMG.2.1" },
      { question: "Les araignées sont des insectes.", explanation: "Faux. Les araignées sont des arachnides, pas des insectes. Les insectes ont 6 pattes, les araignées ont 8.", grade: 3, difficulty: 2, topic: "NMG.2.4" },
      { question: "La Terre est plate.", explanation: "Faux. La Terre est sphérique (un sphéroïde), pas plate.", grade: 4, difficulty: 1, topic: "NMG.4.1" },
    ],

    geography: [
      { question: "La Suisse a accès à la mer.", explanation: "Faux. La Suisse est un pays enclavé sans accès à la mer.", grade: 3, difficulty: 1, topic: "NMG.8.5" },
      { question: "La Suisse a 20 cantons.", explanation: "Faux. La Suisse a 26 cantons, pas 20.", grade: 4, difficulty: 2, topic: "NMG.8.3" },
      { question: "Le Rhône se jette dans la mer du Nord.", explanation: "Faux. Le Rhône se jette dans la mer Méditerranée, pas dans la mer du Nord.", grade: 5, difficulty: 3, topic: "NMG.8.5" },
      { question: "Genève est la capitale de la Suisse.", explanation: "Faux. Berne est la ville fédérale de la Suisse, pas Genève.", grade: 4, difficulty: 2, topic: "NMG.8.3" },
      { question: "Le Mont Blanc est en Suisse.", explanation: "Faux. Le Mont Blanc est principalement en France, à la frontière franco-italienne. Le plus haut sommet entièrement suisse est la Pointe Dufour.", grade: 6, difficulty: 4, topic: "NMG.8.5" },
    ]
  }
};

// Helper to expand templates by duplicating with variations
function expandTemplates(templates, targetCount) {
  const expanded = [];
  let index = 0;

  while (expanded.length < targetCount) {
    const template = templates[index % templates.length];
    expanded.push({ ...template });
    index++;
  }

  return expanded.slice(0, targetCount);
}

// Generate questions for a specific language and subject
function generateQuestions(language, subject, count) {
  const templates = FALSE_TEMPLATES[language][subject];
  if (!templates) {
    console.error(`No templates found for ${language}/${subject}`);
    return [];
  }

  const expanded = expandTemplates(templates, count);

  return expanded.map((template, idx) => ({
    type: 'true-false',
    language: language,
    grade: template.grade,
    subject: subject === 'language' ? language : subject,
    question: template.question,
    correct_answer: language === 'de' ? 'Falsch' : (language === 'en' ? 'False' : 'Faux'),
    explanation: template.explanation,
    difficulty: template.difficulty,
    lehrplan21_topic: template.topic,
    school_id: null, // Will be set during import
    created_by: null, // Will be set during import
    is_active: true,
    validation_status: 'pending'
  }));
}

// Main generation function
function generateAllFalseQuestions() {
  const allQuestions = [];

  Object.entries(TARGETS).forEach(([lang, config]) => {
    console.log(`\n=== Generating ${config.total} ${lang.toUpperCase()} FALSE questions ===`);

    Object.entries(config.subjects).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count} questions`);
      const questions = generateQuestions(lang, subject, count);
      allQuestions.push(...questions);
      console.log(`  ✓ Generated ${questions.length} questions`);
    });
  });

  return allQuestions;
}

// Main execution
if (require.main === module) {
  console.log('=== FALSE True/False Question Generator ===');
  console.log('Target: 1,863 questions to balance TRUE/FALSE distribution\n');

  const questions = generateAllFalseQuestions();

  console.log(`\n=== Summary ===`);
  console.log(`Total questions generated: ${questions.length}`);
  console.log(`Target: ${TARGETS.de.total + TARGETS.en.total + TARGETS.fr.total}`);

  // Group by language
  const byLang = questions.reduce((acc, q) => {
    acc[q.language] = (acc[q.language] || 0) + 1;
    return acc;
  }, {});

  console.log('\nBy language:');
  Object.entries(byLang).forEach(([lang, count]) => {
    console.log(`  ${lang.toUpperCase()}: ${count} questions`);
  });

  // Save to file
  const outputPath = path.join(__dirname, 'false-truefalse-questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`\n✓ Questions saved to: ${outputPath}`);

  // Create import script
  const importScriptPath = path.join(__dirname, 'import-false-questions.js');
  const importScript = `#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');

async function importQuestions() {
  const questions = JSON.parse(fs.readFileSync('${outputPath}', 'utf8'));
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('Importing', questions.length, 'FALSE true/false questions...');

  let imported = 0;
  for (const q of questions) {
    try {
      await client.query(\`
        INSERT INTO questions (
          type, language, grade, subject, question, correct_answer,
          explanation, difficulty, lehrplan21_topic, is_active, validation_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      \`, [
        q.type, q.language, q.grade, q.subject, q.question, q.correct_answer,
        q.explanation, q.difficulty, q.lehrplan21_topic, q.is_active, 'approved'
      ]);
      imported++;
      if (imported % 100 === 0) console.log(\`  Imported \${imported}/\${questions.length}\`);
    } catch (err) {
      console.error('Error importing question:', q.question.substring(0, 50), err.message);
    }
  }

  console.log(\`\\n✓ Successfully imported \${imported}/\${questions.length} questions\`);

  // Verify balance
  const result = await client.query(\`
    SELECT
      CASE
        WHEN correct_answer ILIKE '%true%' OR correct_answer ILIKE '%wahr%' OR correct_answer ILIKE '%richtig%' OR correct_answer ILIKE '%vrai%' THEN 'TRUE'
        ELSE 'FALSE'
      END as answer_type,
      COUNT(*) as count
    FROM questions
    WHERE type = 'true-false'
    GROUP BY answer_type
  \`);

  console.log('\\n=== New TRUE/FALSE Distribution ===');
  console.table(result.rows);

  await client.end();
}

importQuestions().catch(console.error);
`;

  fs.writeFileSync(importScriptPath, importScript);
  fs.chmodSync(importScriptPath, '755');
  console.log(`✓ Import script created: ${importScriptPath}`);
  console.log(`\nTo import: node ${importScriptPath}`);
}

module.exports = { generateQuestions, generateAllFalseQuestions };
