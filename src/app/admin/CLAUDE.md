# Admin Dashboard - CLAUDE.md

## Overview
The admin dashboard is the main entry point for school administrators and teachers to manage the LearnKick application. It provides a comprehensive interface for user management, question bank management, analytics, and school settings.

## Key Components

### Authentication Flow
- **File**: `src/app/admin/page.tsx`
- **Purpose**: Handles admin authentication and rendering
- **Features**:
  - Auth state management with `useAuth()`
  - Loading state during authentication
  - Role-based access (admin/teacher only)
  - Automatic redirect to login for unauthorized users

### Main Dashboard Component
- **File**: `src/components/admin/AdminDashboard.tsx` 
- **Purpose**: Main dashboard layout and navigation
- **Features**:
  - Fixed sidebar navigation with icons
  - Tab-based content switching
  - User profile display
  - School information header
  - Responsive design for mobile/desktop

## Navigation Structure
The admin dashboard uses a tab-based navigation system:

1. **Overview** - Key metrics and analytics summary
2. **Question Bank** - Manage educational questions and content
3. **Subjects** - Create and organize subject categories  
4. **User Management** - Invite and manage users (teachers, parents, students)
5. **Analytics** - Detailed performance insights and charts
6. **School Settings** - Configure school preferences and settings
7. **Offers Management** - Create and manage promotional offers

## Technology Stack
- **React 19** with Next.js 15
- **TypeScript** for type safety
- **OriginUI** components for consistent design
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Supabase** for authentication and data
- **Lucide React** for icons

## Authentication & Authorization
- Uses custom `useAuth()` hook
- Supports admin and teacher roles
- Automatic session management
- Protected routes with role-based access
- Cache-control headers to prevent stale data

## Design System
The admin dashboard uses OriginUI components throughout:
- **Card** components for all content containers
- **Button** components with consistent variants
- **Input, Label, Switch** for form controls
- **Badge** components for status indicators
- Consistent color scheme and typography
- Dark mode support through CSS variables

## State Management
- Local React state for UI interactions
- Custom hooks for data fetching
- Context providers for shared state
- Real-time updates via Supabase subscriptions

## Performance Considerations
- Lazy loading of components
- Optimized re-renders with React.memo
- Efficient state updates
- Image optimization
- Code splitting by route

## Future Enhancements
- Real-time notifications
- Advanced analytics dashboard
- Bulk operations for user management
- Export/import functionality
- Mobile app integration
- Advanced reporting features

## Development Guidelines
1. All new components should use OriginUI design system
2. Maintain consistent error handling patterns
3. Follow TypeScript strict mode guidelines
4. Use proper loading and error states
5. Implement responsive design principles
6. Add proper ARIA labels for accessibility