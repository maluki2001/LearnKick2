# Generation Cluster Master

## Purpose
Manage 3 generation agents to produce 8,000 total questions.

## Managed Agents

### German Generator (`de/AGENT_DE.md`)
- **Target**: 4,000 questions (50%)
- **Curriculum**: Lehrplan 21 (complete coverage)
- **Subjects**: Mathematik, Deutsch, NMG, Gestalten, Musik, Sport
- **Config**: `de/config.json`

### English Generator (`en/AGENT_EN.md`)
- **Target**: 2,000 questions (25%)
- **Curriculum**: Lehrplan 21 (English adaptation)
- **Subjects**: Math, English, Science, Geography
- **Config**: `en/config.json`

### French Generator (`fr/AGENT_FR.md`)
- **Target**: 2,000 questions (25%)
- **Curriculum**: Plan d'études romand
- **Subjects**: Mathématiques, Français, Sciences, Géographie
- **Config**: `fr/config.json`

## Execution Strategy
1. Run all 3 agents in parallel
2. Each generates 100 questions per batch
3. Submit batch to respective QC agent
4. Continue until targets met

## Quality Requirements
- Perfect grammar (zero errors)
- Factual accuracy (verified)
- Swiss cultural appropriateness
- Age-appropriate vocabulary
- Exact curriculum alignment

## QC Submission
Generator DE → `../quality-control/qc-de/`
Generator EN → `../quality-control/qc-en/`
Generator FR → `../quality-control/qc-fr/`
