'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  // Home, // unused
  Star,
  Clock,
  Tag,
  // ExternalLink, // unused
  Copy,
  Check,
  // Users, // unused
  HelpCircle,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  // Filter, // unused
  X
} from 'lucide-react'
// Removed OriginUI imports - using simple HTML and Tailwind
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'
import { DocumentationSection, DocumentationArticle, DocumentationSearchResult } from '@/types/documentation'
import { documentationContent } from '@/lib/documentationContent'

// Empty interface is fine for extensibility
interface DocumentationManagerProps {
  [key: string]: unknown;
}

interface BreadcrumbItem {
  id: string
  title: string
  type: 'home' | 'section' | 'article'
}

export function DocumentationManager({}: DocumentationManagerProps) {
  const { language, t } = useAdminLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<DocumentationSection | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<DocumentationArticle | null>(null)
  const [searchResults, setSearchResults] = useState<DocumentationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set())
  const [recentArticles, setRecentArticles] = useState<string[]>([])
  const [copiedContent, setCopiedContent] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  // Get documentation content for current language, fallback to English
  const currentLanguage = (['en', 'de', 'fr', 'sq'].includes(language) ? language : 'en') as keyof typeof documentationContent
  const sections = documentationContent[currentLanguage] || documentationContent.en

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Documentation Manager Error:', error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Search functionality - must be before early returns (React Hooks rule)
  const searchArticles = useMemo(() => {
    // Handle empty sections case
    if (!sections || sections.length === 0) {
      return
    }

    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const results: DocumentationSearchResult[] = []
    const term = searchTerm.toLowerCase()

    sections.forEach(section => {
      section.articles.forEach(article => {
        let relevanceScore = 0
        let matchedContent = ''

        // Title match (highest priority)
        if (article.title.toLowerCase().includes(term)) {
          relevanceScore += 10
          matchedContent = article.title
        }

        // Content match
        if (article.content.toLowerCase().includes(term)) {
          relevanceScore += 5

          // Extract snippet around the match
          const contentLower = article.content.toLowerCase()
          const matchIndex = contentLower.indexOf(term)
          const snippetStart = Math.max(0, matchIndex - 100)
          const snippetEnd = Math.min(article.content.length, matchIndex + 200)
          matchedContent = article.content.substring(snippetStart, snippetEnd).trim()

          if (snippetStart > 0) matchedContent = '...' + matchedContent
          if (snippetEnd < article.content.length) matchedContent += '...'
        }

        // Tag match
        if (article.tags.some(tag => tag.toLowerCase().includes(term))) {
          relevanceScore += 3
        }

        if (relevanceScore > 0) {
          results.push({
            article,
            section,
            relevanceScore,
            matchedContent: matchedContent || article.content.substring(0, 200) + '...'
          })
        }
      })
    })

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    setSearchResults(results)
  }, [searchTerm, sections])

  // Handle search debounce
  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      searchArticles()
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, searchArticles])

  // Navigation helpers - must be before early returns (React Hooks rule)
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ id: 'home', title: 'Documentation', type: 'home' }]

    if (selectedSection) {
      items.push({ id: selectedSection.id, title: selectedSection.title, type: 'section' })
    }

    if (selectedArticle) {
      items.push({ id: selectedArticle.id, title: selectedArticle.title, type: 'article' })
    }

    return items
  }, [selectedSection, selectedArticle])

  // Fallback for missing documentation content
  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Documentation Loading</h3>
          <p className="text-muted-foreground">Please wait while we load the help content...</p>
        </div>
      </div>
    )
  }

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Something went wrong</h3>
          <p className="text-muted-foreground">Please refresh the page to reload the documentation.</p>
          <button onClick={() => setHasError(false)}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Reference hooks to satisfy linter (they are used in JSX below)
  void searchArticles
  void breadcrumbs

  const handleSectionSelect = (section: DocumentationSection) => {
    setSelectedSection(section)
    setSelectedArticle(null)
    setSearchTerm('')
    setShowSearch(false)
  }

  const handleArticleSelect = (article: DocumentationArticle, section?: DocumentationSection) => {
    setSelectedArticle(article)
    if (section) setSelectedSection(section)
    
    // Add to recent articles
    const newRecent = [article.id, ...recentArticles.filter(id => id !== article.id)].slice(0, 5)
    setRecentArticles(newRecent)
    
    setSearchTerm('')
    setShowSearch(false)
  }

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null)
    } else if (selectedSection) {
      setSelectedSection(null)
    }
  }

  const handleHome = () => {
    setSelectedSection(null)
    setSelectedArticle(null)
    setSearchTerm('')
    setShowSearch(false)
  }

  const toggleBookmark = (articleId: string) => {
    const newBookmarks = new Set(bookmarkedArticles)
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId)
    } else {
      newBookmarks.add(articleId)
    }
    setBookmarkedArticles(newBookmarks)
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedContent(content)
      setTimeout(() => setCopiedContent(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }


  const formatContent = (content: string) => {
    // Simple markdown-like formatting using OriginUI classes
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
      .replace(/^\* (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .split('\n').map(line => line.trim() ? `<p class="mb-3">${line}</p>` : '').join('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{t.documentation || 'Documentation'}</h2>
          <p className="text-muted-foreground">{t.documentationDesc || 'Complete guide to using LearnKick Admin'}</p>
        </div>
        
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
            showSearch
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-accent'
          }`}
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </button>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search documentation..."
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-md hover:bg-accent"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6">
              {/* Breadcrumbs */}
              {breadcrumbs.length > 1 && (
                <div className="mb-4 pb-4 border-b border-border">
                  <div className="flex flex-wrap items-center gap-1">
                    {breadcrumbs.map((item, index) => (
                      <div key={item.id} className="flex items-center">
                        {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-1 flex-shrink-0" />}
                        <button
                          onClick={() => {
                            if (item.type === 'home') handleHome()
                            else if (item.type === 'section') {
                              setSelectedArticle(null)
                            }
                          }}
                          className={`text-xs hover:underline truncate max-w-[120px] ${
                            index === breadcrumbs.length - 1
                              ? 'font-medium text-foreground cursor-default'
                              : 'text-muted-foreground hover:text-foreground cursor-pointer'
                          }`}
                          title={item.title}
                        >
                          {item.title}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back button */}
              {(selectedSection || selectedArticle) && (
                <button
                  onClick={handleBack}
                  className="w-full mb-4 flex items-center justify-center px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              )}

              {/* Navigation */}
              <div className="space-y-2">
                {!selectedSection && (
                  <>
                    <h3 className="text-sm font-medium text-foreground mb-3">Sections</h3>
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionSelect(section)}
                        className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{section.icon}</span>
                          <div className="text-left">
                            <div className="font-medium text-foreground">
                              {section.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {section.articles.length} articles
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {selectedSection && !selectedArticle && (
                  <>
                    <h3 className="text-sm font-medium text-foreground mb-3">Articles</h3>
                    {selectedSection.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleSelect(article)}
                        className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="text-left w-full">
                          <div className="font-medium mb-1 text-foreground">
                            {article.title}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime} min read</span>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                              {article.difficulty}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Bookmarks */}
                {bookmarkedArticles.size > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-foreground mb-3 mt-6 pt-4 border-t border-border flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      Bookmarks ({bookmarkedArticles.size})
                    </h3>
                    <div className="space-y-1">
                      {Array.from(bookmarkedArticles).map((articleId) => {
                        // Find the bookmarked article
                        let bookmarkedArticle: DocumentationArticle | null = null
                        let bookmarkedSection: DocumentationSection | null = null

                        for (const section of sections) {
                          const found = section.articles.find(a => a.id === articleId)
                          if (found) {
                            bookmarkedArticle = found
                            bookmarkedSection = section
                            break
                          }
                        }

                        if (!bookmarkedArticle || !bookmarkedSection) return null

                        return (
                          <button
                            key={articleId}
                            onClick={() => handleArticleSelect(bookmarkedArticle!, bookmarkedSection!)}
                            className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            <span className="text-xs text-foreground truncate" title={bookmarkedArticle.title}>
                              {bookmarkedArticle.title}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="min-h-[600px] bg-card border border-border rounded-lg shadow-sm">
            {/* Search Results */}
            {searchTerm && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-0">
                    <h2 className="text-lg font-semibold text-foreground">
                      Search Results
                      {!isSearching && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({searchResults.length} results for &ldquo;{searchTerm}&rdquo;)
                        </span>
                      )}
                    </h2>
                  </div>
                  {isSearching && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {searchResults.length === 0 && !isSearching ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2 text-foreground">No results found</h4>
                    <p className="text-muted-foreground">Try different keywords or browse by sections</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={`${result.section.id}-${result.article.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => handleArticleSelect(result.article, result.section)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{result.article.title}</h4>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                            {result.section.title}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {result.matchedContent}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.article.readTime} min read</span>
                          </div>
                          <span className="text-xs border border-border px-2 py-0.5 rounded-md">
                            {result.article.difficulty}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{result.article.tags.join(', ')}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section Overview */}
            {!searchTerm && selectedSection && !selectedArticle && (
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{selectedSection.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedSection.title}</h3>
                    <p className="text-muted-foreground">{selectedSection.articles.length} articles in this section</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSection.articles.map((article) => (
                    <motion.div
                      key={article.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleArticleSelect(article)}
                    >
                      <h4 className="font-medium mb-2 text-foreground">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {article.content.replace(/[#*]/g, '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime} min read</span>
                        </div>
                        <span className="text-xs border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                          {article.difficulty}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Article View */}
            {!searchTerm && selectedArticle && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2 text-foreground">{selectedArticle.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedArticle.readTime} min read</span>
                      </div>
                      <span className="text-xs border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                        {selectedArticle.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleBookmark(selectedArticle.id)}
                      className="p-2 border border-border rounded-md hover:bg-accent transition-colors"
                    >
                      <Star className={`w-4 h-4 ${bookmarkedArticles.has(selectedArticle.id) ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`} />
                    </button>

                    <button
                      onClick={() => copyToClipboard(selectedArticle.content)}
                      className="p-2 border border-border rounded-md hover:bg-accent transition-colors"
                    >
                      {copiedContent === selectedArticle.content ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: formatContent(selectedArticle.content) }}
                    className="leading-relaxed"
                  />
                </div>

                {/* Article Footer */}
                <div className="mt-8 pt-6 border-t">
                  {selectedArticle.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-2">
                        {selectedArticle.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedArticle.relatedArticles && selectedArticle.relatedArticles.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center text-foreground">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Related Articles
                      </h4>
                      <div className="space-y-2">
                        {selectedArticle.relatedArticles.map((relatedId) => {
                          // Find the related article
                          let relatedArticle: DocumentationArticle | null = null
                          let relatedSection: DocumentationSection | null = null
                          
                          for (const section of sections) {
                            const found = section.articles.find(a => a.id === relatedId)
                            if (found) {
                              relatedArticle = found
                              relatedSection = section
                              break
                            }
                          }
                          
                          if (!relatedArticle || !relatedSection) return null
                          
                          return (
                            <button
                              key={relatedId}
                              onClick={() => handleArticleSelect(relatedArticle!, relatedSection!)}
                              className="flex items-center p-2 text-primary hover:text-primary/80 hover:bg-accent rounded-md transition-colors"
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              <span className="text-sm">{relatedArticle.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Home View */}
            {!searchTerm && !selectedSection && !selectedArticle && (
              <div className="p-6">
                <div className="text-center mb-8">
                  <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-foreground">LearnKick Documentation</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to know about managing your school&apos;s LearnKick platform.
                    Browse by category or use the search to find specific topics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {sections.map((section) => (
                    <motion.div
                      key={section.id}
                      whileHover={{ scale: 1.05 }}
                      className="p-6 border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleSectionSelect(section)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{section.icon}</div>
                        <h4 className="text-lg font-semibold mb-2 text-foreground">{section.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {section.articles.length} articles
                        </p>
                        <div className="flex items-center justify-center text-primary">
                          <span className="text-sm">Browse</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="bg-muted/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 text-foreground">Popular Articles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sections.slice(0, 2).map(section =>
                      section.articles.slice(0, 2).map(article => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleSelect(article, section)}
                          className="text-left p-3 bg-card border border-border rounded-md hover:shadow-md hover:border-primary/50 transition-all"
                        >
                          <div>
                            <h5 className="font-medium mb-1 text-foreground">{article.title}</h5>
                            <p className="text-xs text-muted-foreground">{section.title} • {article.readTime} min read</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}