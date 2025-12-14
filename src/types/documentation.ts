export type DocumentationLanguage = 'en' | 'de' | 'fr' | 'sq'

export interface DocumentationSection {
  id: string
  title: string
  icon: string
  articles: DocumentationArticle[]
}

export interface DocumentationArticle {
  id: string
  title: string
  content: string
  lastUpdated: string
  readTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  relatedArticles?: string[]
  videoUrl?: string
  screenshots?: DocumentationScreenshot[]
}

export interface DocumentationScreenshot {
  id: string
  url: string
  caption: string
  alt: string
}

export interface DocumentationSearchResult {
  article: DocumentationArticle
  section: DocumentationSection
  relevanceScore: number
  matchedContent: string
}

export interface DocumentationContent {
  [key: string]: {
    [language in DocumentationLanguage]: DocumentationSection[]
  }
}