# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LearnKick is a sports-themed, head-to-head learning game for kids aged 6-12 built as a **React PWA using Next.js 15**. Students engage in rapid-fire 60-second duels where correct answers advance their team toward goals in soccer/hockey arenas. The application features curriculum-aligned questions (Swiss Lehrplan21), offline-first capabilities, and an enterprise admin system with PostgreSQL backend.

## Common Commands

### Development
```bash
npm run dev           # Start dev server with Turbopack (default port 3000)
npm run build         # Build for production with Turbopack
npm start             # Start production server
npm run lint          # Run ESLint
```

### Testing
```bash
npm test              # Run all Playwright tests
npm run test:ui       # Open Playwright UI mode
npm run test:headed   # Run tests in headed mode (browser visible)
npm run test:debug    # Debug tests with Playwright Inspector

# Run specific test
npm run test:headed -- tests/your-test.spec.ts

# Run specific test with grep pattern
npm run test:headed -- --project=chromium tests/test-file.spec.ts -g "test name pattern"
```

**Note**: Tests run on port 3001 by default (configured in `playwright.config.ts`). The dev server typically runs on port 3000.

## High-Level Architecture

### State Management
- **Zustand** for game state (`src/stores/gameStore.ts`)
- **React Context** for themes, accessibility, and admin language
- Game logic encapsulated in `GameEngine` class (`src/lib/gameEngine.ts`)

### Data Flow
```
User Action → GameEngine → State Update → UI Render
                ↓
          Question Bank (hybrid sources)
                ↓
    1. PostgreSQL Database (via API routes)
    2. OpenAI Generation (online, fallback)
    3. IndexedDB Cache (offline)
    4. Static Questions (ultimate fallback)
```

### Question System Architecture
The question system uses a **multi-source, offline-first hybrid approach with API routes**:

1. **Database Layer** (`src/lib/auth.ts` + `src/app/api/questions/`)
   - PostgreSQL database (Neon, Railway, or self-hosted)
   - API routes handle all database operations
   - School-based multi-tenancy isolation
   - Client-side automatically uses API routes, server-side uses database directly

2. **API Routes** (`src/app/api/questions/route.ts`)
   - GET /api/questions - Fetch questions with filters
   - POST /api/questions - Add new question
   - PUT /api/questions - Update question
   - DELETE /api/questions - Delete question
   - POST /api/questions/bulk - Bulk import

3. **Offline Storage** (`src/lib/offlineStorage.ts`)
   - IndexedDB for caching questions locally
   - Enables full offline gameplay
   - Stores player profiles and game history

4. **Question Bank Service** (`src/lib/questionBank.ts`)
   - Unified interface for all question sources
   - Adaptive difficulty based on player ELO
   - Falls through sources: Database (API) → OpenAI → Cached → Static
   - Automatic client/server detection

5. **AI Generation** (`src/lib/openaiQuestionGenerator.ts`)
   - OpenAI API for generating adaptive questions
   - Used when database has insufficient questions
   - Generated questions are cached for offline use

6. **Question Generation Agent System** (`/agents/` and `/.claude/agents/`)
   - **82 specification files** in `/agents/` directory defining generation rules
   - **4 Claude Code CLI agents** in `/.claude/agents/` for interactive generation:
     - `question-master` - Coordinates generation of 800 questions
     - `german-generator` - Generates 400 German questions
     - `french-generator` - Generates 200 French questions
     - `english-generator` - Generates 200 English questions
   - **Target**: 8,000 total questions (4,000 DE, 2,000 EN, 2,000 FR)
   - **Quality Control**: 92 validation checks per language (276 total)
   - **Curriculum**: Aligned with Swiss Lehrplan 21 / Plan d'études romand
   - See `COMPLETE_SYSTEM_STATUS.md` for full details

### Authentication & Multi-Tenancy
- **Development Auth** (`src/lib/useAuth.ts`) - localStorage-based for testing
- **Production Auth** (to implement) - NextAuth.js or similar recommended
- **User Roles**: admin, teacher, parent, student
- **School Isolation**: Each school has unique code, questions scoped to school_id
- **Database Security**: Application-level checks (RLS not used with direct PostgreSQL)

### Component Structure
```
src/
├── app/              # Next.js App Router
│   ├── api/          # API routes for database operations
│   │   └── questions/  # Question CRUD endpoints
│   ├── page.tsx      # Main game interface
│   ├── layout.tsx    # Root layout with providers
│   └── admin/        # Admin dashboard (separate route)
├── components/
│   ├── game/         # Game-specific components (GameArena, QuestionCard, etc.)
│   ├── admin/        # Admin panel components (QuestionBankManager, UserManagement, etc.)
│   └── ui/           # Reusable UI components (shadcn/ui based)
├── lib/              # Core business logic
│   ├── gameEngine.ts         # Game state machine and rules
│   ├── questionBank.ts       # Question management (uses API routes)
│   ├── auth.ts              # PostgreSQL database helpers (server-side)
│   ├── useAuth.ts           # Auth hook (client-side)
│   ├── offlineStorage.ts    # IndexedDB for offline functionality
│   └── aiOpponent.ts        # AI player logic
├── stores/           # Zustand state stores
├── types/            # TypeScript type definitions
└── constants/        # Game configuration constants
```

## Key Technical Details

### Game Engine
- **60-second matches** with real-time countdown
- **AI opponent** with ELO-based difficulty (`src/lib/aiOpponent.ts`)
- **Scoring**: 3 correct answers = 1 goal (configurable)
- **Field position**: Visual representation moves based on correct/incorrect answers
- Implemented as class with state machine pattern

### Question Types
Defined in `src/types/questions.ts`:
- `multiple-choice` - 4 answer options
- `true-false` - Boolean statement evaluation
- `number-input` - Numeric answers with optional tolerance
- `image-question` - Visual questions with 4 answer options

### PWA Configuration
- `next-pwa` plugin configured in `next.config.ts`
- Service worker disabled in development
- Offline-first caching via IndexedDB (separate from service worker)

### Database Schema
Key tables (see `supabase-schema.sql`):
- `schools` - Multi-tenant organizations with unique codes
- `users` - Extended profiles linked to auth.users
- `questions` - School-scoped question bank
- `game_sessions` - Student performance tracking
- `school_invites` - Invitation management

### Admin System
**Route**: `/admin`
- Separate professional dashboard interface
- Features:
  - Question Bank Management (CRUD, CSV import/export)
  - User Management (role-based, invitations)
  - Analytics Dashboard (student performance)
  - School Settings
  - OpenAI integration for question generation
- Multi-language support (EN/DE/FR) via `src/lib/adminTranslations.ts`

### Environment Variables
Required in `.env.local`:
```
DATABASE_URL=postgresql://user:pass@host:5432/database
OPENAI_API_KEY=your-openai-key (optional, for AI question generation)
NODE_ENV=development
```

**Database Options**:
- **Neon** (recommended): Free tier, no pausing - https://neon.tech
- **Railway**: $5/month - https://railway.app
- **Local**: `brew install postgresql` or Docker
- See `POSTGRESQL_SETUP.md` for complete instructions

## Important Implementation Patterns

### Adding New Questions
Questions can come from 4 sources (priority order):
1. Database via admin panel
2. CSV import (admin feature)
3. AI generation (automatic when needed)
4. Static definitions in `src/lib/questionBank.ts`

When adding questions programmatically:
```typescript
await questionBank.addQuestion(question, schoolId, userId)
```
This automatically:
- Client-side: Calls POST /api/questions
- Server-side: Writes directly to PostgreSQL
- Caches in IndexedDB for offline use
- Makes available in game immediately

**API Route Usage**:
```typescript
// Fetch questions (auto-detects client vs server)
const questions = await questionBank.getAdaptiveQuestions(grade, elo, subject)

// Or call API directly from client
const response = await fetch('/api/questions?grade=2&subject=math')
const { success, questions } = await response.json()
```

### Working with Game State
The game state is managed through Zustand store (`src/stores/gameStore.ts`):
```typescript
const { gameState, isGameActive, currentQuestion } = useGameStore()
const { startGame, submitAnswer, pauseGame } = useGameStore()
```

Game initialization is async:
```typescript
await initializeGame(player1, player2, arena, subject, language, playerGrade)
```

### Offline-First Development
Always consider offline scenarios:
- Check `offlineStorage.isOffline()` before network calls
- Cache data proactively: `await offlineStorage.cacheQuestions(questions)`
- Provide fallbacks for all network operations

### Multi-Language Support
- Game UI: Uses `src/lib/translations.ts` (player-facing)
- Admin UI: Uses `src/lib/adminTranslations.ts` (admin-facing)
- Questions: Have `language` field ('de' | 'en' | 'fr')

### Question Generation Agent System

**Purpose**: Generate 8,000 curriculum-aligned questions using AI agents with 99.9% accuracy guarantee.

**Architecture**:
- **Specification Files** (`/agents/`): 82 files defining generation rules, curriculum, grammar, vocabulary, cultural context
- **CLI Agents** (`/.claude/agents/`): 4 interactive agents for question generation
- **Database**: Neon PostgreSQL with 8 migrations deployed
- **Quality Control**: 92 validation checks per language

**Agent System**:
```
question-master (Master Coordinator)
├── german-generator → 400 German questions
├── french-generator → 200 French questions
└── english-generator → 200 English questions
```

**Specifications Structure**:
```
/agents/
├── MASTER_ORCHESTRATOR.md
├── generation/
│   ├── de/ (German: 13 files)
│   │   ├── AGENT_DE.md
│   │   ├── config.json
│   │   ├── curriculum/ (5 subject files)
│   │   ├── rules/ (grammar, vocabulary, cultural)
│   │   └── templates/
│   ├── en/ (English: 14 files)
│   └── fr/ (French: 14 files)
└── quality-control/
    ├── qc-de/ (7 validation files)
    ├── qc-en/ (7 validation files)
    └── qc-fr/ (7 validation files)
```

**Language-Specific Rules**:
- **German**: Swiss German (ss not ß), CHF, Zürich/Bern/Basel, Lehrplan 21
- **English**: British English (colour/favourite), metric system, Swiss+international context
- **French**: Swiss numbers (septante/huitante/nonante), Suisse romande, Plan d'études romand

**Using the Agents**:
1. Access via `/agents` command in Claude Code CLI
2. Select `question-master` to coordinate full generation
3. Or select individual language generators for specific batches
4. Generated questions follow schema in `/agents/generation/{lang}/templates/`
5. All questions validated through QC agents before approval

**Database Tables** (from `migrations/`):
- `questions` - Main question storage (32 columns)
- `question_performance` - ELO calibration and accuracy tracking
- `question_versions` - Version control for all changes
- `question_validation_log` - QC audit trail
- `curriculum_coverage` - Lehrplan 21 gap analysis
- `generation_progress` - Tracks progress toward 8,000 question goal

See `COMPLETE_SYSTEM_STATUS.md` for comprehensive details.

### Lehrplan 21 Curriculum Validation

**CRITICAL**: Math questions must follow Swiss Lehrplan 21 grade-specific rules. Violations can cause inappropriate questions (e.g., "3 × 9" appearing for Grade 2 students).

**Grade-Specific Math Rules** (from `agents/quality-control/qc-fr/validation-rules/math-lehrplan21-checks.json`):

| Grade | Number Range | Addition Max | Multiplication Rules |
|-------|--------------|--------------|---------------------|
| **1** | 0-20 | Sum ≤ 20 | NOT allowed |
| **2** | 0-100 | Sum ≤ 100 | **ONLY 2×, 5×, 10× tables** |
| **3** | 0-1000 | Sum ≤ 1000 | Full 1×1 to 10×10 |
| **4** | 0-10000 | Sum ≤ 10000 | Extended, two-digit factors |
| **5** | 0-100000 | Sum ≤ 100000 | Written multiplication |
| **6** | 0-1000000 | Sum ≤ 1000000 | All forms |

**Grade 2 Multiplication Rule** (Most Common Violation):
- Grade 2 ONLY allows: **2×, 5×, and 10× multiplication tables**
- A question is valid if **at least ONE factor is 2, 5, or 10**
- Examples:
  - VALID: `9 × 2`, `5 × 7`, `10 × 8` (one factor is 2/5/10)
  - INVALID: `3 × 4`, `6 × 7`, `8 × 9` (neither is 2/5/10)

**Fix Scripts** (in project root):
```bash
# Detect and fix Grade 2 multiplication violations
node fix-grade2-multiplication-v2.cjs

# Fix specific curriculum violations (addition sums, etc.)
node fix-curriculum-violations-db.cjs
```

**Validation Pattern for Multiplication**:
```javascript
const ALLOWED_GRADE2_TABLES = [2, 5, 10];
function isValidGrade2Multiplication(factor1, factor2) {
  return ALLOWED_GRADE2_TABLES.includes(factor1) ||
         ALLOWED_GRADE2_TABLES.includes(factor2);
}

// Pattern matching (handles ×, x, *, mal, fois, times)
const patterns = [
  /(\d+)\s*[x*\u00D7]\s*(\d+)/i,  // 9 × 6, 9 * 6
  /(\d+)\s*mal\s*(\d+)/i,         // German
  /(\d+)\s*fois\s*(\d+)/i,        // French
  /(\d+)\s*times\s*(\d+)/i,       // English
];
```

## Testing Strategy

### Playwright E2E Tests
Located in `tests/` directory:
- Tests run on port 3001 (see `playwright.config.ts`)
- **Headed mode** by default for interactive testing
- Configure viewports for different devices
- Use `--project=chromium` to test specific browser

Common test patterns:
```bash
# Run all tests in headed mode
npm run test:headed

# Debug specific test
npm run test:debug -- tests/admin.spec.ts

# Run specific test case
npm run test:headed -- -g "should load questions"
```

## Development Workflow Recommendations

1. **Starting Development**
   - Set up PostgreSQL database (Neon recommended - see `POSTGRESQL_SETUP.md`)
   - Add `DATABASE_URL` to `.env.local`
   - Run database schema: `psql "DATABASE_URL" < supabase-schema.sql`
   - Run `npm run dev` for local development
   - Admin panel at `/admin`, game at `/`

2. **Working with Questions**
   - Use admin panel for CRUD operations (calls API routes)
   - CSV import template available: `question-import-template.csv`
   - Questions auto-cache for offline use
   - All operations go through `/api/questions` endpoints

3. **Database Changes**
   - Schema defined in `supabase-schema.sql`
   - Run SQL directly on PostgreSQL (Neon dashboard, psql, etc.)
   - Application-level security (no RLS with direct PostgreSQL)
   - API routes enforce school isolation

4. **Testing Game Mechanics**
   - Use headed mode to see game visually
   - Check browser console for detailed logging
   - Game engine logs prefixed with emojis (🎮, 📊, 🎯, etc.)
   - Use `authDebug.testLogin()` in console for quick dev auth

## Important Files Reference

- `src/lib/gameEngine.ts` - Core game logic and state machine
- `src/lib/questionBank.ts` - Question retrieval and adaptive difficulty
- `src/lib/auth.ts` - PostgreSQL database helpers (server-side)
- `src/lib/useAuth.ts` - Auth hook (client-side)
- `src/app/api/questions/route.ts` - Question CRUD API endpoints
- `src/stores/gameStore.ts` - Game state management
- `src/types/questions.ts` - Question type definitions
- `supabase-schema.sql` - Complete database schema (works with PostgreSQL)
- `POSTGRESQL_SETUP.md` - PostgreSQL setup instructions (NEW)
- `API_DOCUMENTATION.md` - API routes reference (NEW)
- `MIGRATION_SUMMARY.md` - Supabase→PostgreSQL migration notes (NEW)
- `ADMIN_SETUP.md` - Admin system documentation
- `QUESTION_MANAGEMENT_SYSTEM.md` - Question structure specification
- `fix-grade2-multiplication-v2.cjs` - Fix Grade 2 multiplication curriculum violations
- `fix-curriculum-violations-db.cjs` - Fix specific curriculum violations
- `agents/quality-control/qc-fr/validation-rules/math-lehrplan21-checks.json` - Lehrplan 21 math rules

## Common Gotchas

1. **`pg` package in client code**: The `pg` package only works server-side. Always use API routes from client components. The code auto-detects with `typeof window !== 'undefined'`.

2. **Port conflicts**: Dev server uses 3000, tests use 3001. If tests fail to connect, check if dev server is running on the expected port.

3. **Question filtering**: Questions are filtered by grade, subject, difficulty, and language. If no questions appear, check all filter criteria match available questions.

4. **Offline mode**: The app works offline but requires initial online session to cache questions. IndexedDB must be available in the browser.

5. **School isolation**: All database operations are scoped to school_id. API routes check this at application level (no PostgreSQL RLS).

6. **Next.js 15 + Turbopack**: This project uses Next.js 15 with Turbopack for faster builds. Some older Next.js patterns may not work. Build may show warnings for Tailwind CSS.

7. **Development auth**: Use `authDebug.testLogin()` in browser console for quick testing. Real auth (NextAuth.js) should be implemented for production.

8. **Database connection**: Set `DATABASE_URL` in `.env.local`. Without it, app falls back to static questions only.

9. **Lehrplan 21 curriculum violations**: If a user reports inappropriate questions (e.g., Grade 2 student seeing "3 × 9"), check the curriculum rules. Grade 2 ONLY allows 2×, 5×, 10× multiplication. Run `node fix-grade2-multiplication-v2.cjs` to detect and fix violations. Use Unicode `\u00D7` (not just `×`) in regex patterns to match multiplication signs properly.

10. **Team Builder plan**: A comprehensive plan exists at `~/.claude/plans/tender-beaming-stroustrup.md` for transforming LearnKick into a FIFA Ultimate Team-style game with 11 subjects = 11 player positions. Check this plan before implementing team/league features.
