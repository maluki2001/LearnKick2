# LearnKick i18n Quick Fix Guide

## Immediate Action Items

### 1. Critical Hardcoded Strings by File

#### `/src/app/page.tsx` (73 strings) - HIGHEST PRIORITY
```typescript
// CURRENT (❌ BAD):
<div>Loading LearnKick...</div>
<h1>LearnKick</h1>
<p>Sports-themed learning duels!</p>
<h1>Game Over!</h1>
<div>Final Score</div>

// FIX (✅ GOOD):
import { useTranslation } from '@/lib/translations'

const { t } = useTranslation(language) // Get language from context

<div>{t.loading}</div>
<h1>{t.welcome}</h1>
<p>{t.welcomeSubtitle}</p>
<h1>{t.game.gameOver}</h1>
<div>{t.game.finalScore}</div>
```

#### `/src/components/game/QuestionCard.tsx` (22 strings)
```typescript
// CURRENT (❌ BAD):
<span>Grade {question.grade}</span>
<span>True</span>
<span>False</span>
"🎉 Correct!"
"❌ Incorrect"

// FIX (✅ GOOD):
import { useTranslation } from '@/lib/translations'

const { t } = useTranslation(question.language)

<span>{t.playerSetup.gradeLabel} {question.grade}</span>
<span>{t.game.true}</span>
<span>{t.game.false}</span>
{t.game.correct}
{t.game.incorrect}
```

#### `/src/components/ui/QuickSetup.tsx` (18 strings)
```typescript
// CURRENT (❌ BAD):
<h2>Welcome to LearnKick!</h2>
<label>What's your name?</label>
<input placeholder="Enter your name..." />
<button>START</button>

// FIX (✅ GOOD):
import { useContext } from 'react'
import { LanguageContext } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/translations'

const { language } = useContext(LanguageContext)
const { t } = useTranslation(language)

<h2>{t.playerSetup.title}</h2>
<label>{t.playerSetup.nameLabel}</label>
<input placeholder={t.playerSetup.namePlaceholder} />
<button>{t.startPlaying}</button>
```

#### `/src/components/ui/BattleButton.tsx` (8 strings)
```typescript
// CURRENT (❌ BAD):
const SUBJECT_LABELS = {
  math: 'Math',
  geography: 'Geography',
  language: 'Language',
  'general-knowledge': 'General'
}

// FIX (✅ GOOD):
import { useTranslation } from '@/lib/translations'

const { t } = useTranslation(language)

// Use translation keys:
t.gameSetup.subjects.math
t.gameSetup.subjects.geography
t.gameSetup.subjects.language
t.gameSetup.subjects['general-knowledge']
```

#### `/src/components/ui/SettingsModal.tsx` (43 strings)
```typescript
// CURRENT (❌ BAD):
<h2>Settings</h2>
<label>Grade Level</label>
<label>Subject</label>
<button>Save Settings</button>

// FIX (✅ GOOD):
import { useTranslation } from '@/lib/translations'

const { t } = useTranslation(language)

<h2>{t.settings.title}</h2>
<label>{t.settings.gradeLevel}</label>
<label>{t.settings.subject}</label>
<button>{t.settings.saveSettings}</button>
```

---

## 2. Missing Translation Keys to Add

### Add to `src/lib/translations.ts`:

```typescript
export const translations: Record<Language, Translations> = {
  en: {
    // ... existing keys ...

    // NEW KEYS NEEDED:
    game: {
      // ... existing game keys ...
      aiRival: 'AI RIVAL',
      you: 'YOU',
      vs: 'VS',
      getReady: 'Get Ready!',
      gameStarting: 'Game starts in a moment...',
      gamePaused: 'Game Paused',
      clickResume: 'Click Resume to continue',
      loadingQuestion: 'Loading Question...',
      true: 'True',
      false: 'False',
    },

    setup: {
      playingAt: 'Where are you playing?',
      teacherMode: 'Teacher mode',
      familyMode: 'Family mode',
      autoSave: 'Your settings are saved automatically',
      start: 'START',
    },

    settings: {
      title: 'Settings',
      playingAs: 'Playing as',
      mode: 'Mode',
      gradeLevel: 'Grade Level',
      questionLanguage: 'Question Language',
      dangerZone: 'Danger Zone',
      resetProfile: 'Reset Profile & Data',
      resetWarning: 'This will delete all your progress, stats, and settings. Are you sure?',
      confirmDelete: 'Yes, Delete',
      saveSettings: 'Save Settings',
    },

    battle: {
      button: 'BATTLE',
    },
  },

  de: {
    // ... existing keys ...

    // GERMAN TRANSLATIONS:
    game: {
      // ... existing game keys ...
      aiRival: 'KI GEGNER',
      you: 'DU',
      vs: 'VS',
      getReady: 'Mach dich bereit!',
      gameStarting: 'Spiel beginnt gleich...',
      gamePaused: 'Spiel pausiert',
      clickResume: 'Klicke auf Fortsetzen',
      loadingQuestion: 'Frage wird geladen...',
      true: 'Wahr',
      false: 'Falsch',
    },

    setup: {
      playingAt: 'Wo spielst du?',
      teacherMode: 'Lehrermodus',
      familyMode: 'Familienmodus',
      autoSave: 'Deine Einstellungen werden automatisch gespeichert',
      start: 'START',
    },

    settings: {
      title: 'Einstellungen',
      playingAs: 'Spielst als',
      mode: 'Modus',
      gradeLevel: 'Klassenstufe',
      questionLanguage: 'Fragensprache',
      dangerZone: 'Gefahrenzone',
      resetProfile: 'Profil & Daten zurücksetzen',
      resetWarning: 'Dies löscht alle deine Fortschritte, Statistiken und Einstellungen. Bist du sicher?',
      confirmDelete: 'Ja, löschen',
      saveSettings: 'Einstellungen speichern',
    },

    battle: {
      button: 'KAMPF',
    },
  },

  fr: {
    // ... existing keys ...

    // FRENCH TRANSLATIONS:
    game: {
      // ... existing game keys ...
      aiRival: 'RIVAL IA',
      you: 'TOI',
      vs: 'VS',
      getReady: 'Prépare-toi!',
      gameStarting: 'Le jeu commence bientôt...',
      gamePaused: 'Jeu en pause',
      clickResume: 'Clique sur Reprendre',
      loadingQuestion: 'Chargement de la question...',
      true: 'Vrai',
      false: 'Faux',
    },

    setup: {
      playingAt: 'Où joues-tu?',
      teacherMode: 'Mode enseignant',
      familyMode: 'Mode famille',
      autoSave: 'Tes paramètres sont sauvegardés automatiquement',
      start: 'COMMENCER',
    },

    settings: {
      title: 'Paramètres',
      playingAs: 'Jouant comme',
      mode: 'Mode',
      gradeLevel: 'Niveau scolaire',
      questionLanguage: 'Langue des questions',
      dangerZone: 'Zone de danger',
      resetProfile: 'Réinitialiser profil & données',
      resetWarning: 'Ceci supprimera tous tes progrès, statistiques et paramètres. Es-tu sûr?',
      confirmDelete: 'Oui, supprimer',
      saveSettings: 'Sauvegarder les paramètres',
    },

    battle: {
      button: 'BATAILLE',
    },
  },
}
```

---

## 3. Create Language Context

### Create `/src/contexts/LanguageContext.tsx`:

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {}
})

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ui-language') as Language
    if (saved && ['en', 'de', 'fr', 'sq'].includes(saved)) {
      setLanguageState(saved)
    }
  }, [])

  // Save to localStorage when changed
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('ui-language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext }
```

### Update `/src/app/layout.tsx`:

```typescript
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlayerProfileProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </PlayerProfileProvider>
      </body>
    </html>
  )
}
```

---

## 4. Component Refactoring Pattern

### Before (Hardcoded):
```typescript
'use client'

export function MyComponent() {
  return (
    <div>
      <h1>Welcome!</h1>
      <button>Start Game</button>
      <p>Loading...</p>
    </div>
  )
}
```

### After (Translated):
```typescript
'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/translations'

export function MyComponent() {
  const { language } = useLanguage()
  const { t } = useTranslation(language)

  return (
    <div>
      <h1>{t.welcome}</h1>
      <button>{t.startPlaying}</button>
      <p>{t.loading}</p>
    </div>
  )
}
```

---

## 5. Quick Test Script

### Create `/scripts/check-hardcoded-strings.sh`:

```bash
#!/bin/bash

echo "Checking for hardcoded English strings..."

# Find English text in JSX (basic regex)
grep -r ">[A-Z][a-z]* [a-z]*<" src/components/ src/app/ --include="*.tsx" --exclude-dir=node_modules | \
  grep -v "// Translation:" | \
  grep -v "t\." | \
  head -20

echo ""
echo "Found potential hardcoded strings (showing first 20)"
echo "Review and replace with translation keys"
```

Make executable:
```bash
chmod +x scripts/check-hardcoded-strings.sh
```

Run:
```bash
./scripts/check-hardcoded-strings.sh
```

---

## 6. Translation Completion Checklist

### Phase 1: Critical (Week 1)
- [ ] Add all missing translation keys to translations.ts
- [ ] Create LanguageContext
- [ ] Refactor page.tsx (73 strings)
- [ ] Refactor QuestionCard.tsx (22 strings)
- [ ] Refactor QuickSetup.tsx (18 strings)
- [ ] Refactor BattleButton.tsx (8 strings)
- [ ] Refactor SettingsModal.tsx (43 strings)

### Phase 2: High Priority (Week 2)
- [ ] Complete German translations (400+ keys)
- [ ] Complete French translations (400+ keys)
- [ ] Refactor remaining game components
- [ ] Translate all form placeholders
- [ ] Translate all ARIA labels

### Phase 3: Polish (Week 3)
- [ ] Add Albanian game translations
- [ ] Complete admin panel translations (all languages)
- [ ] Test all languages for text overflow
- [ ] Add automated i18n tests
- [ ] Update documentation

---

## 7. Common Pitfalls to Avoid

### DON'T:
```typescript
// ❌ Hardcoded string
<button>Click Me</button>

// ❌ String concatenation
<p>Welcome, {userName}!</p>

// ❌ Hardcoded placeholder
<input placeholder="Enter name" />

// ❌ Hardcoded ARIA
<button aria-label="Close">×</button>
```

### DO:
```typescript
// ✅ Use translation key
<button>{t.button.clickMe}</button>

// ✅ Use template with variable
<p>{t.welcome.message.replace('{name}', userName)}</p>

// ✅ Translate placeholder
<input placeholder={t.input.namePlaceholder} />

// ✅ Translate ARIA
<button aria-label={t.button.close}>×</button>
```

---

## 8. Testing Your Changes

### Manual Testing:
1. Switch to German in settings
2. Verify all UI text is in German
3. Switch to French in settings
4. Verify all UI text is in French
5. Check for text overflow/truncation
6. Test on mobile viewport

### Automated Testing:
```typescript
// Example Jest test
import { translations } from '@/lib/translations'

describe('Translations', () => {
  it('should have matching keys across all languages', () => {
    const enKeys = Object.keys(translations.en)
    const deKeys = Object.keys(translations.de)
    const frKeys = Object.keys(translations.fr)

    expect(deKeys).toEqual(enKeys)
    expect(frKeys).toEqual(enKeys)
  })

  it('should not have empty translations', () => {
    Object.values(translations).forEach(lang => {
      Object.values(lang).forEach(value => {
        expect(value).not.toBe('')
        expect(value).not.toBe('TODO')
      })
    })
  })
})
```

---

## 9. Translation Resources

### Get Help:
- German (de): Native speaker review recommended
- French (fr): Native speaker review recommended
- Swiss German: Verify ss (not ß), CHF currency
- Swiss French: Verify septante/huitante/nonante usage

### Tools:
- DeepL (better for Swiss German/French than Google Translate)
- Context screenshots for translators
- Character limits for buttons/labels

---

## Contact

For questions about this i18n implementation:
- Review full audit: `/I18N_AUDIT_REPORT.md`
- Check current translations: `/src/lib/translations.ts`
- Check admin translations: `/src/lib/adminTranslations.ts`
