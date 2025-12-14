# French Math QC Validation - Quick Reference

## Status: 🔴 CRITICAL

**Pass Rate:** 2% (2/100)
**Fail Rate:** 98% (98/100)

---

## The Problem

Questions store answer VALUES instead of answer INDICES:

```
❌ WRONG (98% of questions):
correct_answer: "1000"

✅ CORRECT:
correct_answer: "2"  // index of "1000" in array
```

---

## What to Do

### 1. Run the Repair
```bash
psql "$DATABASE_URL" < repair-fr-math-questions.sql
```

### 2. Re-Validate
```bash
node validate-fr-math.cjs
```

### 3. Check Results
```bash
cat qc-results-fr-math.json
```

---

## Files

| File | Purpose |
|------|---------|
| `validate-fr-math.cjs` | Validation script |
| `qc-results-fr-math.json` | Full results (100 questions) |
| `QC-REPORT-FR-MATH.md` | Detailed analysis report |
| `repair-fr-math-questions.sql` | Database repair script |
| `VALIDATION_SUMMARY.md` | Executive summary |

---

## Key Stats

- **Structural Issues:** 85+ questions
- **Empty Fields:** 20+ questions
- **Null Arrays:** 15+ questions
- **Math Errors:** 2 questions
- **Swiss French Violations:** 0 ✅

---

## Next Steps

1. ✅ Validation complete
2. ⏳ Run repair script
3. ⏳ Re-validate
4. ⏳ Validate other subjects/languages
5. ⏳ Add database constraints

---

## Contact

See `QC-REPORT-FR-MATH.md` for full details.
