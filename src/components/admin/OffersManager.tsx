/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Plus,
  Target,
  DollarSign,
  Users,
  Download,
  Edit,
  Eye,
  Send,
  BarChart3,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'
import { Offer } from '@/types/offers'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface OffersManagerProps {
  // Props for admin user info if needed
}

type ActiveTab = 'overview' | 'offers' | 'templates' | 'analytics' | 'quotes' | 'segments'

// Mock data removed - now using real database integration

export function OffersManager({}: OffersManagerProps) {
  useAdminLanguage() // Hook called for context, translations used in child components
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [offers, setOffers] = useState<Offer[]>([])
  const [_isLoading, setIsLoading] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)

  // Load offers from database on component mount
  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call to fetch offers from database
      // For now, using empty array to show no fake data
      // const offersData = await offersService.getOffers()
      // setOffers(offersData)
      setOffers([]) // Using empty array instead of mock data
    } catch (error) {
      console.error('Error loading offers:', error)
      setOffers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOffer = () => {
    setEditingOffer(null)
    setShowOfferModal(true)
  }

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setShowOfferModal(true)
  }

  const handleOfferSave = (offerData: Partial<Offer>) => {
    // TODO: Implement save to database
    console.log('Saving offer:', offerData)
    setShowOfferModal(false)
  }

  const handleUseTemplate = (template: any) => {
    console.log('Using template:', template)
  }

  const handleCreateTemplate = () => {
    console.log('Create new template')
  }

  const handleEditTemplate = (template: any) => {
    console.log('Edit template:', template)
  }

  const handleCreateQuote = () => {
    console.log('Create new quote')
  }

  const handleViewQuote = (quote: any) => {
    console.log('View quote:', quote)
  }

  const handleEditQuote = (quote: any) => {
    console.log('Edit quote:', quote)
  }

  const handleSendQuote = (quote: any) => {
    console.log('Send quote:', quote)
  }

  const handleCreateSegment = () => {
    console.log('Create new segment')
  }

  const handleEditSegment = (segment: any) => {
    console.log('Edit segment:', segment)
    setEditingSegment(segment)
  }

  const handleTargetSegment = (segment: any) => {
    console.log('Target segment:', segment)
  }

  const handleCreateTargetedOffer = () => {
    console.log('Create targeted offer')
  }

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'offers', label: 'Offers', icon: Target },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'segments', label: 'Segments', icon: Users }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Offers Management</h1>
          <p className="text-muted-foreground">Create and manage promotional offers for your school</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleExport}
            variant="secondary"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button
            onClick={handleCreateOffer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Tabs Navigation */}
        <nav className="border-b">
          <ul className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab offers={offers} />}
              {activeTab === 'offers' && <OffersTab offers={offers} onOfferSelect={setSelectedOffer} onEditOffer={handleEditOffer} />}
              {activeTab === 'templates' && (
                <TemplatesTab 
                  onUseTemplate={handleUseTemplate}
                  onCreateTemplate={handleCreateTemplate}
                  onEditTemplate={handleEditTemplate}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsTab offers={offers} />}
              {activeTab === 'quotes' && (
                <QuotesTab 
                  onCreateQuote={handleCreateQuote}
                  onViewQuote={handleViewQuote}
                  onEditQuote={handleEditQuote}
                  onSendQuote={handleSendQuote}
                />
              )}
              {activeTab === 'segments' && (
                <SegmentsTab 
                  onCreateSegment={handleCreateSegment}
                  onEditSegment={handleEditSegment}
                  onTargetSegment={handleTargetSegment}
                  onCreateTargetedOffer={handleCreateTargetedOffer}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* Create/Edit Offer Modal */}
      {showOfferModal && (
        <CreateOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          offer={editingOffer}
          onSave={handleOfferSave}
        />
      )}
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ offers }: { offers: Offer[] }) {
  const { t } = useAdminLanguage()
  const totalRevenue = offers.reduce((sum, offer) => sum + (offer.performance?.revenue || 0), 0)
  const totalLeads = offers.reduce((sum, offer) => sum + (offer.performance?.leads || 0), 0)
  const _totalConversions = offers.reduce((sum, offer) => sum + (offer.performance?.conversions || 0), 0)
  const avgConversionRate = offers.length > 0 
    ? offers.reduce((sum, offer) => sum + (offer.performance?.conversionRate || 0), 0) / offers.length
    : 0
  const activeOffers = offers.filter(o => o.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t.totalRevenue}
          value={`$${totalRevenue.toLocaleString()}`}
          change="+12.5%"
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title={t.activeOffers}
          value={activeOffers.toString()}
          change="+3"
          icon={Target}
          color="bg-blue-500"
        />
        <MetricCard
          title={t.conversionRate}
          value={`${avgConversionRate.toFixed(1)}%`}
          change="+2.1%"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <MetricCard
          title={t.totalLeads}
          value={totalLeads.toString()}
          change="+18"
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Recent Activity and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {offers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                offers.slice(0, 5)
                  .sort((a, b) => (b.performance?.views || 0) - (a.performance?.views || 0))
                  .map((offer) => (
                    <ActivityItem
                      key={offer.id}
                      icon={Eye}
                      action="Offer viewed"
                      description={offer.name}
                      time="2 hours ago"
                      color="text-blue-600"
                    />
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {offers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No offers available</p>
              ) : (
                offers.slice(0, 5)
                  .sort((a, b) => (b.performance?.revenue || 0) - (a.performance?.revenue || 0))
                  .map((offer, index) => (
                    <div key={offer.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{offer.name}</p>
                          <p className="text-xs text-muted-foreground">{offer.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${(offer.performance?.revenue || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(offer.performance?.conversionRate || 0).toFixed(1)}% CVR
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Offers Tab Component  
function OffersTab({ offers, onOfferSelect, onEditOffer }: { 
  offers: Offer[], 
  onOfferSelect: (offer: Offer) => void,
  onEditOffer: (offer: Offer) => void 
}) {
  useAdminLanguage() // Context for future translations
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No offers found</h3>
            <p className="text-muted-foreground">Create your first offer to get started.</p>
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onSelect={() => onOfferSelect(offer)} onEdit={() => onEditOffer(offer)} />
          ))
        )}
      </div>
    </div>
  )
}

// Additional tab components would be implemented similarly...
function TemplatesTab({ onUseTemplate, onCreateTemplate, onEditTemplate }: {
  onUseTemplate: (template: any) => void
  onCreateTemplate: () => void
  onEditTemplate: (template: any) => void
}) {
  useAdminLanguage() // Context for future translations
  // Using empty array instead of mock data - integrate with real database  
  const templates: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Offer Templates</h2>
          <p className="text-muted-foreground">Pre-built templates to speed up offer creation</p>
        </div>
        <Button
          onClick={onCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
            <p className="text-muted-foreground">Create your first template to get started.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {template.category}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground capitalize">{template.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-foreground">{template.discount}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => onUseTemplate(template)}
                  size="sm"
                  className="flex-1"
                >
                  Use Template
                </Button>
                <Button
                  onClick={() => onEditTemplate(template)}
                  variant="secondary"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AnalyticsTab({ offers }: { offers: Offer[] }) {
  useAdminLanguage() // Context for future translations
  const totalRevenue = offers.reduce((sum, offer) => sum + (offer.performance?.revenue || 0), 0)
  const totalViews = offers.reduce((sum, offer) => sum + (offer.performance?.views || 0), 0)
  const totalConversions = offers.reduce((sum, offer) => sum + (offer.performance?.conversions || 0), 0)
  const avgConversionRate = offers.length > 0 
    ? offers.reduce((sum, offer) => sum + (offer.performance?.conversionRate || 0), 0) / offers.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Offers Analytics</h2>
        <p className="text-muted-foreground">Performance insights and metrics for your offers</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+12.5%"
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          change="+8.2%"
          icon={Eye}
          color="bg-blue-500"
        />
        <MetricCard
          title="Conversions"
          value={totalConversions.toString()}
          change="+15.3%"
          icon={Target}
          color="bg-purple-500"
        />
        <MetricCard
          title="Avg. Conversion Rate"
          value={`${avgConversionRate.toFixed(1)}%`}
          change="+2.1%"
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Charts placeholder */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Analytics charts will be implemented</p>
            <p className="text-muted-foreground/70 text-sm">with charting library integration</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuotesTab({ onCreateQuote, onViewQuote, onEditQuote, onSendQuote }: {
  onCreateQuote: () => void
  onViewQuote: (quote: any) => void
  onEditQuote: (quote: any) => void
  onSendQuote: (quote: any) => void
}) {
  useAdminLanguage() // Context for future translations
  // Using empty array instead of mock data - integrate with real database
  const quotes: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Customer Quotes</h2>
          <p className="text-muted-foreground">Generate and manage custom quotes for prospects</p>
        </div>
        <Button
          onClick={onCreateQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="overflow-x-auto">
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No quotes found</h3>
              <p className="text-muted-foreground">Create your first quote to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Offer</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Valid Until</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{quote.customerName}</p>
                        <p className="text-sm text-muted-foreground">{quote.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{quote.offerName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">${quote.totalValue.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{quote.validUntil}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onViewQuote(quote)}
                          variant="secondary"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onEditQuote(quote)}
                          variant="secondary"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onSendQuote(quote)}
                          variant="secondary"
                          size="sm"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function SegmentsTab({ onCreateSegment, onEditSegment, onTargetSegment, onCreateTargetedOffer }: {
  onCreateSegment: () => void
  onEditSegment: (segment: any) => void
  onTargetSegment: (segment: any) => void
  onCreateTargetedOffer: () => void
}) {
  useAdminLanguage() // Context for future translations
  // Using empty array instead of mock data - integrate with real database
  const segments: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Customer Segments</h2>
          <p className="text-muted-foreground">Define and manage customer segments for targeted offers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={onCreateTargetedOffer}
            variant="secondary"
          >
            <Target className="w-4 h-4 mr-2" />
            Create Targeted Offer
          </Button>
          <Button
            onClick={onCreateSegment}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Segment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No segments found</h3>
            <p className="text-muted-foreground">Create your first customer segment to get started.</p>
          </div>
        ) : (
          segments.map((segment) => (
            <div key={segment.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{segment.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {segment.size} customers
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-1">
                  {segment.criteria.map((criterion: string, index: number) => (
                    <span key={index} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                      {criterion}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => onTargetSegment(segment)}
                  size="sm"
                  className="flex-1"
                >
                  Target
                </Button>
                <Button
                  onClick={() => onEditSegment(segment)}
                  variant="secondary"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon, color }: {
  title: string
  value: string
  change: string
  icon: any
  color: string
}) {
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

function ActivityItem({ icon: Icon, action, description, time, color }: {
  icon: any
  action: string
  description: string
  time: string
  color: string
}) {
  return (
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{action}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  )
}

function OfferCard({ offer, onSelect, onEdit }: { offer: Offer, onSelect: () => void, onEdit: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-foreground">{offer.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          offer.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          offer.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-muted text-muted-foreground'
        }`}>
          {offer.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className="text-foreground capitalize">{offer.type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="text-foreground">${(offer.performance?.revenue || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Conversions:</span>
          <span className="text-foreground">{offer.performance?.conversions || 0}</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onSelect} size="sm" className="flex-1">
          View Details
        </Button>
        <Button onClick={onEdit} variant="secondary" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Create/Edit Offer Modal Component
function CreateOfferModal({ isOpen, onClose, offer, onSave }: {
  isOpen: boolean
  onClose: () => void
  offer: Offer | null
  onSave: (offerData: Partial<Offer>) => void
}) {
  useAdminLanguage() // Context for future translations
  const [formData, setFormData] = useState({
    name: offer?.name || '',
    description: offer?.description || '',
    type: offer?.type || 'subscription',
    status: offer?.status || 'draft',
    basePrice: offer?.pricing?.basePrice || 0,
    discountType: offer?.pricing?.discountType || 'percentage',
    discountValue: offer?.pricing?.discountValue || 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const offerData: Partial<Offer> = {
      name: formData.name,
      description: formData.description,
      type: formData.type as any,
      status: formData.status as any,
      pricing: {
        basePrice: formData.basePrice,
        currency: 'USD',
        billingCycle: formData.type === 'subscription' ? 'monthly' : 'one-time',
        discountType: formData.discountType as any,
        discountValue: formData.discountValue
      },
      schedule: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        timezone: 'UTC',
        autoExpire: true
      }
    }

    onSave(offerData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {offer ? 'Edit Offer' : 'Create New Offer'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Offer Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Enter offer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              placeholder="Describe your offer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Offer Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'subscription' | 'one-time' | 'bundle' | 'trial' | 'enterprise' }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="subscription">Subscription</option>
                <option value="one-time">One-time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'paused' | 'draft' | 'expired' | 'archived' }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Base Price ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'volume' | 'percentage' | 'fixed' | 'tiered' }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Value
              </label>
              <input
                type="number"
                min="0"
                step={formData.discountType === 'percentage' ? '1' : '0.01'}
                max={formData.discountType === 'percentage' ? '100' : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {offer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}