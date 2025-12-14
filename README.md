# LearnKick 🚀⚽

A sports-themed, head-to-head learning game for kids aged 6-12 that makes education feel like play through fast 60-second duels.

## 📖 Overview

LearnKick is a **React PWA** built with **Next.js 15** that transforms learning into competitive sports gameplay. Students engage in rapid-fire 60-second duels across themed arenas, answering curriculum-aligned questions while their avatars battle for goals.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database

**Option A: Neon (Recommended - Free, No Pausing)**
1. Go to https://neon.tech and create free account
2. Create project "LearnKick"
3. Copy connection string from dashboard
4. Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb"
   ```
5. Run schema in Neon SQL Editor (paste contents of `supabase-schema.sql`) or via psql:
   ```bash
   psql "your-connection-string" < supabase-schema.sql
   ```

**Option B: Local PostgreSQL**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb learnkick
echo 'DATABASE_URL="postgresql://localhost:5432/learnkick"' > .env.local
psql learnkick < supabase-schema.sql
```

See **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** for more options (Docker, Railway, etc.)

### 3. Start Development Server
```bash
npm run dev
```

Visit:
- **Game**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 4. Development Login
Open browser console:
```javascript
authDebug.testLogin()  // Creates dev user
authDebug.help()       // Show all commands
```

## 📋 Available Commands

```bash
# Development
npm run dev           # Start dev server (port 3000)
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint

# Testing
npm test              # Run all Playwright tests
npm run test:headed   # Run tests with browser visible
npm run test:ui       # Playwright UI mode
npm run test:debug    # Debug specific test
```

## 🎯 Core Features (MVP)

### Gameplay
- **60-Second Duels**: Fast-paced matches with grade-based timers
- **PVP with AI Opponent**: Smart AI with ELO-based difficulty
- **Sports Arenas**: Soccer and Hockey themes
- **Scoring**: 3 correct answers = 1 goal

### Educational Content
- **Curriculum-Aligned**: Swiss Lehrplan21 standards
- **Multi-Subject**: Math, Geography, Languages (DE/EN/FR)
- **Adaptive Difficulty**: ELO-like system based on accuracy
- **Question Types**: Multiple choice, true/false, number input, image questions

### User Experience
- **Offline-First**: IndexedDB caching for classroom use
- **Multi-Language**: English, German, French
- **Progress Tracking**: XP, streaks, performance analytics
- **Admin Dashboard**: Question management, CSV import/export, AI generation

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 15 with Turbopack
- **Database**: PostgreSQL (Neon, Railway, or self-hosted)
- **State Management**: Zustand + React Context
- **Styling**: Tailwind CSS + shadcn/ui
- **PWA**: next-pwa for offline capabilities
- **Testing**: Playwright E2E tests
- **AI**: OpenAI for question generation

### Database Architecture
```
Client Component → API Route → PostgreSQL
                     ↓
              Question Bank
                     ↓
    1. Database (via API)
    2. OpenAI Generation (fallback)
    3. IndexedDB Cache (offline)
    4. Static Questions (ultimate fallback)
```

### API Routes
- `GET /api/questions` - Fetch questions with filters
- `POST /api/questions` - Add question
- `PUT /api/questions` - Update question
- `DELETE /api/questions` - Delete question
- `POST /api/questions/bulk` - Bulk import

See **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** for complete reference.

## 📚 Documentation

### Setup & Migration
- **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - Database setup guide (Neon/Local/Docker)
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Supabase→PostgreSQL migration notes
- **[.env.local.example](./.env.local.example)** - Environment variables template

### Development
- **[CLAUDE.md](./CLAUDE.md)** - Development guide for Claude Code
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin panel documentation
- **[QUESTION_MANAGEMENT_SYSTEM.md](./QUESTION_MANAGEMENT_SYSTEM.md)** - Question structure

### Product & Strategy
- **[MVP PRD & Pitch](docs/learn_kick_mvp_prd_pitch_v_1.md)** - Product requirements
- **[Implementation Q&A](docs/IMPLEMENTATION.md)** - Technical requirements
- **[MVP Brief](docs/LearnKick_MVP_Brief_TalkingPoints.md)** - Strategy & talking points

## 🔧 Environment Variables

Create `.env.local`:
```env
# PostgreSQL Database (Required)
DATABASE_URL="postgresql://user:pass@host:5432/database"

# OpenAI (Optional - for AI question generation)
OPENAI_API_KEY="sk-..."

# Node Environment
NODE_ENV="development"
```

## 🏃 Development Workflow

1. **Start server**: `npm run dev`
2. **Login**: Open console → `authDebug.testLogin()`
3. **Add questions**: Admin panel at `/admin`
4. **Test game**: Play at `/`
5. **Run tests**: `npm run test:headed`

### Working with Questions
- **Admin UI**: Question CRUD at `/admin`
- **CSV Import**: Use template `question-import-template.csv`
- **AI Generation**: Automatic when OpenAI API key is set
- **API**: Direct API calls via `/api/questions`

## 🧪 Testing

```bash
# Run all tests
npm test

# Headed mode (browser visible)
npm run test:headed

# Debug specific test
npm run test:debug -- tests/game.spec.ts

# Run with pattern
npm run test:headed -- -g "should load questions"
```

Tests run on port 3001 (configured in `playwright.config.ts`).

## 🚢 Production Deployment

### 1. Choose Database Provider
- **Neon**: Free tier → $20/month Pro (recommended, no pausing)
- **Railway**: $5/month
- **DigitalOcean**: $15/month managed
- **Render**: Free tier available

### 2. Set Environment Variables
```env
DATABASE_URL="your-production-postgresql-url"
NODE_ENV="production"
OPENAI_API_KEY="optional-for-ai-generation"
```

### 3. Deploy
```bash
npm run build
npm start
```

Or deploy to:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Your own VPS

### 4. Production Auth
Current: localStorage (dev only)
**TODO**: Implement NextAuth.js or Clerk for production

## 🎮 Game Mechanics

- **Match Duration**: 60 seconds
- **Scoring**: 3 correct answers = 1 goal
- **Field Position**: Visual progress based on correct/incorrect
- **AI Opponent**: ELO-based difficulty adjustment
- **Anti-Cheat**: Minimum answer time, randomization

## 📊 Database Schema

Key tables (see `supabase-schema.sql`):
- `schools` - Multi-tenant organizations
- `users` - Student/teacher/admin profiles
- `questions` - School-scoped question bank
- `game_sessions` - Performance tracking
- `school_invites` - User invitation system

Multi-tenancy via `school_id` isolation at application level.

## 🎯 Success Metrics (30-Day KPIs)

- **Engagement**: ≥30% D7 retention
- **Learning**: +10pp accuracy improvement after 50 questions
- **Adoption**: 3 pilot schools using offline mode
- **Revenue**: 100 paid family plans

## 💰 Business Model

- **Web-First**: Stripe subscriptions (avoiding app store fees)
- **Family Plans**: Parent-managed kid profiles
- **School Plans**: Classroom management & offline sync
- **Future**: Cosmetic unlocks, themed question packs

## 🆘 Troubleshooting

**Database connection errors?**
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- See `POSTGRESQL_SETUP.md`

**Questions not loading?**
- Check browser console for API errors
- Verify database has questions (run schema)
- Test API: `curl http://localhost:3000/api/questions?grade=2`

**Build failing?**
- Ensure `pg` package only imported server-side
- Check webpack config in `next.config.ts`
- See `MIGRATION_SUMMARY.md` troubleshooting section

**Need help?**
- Check documentation files
- Run `authDebug.help()` in browser console
- See `CLAUDE.md` for development patterns

## 🤝 Contributing

See `CLAUDE.md` for development guidelines and architecture details.

## 📄 License

Private repository - All rights reserved to LearnKick team.

---

*Making learning feel like play, one duel at a time!* ⚽📚
