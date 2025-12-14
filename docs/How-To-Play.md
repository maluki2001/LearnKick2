The system has two different user flows designed for
  different audiences:

  🎮 Anonymous/Guest Users (Main Game)

  For regular gameplay (parents, kids, casual users):

  Access Point: http://localhost:3000/ (main page)

  1. No Sign-in Required ✅
    - Players land on the beautiful game homepage
    - Click "Start Playing!"

  2. Player Setup
    - Name input (just for personalization)
    - Grade selection (1-6)
    - Language choice (EN/DE/FR)
  3. Game Mode Selection
    - Family Mode: Relaxed, fun experience
    - School Mode: More structured (if linked to school)
  4. Full Game Experience
    - ✅ Complete games with scoring
    - ✅ Progress tracking (local storage)
    - ✅ All 1000+ questions available
    - ✅ Multi-language support
    - ✅ Performance statistics

  🏢 Admin Users (School Management)

  For educators and administrators:

  Access Point: http://localhost:3000/admin

  1. Authentication Required 🔐
    - Professional login system
    - School-based accounts
    - Role-based permissions
  2. Enterprise Features
    - Question bank management
    - User management
    - Analytics and reporting
    - CSV import/export
    - School settings

  🔀 How They Work Together

  Anonymous Gameplay Flow:

  Guest Player → PlayerSetup → GameModeSelector → Game → Results
       ↓
  Local storage saves progress (no account needed)

  School-Linked Gameplay:

  Student → Uses School Code → Links to School → Game → Progress saved to
  database

  📊 Data Storage Strategy

  Anonymous Users:

  - Local Storage: Progress, preferences, game history
  - IndexedDB: Offline question cache
  - No Account: Can play immediately

  School Users:

  - Supabase Database: Complete profile and progress
  - School Isolation: Only see their school's data
  - Persistent: Data survives browser clearing

  🎯 The Beauty of This System

  ✅ Immediate Access: Anyone can play instantly✅ Progressive Enhancement:
  Can upgrade to school account later✅ Privacy Friendly: No forced
  registrations✅ School Ready: Enterprise features when needed

  Example User Journeys:

  Family at Home:
  1. Visit localhost:3000
  2. Enter child's name and grade
  3. Play immediately
  4. Progress saved locally

  Student at School:
  1. Teacher gives school code
  2. Parent creates account with code
  3. Student profile linked to school
  4. Progress tracked by teachers

  Teacher:
  1. Admin creates teacher account
  2. Access localhost:3000/admin
  3. Manage questions and view student progress

  The system is designed so nobody is forced to create accounts - the game
  works perfectly for anonymous users, but offers enhanced features for
  schools that want them!

⏺ This dual-flow design makes LearnKick both family-friendly and
  enterprise-ready! 🚀
