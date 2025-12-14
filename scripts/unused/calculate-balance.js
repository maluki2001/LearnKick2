const data = {
  de: { false: 138 + 42, true: 192 + 928 + 244 },
  en: { false: 24 + 19, true: 140 + 197 },
  fr: { false: 41, true: 426 }
};

console.log('=== CURRENT DISTRIBUTION ===');
Object.entries(data).forEach(([lang, counts]) => {
  const total = counts.false + counts.true;
  const falsePct = ((counts.false / total) * 100).toFixed(1);
  const truePct = ((counts.true / total) * 100).toFixed(1);
  console.log(`${lang.toUpperCase()}: FALSE=${counts.false} (${falsePct}%), TRUE=${counts.true} (${truePct}%), TOTAL=${total}`);
});

console.log('\n=== NEEDED FOR 50/50 BALANCE ===');
let totalNeeded = 0;
Object.entries(data).forEach(([lang, counts]) => {
  const needed = counts.true - counts.false;
  totalNeeded += needed;
  console.log(`${lang.toUpperCase()}: Need ${needed} more FALSE questions`);
});

console.log(`\nTOTAL FALSE questions needed: ${totalNeeded}`);

console.log('\n=== PROPOSED GENERATION BATCHES ===');
console.log('German (DE): 1,184 FALSE questions');
console.log('  - Math: 300 questions (grades 1-6)');
console.log('  - Language (Deutsch): 250 questions (grades 1-6)');
console.log('  - NMG: 400 questions (grades 1-6)');
console.log('  - Geography: 150 questions (grades 1-6)');
console.log('  - Science: 84 questions (grades 1-6)');
console.log('\nEnglish (EN): 294 FALSE questions');
console.log('  - Math: 75 questions (grades 1-6)');
console.log('  - Language (English): 65 questions (grades 1-6)');
console.log('  - Science: 75 questions (grades 1-6)');
console.log('  - Geography: 79 questions (grades 1-6)');
console.log('\nFrench (FR): 385 FALSE questions');
console.log('  - Math: 100 questions (grades 1-6)');
console.log('  - Language (Français): 85 questions (grades 1-6)');
console.log('  - Science: 100 questions (grades 1-6)');
console.log('  - Geography: 100 questions (grades 1-6)');
