# Data Integrity Fixes for English Geography Questions

**Date**: 2025-12-07
**Issue**: 61 questions have missing or invalid correct answers
**Impact**: Questions cannot be used in game until fixed

---

## Issue Summary

Out of 100 sampled English geography questions:
- **58 questions** have empty `correct_answer` field
- **3 questions** have invalid numeric values instead of actual answers

---

## Auto-Fixable Questions (Based on Knowledge Base)

These questions have obvious correct answers that can be programmatically populated:

### World Capitals (Easy to Fix)

```sql
-- Russia
UPDATE questions SET correct_answer = 'Moscow'
WHERE question = 'What is the capital of Russia?' AND language = 'en' AND subject = 'geography';

-- Austria
UPDATE questions SET correct_answer = 'Vienna'
WHERE question = 'What is the capital of Austria?' AND language = 'en' AND subject = 'geography';

-- Greece
UPDATE questions SET correct_answer = 'Athens'
WHERE question = 'What is the capital of Greece?' AND language = 'en' AND subject = 'geography';

-- Estonia
UPDATE questions SET correct_answer = 'Tallinn'
WHERE question = 'What is the capital of Estonia?' AND language = 'en' AND subject = 'geography';

-- Finland
UPDATE questions SET correct_answer = 'Helsinki'
WHERE question = 'What is the capital of Finland?' AND language = 'en' AND subject = 'geography';

-- Romania
UPDATE questions SET correct_answer = 'Bucharest'
WHERE question = 'What is the capital of Romania?' AND language = 'en' AND subject = 'geography';

-- Croatia
UPDATE questions SET correct_answer = 'Zagreb'
WHERE question = 'What is the capital of Croatia?' AND language = 'en' AND subject = 'geography';

-- Ireland
UPDATE questions SET correct_answer = 'Dublin'
WHERE question = 'What is the capital of Ireland?' AND language = 'en' AND subject = 'geography';

-- Latvia
UPDATE questions SET correct_answer = 'Riga'
WHERE question = 'What is the capital of Latvia?' AND language = 'en' AND subject = 'geography';

-- Lithuania
UPDATE questions SET correct_answer = 'Vilnius'
WHERE question = 'What is the capital of Lithuania?' AND language = 'en' AND subject = 'geography';

-- New Zealand
UPDATE questions SET correct_answer = 'Wellington'
WHERE question = 'What is the capital of New Zealand?' AND language = 'en' AND subject = 'geography';

-- Kenya
UPDATE questions SET correct_answer = 'Nairobi'
WHERE question = 'What is the capital of Kenya?' AND language = 'en' AND subject = 'geography';

-- Turkey
UPDATE questions SET correct_answer = 'Ankara'
WHERE question = 'What is the capital of Turkey?' AND language = 'en' AND subject = 'geography';

-- Argentina
UPDATE questions SET correct_answer = 'Buenos Aires'
WHERE question = 'What is the capital of Argentina?' AND language = 'en' AND subject = 'geography';

-- Brazil
UPDATE questions SET correct_answer = 'Brasília'
WHERE question = 'What is the capital of Brazil?' AND language = 'en' AND subject = 'geography';

-- Mexico
UPDATE questions SET correct_answer = 'Mexico City'
WHERE question = 'What is the capital of Mexico?' AND language = 'en' AND subject = 'geography';

-- Bulgaria
UPDATE questions SET correct_answer = 'Sofia'
WHERE question = 'What is the capital of Bulgaria?' AND language = 'en' AND subject = 'geography';

-- Chile
UPDATE questions SET correct_answer = 'Santiago'
WHERE question = 'What is the capital of Chile?' AND language = 'en' AND subject = 'geography';

-- Slovenia
UPDATE questions SET correct_answer = 'Ljubljana'
WHERE question = 'What is the capital of Slovenia?' AND language = 'en' AND subject = 'geography';

-- Belgium
UPDATE questions SET correct_answer = 'Brussels'
WHERE question = 'What is the capital of Belgium?' AND language = 'en' AND subject = 'geography';

-- Denmark
UPDATE questions SET correct_answer = 'Copenhagen'
WHERE question = 'What is the capital of Denmark?' AND language = 'en' AND subject = 'geography';
```

### Swiss Geography (Easy to Fix)

```sql
-- Highest mountain
UPDATE questions SET correct_answer = 'Dufourspitze'
WHERE question = 'What is the highest mountain in Switzerland?' AND language = 'en' AND subject = 'geography';

-- Most famous mountain
UPDATE questions SET correct_answer = 'Matterhorn'
WHERE question = 'Which mountain is the most famous in Switzerland?' AND language = 'en' AND subject = 'geography';

-- Toblerone mountain
UPDATE questions SET correct_answer = 'Matterhorn'
WHERE question LIKE '%Toblerone%' AND language = 'en' AND subject = 'geography';

-- Largest city
UPDATE questions SET correct_answer = 'Zürich'
WHERE question = 'What is the largest city in Switzerland?' AND language = 'en' AND subject = 'geography';

-- Capital city
UPDATE questions SET correct_answer = 'Bern'
WHERE question = 'What is the capital city of Switzerland?' AND language = 'en' AND subject = 'geography';

-- Largest lake entirely in Switzerland
UPDATE questions SET correct_answer = 'Lake Neuchâtel'
WHERE question LIKE '%largest lake entirely%' AND language = 'en' AND subject = 'geography';

-- River through Bern
UPDATE questions SET correct_answer = 'Aare'
WHERE question LIKE '%river flows through Bern%' AND language = 'en' AND subject = 'geography';

-- Language in Zürich
UPDATE questions SET correct_answer = 'German'
WHERE question LIKE '%language%Zürich%' AND language = 'en' AND subject = 'geography';

-- Language in Ticino
UPDATE questions SET correct_answer = 'Italian'
WHERE question LIKE '%language%Ticino%' AND language = 'en' AND subject = 'geography';

-- Gotthard Pass
UPDATE questions SET correct_answer = 'Gotthard Pass'
WHERE question LIKE '%pass connects%Uri%Ticino%' AND language = 'en' AND subject = 'geography';

-- Famous mountain range
UPDATE questions SET correct_answer = 'Alps'
WHERE question LIKE '%famous mountain range%Switzerland%' AND language = 'en' AND subject = 'geography';

-- Bern's bear park
UPDATE questions SET correct_answer = 'BärenPark'
WHERE question LIKE '%bear park%Bern%' AND language = 'en' AND subject = 'geography';

-- Swiss cheese with holes
UPDATE questions SET correct_answer = 'Emmental'
WHERE question LIKE '%cheese with holes%' AND language = 'en' AND subject = 'geography';

-- Chapel bridge in Lucerne
UPDATE questions SET correct_answer = 'Kapellbrücke'
WHERE question LIKE '%chapel bridge%Lucerne%' AND language = 'en' AND subject = 'geography';

-- Official languages count
UPDATE questions SET correct_answer = '4'
WHERE question LIKE '%How many official languages%Switzerland%' AND language = 'en' AND subject = 'geography';

-- Countries bordering Switzerland
UPDATE questions SET correct_answer = '5'
WHERE question LIKE '%How many countries border Switzerland%' AND language = 'en' AND subject = 'geography';

-- Cantons count
UPDATE questions SET correct_answer = '26'
WHERE question LIKE '%How many cantons%Switzerland%' AND language = 'en' AND subject = 'geography';

-- Lake shared with Germany
UPDATE questions SET correct_answer = 'Lake Constance'
WHERE question LIKE '%lake%shared%Germany%' AND language = 'en' AND subject = 'geography';

-- Olympic Capital
UPDATE questions SET correct_answer = 'Lausanne'
WHERE question LIKE '%Olympic Capital%' AND language = 'en' AND subject = 'geography';

-- Canton Basel
UPDATE questions SET correct_answer = 'Basel-Stadt'
WHERE question = 'Which canton is Basel in?' AND language = 'en' AND subject = 'geography';

-- Entirely surrounded canton
UPDATE questions SET correct_answer = 'Appenzell Innerrhoden'
WHERE question LIKE '%entirely surrounded by other%canton%' AND language = 'en' AND subject = 'geography';

-- Highest waterfall
UPDATE questions SET correct_answer = 'Staubbach Falls'
WHERE question LIKE '%highest waterfall%Switzerland%' AND language = 'en' AND subject = 'geography';
```

### World Geography (Easy to Fix)

```sql
-- Longest river
UPDATE questions SET correct_answer = 'Nile'
WHERE question = 'What is the longest river in the world?' AND language = 'en' AND subject = 'geography';

-- Longest river in Asia
UPDATE questions SET correct_answer = 'Yangtze'
WHERE question LIKE '%longest river%Asia%' AND language = 'en' AND subject = 'geography';

-- Longest river in Europe
UPDATE questions SET correct_answer = 'Volga River'
WHERE question LIKE '%longest river%Europe%' AND language = 'en' AND subject = 'geography';

-- River through Egypt
UPDATE questions SET correct_answer = 'Nile'
WHERE question LIKE '%river flows through Egypt%' AND language = 'en' AND subject = 'geography';

-- Great Wall
UPDATE questions SET correct_answer = 'Great Wall of China'
WHERE question LIKE '%famous wall%China%' AND language = 'en' AND subject = 'geography';

-- Coldest continent
UPDATE questions SET correct_answer = 'Antarctica'
WHERE question LIKE '%coldest continent%' AND language = 'en' AND subject = 'geography';

-- Smallest ocean
UPDATE questions SET correct_answer = 'Arctic'
WHERE question LIKE '%smallest%ocean%' AND language = 'en' AND subject = 'geography';

-- Smallest continent
UPDATE questions SET correct_answer = 'Australia'
WHERE question LIKE '%smallest continent%' AND language = 'en' AND subject = 'geography';

-- Largest continent by area
UPDATE questions SET correct_answer = 'Asia'
WHERE question LIKE '%largest continent%land area%' AND language = 'en' AND subject = 'geography';

-- Largest country by area
UPDATE questions SET correct_answer = 'Russia'
WHERE question LIKE '%largest country%land area%' AND language = 'en' AND subject = 'geography';

-- Ocean surrounding Antarctica
UPDATE questions SET correct_answer = 'Southern Ocean'
WHERE question LIKE '%ocean surrounds Antarctica%' AND language = 'en' AND subject = 'geography';

-- Bering Strait
UPDATE questions SET correct_answer = 'Bering Strait'
WHERE question LIKE '%strait separates Asia%North America%' AND language = 'en' AND subject = 'geography';

-- Big Ben
UPDATE questions SET correct_answer = 'Big Ben'
WHERE question LIKE '%clock tower%London%' AND language = 'en' AND subject = 'geography';

-- Eiffel Tower
UPDATE questions SET correct_answer = 'Eiffel Tower'
WHERE question LIKE '%famous tower%Paris%' AND language = 'en' AND subject = 'geography';

-- Statue of Liberty
UPDATE questions SET correct_answer = 'Statue of Liberty'
WHERE question LIKE '%famous statue%New York harbour%' AND language = 'en' AND subject = 'geography';

-- Sydney Opera House
UPDATE questions SET correct_answer = 'Sydney Opera House'
WHERE question LIKE '%opera house%Sydney%' AND language = 'en' AND subject = 'geography';

-- Golden Gate Bridge
UPDATE questions SET correct_answer = 'Golden Gate Bridge'
WHERE question LIKE '%famous bridge%San Francisco%' AND language = 'en' AND subject = 'geography';

-- Grand Canyon location
UPDATE questions SET correct_answer = 'Grand Canyon'
WHERE question LIKE '%famous canyon%Arizona%' AND language = 'en' AND subject = 'geography';

-- Petra location
UPDATE questions SET correct_answer = 'Jordan'
WHERE question LIKE '%Petra%' AND language = 'en' AND subject = 'geography';

-- Amazon rainforest
UPDATE questions SET correct_answer = 'Amazon Rainforest'
WHERE question LIKE '%forest%lungs of the Earth%' AND language = 'en' AND subject = 'geography';
```

---

## Invalid Answer Format Issues

These 3 questions have numeric values (likely array indices) instead of actual answers:

```sql
-- Fix: Which Swiss canton has the shortest name?
-- Current: correct_answer = "2"
-- Should be: "Uri" or "Zug" (both have 3 letters)
UPDATE questions
SET correct_answer = 'Uri'
WHERE question LIKE '%canton%shortest name%'
AND language = 'en'
AND subject = 'geography'
AND correct_answer = '2';

-- Fix: Which canton is known for its many vineyards?
-- Current: correct_answer = "2"
-- Should be: "Valais" or "Vaud"
UPDATE questions
SET correct_answer = 'Valais'
WHERE question LIKE '%canton%vineyards%'
AND language = 'en'
AND subject = 'geography'
AND correct_answer = '2';

-- Fix: Which Swiss city has a famous medieval old town with covered wooden bridges?
-- Current: correct_answer = "3"
-- Should be: "Lucerne"
UPDATE questions
SET correct_answer = 'Lucerne'
WHERE question LIKE '%medieval old town%covered%bridges%'
AND language = 'en'
AND subject = 'geography'
AND correct_answer = '3';
```

---

## Bulk Update Script

Create a file `fix-geography-answers.sql` with all the above SQL statements, then run:

```bash
psql "$DATABASE_URL" < fix-geography-answers.sql
```

Or use the admin panel's bulk import feature to update correct answers.

---

## Verification Steps

After applying fixes:

1. Run validation again:
   ```bash
   node validate-en-geography-v2.cjs
   ```

2. Expected result:
   - Passed: ~95-100 questions
   - Failed (Factual): 0 questions
   - Failed (Data Integrity): 0-5 questions

3. Mark fixed questions as approved:
   ```sql
   UPDATE questions
   SET validation_status = 'approved'
   WHERE language = 'en'
   AND subject = 'geography'
   AND correct_answer IS NOT NULL
   AND correct_answer != '';
   ```

---

## Prevention

Add database constraint:

```sql
ALTER TABLE questions
ADD CONSTRAINT check_correct_answer_not_empty
CHECK (correct_answer IS NOT NULL AND correct_answer != '');
```

This will prevent future questions from being inserted without valid correct answers.

---

**Generated**: 2025-12-07
**Total Fixes Required**: 61 questions
**Estimated Time**: 30-60 minutes (with bulk SQL script)
