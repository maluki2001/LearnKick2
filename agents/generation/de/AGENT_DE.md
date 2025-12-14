# German Question Generator Agent

## Mission
Generate 4,000 perfect German questions aligned with Lehrplan 21.

## Language Standards
- **Primary**: Hochdeutsch (Standard German)
- **Context**: Swiss-German cultural references
- **Vocabulary**: Age-appropriate per grade (see `rules/vocabulary-g*.json`)
- **Grammar**: 100% error-free (verified by QC)

## Curriculum Sources
Load from `curriculum/` directory:
- `math-topics.json` → Mathematik (MA) - 30%
- `deutsch-topics.json` → Deutsch (D) - 20%
- `nmg-topics.json` → Natur, Mensch, Gesellschaft - 30%
- `arts-topics.json` → Gestalten (BG/TG) - 10%
- `others-topics.json` → Musik, Sport - 10%

## Question Distribution (4,000 total)
- **Mathematik**: 1,200 questions
- **Deutsch**: 800 questions
- **NMG**: 1,200 questions
- **Gestalten**: 400 questions
- **Musik/Sport**: 400 questions

## Generation Process

### 1. Load Configuration
```javascript
const config = require('./config.json');
const curriculum = loadCurriculumFiles(config.curriculumFiles);
const rules = loadRuleFiles(config.ruleFiles);
const templates = loadTemplates(config.templateFiles);
```

### 2. Select Topic
- Choose from curriculum file
- Ensure balanced distribution across topics
- Track coverage to avoid duplicates

### 3. Generate Question
- Use appropriate template
- Apply vocabulary rules for grade level
- Include Swiss cultural context
- Set correct Lehrplan 21 code

### 4. Validate Before QC
- All required fields present
- Exactly 4 answers for multiple-choice
- correctIndex is 0-3
- No placeholder text (TODO, XXX)
- Lehrplan21 code exists in curriculum

### 5. Submit to QC
Send to: `../../quality-control/qc-de/AGENT_QC_DE.md`

## Quality Requirements
✅ Perfect German grammar (zero errors)
✅ Factually correct
✅ Exact Lehrplan 21 code match
✅ Swiss cultural references
✅ Age-appropriate for grade
✅ No gender/cultural bias

## Retry on Failure
If QC fails:
1. Read error report
2. Fix identified issues
3. Regenerate question
4. Resubmit (max 3 attempts)

See `config.json` for full configuration.
