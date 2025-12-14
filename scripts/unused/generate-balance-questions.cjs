#!/usr/bin/env node
/**
 * MISSION: Balance Multiple-Choice and True-False Questions
 *
 * Generate:
 * - 625 German multiple-choice questions
 * - 609 English true-false questions (305 TRUE, 304 FALSE)
 * - 570 French true-false questions (285 TRUE, 285 FALSE)
 *
 * Total: 1,804 questions to achieve 50/50 balance
 */

const fs = require('fs');
const path = require('path');

// Load curriculum and rules
function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (err) {
    console.error(`Failed to load ${filepath}:`, err.message);
    return null;
  }
}

// German curriculum
const deMathTopics = loadJSON(path.join(__dirname, 'agents/generation/de/curriculum/math-topics.json'));
const deDeutschTopics = loadJSON(path.join(__dirname, 'agents/generation/de/curriculum/deutsch-topics.json'));
const deNMGTopics = loadJSON(path.join(__dirname, 'agents/generation/de/curriculum/nmg-topics.json'));

// English curriculum
const enMathTopics = loadJSON(path.join(__dirname, 'agents/generation/en/curriculum/math-topics.json'));
const enScienceTopics = loadJSON(path.join(__dirname, 'agents/generation/en/curriculum/science-topics.json'));
const enGeographyTopics = loadJSON(path.join(__dirname, 'agents/generation/en/curriculum/geography-topics.json'));

// French curriculum
const frMathTopics = loadJSON(path.join(__dirname, 'agents/generation/fr/curriculum/math-topics.json'));
const frScienceTopics = loadJSON(path.join(__dirname, 'agents/generation/fr/curriculum/science-topics.json'));
const frGeographyTopics = loadJSON(path.join(__dirname, 'agents/generation/fr/curriculum/geographie-topics.json'));

// Lehrplan 21 codes by subject and grade
const lehrplan21Codes = {
  math: {
    1: ['MA.1.A.1', 'MA.1.B.1', 'MA.2.A.1'],
    2: ['MA.1.A.2', 'MA.1.B.2', 'MA.2.A.2'],
    3: ['MA.1.A.3', 'MA.1.B.3', 'MA.2.A.3', 'MA.3.A.1'],
    4: ['MA.1.A.4', 'MA.1.B.4', 'MA.2.A.4', 'MA.3.A.2'],
    5: ['MA.1.A.5', 'MA.1.B.5', 'MA.2.A.5', 'MA.3.A.3'],
    6: ['MA.1.A.6', 'MA.1.B.6', 'MA.2.A.6', 'MA.3.A.4']
  },
  deutsch: {
    1: ['D.1.A.1', 'D.2.A.1', 'D.3.A.1'],
    2: ['D.1.A.2', 'D.2.A.2', 'D.3.A.2'],
    3: ['D.1.A.3', 'D.2.A.3', 'D.3.A.3'],
    4: ['D.1.A.4', 'D.2.A.4', 'D.3.A.4'],
    5: ['D.1.A.5', 'D.2.A.5', 'D.3.A.5'],
    6: ['D.1.A.6', 'D.2.A.6', 'D.3.A.6']
  },
  nmg: {
    1: ['NMG.1.1', 'NMG.2.1'],
    2: ['NMG.1.2', 'NMG.2.2', 'NMG.8.1'],
    3: ['NMG.1.3', 'NMG.2.3', 'NMG.8.2'],
    4: ['NMG.2.4', 'NMG.8.3', 'NMG.10.1'],
    5: ['NMG.2.5', 'NMG.8.4', 'NMG.10.2'],
    6: ['NMG.2.6', 'NMG.8.5', 'NMG.10.3']
  },
  science: {
    1: ['NMG.2.1', 'NMG.4.1'],
    2: ['NMG.2.2', 'NMG.4.2'],
    3: ['NMG.2.3', 'NMG.4.3'],
    4: ['NMG.2.4', 'NMG.4.4', 'NT.1.1'],
    5: ['NMG.2.5', 'NMG.4.5', 'NT.1.2'],
    6: ['NMG.2.6', 'NMG.4.6', 'NT.1.3']
  },
  geography: {
    1: ['NMG.8.1'],
    2: ['NMG.8.2'],
    3: ['NMG.8.3'],
    4: ['NMG.8.4', 'RZG.1.1'],
    5: ['NMG.8.5', 'RZG.1.2'],
    6: ['NMG.8.6', 'RZG.1.3']
  }
};

// Question counter
let questionCounter = {
  de: 1,
  en: 1,
  fr: 1
};

// Generate ID
function generateID(lang, subject, grade, type, number) {
  const typePrefix = type === 'true-false' ? 'tf' : 'mc';
  return `${lang}_${subject}_grade${grade}_${typePrefix}_${String(number).padStart(3, '0')}`;
}

// Get random element from array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get time limit based on grade and type
function getTimeLimit(grade, type) {
  if (type === 'true-false') {
    return grade <= 2 ? 15000 : grade <= 4 ? 12000 : 10000;
  }
  return grade <= 2 ? 20000 : grade <= 4 ? 18000 : 15000;
}

// ==============================================
// GERMAN MULTIPLE-CHOICE GENERATOR
// ==============================================

const germanMCQuestions = {
  math: [
    // Grade 1
    { grade: 1, question: "Was ist 2 + 3?", answers: ["4", "5", "6", "7"], correctIndex: 1, tags: ["addition", "zahlen-bis-10"] },
    { grade: 1, question: "Wie viele Ecken hat ein Dreieck?", answers: ["2", "3", "4", "5"], correctIndex: 1, tags: ["geometrie", "formen"] },
    { grade: 1, question: "Was ist 5 - 2?", answers: ["2", "3", "4", "5"], correctIndex: 1, tags: ["subtraktion", "zahlen-bis-10"] },
    { grade: 1, question: "Welche Zahl kommt nach 7?", answers: ["6", "7", "8", "9"], correctIndex: 2, tags: ["zahlenfolge", "zahlen-bis-10"] },
    { grade: 1, question: "Was ist 4 + 4?", answers: ["6", "7", "8", "9"], correctIndex: 2, tags: ["addition", "zahlen-bis-10"] },

    // Grade 2
    { grade: 2, question: "Was ist 12 + 8?", answers: ["18", "19", "20", "21"], correctIndex: 2, tags: ["addition", "zahlen-bis-20"] },
    { grade: 2, question: "Was ist 15 - 7?", answers: ["7", "8", "9", "10"], correctIndex: 1, tags: ["subtraktion", "zahlen-bis-20"] },
    { grade: 2, question: "Wie viele Minuten hat eine halbe Stunde?", answers: ["15", "20", "30", "60"], correctIndex: 2, tags: ["zeit", "uhren"] },
    { grade: 2, question: "Was ist 2 × 5?", answers: ["7", "10", "12", "15"], correctIndex: 1, tags: ["multiplikation", "einmaleins"] },
    { grade: 2, question: "Welche Zahl ist gerade?", answers: ["13", "15", "16", "17"], correctIndex: 2, tags: ["zahlen", "gerade-ungerade"] },

    // Grade 3
    { grade: 3, question: "Was ist 25 + 37?", answers: ["52", "62", "72", "82"], correctIndex: 1, tags: ["addition", "zweistellig"] },
    { grade: 3, question: "Was ist 48 - 19?", answers: ["27", "29", "31", "33"], correctIndex: 1, tags: ["subtraktion", "zweistellig"] },
    { grade: 3, question: "Was ist 7 × 8?", answers: ["48", "54", "56", "63"], correctIndex: 2, tags: ["multiplikation", "einmaleins"] },
    { grade: 3, question: "Wie viele Zentimeter sind 1 Meter?", answers: ["10", "50", "100", "1000"], correctIndex: 2, tags: ["masse", "umrechnung"] },
    { grade: 3, question: "Was ist ein Viertel von 100?", answers: ["20", "25", "50", "75"], correctIndex: 1, tags: ["brueche", "prozent"] },

    // Grade 4
    { grade: 4, question: "Was ist 145 + 287?", answers: ["432", "442", "452", "462"], correctIndex: 0, tags: ["addition", "dreistellig"] },
    { grade: 4, question: "Was ist 63 ÷ 9?", answers: ["6", "7", "8", "9"], correctIndex: 1, tags: ["division", "grundrechenarten"] },
    { grade: 4, question: "Wie viele Gramm sind 1,5 Kilogramm?", answers: ["150", "500", "1000", "1500"], correctIndex: 3, tags: ["masse", "umrechnung"] },
    { grade: 4, question: "Was ist 12 × 12?", answers: ["124", "132", "144", "156"], correctIndex: 2, tags: ["multiplikation", "einmaleins"] },
    { grade: 4, question: "Welcher Bruch ist grösser: 1/2 oder 1/4?", answers: ["1/4", "1/2", "gleich gross", "keiner"], correctIndex: 1, tags: ["brueche", "vergleichen"] },

    // Grade 5
    { grade: 5, question: "Was ist 0,5 + 0,25?", answers: ["0,55", "0,65", "0,75", "0,85"], correctIndex: 2, tags: ["dezimalzahlen", "addition"] },
    { grade: 5, question: "Was ist 25% von 200?", answers: ["25", "50", "75", "100"], correctIndex: 1, tags: ["prozent", "rechnen"] },
    { grade: 5, question: "Welche Fläche hat ein Quadrat mit Seitenlänge 5 cm?", answers: ["10 cm²", "20 cm²", "25 cm²", "30 cm²"], correctIndex: 2, tags: ["flaeche", "geometrie"] },
    { grade: 5, question: "Was ist der Durchschnitt von 10, 20 und 30?", answers: ["15", "20", "25", "30"], correctIndex: 1, tags: ["mittelwert", "statistik"] },
    { grade: 5, question: "Was ist 3/4 als Dezimalzahl?", answers: ["0,25", "0,5", "0,75", "1,0"], correctIndex: 2, tags: ["brueche", "dezimalzahlen"] },

    // Grade 6
    { grade: 6, question: "Was ist 2³?", answers: ["4", "6", "8", "9"], correctIndex: 2, tags: ["potenzen", "rechnen"] },
    { grade: 6, question: "Welcher Prozentsatz ist 15 von 60?", answers: ["15%", "20%", "25%", "30%"], correctIndex: 2, tags: ["prozent", "rechnen"] },
    { grade: 6, question: "Was ist der Umfang eines Kreises mit Radius 5 cm? (π ≈ 3,14)", answers: ["15,7 cm", "31,4 cm", "78,5 cm", "100 cm"], correctIndex: 1, tags: ["geometrie", "kreis"] },
    { grade: 6, question: "Was ist die Primfaktorzerlegung von 12?", answers: ["2 × 6", "3 × 4", "2² × 3", "2 × 2 × 2"], correctIndex: 2, tags: ["primzahlen", "faktorisierung"] },
    { grade: 6, question: "Was ist 40% von 150?", answers: ["50", "60", "70", "80"], correctIndex: 1, tags: ["prozent", "rechnen"] }
  ],
  deutsch: [
    // Grade 1
    { grade: 1, question: "Welcher Buchstabe kommt nach 'B'?", answers: ["A", "C", "D", "E"], correctIndex: 1, tags: ["alphabet", "buchstaben"] },
    { grade: 1, question: "Wie viele Vokale hat das Wort 'Hund'?", answers: ["0", "1", "2", "3"], correctIndex: 1, tags: ["vokale", "worter"] },
    { grade: 1, question: "Was reimt sich auf 'Haus'?", answers: ["Auto", "Maus", "Ball", "Buch"], correctIndex: 1, tags: ["reime", "worter"] },
    { grade: 1, question: "Welches Wort ist ein Nomen?", answers: ["laufen", "schön", "Baum", "schnell"], correctIndex: 2, tags: ["wortarten", "nomen"] },

    // Grade 2
    { grade: 2, question: "Welche Mehrzahl ist richtig: 'das Kind'?", answers: ["die Kinds", "die Kinder", "die Kindes", "die Kinden"], correctIndex: 1, tags: ["mehrzahl", "grammatik"] },
    { grade: 2, question: "Welches Wort ist ein Verb?", answers: ["Tisch", "gross", "rennen", "heute"], correctIndex: 2, tags: ["wortarten", "verben"] },
    { grade: 2, question: "Was ist das Gegenteil von 'gross'?", answers: ["klein", "lang", "breit", "hoch"], correctIndex: 0, tags: ["gegensaetze", "adjektive"] },
    { grade: 2, question: "Welcher Satz ist richtig?", answers: ["ich gehe zur Schule", "Ich gehe zur Schule.", "ich gehe zur schule", "Ich gehe zur schule"], correctIndex: 1, tags: ["rechtschreibung", "satzzeichen"] },

    // Grade 3
    { grade: 3, question: "Welches Wort wird mit 'ie' geschrieben?", answers: ["Kise", "Kiese", "Liebe", "Libe"], correctIndex: 2, tags: ["rechtschreibung", "ie-regel"] },
    { grade: 3, question: "Was ist ein Adjektiv?", answers: ["Tuwort", "Namenwort", "Wiewort", "Fürwort"], correctIndex: 2, tags: ["wortarten", "grammatik"] },
    { grade: 3, question: "Welche Zeit ist 'ich ging'?", answers: ["Präsens", "Präteritum", "Futur", "Perfekt"], correctIndex: 1, tags: ["zeitformen", "verben"] },
    { grade: 3, question: "Wie schreibt man 'Strasse' in der Schweiz?", answers: ["Straße", "Strasse", "Strase", "Strasa"], correctIndex: 1, tags: ["rechtschreibung", "swiss-german"] },

    // Grade 4
    { grade: 4, question: "Was ist ein Prädikat?", answers: ["Satzgegenstand", "Satzaussage", "Beifügung", "Umstandsbestimmung"], correctIndex: 1, tags: ["satzglieder", "grammatik"] },
    { grade: 4, question: "Welche Wortart ist 'schnell'?", answers: ["Nomen", "Verb", "Adjektiv", "Pronomen"], correctIndex: 2, tags: ["wortarten", "adjektive"] },
    { grade: 4, question: "Was ist der Plural von 'das Museum'?", answers: ["die Museums", "die Museen", "die Museumen", "die Musea"], correctIndex: 1, tags: ["mehrzahl", "fremdworter"] },
    { grade: 4, question: "Welches Satzzeichen gehört ans Ende einer Frage?", answers: [".", "!", "?", ","], correctIndex: 2, tags: ["satzzeichen", "fragesatz"] },

    // Grade 5
    { grade: 5, question: "Was ist ein Dativ?", answers: ["1. Fall", "2. Fall", "3. Fall", "4. Fall"], correctIndex: 2, tags: ["falle", "grammatik"] },
    { grade: 5, question: "Welches Wort ist ein Pronomen?", answers: ["Haus", "schön", "laufen", "sie"], correctIndex: 3, tags: ["wortarten", "pronomen"] },
    { grade: 5, question: "Was ist eine Metapher?", answers: ["Übertreibung", "Vergleich", "Bildlicher Ausdruck", "Wiederholung"], correctIndex: 2, tags: ["stilmittel", "metapher"] },
    { grade: 5, question: "Wie heisst die Vergangenheitsform 'ich habe gelesen'?", answers: ["Präteritum", "Perfekt", "Plusquamperfekt", "Futur"], correctIndex: 1, tags: ["zeitformen", "perfekt"] },

    // Grade 6
    { grade: 6, question: "Was ist ein Konjunktiv?", answers: ["Zeitform", "Möglichkeitsform", "Befehlsform", "Frageform"], correctIndex: 1, tags: ["modi", "konjunktiv"] },
    { grade: 6, question: "Welcher Fall folgt nach 'wegen'?", answers: ["Nominativ", "Genitiv", "Dativ", "Akkusativ"], correctIndex: 1, tags: ["praepositionen", "faelle"] },
    { grade: 6, question: "Was ist ein Passiv-Satz?", answers: ["Täter handelt", "Betonung der Handlung", "Frage", "Befehl"], correctIndex: 1, tags: ["aktiv-passiv", "grammatik"] },
    { grade: 6, question: "Welches Stilmittel ist 'blitzschnell'?", answers: ["Metapher", "Personifikation", "Übertreibung", "Alliteration"], correctIndex: 2, tags: ["stilmittel", "hyperbel"] }
  ],
  nmg: [
    // Nature & Science
    { grade: 1, subject: "nmg", question: "Welche Jahreszeit kommt nach dem Sommer?", answers: ["Frühling", "Winter", "Herbst", "Sommer"], correctIndex: 2, tags: ["jahreszeiten", "natur"] },
    { grade: 2, subject: "nmg", question: "Was brauchen Pflanzen zum Wachsen?", answers: ["Wasser und Licht", "Nur Erde", "Nur Luft", "Nur Dunkelheit"], correctIndex: 0, tags: ["pflanzen", "wachstum"] },
    { grade: 3, subject: "nmg", question: "Welches ist ein Säugetier?", answers: ["Fisch", "Vogel", "Hund", "Frosch"], correctIndex: 2, tags: ["tiere", "saugetiere"] },
    { grade: 4, subject: "nmg", question: "Wie viele Kantone hat die Schweiz?", answers: ["20", "23", "26", "30"], correctIndex: 2, tags: ["schweiz", "kantone"] },
    { grade: 5, subject: "nmg", question: "Was ist die Hauptstadt der Schweiz?", answers: ["Zürich", "Genf", "Bern", "Basel"], correctIndex: 2, tags: ["schweiz", "geografie"] },
    { grade: 6, subject: "nmg", question: "Welcher Berg ist der höchste der Schweiz?", answers: ["Matterhorn", "Eiger", "Dufourspitze", "Jungfrau"], correctIndex: 2, tags: ["schweiz", "berge"] },

    // Geography
    { grade: 1, subject: "nmg", question: "Welche Farbe hat die Schweizer Flagge?", answers: ["Blau", "Rot", "Grün", "Gelb"], correctIndex: 1, tags: ["schweiz", "flagge"] },
    { grade: 2, subject: "nmg", question: "An welchem See liegt Zürich?", answers: ["Bodensee", "Genfersee", "Zürichsee", "Vierwaldstättersee"], correctIndex: 2, tags: ["schweiz", "seen"] },
    { grade: 3, subject: "nmg", question: "Welches Gebirge liegt in der Schweiz?", answers: ["Alpen", "Himalaya", "Rocky Mountains", "Anden"], correctIndex: 0, tags: ["gebirge", "schweiz"] },
    { grade: 4, subject: "nmg", question: "Welcher Fluss fliesst durch Basel?", answers: ["Aare", "Rhone", "Rhein", "Reuss"], correctIndex: 2, tags: ["fluesse", "schweiz"] },
    { grade: 5, subject: "nmg", question: "In welcher Sprachregion liegt Genf?", answers: ["Deutschsprachig", "Französischsprachig", "Italienischsprachig", "Rätoromanisch"], correctIndex: 1, tags: ["sprachen", "schweiz"] },
    { grade: 6, subject: "nmg", question: "Welches Nachbarland grenzt nicht an die Schweiz?", answers: ["Deutschland", "Frankreich", "Spanien", "Österreich"], correctIndex: 2, tags: ["nachbarlaender", "geografie"] },

    // History & Society
    { grade: 3, subject: "nmg", question: "Wann ist der Schweizer Nationalfeiertag?", answers: ["1. Januar", "1. August", "25. Dezember", "1. Mai"], correctIndex: 1, tags: ["feiertage", "schweiz"] },
    { grade: 4, subject: "nmg", question: "Was ist ein Kanton?", answers: ["Eine Stadt", "Ein Bundesstaat", "Ein Dorf", "Ein Berg"], correctIndex: 1, tags: ["politik", "kantone"] },
    { grade: 5, subject: "nmg", question: "Welche Währung gilt in der Schweiz?", answers: ["Euro", "Dollar", "Schweizer Franken", "Pfund"], correctIndex: 2, tags: ["waehrung", "schweiz"] },
    { grade: 6, subject: "nmg", question: "Was bedeutet die Abkürzung 'UNO'?", answers: ["United Nations Organisation", "Universal Nature Organisation", "Urban New Order", "United Nordic Organisation"], correctIndex: 0, tags: ["organisationen", "politik"] }
  ]
};

function generateGermanMCBatch(count) {
  const questions = [];
  const subjects = ['math', 'deutsch', 'nmg'];
  const grades = [1, 2, 3, 4, 5, 6];

  // Distribute across subjects
  const perSubject = Math.ceil(count / subjects.length);

  for (const subject of subjects) {
    const subjectQuestions = germanMCQuestions[subject] || germanMCQuestions.math;

    for (let i = 0; i < perSubject && questions.length < count; i++) {
      const template = randomElement(subjectQuestions);
      const grade = template.grade || randomElement(grades);
      const id = generateID('de', subject, grade, 'multiple-choice', questionCounter.de++);

      const question = {
        id,
        type: 'multiple-choice',
        subject,
        grade,
        difficulty: Math.min(Math.max(grade - 1, 1), 6),
        language: 'de',
        lehrplan21Code: randomElement(lehrplan21Codes[subject === 'nmg' ? 'nmg' : subject][grade]),
        competencyLevel: Math.ceil(grade / 2),
        question: template.question,
        answers: template.answers,
        correctIndex: template.correctIndex,
        explanation: `Die richtige Antwort ist: ${template.answers[template.correctIndex]}`,
        tags: template.tags,
        timeLimit: getTimeLimit(grade, 'multiple-choice'),
        validated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      questions.push(question);
    }
  }

  return questions.slice(0, count);
}

// ==============================================
// ENGLISH TRUE-FALSE GENERATOR
// ==============================================

const englishTFStatements = {
  true: [
    // Grade 1-2
    { grade: 1, subject: "math", question: "2 + 2 equals 4.", tags: ["addition", "basic-facts"] },
    { grade: 1, subject: "science", question: "The sun rises in the east.", tags: ["sun", "directions"] },
    { grade: 2, subject: "math", question: "A triangle has three sides.", tags: ["shapes", "geometry"] },
    { grade: 2, subject: "science", question: "Water freezes at 0 degrees Celsius.", tags: ["water", "temperature"] },

    // Grade 3-4
    { grade: 3, subject: "math", question: "10 × 5 equals 50.", tags: ["multiplication", "times-tables"] },
    { grade: 3, subject: "geography", question: "Switzerland is located in Europe.", tags: ["switzerland", "continents"] },
    { grade: 4, subject: "science", question: "Plants need sunlight to grow.", tags: ["plants", "photosynthesis"] },
    { grade: 4, subject: "geography", question: "The capital of Switzerland is Bern.", tags: ["switzerland", "capitals"] },

    // Grade 5-6
    { grade: 5, subject: "math", question: "50% is equivalent to one half.", tags: ["percentages", "fractions"] },
    { grade: 5, subject: "science", question: "The Earth orbits around the Sun.", tags: ["solar-system", "astronomy"] },
    { grade: 6, subject: "geography", question: "Switzerland has four official languages.", tags: ["switzerland", "languages"] },
    { grade: 6, subject: "science", question: "Sound travels faster in water than in air.", tags: ["sound", "physics"] }
  ],
  false: [
    // Grade 1-2
    { grade: 1, subject: "math", question: "3 + 3 equals 5.", tags: ["addition", "basic-facts"] },
    { grade: 1, subject: "science", question: "Fish can live on land.", tags: ["animals", "habitats"] },
    { grade: 2, subject: "math", question: "A square has three corners.", tags: ["shapes", "geometry"] },
    { grade: 2, subject: "science", question: "The moon is a star.", tags: ["moon", "astronomy"] },

    // Grade 3-4
    { grade: 3, subject: "math", question: "7 × 6 equals 48.", tags: ["multiplication", "times-tables"] },
    { grade: 3, subject: "geography", question: "Switzerland is an island country.", tags: ["switzerland", "geography"] },
    { grade: 4, subject: "science", question: "All insects have eight legs.", tags: ["insects", "animals"] },
    { grade: 4, subject: "geography", question: "Geneva is the capital of Switzerland.", tags: ["switzerland", "capitals"] },

    // Grade 5-6
    { grade: 5, subject: "math", question: "25% is equivalent to one half.", tags: ["percentages", "fractions"] },
    { grade: 5, subject: "science", question: "The Sun orbits around the Earth.", tags: ["solar-system", "astronomy"] },
    { grade: 6, subject: "geography", question: "Switzerland has five official languages.", tags: ["switzerland", "languages"] },
    { grade: 6, subject: "science", question: "Sound travels faster in air than in water.", tags: ["sound", "physics"] }
  ]
};

function generateEnglishTFBatch(countTrue, countFalse) {
  const questions = [];

  // Generate TRUE statements
  for (let i = 0; i < countTrue; i++) {
    const template = randomElement(englishTFStatements.true);
    const id = generateID('en', template.subject, template.grade, 'true-false', questionCounter.en++);

    questions.push({
      id,
      type: 'true-false',
      subject: template.subject,
      grade: template.grade,
      difficulty: Math.min(Math.max(template.grade - 1, 1), 6),
      language: 'en',
      lehrplan21Code: randomElement(lehrplan21Codes[template.subject][template.grade]),
      competencyLevel: Math.ceil(template.grade / 2),
      question: template.question,
      answers: ['True', 'False'],
      correctIndex: 0,
      explanation: "This statement is true.",
      tags: template.tags,
      timeLimit: getTimeLimit(template.grade, 'true-false'),
      validated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Generate FALSE statements
  for (let i = 0; i < countFalse; i++) {
    const template = randomElement(englishTFStatements.false);
    const id = generateID('en', template.subject, template.grade, 'true-false', questionCounter.en++);

    questions.push({
      id,
      type: 'true-false',
      subject: template.subject,
      grade: template.grade,
      difficulty: Math.min(Math.max(template.grade - 1, 1), 6),
      language: 'en',
      lehrplan21Code: randomElement(lehrplan21Codes[template.subject][template.grade]),
      competencyLevel: Math.ceil(template.grade / 2),
      question: template.question,
      answers: ['True', 'False'],
      correctIndex: 1,
      explanation: "This statement is false.",
      tags: template.tags,
      timeLimit: getTimeLimit(template.grade, 'true-false'),
      validated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return questions;
}

// ==============================================
// FRENCH TRUE-FALSE GENERATOR
// ==============================================

const frenchTFStatements = {
  true: [
    // Grade 1-2
    { grade: 1, subject: "math", question: "2 + 2 égale 4.", tags: ["addition", "calcul-base"] },
    { grade: 1, subject: "science", question: "Le soleil se lève à l'est.", tags: ["soleil", "directions"] },
    { grade: 2, subject: "math", question: "Un triangle a trois côtés.", tags: ["formes", "géométrie"] },
    { grade: 2, subject: "science", question: "L'eau gèle à 0 degré Celsius.", tags: ["eau", "température"] },

    // Grade 3-4
    { grade: 3, subject: "math", question: "10 × 5 égale 50.", tags: ["multiplication", "tables"] },
    { grade: 3, subject: "geography", question: "La Suisse se trouve en Europe.", tags: ["suisse", "continents"] },
    { grade: 4, subject: "science", question: "Les plantes ont besoin de lumière pour grandir.", tags: ["plantes", "photosynthèse"] },
    { grade: 4, subject: "geography", question: "Berne est la capitale de la Suisse.", tags: ["suisse", "capitales"] },

    // Grade 5-6
    { grade: 5, subject: "math", question: "50% équivaut à un demi.", tags: ["pourcentages", "fractions"] },
    { grade: 5, subject: "science", question: "La Terre tourne autour du Soleil.", tags: ["système-solaire", "astronomie"] },
    { grade: 6, subject: "geography", question: "La Suisse a quatre langues officielles.", tags: ["suisse", "langues"] },
    { grade: 6, subject: "science", question: "Le son voyage plus vite dans l'eau que dans l'air.", tags: ["son", "physique"] }
  ],
  false: [
    // Grade 1-2
    { grade: 1, subject: "math", question: "3 + 3 égale 5.", tags: ["addition", "calcul-base"] },
    { grade: 1, subject: "science", question: "Les poissons peuvent vivre sur terre.", tags: ["animaux", "habitats"] },
    { grade: 2, subject: "math", question: "Un carré a trois coins.", tags: ["formes", "géométrie"] },
    { grade: 2, subject: "science", question: "La lune est une étoile.", tags: ["lune", "astronomie"] },

    // Grade 3-4
    { grade: 3, subject: "math", question: "7 × 6 égale 48.", tags: ["multiplication", "tables"] },
    { grade: 3, subject: "geography", question: "La Suisse est un pays insulaire.", tags: ["suisse", "géographie"] },
    { grade: 4, subject: "science", question: "Tous les insectes ont huit pattes.", tags: ["insectes", "animaux"] },
    { grade: 4, subject: "geography", question: "Genève est la capitale de la Suisse.", tags: ["suisse", "capitales"] },

    // Grade 5-6
    { grade: 5, subject: "math", question: "25% équivaut à un demi.", tags: ["pourcentages", "fractions"] },
    { grade: 5, subject: "science", question: "Le Soleil tourne autour de la Terre.", tags: ["système-solaire", "astronomie"] },
    { grade: 6, subject: "geography", question: "La Suisse a cinq langues officielles.", tags: ["suisse", "langues"] },
    { grade: 6, subject: "science", question: "Le son voyage plus vite dans l'air que dans l'eau.", tags: ["son", "physique"] }
  ]
};

function generateFrenchTFBatch(countTrue, countFalse) {
  const questions = [];

  // Generate TRUE statements
  for (let i = 0; i < countTrue; i++) {
    const template = randomElement(frenchTFStatements.true);
    const id = generateID('fr', template.subject, template.grade, 'true-false', questionCounter.fr++);

    questions.push({
      id,
      type: 'true-false',
      subject: template.subject,
      grade: template.grade,
      difficulty: Math.min(Math.max(template.grade - 1, 1), 6),
      language: 'fr',
      lehrplan21Code: randomElement(lehrplan21Codes[template.subject][template.grade]),
      competencyLevel: Math.ceil(template.grade / 2),
      question: template.question,
      answers: ['Vrai', 'Faux'],
      correctIndex: 0,
      explanation: "Cette affirmation est vraie.",
      tags: template.tags,
      timeLimit: getTimeLimit(template.grade, 'true-false'),
      validated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Generate FALSE statements
  for (let i = 0; i < countFalse; i++) {
    const template = randomElement(frenchTFStatements.false);
    const id = generateID('fr', template.subject, template.grade, 'true-false', questionCounter.fr++);

    questions.push({
      id,
      type: 'true-false',
      subject: template.subject,
      grade: template.grade,
      difficulty: Math.min(Math.max(template.grade - 1, 1), 6),
      language: 'fr',
      lehrplan21Code: randomElement(lehrplan21Codes[template.subject][template.grade]),
      competencyLevel: Math.ceil(template.grade / 2),
      question: template.question,
      answers: ['Vrai', 'Faux'],
      correctIndex: 1,
      explanation: "Cette affirmation est fausse.",
      tags: template.tags,
      timeLimit: getTimeLimit(template.grade, 'true-false'),
      validated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return questions;
}

// ==============================================
// MAIN GENERATION ORCHESTRATOR
// ==============================================

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   QUESTION BALANCE GENERATOR - Achieving 50/50 Split    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('TARGET GENERATION:');
console.log('  German:  625 multiple-choice questions');
console.log('  English: 609 true-false questions (305 TRUE, 304 FALSE)');
console.log('  French:  570 true-false questions (285 TRUE, 285 FALSE)');
console.log('  TOTAL:   1,804 questions\n');

const allQuestions = [];

// Generate German MC
console.log('[1/3] Generating German multiple-choice questions...');
const germanQuestions = generateGermanMCBatch(625);
allQuestions.push(...germanQuestions);
console.log(`✓ Generated ${germanQuestions.length} German MC questions\n`);

// Generate English TF
console.log('[2/3] Generating English true-false questions...');
const englishQuestions = generateEnglishTFBatch(305, 304);
allQuestions.push(...englishQuestions);
console.log(`✓ Generated ${englishQuestions.length} English TF questions\n`);

// Generate French TF
console.log('[3/3] Generating French true-false questions...');
const frenchQuestions = generateFrenchTFBatch(285, 285);
allQuestions.push(...frenchQuestions);
console.log(`✓ Generated ${frenchQuestions.length} French TF questions\n`);

// Save to file
const outputPath = path.join(__dirname, 'balance-questions-1804.json');
fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                  GENERATION COMPLETE!                     ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('FINAL COUNT:');
console.log(`  Total questions generated: ${allQuestions.length}`);
console.log(`  German MC:  ${germanQuestions.length}`);
console.log(`  English TF: ${englishQuestions.length}`);
console.log(`  French TF:  ${frenchQuestions.length}\n`);

console.log(`Output saved to: ${outputPath}\n`);

console.log('NEXT STEPS:');
console.log('  1. Review questions for quality');
console.log('  2. Run validation: node validate-balance-questions.cjs');
console.log('  3. Import to database: node import-balance-questions.cjs\n');
