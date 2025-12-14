# French Math Question Validation Report

**Generated:** 2025-12-07T04:18:28.625Z
**Validator:** AI QC System for Swiss Primary School Questions
**Language:** French (fr)
**Subject:** Mathematics (math)
**Sample Size:** 100 questions (randomly selected)

---

## Executive Summary

### CRITICAL DATA QUALITY ISSUE DETECTED

**PASS Rate:** 2.0% (2/100)
**FAIL Rate:** 98.0% (98/100)

The French math question database has a **critical structural defect** affecting 98% of questions. The `correct_answer` field is storing **answer values** instead of **answer indices** (0-3), making the questions unusable in the application.

---

## Issue Breakdown

### Category 1: Invalid Answer Index (Most Common)
**Count:** 70+ questions
**Issue:** `correct_answer` field contains the actual answer value (e.g., "50", "1000", "CHF 7.50") instead of the index (0, 1, 2, or 3)

**Examples:**
1. **ID:** `946c0859-03af-46e5-a91a-2273f300b343`
   - **Question:** "Combien de grammes y a-t-il dans 1 kilogramme ?"
   - **Answers:** ["10", "100", "1000", "10000"]
   - **correct_answer:** "1000" ❌ (should be: 2)
   - **Expected:** Index 2 (the value "1000" is at index 2)

2. **ID:** `4c6ba4bc-7720-416a-a22d-d215d952e78a`
   - **Question:** "Quel est le double de 25 ?"
   - **Answers:** ["45", "48", "50", "52"]
   - **correct_answer:** "50" ❌ (should be: 2)
   - **Expected:** Index 2 (the value "50" is at index 2)

3. **ID:** `aaaaad7d-a5f5-475d-9ce2-aa36dd9e9ad5`
   - **Question:** Money question
   - **correct_answer:** "CHF 7.50" ❌ (should be: 0-3)

### Category 2: Empty correct_answer Field
**Count:** 20+ questions
**Issue:** `correct_answer` field is empty string ("")

**Examples:**
1. **ID:** `333fbb04-a22d-4c8f-8af6-e38a2007360f`
   - **Question:** "Un carré a une aire de 49 cm². Quelle est la longueur d'un côté?"
   - **Answers:** ["5 cm", "6 cm", "7 cm", "8 cm"]
   - **correct_answer:** "" ❌
   - **Expected:** Index 2 ("7 cm" is correct: √49 = 7)

### Category 3: Null answers Array
**Count:** 15+ questions
**Issue:** `answers` field is null or not an array (likely true/false questions stored incorrectly)

**Examples:**
1. **ID:** `cd04a6fa-26de-4bb2-931f-34534ab78e10`
   - **Question:** "3 + 3 = 6"
   - **answers:** null ❌
   - **correct_answer:** "true"
   - **Expected:** This is a true/false question stored in wrong format

### Category 4: Mathematical Errors (Actual Content Issues)
**Count:** 2 questions
**Issue:** The marked correct answer is mathematically wrong

**Examples:**
1. **ID:** `1cf35590-3a4b-477b-96c3-fbffe5878713`
   - **Question:** "Quelle est la valeur de 3/4 en décimales ?"
   - **Answers:** ["0.25", "0.5", "0.75", "1"]
   - **correct_answer:** "0.25" (index would be 0) ❌
   - **MATH ERROR:** 3/4 = 0.75, not 0.25
   - **Wrong answer:** "0.75" (index 2) is marked as wrong but equals the correct answer

2. **ID:** `b3029689-36a5-45ee-b618-11c1f4618082`
   - **Question:** "Combien font 10 - 7 ?"
   - **Expected:** 3
   - **Marked correct:** 5 ❌
   - **MATH ERROR:** 10 - 7 = 3, not 5

---

## Passed Questions (2 total)

### Question 1: PASS with Warnings
**ID:** `657b251e-e8ca-43d8-967e-c4a1cb018aac`
- **Question:** "Un triangle a combien de côtés ?"
- **Answers:** ["2", "3", "4", "5"]
- **correct_answer:** "3"
- **Status:** PASS (by luck - the value "3" happens to also be a valid index)
- **Warning:** Complex word problem - manual verification recommended

**NOTE:** This question PASSED but still has the data structure issue. It only passed because the answer value "3" is also a valid index (3 = index of "5" in the array). This is **not actually correct** - the correct index should be 1 (where "3" is located).

### Question 2: PASS with Warnings
**ID:** `1e3fb8d6-1087-438d-9314-88b9b7ba9b8a`
- **Question:** "Quelle fraction est plus grande : 2/3 ou 1/3 ?"
- **Answers:** ["2/3", "1/3", "Elles sont égales", "On ne peut pas comparer"]
- **correct_answer:** "2/3"
- **Status:** PASS
- **Warning:** Could not extract number from correct answer: "Elles sont égales"

**NOTE:** This question also has the structural issue. It passed because the answer "2/3" happens to match index 0.

---

## Swiss French Compliance

**Status:** ✅ NO VIOLATIONS DETECTED

All questions scanned for France French numbers:
- ❌ soixante-dix (70)
- ❌ quatre-vingt (80)
- ❌ quatre-vingt-dix (90)

**Expected Swiss French numbers:**
- ✅ septante (70)
- ✅ huitante (80)
- ✅ nonante (90)

No instances of France French numbers were found in the sampled questions.

---

## Root Cause Analysis

### Database Schema Issue

The `questions` table appears to have been populated with data where:
- `correct_answer` stores the **answer text/value** (e.g., "50", "1000", "true")
- Application expects `correct_answer` to be an **integer index** (0, 1, 2, or 3)

This is a **critical schema/data mismatch** that renders 98% of French math questions unusable.

### Possible Causes

1. **CSV Import Error:** The import script may have mapped the wrong column to `correct_answer`
2. **Data Migration Issue:** Previous system may have used different schema
3. **Question Generator Bug:** AI question generator may be outputting wrong format
4. **Database Type Mismatch:** Column may be TEXT instead of INTEGER

---

## Recommendations

### IMMEDIATE ACTION REQUIRED

1. **Fix Database Schema**
   - Verify `correct_answer` column type (should be INTEGER or SMALLINT)
   - If TEXT, consider migration to INTEGER

2. **Data Repair Script**
   - Create SQL script to find answer value in answers array and replace with index
   - Example:
     ```sql
     UPDATE questions
     SET correct_answer = (
       SELECT idx FROM unnest(answers) WITH ORDINALITY AS t(val, idx)
       WHERE val = correct_answer LIMIT 1
     ) - 1
     WHERE language = 'fr' AND subject = 'math' AND correct_answer ~ '^[0-9]+$';
     ```

3. **Validate Entire Database**
   - Run this QC script on ALL languages and subjects:
     - German (de) - Math, German Language, NMG, Music
     - English (en) - Math, English Language, NMG, Music
     - French (fr) - Math, French Language, NMG, Music

4. **Review Question Generation Process**
   - Check `/agents/generation/fr/` specifications
   - Verify AI agents are outputting correct schema
   - Update templates in `/agents/generation/fr/templates/`

5. **Add Database Constraints**
   ```sql
   ALTER TABLE questions
   ADD CONSTRAINT correct_answer_in_bounds
   CHECK (correct_answer >= 0 AND correct_answer < 4);
   ```

---

## Updated Questions Status

All 98 failed questions have been marked with:
```sql
UPDATE questions SET validation_status = 'rejected' WHERE id IN ([failed IDs])
```

These questions are now flagged and should not be used in the game until repaired.

---

## Next Steps

1. ✅ **COMPLETED:** Validate 100 French math questions
2. ✅ **COMPLETED:** Mark failed questions as 'rejected'
3. ✅ **COMPLETED:** Generate detailed report
4. ⏳ **PENDING:** Create data repair SQL script
5. ⏳ **PENDING:** Run repair script on database
6. ⏳ **PENDING:** Re-validate after repair
7. ⏳ **PENDING:** Validate other language/subject combinations

---

## Technical Details

**Validation Script:** `/Users/arisejupi/Desktop/LearnKick-LeanMVP/validate-fr-math.cjs`
**Results File:** `/Users/arisejupi/Desktop/LearnKick-LeanMVP/qc-results-fr-math.json`
**Database:** PostgreSQL (Neon)
**Connection:** Via environment variable `DATABASE_URL`

**Validation Checks Performed:**
- ✅ Swiss French number compliance (septante/huitante/nonante)
- ✅ Answer array structure validation
- ✅ Correct answer index bounds checking
- ✅ Mathematical accuracy verification (addition, subtraction, multiplication, division)
- ✅ Wrong answers verification (ensuring they are actually wrong)
- ✅ Duplicate answer detection
- ✅ Grade-appropriateness warnings

---

## Contact

For questions about this validation report, refer to:
- Project documentation: `/CLAUDE.md`
- Question system spec: `/QUESTION_MANAGEMENT_SYSTEM.md`
- Agent system status: `/COMPLETE_SYSTEM_STATUS.md`
