# SubjectManager Component - CLAUDE.md

## Overview
The SubjectManager component provides a comprehensive interface for creating, editing, and managing educational subjects in the LearnKick system. It features a visual card-based layout with animated interactions.

## File Location
`src/components/admin/SubjectManager.tsx`

## Key Features

### Subject Display Grid
- **Visual Cards**: Each subject displayed as an animated card with custom icon and color
- **Hover Effects**: Cards lift with shadow on hover for better UX
- **Status Indicators**: System vs. custom subject badges
- **Action Buttons**: Edit and delete buttons for each subject
- **Responsive Grid**: Adjusts from 1 to 4 columns based on screen size

### Subject Creation & Editing
- **Modal Interface**: Full-screen modal with comprehensive form
- **Real-time Preview**: Live preview of subject appearance
- **Icon Selection**: Visual icon picker with common educational icons
- **Color Picker**: Custom color selection with preset options
- **Slug Generation**: Automatic URL-friendly slug generation
- **Validation**: Form validation with error messaging

### Subject Management
- **CRUD Operations**: Create, read, update, delete functionality
- **System Protection**: Prevent deletion of system-wide subjects
- **School-specific**: Allow custom subjects per school
- **Bulk Operations**: Future support for bulk actions

## Component Architecture

### Props Interface
```typescript
interface SubjectManagerProps {
  schoolId?: string
}
```

### State Management
```typescript
const [subjects, setSubjects] = useState<SubjectData[]>([])
const [isLoading, setIsLoading] = useState(false)
const [showAddModal, setShowAddModal] = useState(false)
const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null)
```

### Data Types
```typescript
interface SubjectData {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description?: string
  school_id?: string
}

interface CreateSubjectData {
  name: string
  slug: string
  icon: string
  color: string
  description?: string
  school_id?: string
}
```

## OriginUI Integration

### Design System Components
- **Card/CardContent/CardHeader**: All containers and modals
- **Input**: Text inputs with proper validation styling
- **Label**: Form labels with htmlFor associations
- **Button**: All interactive buttons with loading states
- **motion.div**: Framer Motion animations for card entrance

### Subject Card Layout
```tsx
<Card className="hover:shadow-lg transition-all">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
      >
        {subject.icon}
      </div>
      <div className="flex space-x-1">
        {/* Action buttons */}
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
    <p className="text-sm text-muted-foreground mb-3">{subject.description}</p>
  </CardContent>
</Card>
```

## Subject Modal Component

### Modal Features
- **Responsive Design**: Adapts to different screen sizes
- **Form Sections**: Organized sections for different input types
- **Live Preview**: Real-time preview of subject appearance
- **Error Handling**: Field-specific error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Form Structure
```tsx
<Card className="flex-1 flex flex-col">
  <CardHeader>
    <CardTitle>Add/Edit Subject</CardTitle>
  </CardHeader>
  <CardContent className="flex-1 overflow-y-auto space-y-6">
    {/* Name Input */}
    <div className="space-y-2">
      <Label htmlFor="subject-name">Subject Name *</Label>
      <Input id="subject-name" type="text" />
    </div>
    
    {/* Icon Selection */}
    <div className="space-y-2">
      <Label>Subject Icon</Label>
      <div className="flex flex-wrap gap-2">
        {/* Icon buttons */}
      </div>
    </div>
    
    {/* Color Selection */}
    <div className="space-y-2">
      <Label>Subject Color</Label>
      <div className="flex items-center space-x-3">
        <input type="color" />
        <Input type="text" className="font-mono" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Icon & Color Options
```typescript
const commonIcons = ['📚', '🔢', '🌍', '📖', '🔬', '📜', '🎨', '🎵', '⚽', '💻', '🏛️', '🎭', '🧪', '🌱', '⭐']
const commonColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#ef4444', '#84cc16', '#6366f1']
```

## Data Integration

### Supabase Integration
```typescript
// Service layer integration
const loadSubjects = async () => {
  const data = await subjectsService.getSubjects(schoolId)
  setSubjects(data)
}

const handleCreateSubject = async (subjectData: CreateSubjectData) => {
  await subjectsService.createSubject({
    ...subjectData,
    school_id: schoolId
  })
  await loadSubjects()
}
```

### Database Schema
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Animation & UX

### Framer Motion Integration
```tsx
<motion.div
  key={subject.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  <Card>
    {/* Subject content */}
  </Card>
</motion.div>

<AnimatePresence>
  {showAddModal && (
    <SubjectModal
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  )}
</AnimatePresence>
```

### Loading States
- **Grid Loading**: Spinner with loading message
- **Button States**: Disabled buttons during operations
- **Smooth Transitions**: Fade in/out for state changes

## Validation & Error Handling

### Form Validation
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!formData.name.trim()) {
    newErrors.name = t.subjectNameRequired
  }

  if (!formData.slug.trim()) {
    newErrors.slug = t.slugRequired
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    newErrors.slug = t.slugFormat
  }

  if (!formData.color.match(/^#[0-9A-F]{6}$/i)) {
    newErrors.color = t.colorFormat
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### Error Display
- **Field-level Errors**: Red text below invalid inputs
- **Color-coded Borders**: Red borders for invalid fields
- **User-friendly Messages**: Clear, actionable error messages

## Slug Generation
```typescript
const generateSlug = (name: string) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const handleNameChange = (name: string) => {
  setFormData({
    ...formData,
    name,
    slug: generateSlug(name)
  })
}
```

## Internationalization
- Uses `useAdminLanguage()` hook for all text
- Translatable form labels and error messages
- RTL language support through CSS logical properties

## Performance Optimizations
- **Memoized Components**: Prevent unnecessary re-renders
- **Lazy Modal Loading**: Modal components loaded on demand
- **Debounced Search**: Future search functionality optimization
- **Virtual Scrolling**: For large subject lists

## Security Features
- **School Isolation**: Subjects scoped to specific schools
- **Role-based Access**: Only admins can manage subjects
- **Input Sanitization**: All inputs properly validated
- **SQL Injection Protection**: Parameterized queries

## Future Enhancements
- **Subject Categories**: Group subjects into categories
- **Subject Templates**: Pre-defined subject templates
- **Import/Export**: Bulk subject management
- **Subject Analytics**: Usage statistics and insights
- **Subject Dependencies**: Prerequisites and relationships
- **Rich Descriptions**: Markdown support for descriptions
- **Subject Images**: Support for custom subject images

## Development Guidelines
1. Maintain consistent icon and color schemes
2. Ensure all modals use OriginUI Card components
3. Provide proper loading and error states
4. Follow accessibility guidelines
5. Test on multiple screen sizes
6. Use TypeScript for type safety
7. Implement proper form validation
8. Follow the established animation patterns