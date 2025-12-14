# SchoolSettings Component - CLAUDE.md

## Overview
The SchoolSettings component provides a comprehensive interface for administrators to configure school-wide settings, manage access controls, and handle subscription plans.

## File Location
`src/components/admin/SchoolSettings.tsx`

## Key Features

### School Information Management
- **School Name Configuration**: Editable school name field
- **School Code Display**: Read-only unique school identifier
- **Code Generation**: Generate new random school codes
- **Copy Functionality**: One-click copy school code to clipboard
- **Subscription Plan Display**: Current plan information and status

### Access Control Settings
- **Parent Registration Toggle**: Enable/disable parent self-registration
- **Admin Approval Toggle**: Require admin approval for new users
- **Switch Components**: Modern toggle switches using OriginUI Switch
- **Real-time Updates**: Settings saved immediately to database

### Game Configuration
- **Time Limits**: Configure default game time limits (5-60 minutes)
- **Class Size Limits**: Set maximum students per class (10-50)
- **Validation**: Numeric input validation with min/max constraints
- **Instant Preview**: Changes reflected immediately in UI

### Quick Actions Sidebar
- **Generate New Code**: Create new school access codes
- **Invite Teachers**: Quick link to user management
- **Email Parents**: Bulk email functionality for parent communication
- **Loading States**: Proper feedback during operations

## Component Architecture

### Props Interface
```typescript
interface SchoolSettingsProps {
  user: User
}
```

### State Management
```typescript
const [settings, setSettings] = useState({
  schoolName: string
  allowParentSignup: boolean
  requireApproval: boolean
  gameTimeLimit: number
  maxStudentsPerClass: number
  enableNotifications: boolean
})
```

### Key Functions
- `handleSave()`: Saves settings to Supabase database
- `handleGenerateCode()`: Creates new 6-character school code
- `handleCopyCode()`: Copies school code to clipboard
- `handleInviteTeachers()`: Opens teacher invitation modal
- `handleEmailParents()`: Opens parent email modal

## OriginUI Integration

### Design System Components
- **Card/CardHeader/CardContent**: All section containers
- **Input**: Text and number inputs with validation
- **Label**: Proper form labeling with htmlFor
- **Switch**: Modern toggle switches for boolean settings
- **Button**: All interactive elements with variants
- **SelectNative**: Dropdown selections where needed

### Layout Structure
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main Settings */}
  <div className="lg:col-span-2 space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>School Information</CardTitle>
      </CardHeader>
      <CardContent>
        // Settings form
      </CardContent>
    </Card>
  </div>
  
  {/* Sidebar */}
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        // Action buttons
      </CardContent>
    </Card>
  </div>
</div>
```

## Modal Components

### Invite Teachers Modal
- **Purpose**: Direct users to the User Management tab
- **Design**: Simple informational modal with navigation
- **Actions**: Navigate to user management or cancel

### Email Parents Modal
- **Purpose**: Compose and send bulk emails to parents
- **Features**: Subject line, message body, recipient preview
- **Integration**: Uses OriginUI Input and Label components
- **Validation**: Required fields and email format validation

### Upgrade Plan Modal
- **Purpose**: Display subscription plan options
- **Plans**: Basic ($29/month) and Premium ($79/month)
- **Features**: Plan comparison, pricing display, call-to-action
- **Design**: Two-column card layout with pricing cards

## Data Integration

### Supabase Integration
```typescript
// Update school settings
const { error } = await supabase
  .from('schools')
  .update({
    name: settings.schoolName,
    settings: {
      allow_parent_signup: settings.allowParentSignup,
      require_approval: settings.requireApproval,
      // ... other settings
    },
    updated_at: new Date().toISOString()
  })
  .eq('id', user.school_id)
```

### Settings Schema
```typescript
interface SchoolSettings {
  allow_parent_signup: boolean
  require_approval: boolean
  game_time_limits: number
  max_students_per_class: number
  enable_notifications: boolean
}
```

## User Experience Features

### Feedback System
- **Success Messages**: Green notifications for successful operations
- **Error Messages**: Red notifications with error details
- **Auto-dismiss**: Messages automatically disappear after 3-5 seconds
- **Loading States**: Spinners and disabled states during operations

### Copy Code Feature
```typescript
const handleCopyCode = async () => {
  try {
    await navigator.clipboard.writeText(schoolCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  } catch (error) {
    // Fallback for older browsers
    // ... manual selection and copy
  }
}
```

### Validation & Constraints
- **School Name**: Required, minimum length validation
- **Time Limits**: 5-60 minute range with numeric validation
- **Class Size**: 10-50 student range with numeric validation
- **Real-time Validation**: Immediate feedback on invalid inputs

## Internationalization
- Uses `useAdminLanguage()` hook for all text content
- Translatable labels, messages, and placeholders
- Supports RTL languages through CSS logical properties

## Security & Privacy
- **Role Verification**: Only admin users can modify settings
- **Input Sanitization**: All inputs properly validated and escaped
- **Database Security**: Uses Supabase RLS policies
- **Audit Trail**: All changes logged with timestamps

## Performance Optimizations
- **Debounced Saving**: Prevent excessive database writes
- **Optimistic UI**: Immediate UI updates before server confirmation
- **Lazy Loading**: Modal components loaded only when needed
- **Memoized Components**: Prevent unnecessary re-renders

## Mobile Responsiveness
- **Grid Layout**: Responsive grid that stacks on mobile
- **Touch Targets**: Proper sizing for mobile interactions
- **Viewport Optimization**: Proper meta tags and scaling
- **Gesture Support**: Touch-friendly switches and buttons

## Future Enhancements
- **Advanced Email Templates**: Rich text editor for parent emails
- **Bulk Settings Import/Export**: JSON configuration files
- **Setting Categories**: Group related settings together
- **Preview Mode**: Test settings before applying
- **Advanced Analytics**: Settings usage tracking
- **Integration APIs**: Connect with external school systems

## Development Guidelines
1. All form inputs should use OriginUI components
2. Maintain consistent spacing with Tailwind classes
3. Provide proper loading and error states
4. Use TypeScript for all props and state
5. Follow accessibility guidelines (ARIA labels)
6. Test on multiple screen sizes and devices