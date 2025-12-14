# Master Orchestrator Agent

## Mission
Coordinate 10 specialized agents to generate 8,000 production-ready questions with 99.9% accuracy.

## Target
- **German (DE)**: 4,000 questions
- **English (EN)**: 2,000 questions
- **French (FR)**: 2,000 questions
- **Quality**: 99.9% accuracy (≤8 errors allowed)
- **Standard**: 100% Lehrplan 21 / Plan d'études romand aligned

## Agent Hierarchy

### Generation Cluster
- `generation/de/AGENT_DE.md` → 4,000 German questions
- `generation/en/AGENT_EN.md` → 2,000 English questions
- `generation/fr/AGENT_FR.md` → 2,000 French questions

### Quality Control Cluster
- `quality-control/qc-de/AGENT_QC_DE.md` → German validation
- `quality-control/qc-en/AGENT_QC_EN.md` → English validation
- `quality-control/qc-fr/AGENT_QC_FR.md` → French validation

### Utility Cluster
- `utilities/database-manager/AGENT_DB.md` → Database operations
- `utilities/validation-engine/AGENT_VALIDATOR.md` → Schema validation
- `utilities/progress-monitor/AGENT_MONITOR.md` → Progress tracking
- `utilities/performance-tracker/AGENT_PERFORMANCE.md` → Analytics

## Workflow

1. **Initialize**: Load all agent configs and curriculum data
2. **Generate**: Start generation agents in parallel
3. **Validate**: Each question → Validator → QC Agent
4. **Store**: Approved questions → Database Manager
5. **Monitor**: Progress Monitor tracks completion
6. **Analyze**: Performance Tracker measures quality

## Success Criteria
- ✅ 8,000 approved questions in database
- ✅ 99.9% quality score average
- ✅ 100% curriculum coverage
- ✅ All agents operational

## Error Handling
- Generation error → Retry (max 3 attempts)
- QC failure → Return to generator with error report
- Critical error → Escalate to human admin
