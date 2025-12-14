# UserManagement Component - CLAUDE.md

## Overview
The UserManagement component provides a comprehensive interface for school administrators to manage users (teachers, parents, and students) in the LearnKick system.

## File Location
`src/components/admin/UserManagement.tsx`

## Key Features

### User Statistics Display
- **Teachers Count**: Shows total number of registered teachers
- **Parents Count**: Shows total number of registered parents  
- **Students Count**: Shows total number of registered students
- **Visual Cards**: Each statistic displayed in OriginUI Card components with icons

### User Invitation System
- **Email Invitations**: Send invites to multiple email addresses
- **Role Selection**: Choose role (teacher/parent) for invitees
- **Bulk Invites**: Add multiple email addresses at once
- **Dynamic Email Fields**: Add/remove email input fields
- **Role-based Logic**: Different invitation flows for different roles

### User Management Table
- **User Listing**: Comprehensive table of all users
- **Sorting & Filtering**: Sort by various fields, filter by status
- **User Actions**: Edit, delete, and manage individual users
- **Status Indicators**: Visual badges for user status (active, pending, etc.)

### User Modals
1. **Invite Modal**: Send new user invitations
2. **Edit Modal**: Modify existing user information
3. **Delete Modal**: Confirm user deletion with safety prompts

## Component Structure

### Props Interface
```typescript
interface UserManagementProps {
  user: User
  adminData?: any
}
```

### State Management
- `users`: Array of user objects
- `isLoading`: Loading state for data fetching
- `showInviteModal`: Controls invite modal visibility
- `showEditModal`: Controls edit modal visibility
- `showDeleteModal`: Controls delete modal visibility
- `selectedUser`: Currently selected user for operations
- `inviteEmails`: Array of email addresses for invitations
- `inviteRole`: Selected role for new invitations

### Key Functions
- `loadUsers()`: Fetches user data from Supabase
- `handleSendInvites()`: Processes user invitations
- `handleDeleteUser()`: Removes users with confirmation
- `handleEditUser()`: Updates user information
- `addEmailField()`: Adds new email input field
- `removeEmailField()`: Removes email input field

## OriginUI Integration

### Design System Components Used
- **Card/CardContent/CardHeader**: All container elements
- **Input**: Text input fields with proper labeling
- **Label**: Form labels with htmlFor associations
- **Button**: All interactive buttons with variants
- **Badge**: Status indicators and role displays
- **Avatar**: User profile pictures and initials

### Layout Structure
```tsx
<Card>
  <CardContent>
    // Statistics cards
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Users</CardTitle>
  </CardHeader>
  <CardContent>
    // User table and actions
  </CardContent>
</Card>
```

## Data Integration

### Supabase Integration
- Uses `supabase` client for database operations
- Real-time subscriptions for user updates
- Proper error handling and loading states
- Type-safe database queries

### User Schema
```typescript
interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
  school_id?: string
  created_at: string
  // ... other fields
}
```

## Internationalization
- Uses `useAdminLanguage()` hook for translations
- All text content is translatable
- Supports multiple languages through context

## Security Features
- Role-based access control
- Input validation and sanitization
- CSRF protection through Supabase
- Proper error handling for unauthorized actions

## User Experience
- **Loading States**: Shows spinners during operations
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages for actions
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Performance Optimizations
- Efficient re-renders with proper state management
- Lazy loading of user data
- Debounced search functionality
- Optimized table rendering for large user lists

## Future Enhancements
- Export user data to CSV/Excel
- Bulk user operations (delete, role change)
- Advanced filtering and search
- User activity tracking
- Email template customization
- User import functionality

## Development Notes
- All modals use OriginUI Card components instead of plain divs
- Consistent spacing and typography throughout
- Proper form validation on all inputs
- Error boundaries for graceful failure handling
- TypeScript strict mode compliance

## Testing Considerations
- Test user invitation flow
- Verify role-based permissions
- Test modal interactions
- Validate form submissions
- Check responsive behavior
- Test error scenarios