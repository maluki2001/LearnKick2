# Supabase Setup Instructions for LearnKick

## 1. Database Schema Setup

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `bgqdpetjyrixpazfbwtn`
3. **Navigate to SQL Editor**
4. **Execute the schema**:
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to create all tables and policies

## 2. Sample Data (Optional)

1. **In SQL Editor**, run the contents of `sample-data.sql`
2. This creates:
   - Demo Elementary School (code: DEMO123)
   - Sample questions across different subjects and grades
   - Database structure ready for testing

## 3. Create Admin User

### Option A: Using Supabase Dashboard
1. Go to **Authentication > Users**
2. Click **Add User**
3. Enter:
   - Email: `admin@demo.edu`
   - Password: `Demo123!`
   - Confirm password
4. After user is created, note the User ID

### Option B: Using the App (Recommended)
1. Open the admin panel: `http://localhost:3000/admin`
2. Click **School Admin** tab
3. Fill out the form:
   - School Name: `Demo Elementary School`
   - Your Full Name: `Admin User`
   - Email: `admin@demo.edu`
   - Password: `Demo123!`
4. Click **Create School Account**
5. Check your email for verification

## 4. Link User to Sample School

After creating the admin user, run this SQL to link them to the demo school:

```sql
-- Replace 'USER_ID_HERE' with the actual UUID from step 3
INSERT INTO users (id, email, full_name, role, school_id) VALUES 
(
  'USER_ID_HERE', 
  'admin@demo.edu', 
  'Admin User', 
  'admin', 
  '550e8400-e29b-41d4-a716-446655440000'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  school_id = '550e8400-e29b-41d4-a716-446655440000';

-- Update the school admin reference
UPDATE schools 
SET admin_user_id = 'USER_ID_HERE' 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

## 5. Test the Integration

1. **Login**: Go to `http://localhost:3000/admin`
2. **Sign in** with: `admin@demo.edu` / `Demo123!`
3. **Verify data**:
   - Check that questions are loaded from the database
   - Verify user management shows real users
   - Test that all features work with real data

## 6. Row Level Security (RLS)

The schema includes comprehensive RLS policies:
- **Users** can only see data from their own school
- **Admins** can manage their school's data
- **Teachers** can manage questions and view analytics
- **Students** can only access their own game sessions

## 7. Expected Database Contents After Setup

- **1 School**: Demo Elementary School (DEMO123)
- **~10 Questions**: Math, Geography, Language, General Knowledge
- **Multiple Languages**: English, German, French questions
- **Grade Levels**: 1-6 with appropriate difficulty
- **User Roles**: Admin, Teacher, Parent, Student structure

## 8. Troubleshooting

### Authentication Issues
- Verify `.env.local` has correct Supabase credentials
- Check that RLS policies allow your user access
- Ensure user is properly linked to a school

### Data Not Loading
- Verify schema was executed completely
- Check browser console for any errors
- Ensure sample data was inserted properly

### Permission Errors
- Check that Row Level Security policies are properly set
- Verify user has the correct role (admin/teacher)
- Ensure user is linked to the correct school

## 9. Adding More Data

You can add more schools, users, and questions by:

1. **Creating new schools** with unique codes
2. **Inviting users** through the admin panel
3. **Importing questions** via CSV (feature available in Question Bank)
4. **Using the OpenAI integration** to generate questions automatically

## 10. Production Considerations

Before going live:
- [ ] Change default passwords
- [ ] Review and test all RLS policies
- [ ] Set up proper email templates
- [ ] Configure domain restrictions if needed
- [ ] Set up monitoring and backups
- [ ] Review API rate limits and usage

---

**Your Supabase Project**: https://bgqdpetjyrixpazfbwtn.supabase.co
**Database URL**: `https://bgqdpetjyrixpazfbwtn.supabase.co`
**Ready to use!** 🎉