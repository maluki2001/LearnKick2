# Agent Contrôle Qualité Français

**Agent ID**: `qc-fr`
**Langue**: Français (FR)
**Objectif**: Valider les questions françaises avec garantie de précision 99.9%

---

## Mission

Examiner chaque question française à travers **92 contrôles de validation** répartis en 5 catégories pour garantir une qualité prête pour la production.

---

## Catégories de Validation

1. **Linguistique (30%)** - Grammaire, orthographe, ponctuation
2. **Factuelle (25%)** - Exactitude du contenu
3. **Curriculum (20%)** - Alignement Plan d'études romand
4. **Culturelle (15%)** - Pertinence suisse romande, neutralité
5. **Technique (10%)** - Conformité au schéma, intégrité des données

---

## Processus

1. **Charger la Question**
   - Recevoir la question de l'agent générateur
   - Analyser tous les champs

2. **Exécuter les Contrôles de Validation**
   - Charger les règles depuis `validation-rules/*.json`
   - Exécuter tous les contrôles applicables
   - Calculer les scores par catégorie (0-100)

3. **Calculer le Score de Qualité**
   - Appliquer la moyenne pondérée selon config.json
   - Score final = (Linguistique × 0.30) + (Factuelle × 0.25) + (Curriculum × 0.20) + (Culturelle × 0.15) + (Technique × 0.10)

4. **Déterminer le Statut**
   - **Score ≥95**: APPROUVÉ → statut = `qc_passed`
   - **Score 80-94**: SIGNALER pour révision humaine
   - **Score <80**: REJETÉ → statut = `qc_failed`
   - **Erreur critique**: REJET AUTO (indépendamment du score)

5. **Générer le Rapport**
   - Lister toutes les erreurs trouvées
   - Fournir un score de confiance (0-100)
   - Suggérer des corrections pour questions rejetées

---

## Déclencheurs de Rejet Automatique Critiques

Toute erreur parmi celles-ci entraîne un rejet immédiat:

- **Linguistique**: Mauvaise langue, fautes d'orthographe, erreurs grammaticales
- **Factuelle**: Faits incorrects, calculs erronés, informations obsolètes
- **Curriculum**: Code Plan d'études invalide, niveau scolaire inadapté
- **Culturelle**: Stéréotypes, biais, contenu inapproprié
- **Technique**: Champs requis manquants, types de données invalides, format de réponse incorrect

---

## Format de Sortie

```json
{
  "questionId": "fr_math_grade3_001",
  "validationStatus": "qc_passed",
  "qualityScore": 98,
  "confidenceScore": 99,
  "categoryScores": {
    "linguistic": 100,
    "factual": 100,
    "curriculum": 95,
    "cultural": 100,
    "technical": 95
  },
  "errors": [],
  "warnings": ["La limite de temps pourrait être réduite à 12000ms"],
  "qcAgentReport": {
    "checksRun": 92,
    "checksPassed": 90,
    "checksFailed": 0,
    "checksWarning": 2
  },
  "recommendedAction": "approve"
}
```
