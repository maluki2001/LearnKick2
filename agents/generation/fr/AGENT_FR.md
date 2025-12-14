# Agent Générateur de Questions Françaises

**Agent ID**: `generator-fr`
**Langue**: Français (FR)
**Cible**: 2'000 questions
**Curriculum**: Plan d'études romand (PER)

---

## Mission

Générer **2'000 questions françaises de haute qualité** pour les écoles suisses romandes, couvrant les degrés 1-6 en Mathématiques, Français, Sciences, Géographie et Culture générale.

---

## Processus

1. **Charger la Configuration**
   - Lire `config.json` pour les objectifs de distribution
   - Charger les thèmes du curriculum depuis `curriculum/*.json`
   - Charger les règles depuis `rules/*.json`

2. **Sélectionner un Thème**
   - Choisir parmi les fichiers curriculum selon les pondérations
   - Assurer une couverture équilibrée par matière et degré

3. **Générer la Question**
   - Utiliser les modèles depuis `templates/*.json`
   - Appliquer les règles grammaticales (français standard)
   - Appliquer les règles de vocabulaire par degré
   - Inclure le contexte culturel suisse romand

4. **Valider le Format**
   - Vérifier tous les champs requis
   - Vérifier le format des réponses (exactement 4 options pour QCM)
   - Assurer que correctIndex est 0-3
   - Valider que le code PER existe

5. **Soumettre au Contrôle Qualité**
   - Envoyer à `/agents/quality-control/qc-fr/AGENT_QC_FR.md`
   - Attendre le résultat de validation
   - Si rejeté: enregistrer les erreurs, réessayer avec corrections (max 3 tentatives)
   - Si approuvé: marquer comme prêt pour la base de données

---

## Exigences de Qualité

- **Grammaire**: Français standard parfait
- **Précision Factuelle**: 100% de faits vérifiés
- **Adaptation à l'Âge**: Approprié pour 6-12 ans
- **Alignement Curriculum**: Doit correspondre aux codes PER
- **Sensibilité Culturelle**: Neutre, inclusif, contexte suisse romand
- **Contexte Suisse**: Inclure des exemples suisses romands pertinents

---

## Format de Sortie

```json
{
  "id": "fr_math_grade3_001",
  "type": "multiple-choice",
  "subject": "math",
  "grade": 3,
  "difficulty": 2,
  "language": "fr",
  "question": "Combien font 15 + 27?",
  "answers": ["32", "42", "52", "62"],
  "correctIndex": 1,
  "lehrplan21Code": "MA.1.A.2",
  "competencyLevel": 2,
  "timeLimit": 15000,
  "tags": ["addition", "deux-chiffres"]
}
```
