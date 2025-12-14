# Question Balance - Quick Reference

## Current Status (2025-12-11)

**Balance Score**: 93.70% ✅
**Gap**: 577 questions from perfect 50/50

## Numbers at a Glance

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| MC Count | 4,868 | 4,579 | +289 |
| TF Count | 4,291 | 4,580 | -289 |
| Total | 9,159 | 9,159 | 0 |

## What to Do Next

**Need 289 MORE true-false questions**:
- 150 English TF
- 100 French TF
- 39 German TF

## Files Created

| File | Location | Purpose |
|------|----------|---------|
| `balance-questions-1804.json` | Root | 1,804 validated questions |
| `generate-balance-questions.cjs` | Root | Generation script |
| `validate-balance-questions.cjs` | Root | Validation script |
| `import-balance-questions.cjs` | Root | Import script |
| `BALANCE_MISSION_REPORT.md` | Root | Technical report |
| `BALANCE_FINAL_SUMMARY.md` | Root | Executive summary |

## Commands

### Generate Questions
```bash
node generate-balance-questions.cjs
```

### Validate Questions
```bash
node validate-balance-questions.cjs
```

### Import to Database
```bash
source .env.local && node import-balance-questions.cjs
```

### Check Current Balance
```bash
source .env.local && node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const client = await pool.connect();
  const result = await client.query(\`
    SELECT type, COUNT(*) as count FROM questions
    WHERE type IN ('multiple-choice', 'true-false')
    GROUP BY type
  \`);
  console.log(result.rows);
  client.release();
  pool.end();
})();
"
```

## Quality Standards

All questions must have:
- ✅ Swiss language standards (ss not ß, septante, etc.)
- ✅ Lehrplan 21 code
- ✅ Age-appropriate for grade level
- ✅ Factually correct
- ✅ Culturally sensitive
- ✅ Proper JSON format

## Next Actions

1. **Option A**: Use OpenAI API
   - Cost: $3-5
   - Time: 2-3 hours
   - Result: 289 unique TF questions

2. **Option B**: Manual curation
   - Cost: Educator time
   - Time: 15-20 hours
   - Result: Highest quality

3. **Option C**: Hybrid
   - Generate 100 with AI
   - Manually create 189
   - Review all before import

## Contact

Questions? See:
- `BALANCE_FINAL_SUMMARY.md` - Complete overview
- `BALANCE_MISSION_REPORT.md` - Technical details
