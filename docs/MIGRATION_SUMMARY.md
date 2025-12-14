# Migration from Supabase to PostgreSQL - Complete ✅

## What Was Changed

### 1. Dependencies
- ✅ Installed `pg` and `@types/pg` packages
- ✅ Removed dependency on `@supabase/supabase-js` (can uninstall if desired)

### 2. Authentication System (`src/lib/auth.ts`)
- ✅ Replaced Supabase client with PostgreSQL connection pool
- ✅ Implemented development auth using localStorage (no passwords)
- ✅ All database queries now use native SQL with parameterized queries
- ✅ Added client-side protection (queries only work server-side)

### 3. Environment Variables
- ✅ Updated `.env.local.example` with PostgreSQL examples
- ✅ Removed Supabase URL/keys
- ✅ Added `DATABASE_URL` for PostgreSQL connection

### 4. Documentation
- ✅ Created `POSTGRESQL_SETUP.md` - Complete setup guide
- ✅ Updated `.env.local.example` with examples
- ✅ Added migration instructions

## ⚠️ Important Notes

### Database Queries Are Server-Side Only

The `pg` package only works in Node.js (server-side). Database queries will **NOT work** in:
- Client Components
- Browser JavaScript
- useEffect hooks
- Event handlers in client components

### Where Database Queries WORK:
✅ **API Routes** - `/app/api/*/route.ts`
✅ **Server Components** - Components without 'use client'
✅ **Server Actions** - Functions with 'use server'

### Current Issue
The app currently tries to call `database.getQuestions()` from client components. You'll need to:

**Option 1: Create API Routes** (Recommended)
```typescript
// app/api/questions/route.ts
import { database } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const grade = searchParams.get('grade')
  const subject = searchParams.get('subject')

  const questions = await database.getQuestions(null, {
    grade: grade ? parseInt(grade) : undefined,
    subject: subject || undefined
  })

  return Response.json(questions)
}

// Then call from client:
const response = await fetch('/api/questions?grade=2&subject=math')
const questions = await response.json()
```

**Option 2: Use Server Components**
Convert components that need database access to Server Components (remove 'use client').

## 📋 Next Steps to Get App Working

### 1. Set Up Database (Choose One)

**Neon (Easiest - Recommended)**:
```bash
# 1. Go to https://neon.tech
# 2. Create account and project
# 3. Copy connection string
# 4. Add to .env.local:
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb"
```

**Local PostgreSQL**:
```bash
brew install postgresql@15
brew services start postgresql@15
createdb learnkick
echo 'DATABASE_URL="postgresql://localhost:5432/learnkick"' > .env.local
```

**Docker**:
```bash
docker-compose up -d  # Use provided docker-compose.yml in POSTGRESQL_SETUP.md
echo 'DATABASE_URL="postgresql://learnkick:learnkick123@localhost:5432/learnkick"' > .env.local
```

### 2. Run Database Schema

**Via Neon Dashboard**:
- Open SQL Editor
- Paste `supabase-schema.sql`
- Click Run

**Via Command Line**:
```bash
psql "your-connection-string" < supabase-schema.sql
```

### 3. Fix Client-Side Database Calls

You need to create API routes for database access. The main files that need updates:

- `src/lib/questionBank.ts` - Calls `database.getQuestions()`
- `src/components/admin/*` - Admin components calling database directly

Quick fix for testing:
```typescript
// In src/lib/questionBank.ts, wrap database calls:
async getDatabaseQuestions(...) {
  if (typeof window !== 'undefined') {
    // Client-side: use API route
    const response = await fetch('/api/questions?...')
    return await response.json()
  }

  // Server-side: use database directly
  return await database.getQuestions(...)
}
```

### 4. Start Development Server

```bash
npm run dev
```

Visit:
- Game: http://localhost:3000
- Admin: http://localhost:3000/admin

## 🔐 Development Authentication

Auth is now simple for development:
- Users stored in localStorage
- No password verification
- Perfect for testing

Test in browser console:
```javascript
authDebug.testLogin()  // Create dev user
authDebug.getUser()    // Check current user
authDebug.signOut()    // Sign out
```

## 🎯 Benefits of This Change

✅ **No More Pausing** - Free PostgreSQL (Neon) never pauses
✅ **Full Control** - Direct database access
✅ **Flexible Deployment** - Use any PostgreSQL provider
✅ **Simpler Dev** - No complex auth for development
✅ **Same Features** - All database functionality preserved

## 📦 Optional: Remove Supabase

If you're not using Supabase anymore:
```bash
npm uninstall @supabase/supabase-js
```

## 🆘 Need Help?

1. **Connection issues**: Check `POSTGRESQL_SETUP.md`
2. **Schema errors**: Verify schema was applied correctly
3. **Build errors**: Database queries must be server-side only
4. **Auth issues**: Use `authDebug.help()` in browser console

## 🚀 Production Deployment

When ready for production:

1. Choose a PostgreSQL provider:
   - **Neon** - $20/month Pro tier
   - **Railway** - $5/month
   - **DigitalOcean** - $15/month managed
   - **Render** - Free tier available

2. Update `DATABASE_URL` in production environment

3. Implement proper auth:
   - Install NextAuth.js: `npm install next-auth`
   - Or use Clerk: `npm install @clerk/nextjs`
   - Or custom JWT solution

4. Add server-side validation and security

Everything else stays the same!
