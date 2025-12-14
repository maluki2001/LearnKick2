export interface Offer {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'expired' | 'archived'
  type: 'subscription' | 'one-time' | 'bundle' | 'trial' | 'enterprise'
  
  // Pricing Configuration
  pricing: {
    basePrice: number
    currency: 'USD' | 'EUR' | 'GBP' | 'ALL'
    billingCycle?: 'monthly' | 'yearly' | 'one-time'
    discountType?: 'percentage' | 'fixed' | 'volume' | 'tiered'
    discountValue?: number
    discountTiers?: DiscountTier[]
  }
  
  // Targeting Rules
  targeting: {
    customerSegments: CustomerSegment[]
    geographicRegions: string[]
    schoolSizes: ('small' | 'medium' | 'large' | 'enterprise')[]
    existingCustomers: boolean
    newCustomersOnly: boolean
    minimumStudents?: number
    maximumStudents?: number
  }
  
  // Time Constraints
  schedule: {
    startDate: string
    endDate?: string
    timezone: string
    autoExpire: boolean
  }
  
  // Features & Limits
  features: {
    maxStudents: number | 'unlimited'
    maxTeachers: number | 'unlimited'
    analyticsLevel: 'basic' | 'advanced' | 'enterprise'
    support: 'community' | 'email' | 'priority' | 'dedicated'
    customBranding: boolean
    apiAccess: boolean
    ssoIntegration: boolean
    dataExport: boolean
    multiLanguage: boolean
  }
  
  // Sales Metadata
  salesInfo: {
    createdBy: string
    assignedSalesRep?: string
    approvalStatus: 'pending' | 'approved' | 'rejected'
    approvedBy?: string
    approvalDate?: string
    conversionGoal?: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
    tags: string[]
  }
  
  // Performance Tracking
  performance?: {
    views: number
    leads: number
    conversions: number
    revenue: number
    conversionRate: number
    lastUpdated: string
  }
  
  createdAt: string
  updatedAt: string
}

export interface DiscountTier {
  minQuantity: number
  maxQuantity?: number
  discount: number
  discountType: 'percentage' | 'fixed'
}

export interface CustomerSegment {
  id: string
  name: string
  criteria: {
    schoolType?: ('public' | 'private' | 'charter' | 'homeschool')[]
    industryVertical?: string[]
    previousSpend?: { min?: number; max?: number }
    activityLevel?: 'low' | 'medium' | 'high'
    riskScore?: 'low' | 'medium' | 'high'
  }
}

export interface OfferTemplate {
  id: string
  name: string
  description: string
  category: 'startup' | 'growth' | 'enterprise' | 'education' | 'non-profit'
  template: Partial<Offer>
  isPopular: boolean
}

export interface OfferPerformance {
  offerId: string
  period: {
    start: string
    end: string
  }
  metrics: {
    impressions: number
    clicks: number
    leads: number
    conversions: number
    revenue: number
    avgDealSize: number
    timeToClose: number // in days
    churnRate: number
    customerLifetimeValue: number
  }
  trends: {
    period: string
    value: number
    change: number
  }[]
}

export interface Quote {
  id: string
  offerId: string
  customerId: string
  customerInfo: {
    schoolName: string
    contactName: string
    email: string
    phone: string
    studentsCount: number
    teachersCount: number
  }
  
  pricing: {
    subtotal: number
    discount: number
    discountReason: string
    taxes: number
    total: number
    currency: string
  }
  
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  validUntil: string
  terms: string
  notes?: string
  
  salesInfo: {
    generatedBy: string
    salesRep: string
    followUpDate?: string
    customizations: string[]
  }
  
  createdAt: string
  updatedAt: string
}

export interface SalesMetrics {
  period: {
    start: string
    end: string
  }
  overview: {
    totalRevenue: number
    totalDeals: number
    avgDealSize: number
    conversionRate: number
    pipelineValue: number
  }
  
  byOffer: {
    offerId: string
    offerName: string
    revenue: number
    conversions: number
    conversionRate: number
  }[]
  
  byRegion: {
    region: string
    revenue: number
    deals: number
  }[]
  
  bySalesRep: {
    repId: string
    repName: string
    revenue: number
    deals: number
    quota: number
    achievement: number
  }[]
  
  forecast: {
    month: string
    predictedRevenue: number
    confidence: number
  }[]
}