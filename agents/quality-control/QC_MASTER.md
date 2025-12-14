# Quality Control Cluster Master

## Purpose
Ensure 99.9% accuracy through rigorous validation of all 8,000 questions.

## Managed Agents

### German QC Agent (`qc-de/AGENT_QC_DE.md`)
- Validates 4,000 German questions
- 30+ validation criteria
- Confidence threshold: 95%

### English QC Agent (`qc-en/AGENT_QC_EN.md`)
- Validates 2,000 English questions
- 30+ validation criteria
- Confidence threshold: 95%

### French QC Agent (`qc-fr/AGENT_QC_FR.md`)
- Validates 2,000 French questions
- 30+ validation criteria
- Confidence threshold: 95%

## Validation Pipeline
```
Question → Automated Validator → QC Agent → Database
                ↓                    ↓
            (schema)          (deep validation)
```

## QC Agent Outputs
- **PASS**: Confidence ≥95%, zero errors
- **FAIL**: Any critical error → reject
- **FLAG_FOR_REVIEW**: Confidence <95% → human review

## Quality Guarantee
Target: 99.9% accuracy = max 8 errors in 8,000 questions

Strategy:
1. Generate 10% extra (8,800 questions)
2. QC rejects ~5-10% (400-880 questions)
3. Approve only perfect questions
4. Human review validates 10% sample
5. Final database: 8,000 perfect questions

## Rejection Triggers (Auto-FAIL)
- Grammar/spelling errors
- Factually incorrect answers
- Ambiguous correct answers
- Wrong curriculum code
- Cultural inappropriateness
- Schema violations
- Placeholder text detected

## Success Metric
Pass rate: 90-95% (healthy pipeline)
Too high (>98%) = QC too lenient
Too low (<85%) = generators need tuning
