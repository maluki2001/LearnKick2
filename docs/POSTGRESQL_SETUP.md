# PostgreSQL Setup Guide

LearnKick now uses **PostgreSQL directly** instead of Supabase. This gives you more flexibility and avoids project pausing issues.

## 🚀 Quick Start (Choose One Option)

### Option 1: Neon (Recommended - Free, No Pausing)

1. **Create Free Account**: Go to https://neon.tech
2. **Create Project**: Name it "LearnKick"
3. **Copy Connection String**:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
4. **Add to `.env.local`**:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb"
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**:
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt install postgresql
   sudo systemctl start postgresql
   ```

2. **Create Database**:
   ```bash
   createdb learnkick
   ```

3. **Add to `.env.local`**:
   ```env
   DATABASE_URL="postgresql://localhost:5432/learnkick"
   ```

### Option 3: Docker PostgreSQL

1. **Create `docker-compose.yml`**:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: learnkick
         POSTGRES_USER: learnkick
         POSTGRES_PASSWORD: learnkick123
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

2. **Start Database**:
   ```bash
   docker-compose up -d
   ```

3. **Add to `.env.local`**:
   ```env
   DATABASE_URL="postgresql://learnkick:learnkick123@localhost:5432/learnkick"
   ```

## 📊 Setup Database Schema

### Using Neon Dashboard (Easiest)

1. Open your Neon project
2. Click **SQL Editor**
3. Paste contents of `supabase-schema.sql`
4. Click **Run**

### Using Command Line

```bash
psql "your-connection-string-here" < supabase-schema.sql
```

### Using Docker/Local

```bash
psql -h localhost -U learnkick -d learnkick < supabase-schema.sql
```

## ⚙️ Environment Setup

1. **Copy example file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`**:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   OPENAI_API_KEY="optional-for-ai-questions"
   NODE_ENV="development"
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

## 🔐 Development Auth Mode

The app now uses **localStorage-based auth** for development:

- No password verification
- User stored in browser localStorage
- Perfect for development and testing
- To implement real auth later, use NextAuth.js or similar

### Testing Auth:

```javascript
// In browser console:
authDebug.testLogin()  // Creates dev user
authDebug.getUser()    // Check current user
authDebug.signOut()    // Sign out
```

## 🎯 What Changed

### Before (Supabase):
- ❌ Projects pause after inactivity
- ❌ Requires Supabase account
- ❌ Built-in auth (now removed for simplicity)

### After (PostgreSQL):
- ✅ No pausing on free tiers (Neon)
- ✅ Full control over database
- ✅ Simpler development mode
- ✅ Can deploy anywhere

## 📝 Database Access

### Server-Side (Recommended):
Database queries work in:
- API Routes (`/api/*`)
- Server Components
- Server Actions

### Client-Side:
Database queries are blocked client-side. Create API routes instead.

Example:
```typescript
// app/api/questions/route.ts
import { database } from '@/lib/auth'

export async function GET() {
  const questions = await database.getQuestions(null, { grade: 2 })
  return Response.json(questions)
}
```

## 🚨 Common Issues

### Connection Refused
- **Neon**: Check your connection string is correct
- **Local**: Ensure PostgreSQL is running: `brew services list`
- **Docker**: Check container is running: `docker ps`

### SSL Error (Neon)
Already handled in code with `ssl: { rejectUnauthorized: false }`

### Schema Not Created
Run the schema file again:
```bash
psql "your-connection-string" < supabase-schema.sql
```

## 📦 Next Steps

1. ✅ Set up database (Neon/local/Docker)
2. ✅ Run schema SQL
3. ✅ Update `.env.local`
4. ✅ Start dev server: `npm run dev`
5. ✅ Test game at http://localhost:3000
6. ✅ Test admin at http://localhost:3000/admin

## 🔄 Migration from Supabase

If you have existing Supabase data:

1. **Export from Supabase**:
   ```bash
   supabase db dump > backup.sql
   ```

2. **Import to PostgreSQL**:
   ```bash
   psql "your-new-connection-string" < backup.sql
   ```

## 💡 Production Deployment

For production, consider:

- **Neon**: Free tier → Pro ($20/month) for production
- **Railway**: $5/month, simple deployment
- **DigitalOcean**: $15/month managed database
- **Render**: Free tier available
- **Your own VPS**: Most control, cheapest at scale

All work the same way - just update `DATABASE_URL`!
