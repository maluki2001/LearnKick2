# OffersManager Component - CLAUDE.md

## Overview
The OffersManager component is a comprehensive promotional offers management system for schools. It provides a tabbed interface for managing offers, templates, analytics, quotes, and customer segments.

## File Location
`src/components/admin/OffersManager.tsx`

## Key Features

### Tab-based Navigation
- **Overview**: Key metrics and performance dashboard
- **Offers**: Create and manage individual offers
- **Templates**: Pre-built offer templates for quick creation
- **Analytics**: Detailed performance metrics and insights
- **Quotes**: Customer quote generation and management
- **Segments**: Customer segmentation for targeted offers

### Offer Management
- **Create/Edit Offers**: Full CRUD operations with comprehensive forms
- **Offer Types**: Support for subscription and one-time offers
- **Pricing Configuration**: Base price, discount types (percentage/fixed)
- **Scheduling**: Start/end dates with automatic expiration
- **Status Management**: Draft, active, and expired offer states

### Analytics & Metrics
- **Revenue Tracking**: Total and per-offer revenue analytics
- **Conversion Metrics**: Conversion rates and lead tracking
- **Performance Cards**: Visual metric displays with trend indicators
- **Real-time Updates**: Live performance data integration

## Component Architecture

### Main Component Structure
```typescript
interface OffersManagerProps {
  // Props for admin user info if needed
}

type ActiveTab = 'overview' | 'offers' | 'templates' | 'analytics' | 'quotes' | 'segments'
```

### State Management
```typescript
const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
const [offers, setOffers] = useState<Offer[]>([])
const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
const [showCreateModal, setShowCreateModal] = useState(false)
const [isLoading, setIsLoading] = useState(false)
```

## OriginUI Integration

### Design System Components
- **Card/CardContent/CardHeader**: All major containers and sections
- **Input**: Form inputs with proper validation
- **Label**: Form labeling with accessibility
- **SelectNative**: Dropdown selections
- **Button**: All interactive elements with variants

### Tab Navigation Structure
```tsx
<Card className="overflow-hidden">
  <nav className="border-b">
    <ul className="flex space-x-8 px-6">
      {tabs.map((tab) => (
        <li key={tab.id}>
          <button className={`flex items-center space-x-2 py-4 px-1 border-b-2 ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
</Card>
```

## Tab Components

### Overview Tab
- **Metrics Grid**: 4-column responsive grid of key performance indicators
- **Recent Activity**: Timeline of recent offer interactions
- **Top Performers**: Ranked list of highest-performing offers
- **Revenue Tracking**: Total revenue with trend indicators

```tsx
function OverviewTab({ offers }: { offers: Offer[] }) {
  const totalRevenue = offers.reduce((sum, offer) => sum + (offer.performance?.revenue || 0), 0)
  const activeOffers = offers.filter(o => o.status === 'active').length
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <MetricCard title="Active Offers" value={activeOffers.toString()} />
        {/* More metrics */}
      </div>
    </div>
  )
}
```

### Offers Tab
- **Search & Filter**: Real-time search and status filtering
- **Offers Grid**: Card-based display of all offers
- **Quick Actions**: Edit, view, and manage individual offers
- **Empty States**: Helpful messaging when no offers exist

### Templates Tab
- **Template Gallery**: Visual display of available templates
- **Template Categories**: Organized by offer type and purpose
- **Quick Creation**: One-click offer creation from templates
- **Custom Templates**: Create and save custom templates

### Analytics Tab
- **Performance Metrics**: Detailed analytics dashboard
- **Chart Placeholders**: Ready for charting library integration
- **Trend Analysis**: Performance over time tracking
- **Export Functionality**: Data export capabilities

## Metric Card Component

### Visual Design
```tsx
function MetricCard({ title, value, change, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <p className="text-sm text-green-600 mt-2">{change}</p>
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Offer Creation Modal

### Modal Structure
- **Full-screen Modal**: Comprehensive form in modal overlay
- **Form Sections**: Organized sections for different offer aspects
- **Real-time Validation**: Immediate feedback on form inputs
- **Preview Mode**: Live preview of offer configuration

### Form Fields
```typescript
interface OfferFormData {
  name: string
  description: string
  type: 'subscription' | 'one-time'
  status: 'draft' | 'active' | 'expired'
  basePrice: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
  startDate: string
  endDate: string
}
```

### Modal Implementation
```tsx
function CreateOfferModal({ isOpen, onClose, offer, onSave }) {
  const [formData, setFormData] = useState({
    name: offer?.name || '',
    description: offer?.description || '',
    type: offer?.type || 'subscription',
    // ... other fields
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Form fields */}
        </form>
      </div>
    </div>
  )
}
```

## Data Models

### Offer Interface
```typescript
interface Offer {
  id: string
  name: string
  description: string
  type: 'subscription' | 'one-time'
  status: 'draft' | 'active' | 'expired'
  pricing: {
    basePrice: number
    currency: string
    billingCycle: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
  }
  schedule: {
    startDate: string
    endDate: string
    timezone: string
    autoExpire: boolean
  }
  performance?: {
    views: number
    conversions: number
    revenue: number
    conversionRate: number
    leads: number
  }
}
```

## Animation & UX

### Framer Motion Integration
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    {/* Tab content */}
  </motion.div>
</AnimatePresence>
```

### Loading States
- **Tab Transitions**: Smooth animations between tabs
- **Data Loading**: Skeleton states for data fetching
- **Button States**: Loading spinners on form submissions

## Export Functionality

### CSV Export
```typescript
const handleExport = () => {
  const csvContent = "data:text/csv;charset=utf-8,Offer Name,Status,Type,Revenue\n"
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `offers-export-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

## Future Database Integration

### Service Layer Ready
```typescript
const loadOffers = async () => {
  setIsLoading(true)
  try {
    // TODO: Replace with actual API call
    // const offersData = await offersService.getOffers()
    // setOffers(offersData)
    setOffers([]) // Using empty array until database integration
  } catch (error) {
    console.error('Error loading offers:', error)
    setOffers([])
  } finally {
    setIsLoading(false)
  }
}
```

## Performance Optimizations
- **Tab-based Lazy Loading**: Only render active tab content
- **Memoized Components**: Prevent unnecessary re-renders
- **Virtual Scrolling**: For large offer lists
- **Debounced Search**: Optimize search performance

## Security Considerations
- **Input Validation**: All form inputs properly validated
- **XSS Protection**: Content properly escaped
- **CSRF Protection**: Form tokens and validation
- **Role-based Access**: Admin-only functionality

## Future Enhancements
- **Advanced Analytics**: Charts and graphs integration
- **A/B Testing**: Offer performance testing
- **Email Integration**: Automated offer communications
- **Customer Segmentation**: Advanced targeting
- **Offer Templates**: Expandable template library
- **Revenue Forecasting**: Predictive analytics
- **Integration APIs**: Third-party service connections

## Development Guidelines
1. All components should use OriginUI design system
2. Maintain consistent tab navigation patterns
3. Provide proper loading and empty states
4. Implement comprehensive form validation
5. Follow accessibility best practices
6. Test responsive behavior across devices
7. Plan for future database integration
8. Maintain clean component separation