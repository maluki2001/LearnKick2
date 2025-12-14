export interface AccessibilitySettings {
  // Visual accessibility
  theme: 'light' | 'dark' | 'high-contrast'
  dyslexiaFriendlyFont: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  
  // Reading support
  reducedAnimations: boolean
  increasedLineSpacing: boolean
  highlightFocus: boolean
  
  // Audio accessibility
  soundEnabled: boolean
  screenReaderSupport: boolean
  audioDescriptions: boolean
  
  // Motor accessibility
  largerClickTargets: boolean
  stickyButtons: boolean // Buttons stay pressed until clicked again
  
  // Cognitive accessibility
  simplifiedUI: boolean
  showProgressIndicators: boolean
  extendedTimeouts: boolean
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  theme: 'light',
  dyslexiaFriendlyFont: false,
  fontSize: 'medium',
  reducedAnimations: false,
  increasedLineSpacing: false,
  highlightFocus: true,
  soundEnabled: true,
  screenReaderSupport: false,
  audioDescriptions: false,
  largerClickTargets: false,
  stickyButtons: false,
  simplifiedUI: false,
  showProgressIndicators: true,
  extendedTimeouts: false
}

export const DYSLEXIA_FRIENDLY_FONTS = [
  {
    name: 'OpenDyslexic',
    family: '"OpenDyslexic", sans-serif',
    description: 'Designed specifically for dyslexic readers'
  },
  {
    name: 'Comic Sans MS',
    family: '"Comic Sans MS", cursive',
    description: 'Friendly, rounded letters that are easier to read'
  },
  {
    name: 'Lexend',
    family: '"Lexend", sans-serif',
    description: 'Font family designed to improve reading proficiency'
  }
]

export const THEME_CONFIGS = {
  light: {
    background: 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
    cardBackground: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    accent: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500'
  },
  dark: {
    background: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
    cardBackground: 'bg-gray-800',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-600',
    accent: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  },
  'high-contrast': {
    background: 'bg-black',
    cardBackground: 'bg-white',
    textPrimary: 'text-black',
    textSecondary: 'text-gray-800', 
    border: 'border-black border-4',
    accent: 'bg-yellow-400 text-black border-2 border-black',
    success: 'bg-lime-400 text-black border-2 border-black',
    error: 'bg-red-400 text-black border-2 border-black'
  }
}

export const FONT_SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
  'extra-large': 'text-xl'
}

export interface AccessibilityFeature {
  id: keyof AccessibilitySettings
  name: string
  description: string
  category: 'visual' | 'audio' | 'motor' | 'cognitive'
  icon: string
  recommendedFor: string[]
}

export const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  // Visual
  {
    id: 'dyslexiaFriendlyFont',
    name: 'Dyslexia-Friendly Font',
    description: 'Use fonts designed to help with dyslexia and reading difficulties',
    category: 'visual',
    icon: '📖',
    recommendedFor: ['Dyslexia', 'Reading difficulties', 'Visual processing issues']
  },
  {
    id: 'theme',
    name: 'High Contrast Mode',
    description: 'Use high contrast colors for better visibility',
    category: 'visual',
    icon: '🎨',
    recommendedFor: ['Low vision', 'Color blindness', 'Visual impairments']
  },
  {
    id: 'fontSize',
    name: 'Large Text',
    description: 'Increase text size for better readability',
    category: 'visual',
    icon: '🔍',
    recommendedFor: ['Low vision', 'Reading difficulties', 'Age-related vision changes']
  },
  {
    id: 'reducedAnimations',
    name: 'Reduced Animations',
    description: 'Minimize motion and animations that may cause discomfort',
    category: 'visual',
    icon: '🚫',
    recommendedFor: ['Motion sensitivity', 'Vestibular disorders', 'ADHD']
  },
  {
    id: 'increasedLineSpacing',
    name: 'Increased Line Spacing',
    description: 'Add more space between lines for easier reading',
    category: 'visual',
    icon: '📏',
    recommendedFor: ['Dyslexia', 'Reading difficulties', 'Visual tracking issues']
  },
  
  // Motor
  {
    id: 'largerClickTargets',
    name: 'Larger Buttons',
    description: 'Make buttons and clickable areas larger and easier to tap',
    category: 'motor',
    icon: '👆',
    recommendedFor: ['Motor impairments', 'Tremor', 'Coordination difficulties']
  },
  {
    id: 'stickyButtons',
    name: 'Sticky Buttons',
    description: 'Buttons stay activated until clicked again, reducing need for precise timing',
    category: 'motor',
    icon: '📌',
    recommendedFor: ['Motor impairments', 'Tremor', 'Limited fine motor control']
  },
  
  // Cognitive
  {
    id: 'simplifiedUI',
    name: 'Simplified Interface',
    description: 'Remove distracting elements and focus on core functionality',
    category: 'cognitive',
    icon: '✨',
    recommendedFor: ['ADHD', 'Autism', 'Cognitive processing differences']
  },
  {
    id: 'extendedTimeouts',
    name: 'Extended Time',
    description: 'Give more time to read and answer questions',
    category: 'cognitive',
    icon: '⏰',
    recommendedFor: ['Processing speed differences', 'Reading difficulties', 'Anxiety']
  },
  {
    id: 'showProgressIndicators',
    name: 'Progress Indicators',
    description: 'Show clear progress through activities and remaining time',
    category: 'cognitive',
    icon: '📊',
    recommendedFor: ['ADHD', 'Autism', 'Anxiety', 'Executive function support']
  },
  
  // Audio
  {
    id: 'soundEnabled',
    name: 'Sound Effects',
    description: 'Enable audio feedback and sound effects',
    category: 'audio',
    icon: '🔊',
    recommendedFor: ['Visual impairments', 'Auditory learners', 'Engagement']
  },
  {
    id: 'screenReaderSupport',
    name: 'Screen Reader Support',
    description: 'Enhanced compatibility with screen reading software',
    category: 'audio',
    icon: '📱',
    recommendedFor: ['Blindness', 'Low vision', 'Reading difficulties']
  }
]