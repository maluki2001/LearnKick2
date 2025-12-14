# API Routes Documentation

## Overview

The application now uses **API routes** to communicate with the PostgreSQL database. All database operations are handled server-side via Next.js API routes, keeping the `pg` package out of client bundles.

## Architecture

```
Client Component → API Route (server-side) → PostgreSQL Database
```

- **Client-side**: Uses `fetch()` to call API routes
- **Server-side**: API routes use `pg` package directly
- **Automatic detection**: Code checks `typeof window` to choose the right path

## API Endpoints

### 1. GET /api/questions
**Fetch questions with filters**

**Query Parameters**:
- `schoolId` (optional) - Filter by school
- `subject` (optional) - Filter by subject (math, geography, etc.)
- `grade` (optional) - Filter by grade (1-6)
- `language` (optional) - Filter by language (en, de, fr)

**Example**:
```javascript
const response = await fetch('/api/questions?grade=2&subject=math&language=en')
const { success, questions, count } = await response.json()
```

**Response**:
```json
{
  "success": true,
  "questions": [
    {
      "id": "...",
      "type": "multiple-choice",
      "subject": "math",
      "grade": 2,
      "question": "What is 2 + 2?",
      "answers": ["3", "4", "5", "6"],
      "correctIndex": 1
    }
  ],
  "count": 1
}
```

---

### 2. POST /api/questions
**Add a new question**

**Request Body**:
```json
{
  "question": {
    "id": "unique-id",
    "type": "multiple-choice",
    "subject": "math",
    "grade": 2,
    "difficulty": 1,
    "language": "en",
    "question": "What is 2 + 2?",
    "answers": ["3", "4", "5", "6"],
    "correctIndex": 1,
    "tags": ["addition"],
    "timeLimit": 15000
  },
  "schoolId": "school-uuid",
  "userId": "user-uuid"
}
```

**Example**:
```javascript
const response = await fetch('/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question, schoolId, userId })
})
const { success, question } = await response.json()
```

**Response**:
```json
{
  "success": true,
  "question": { /* created question */ }
}
```

---

### 3. PUT /api/questions
**Update an existing question**

**Request Body**:
```json
{
  "questionId": "question-uuid",
  "updates": {
    "question": "Updated question text",
    "difficulty": 2
  },
  "schoolId": "school-uuid"
}
```

**Example**:
```javascript
const response = await fetch('/api/questions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ questionId, updates, schoolId })
})
const { success, question } = await response.json()
```

---

### 4. DELETE /api/questions
**Delete a question**

**Query Parameters**:
- `questionId` (required) - ID of question to delete
- `schoolId` (required) - School ID for authorization

**Example**:
```javascript
const response = await fetch(`/api/questions?questionId=${id}&schoolId=${schoolId}`, {
  method: 'DELETE'
})
const { success, message } = await response.json()
```

---

### 5. POST /api/questions/bulk
**Bulk import questions**

**Request Body**:
```json
{
  "questions": [
    { /* question 1 */ },
    { /* question 2 */ },
    { /* question 3 */ }
  ],
  "schoolId": "school-uuid",
  "userId": "user-uuid"
}
```

**Example**:
```javascript
const response = await fetch('/api/questions/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ questions, schoolId, userId })
})
const { success, questions, count } = await response.json()
```

---

## Automatic Client/Server Detection

The `questionBank.ts` service automatically detects if it's running client-side or server-side:

```typescript
const isClient = typeof window !== 'undefined'

if (isClient) {
  // Client-side: use API route
  const response = await fetch('/api/questions')
  const data = await response.json()
} else {
  // Server-side: use database directly
  const data = await database.getQuestions()
}
```

This means you can use the same `questionBank` service everywhere:

```typescript
import { questionBank } from '@/lib/questionBank'

// Works in both client and server components!
const questions = await questionBank.getAdaptiveQuestions(grade, elo, subject)
```

## Error Handling

All API routes return a consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Example error handling:
```javascript
try {
  const response = await fetch('/api/questions')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error)
  }

  // Use result.questions
} catch (error) {
  console.error('Failed to fetch questions:', error)
}
```

## Authentication

Currently using development mode with localStorage-based auth. In production, you'll want to:

1. Add proper session management (NextAuth.js recommended)
2. Validate user permissions in API routes
3. Check `schoolId` ownership before operations

Example:
```typescript
// In API route
export async function POST(request: NextRequest) {
  // TODO: Get user from session
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user has access to schoolId
  if (session.user.school_id !== schoolId) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // Process request...
}
```

## Development vs Production

### Development Mode:
- Auth via localStorage (`authDebug` in console)
- No database required for basic testing
- Falls back to static questions

### Production Mode:
- Set up PostgreSQL (Neon, Railway, etc.)
- Add `DATABASE_URL` to environment
- Implement proper authentication
- API routes connect to real database

## Testing the API

### Using Browser Console:
```javascript
// Test fetch
fetch('/api/questions?grade=2&subject=math')
  .then(r => r.json())
  .then(data => console.log(data))

// Test add
fetch('/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: { /* your question object */ },
    schoolId: 'test-school',
    userId: 'test-user'
  })
}).then(r => r.json()).then(console.log)
```

### Using curl:
```bash
# Get questions
curl "http://localhost:3000/api/questions?grade=2&subject=math"

# Add question
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"question": {...}, "schoolId": "...", "userId": "..."}'
```

## Next Steps

1. **Set up database**: Follow `POSTGRESQL_SETUP.md`
2. **Run schema**: Execute `supabase-schema.sql`
3. **Update `.env.local`**: Add `DATABASE_URL`
4. **Start dev server**: `npm run dev`
5. **Test API**: Visit http://localhost:3000 and check console logs

The app will:
- ✅ Use API routes for database access
- ✅ Fall back to static questions if database not available
- ✅ Work in development without database
- ✅ Cache questions in IndexedDB for offline use

## Troubleshooting

**API returns 500 error**:
- Check `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running
- Check server logs for database connection errors

**Questions not loading**:
- Open browser console and check for API errors
- Verify API route is returning data: `/api/questions?grade=2`
- Check Network tab in DevTools

**Build failing with pg errors**:
- Webpack config should exclude `pg` from client bundle
- Ensure `useAuth` is imported from `./useAuth.ts`, not `./auth.ts`
- Check that no client components directly import `pg`

For more help, see `POSTGRESQL_SETUP.md` and `MIGRATION_SUMMARY.md`.
