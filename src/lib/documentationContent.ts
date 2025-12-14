import { DocumentationSection, DocumentationLanguage } from '@/types/documentation'

export const documentationContent: Record<DocumentationLanguage, DocumentationSection[]> = {
  en: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          id: 'welcome',
          title: 'Welcome to LearnKick Admin',
          content: `
# Welcome to LearnKick Admin

Welcome to LearnKick's comprehensive admin panel. This powerful dashboard gives you complete control over your school's educational technology platform.

## What You Can Do

- **Manage Users**: Invite teachers, manage student accounts, and control access permissions
- **Question Bank**: Create, import, and organize educational content for all grade levels
- **Analytics**: Track student performance and engagement with detailed reporting
- **Offers Management**: Create custom pricing and promotional offers for your school
- **School Settings**: Configure your school's preferences and integrations

## Quick Start Guide

1. **Set Up Your School**: Complete your school profile in Settings
2. **Invite Teachers**: Use the Quick Actions to invite your teaching staff
3. **Add Content**: Import questions or create custom educational content
4. **Monitor Progress**: Use Analytics to track student engagement and performance

## Getting Help

- Use the search function above to find specific help topics
- Check the FAQ section for common questions
- Contact support for personalized assistance

Let's get started building an amazing learning experience for your students!
          `,
          lastUpdated: '2024-01-15',
          readTime: 3,
          difficulty: 'beginner',
          tags: ['welcome', 'overview', 'getting-started'],
          relatedArticles: ['school-setup', 'inviting-users']
        },
        {
          id: 'school-setup',
          title: 'Setting Up Your School',
          content: `
# Setting Up Your School

Get your school configured properly for the best LearnKick experience.

## School Information

Navigate to **Settings > School Settings** to configure:

### Basic Information
- **School Name**: This appears throughout the platform
- **School Code**: Share this with parents and teachers to join your school
- **Time Zone**: Ensures accurate reporting and scheduling

### Access Control
- **Parent Registration**: Allow parents to self-register using your school code
- **Admin Approval**: Require approval for new user accounts
- **Student Limits**: Set maximum students per class

### Integration Settings
- **Single Sign-On (SSO)**: Connect with your existing authentication system
- **API Access**: Enable integrations with other school systems
- **Data Export**: Configure automated reporting

## Best Practices

- Use a memorable school code that's easy to share
- Enable admin approval for better security
- Set realistic student limits based on your teaching capacity
- Test integrations in a sandbox environment first

## Next Steps

After configuring your school settings:
1. Invite your first teachers
2. Create your first question sets
3. Set up parent access if needed
          `,
          lastUpdated: '2024-01-15',
          readTime: 5,
          difficulty: 'beginner',
          tags: ['setup', 'configuration', 'school-settings'],
          relatedArticles: ['inviting-users', 'question-bank']
        }
      ]
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: '👥',
      articles: [
        {
          id: 'inviting-users',
          title: 'Inviting Teachers and Staff',
          content: `
# Inviting Teachers and Staff

Learn how to invite and manage your teaching staff effectively.

## Invitation Methods

### Email Invitations
1. Go to **Overview** and click **"Invite Teacher"**
2. Choose **"Send Email Invitations"**
3. Fill in teacher details:
   - First Name
   - Last Name  
   - Email Address
   - Role (Teacher or Admin)
4. Click **"Send Invitations"**

### Shareable Link
1. Choose **"Share Invite Link"** method
2. Copy the generated link
3. Share via email, messaging, or other communication channels

## Managing User Roles

### Teacher Role
- Access to their assigned classes
- Can create and manage questions
- View student analytics for their classes
- Cannot modify school settings

### Admin Role  
- Full access to all school features
- Can invite other users
- Manage school settings and billing
- Access to comprehensive analytics

## User Status Management

Monitor user status in **User Management**:
- **Active**: User has accepted invitation and is using the platform
- **Pending**: Invitation sent but not yet accepted
- **Suspended**: User access temporarily disabled

## Best Practices

- Send personalized invitation emails with context
- Use descriptive roles and permissions
- Regularly audit user access
- Maintain up-to-date contact information
          `,
          lastUpdated: '2024-01-15',
          readTime: 4,
          difficulty: 'beginner',
          tags: ['invitations', 'teachers', 'roles', 'permissions'],
          relatedArticles: ['user-roles', 'school-setup']
        }
      ]
    },
    {
      id: 'question-bank',
      title: 'Question Bank Management',
      icon: '📚',
      articles: [
        {
          id: 'creating-questions',
          title: 'Creating and Managing Questions',
          content: `
# Creating and Managing Questions

Build a comprehensive question bank for engaging student assessments.

## Question Types

### Multiple Choice
- 2-4 answer options
- One correct answer
- Great for factual knowledge testing
- Supports images and rich formatting

### True/False
- Simple binary choice questions
- Quick to create and answer
- Ideal for concept verification
- Perfect for younger students

### Number Input
- Students type numeric answers
- Automatic validation
- Supports mathematical expressions
- Great for math and science topics

### Image Questions
- Include visual elements
- Upload diagrams, charts, or photos
- Enhanced engagement for visual learners
- Supports accessibility features

## Question Properties

### Difficulty Levels
- ⭐ Very Easy: Basic concepts, grade-level appropriate
- ⭐⭐ Easy: Standard difficulty for grade level
- ⭐⭐⭐ Medium: Slightly challenging, above average
- ⭐⭐⭐⭐ Hard: Advanced concepts, critical thinking
- ⭐⭐⭐⭐⭐ Very Hard: Expert level, exceptional students

### Subject Categories
- **Mathematics**: Arithmetic, algebra, geometry
- **Language**: Grammar, vocabulary, reading comprehension
- **Geography**: Countries, capitals, physical features
- **General Knowledge**: Science, history, current events

## Bulk Import Process

### CSV Format
Download our template or format your CSV with these columns:
- ID, Type, Subject, Grade, Difficulty, Language
- Question, Statement, Answer A, Answer B, Answer C, Answer D
- Correct Index, Correct Answer, Explanation, Tags

### Import Steps
1. Navigate to **Question Bank**
2. Click **"Import CSV"**
3. Select your prepared file
4. Review validation results
5. Confirm import

## Quality Guidelines

- Write clear, unambiguous questions
- Ensure answer choices are plausible
- Include helpful explanations
- Tag questions for easy organization
- Test questions with sample students
          `,
          lastUpdated: '2024-01-15',
          readTime: 6,
          difficulty: 'intermediate',
          tags: ['questions', 'content-creation', 'csv-import', 'quality'],
          relatedArticles: ['content-organization', 'analytics']
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: '📊',
      articles: [
        {
          id: 'understanding-analytics',
          title: 'Understanding Your Analytics Dashboard',
          content: `
# Understanding Your Analytics Dashboard

Make data-driven decisions to improve student outcomes.

## Key Metrics Overview

### Performance Indicators
- **Average Accuracy**: Overall student performance percentage
- **Games Played**: Total student engagement metric
- **Questions Answered**: Content utilization measure
- **Active Students**: Current platform usage

### Engagement Metrics
- **Time Spent**: Average session duration
- **Return Rate**: How often students come back
- **Completion Rate**: Percentage of started games finished
- **Progress Trends**: Improvement over time

## Subject Performance Analysis

### Performance by Subject
- Compare different subject areas
- Identify struggling topics
- Allocate teaching resources effectively
- Track curriculum effectiveness

### Grade-Level Insights
- Monitor age-appropriate performance
- Identify advanced or struggling students
- Plan differentiated instruction
- Track developmental progress

## Data Export Options

### Available Reports
- **Student Performance**: Individual and class summaries
- **Question Analytics**: Most/least successful questions
- **Usage Reports**: Platform engagement metrics
- **Progress Tracking**: Longitudinal performance data

### Export Formats
- CSV for spreadsheet analysis
- PDF for presentations and reports
- JSON for system integrations
- Excel for advanced data manipulation

## Interpreting Results

### Red Flags to Watch
- Declining accuracy over time
- Low engagement rates
- Uneven subject performance
- High dropout rates mid-game

### Success Indicators
- Steady improvement in scores
- Consistent platform usage
- Balanced performance across subjects
- High completion rates

## Actionable Insights

Use your data to:
- Identify students needing additional support
- Adjust question difficulty levels
- Focus on underperforming subject areas
- Recognize and reward high achievers
- Plan targeted interventions
          `,
          lastUpdated: '2024-01-15',
          readTime: 5,
          difficulty: 'intermediate',
          tags: ['analytics', 'reporting', 'data-analysis', 'insights'],
          relatedArticles: ['data-export', 'student-performance']
        }
      ]
    },
    {
      id: 'offers-management',
      title: 'Offers Management',
      icon: '💰',
      articles: [
        {
          id: 'creating-offers',
          title: 'Creating and Managing Offers',
          content: `
# Creating and Managing Offers

Design compelling offers to attract and retain schools on your platform.

## Offer Types

### Subscription Plans
- **Monthly**: Regular monthly billing
- **Annual**: Yearly billing with discounts
- **Multi-year**: Extended commitments with better rates

### Promotional Offers
- **New Customer**: First-time subscriber incentives
- **Seasonal**: Back-to-school, holiday specials
- **Upgrade**: Incentives to move to higher tiers
- **Referral**: Rewards for bringing new schools

### Enterprise Packages
- **Custom Pricing**: Tailored for large schools
- **Volume Discounts**: Based on student count
- **Feature Bundles**: Comprehensive solution packages
- **White-label**: Branded solutions for districts

## Pricing Configuration

### Base Pricing Structure
- Set foundation price per student/teacher
- Configure billing cycles (monthly/yearly)
- Define currency and regional pricing
- Set up automatic renewals

### Discount Types
- **Percentage**: 10%, 25%, 50% off regular price
- **Fixed Amount**: $100 off, $500 off
- **Tiered Volume**: Discounts based on quantity
- **Bundle Savings**: Package deal discounts

### Advanced Pricing
- **Geographic Targeting**: Different prices by region
- **School Size Brackets**: Small, medium, large, enterprise
- **Usage-based**: Pay per active student
- **Freemium**: Basic free with premium upgrades

## Customer Segmentation

### Segmentation Criteria
- **School Type**: Public, private, charter, homeschool
- **Size**: Student enrollment ranges
- **Previous Spend**: Historical value customers
- **Geographic**: Regional or country-based
- **Activity Level**: High, medium, low engagement

### Targeting Rules
- Define which segments see which offers
- Set exclusion rules for conflicting offers
- Create personalized offer experiences
- A/B test different approaches

## Performance Tracking

### Key Metrics
- **Conversion Rate**: Visitors to customers
- **Customer Acquisition Cost**: Total cost per new customer
- **Lifetime Value**: Projected customer worth
- **Churn Rate**: How many cancel subscriptions

### Optimization Strategies
- Test different offer structures
- Monitor competitor pricing
- Analyze customer feedback
- Adjust based on market conditions

## Quote Generation

### Custom Quotes
- Generate personalized proposals
- Include custom terms and conditions
- Add implementation timelines
- Specify support levels included

### Quote Management
- Track quote status and engagement
- Set expiration dates
- Follow up on pending quotes
- Convert quotes to contracts
          `,
          lastUpdated: '2024-01-15',
          readTime: 7,
          difficulty: 'advanced',
          tags: ['offers', 'pricing', 'sales', 'conversion'],
          relatedArticles: ['analytics', 'customer-segments']
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Guide',
      icon: '🔧',
      articles: [
        {
          id: 'troubleshooting',
          title: 'Common Issues and Solutions',
          content: `
# Common Issues and Solutions

Quick fixes for the most frequently encountered problems.

## Login and Access Issues

### Can't Access Admin Panel
**Symptoms**: "Invalid credentials" or endless loading
**Solutions**:
1. Clear your browser cache and cookies
2. Try incognito/private browsing mode
3. Check if your account has admin permissions
4. Contact support if issue persists

### School Code Not Working
**Symptoms**: "Invalid school code" when users try to join
**Solutions**:
1. Verify the school code in Settings
2. Check if the code has been deactivated
3. Ensure users are entering the correct case
4. Generate a new school code if needed

## Data Import Problems

### CSV Import Failures
**Common Causes**:
- Incorrect file format or encoding
- Missing required columns
- Invalid data in cells
- File too large (>10MB limit)

**Solutions**:
1. Use our official CSV template
2. Save file as UTF-8 encoded CSV
3. Validate data before import
4. Split large files into smaller batches

### Question Formatting Issues
**Best Practices**:
- Remove special characters that break formatting
- Keep questions under 500 characters
- Use standard quotation marks
- Avoid line breaks within cells

## Performance Issues

### Slow Loading Times
**Optimization Steps**:
1. Check your internet connection
2. Close unnecessary browser tabs
3. Update to latest browser version
4. Clear browser cache
5. Try different browser

### Export Timeouts
**For Large Data Sets**:
- Export data in smaller date ranges
- Use filters to reduce dataset size
- Try off-peak hours for large exports
- Contact support for bulk export assistance

## User Management Issues

### Invitation Emails Not Delivered
**Troubleshooting**:
1. Check spam/junk folders
2. Verify email addresses are correct
3. Ensure your domain isn't blocked
4. Use the shareable link method instead
5. Contact email provider about whitelist

### Users Can't Complete Registration
**Common Solutions**:
- Ensure school has registration enabled
- Check if admin approval is required
- Verify the invitation hasn't expired
- Confirm email verification is completed

## Browser Compatibility

### Supported Browsers
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### Unsupported Features
- Internet Explorer (discontinued)
- Very old mobile browsers
- Browsers with JavaScript disabled

## Getting Additional Help

### Before Contacting Support
1. Try the solutions above
2. Check if others in your school have the same issue
3. Note exact error messages
4. Record steps to reproduce the problem

### Support Channels
- **Email**: support@learnkick.com
- **In-app Chat**: Available during business hours
- **Knowledge Base**: Additional articles and tutorials
- **Community Forum**: Connect with other administrators
          `,
          lastUpdated: '2024-01-15',
          readTime: 4,
          difficulty: 'intermediate',
          tags: ['troubleshooting', 'technical-support', 'common-issues'],
          relatedArticles: ['system-requirements', 'best-practices']
        }
      ]
    }
  ],

  // German translations
  de: [
    {
      id: 'getting-started',
      title: 'Erste Schritte',
      icon: '🚀',
      articles: [
        {
          id: 'welcome',
          title: 'Willkommen bei LearnKick Admin',
          content: `
# Willkommen bei LearnKick Admin

Willkommen im umfassenden Admin-Panel von LearnKick. Dieses leistungsstarke Dashboard gibt Ihnen die vollständige Kontrolle über die Bildungstechnologie-Plattform Ihrer Schule.

## Was Sie tun können

- **Benutzer verwalten**: Lehrer einladen, Schülerkonten verwalten und Zugriffsberechtigungen kontrollieren
- **Fragenbank**: Bildungsinhalte für alle Klassenstufen erstellen, importieren und organisieren
- **Analysen**: Schülerleistung und Engagement mit detaillierter Berichterstattung verfolgen
- **Angebotsverwaltung**: Maßgeschneiderte Preise und Werbeangebote für Ihre Schule erstellen
- **Schuleinstellungen**: Einstellungen und Integrationen Ihrer Schule konfigurieren

## Schnellstart-Anleitung

1. **Schule einrichten**: Vervollständigen Sie Ihr Schulprofil in den Einstellungen
2. **Lehrer einladen**: Verwenden Sie die Schnellaktionen, um Ihre Lehrkräfte einzuladen
3. **Inhalte hinzufügen**: Fragen importieren oder benutzerdefinierte Bildungsinhalte erstellen
4. **Fortschritte überwachen**: Verwenden Sie Analysen, um Schülerengagement und -leistung zu verfolgen

## Hilfe erhalten

- Verwenden Sie die Suchfunktion oben, um spezifische Hilfethemen zu finden
- Überprüfen Sie den FAQ-Bereich für häufige Fragen
- Kontaktieren Sie den Support für persönliche Unterstützung

Lassen Sie uns damit beginnen, eine großartige Lernerfahrung für Ihre Schüler zu schaffen!
          `,
          lastUpdated: '2024-01-15',
          readTime: 3,
          difficulty: 'beginner',
          tags: ['willkommen', 'überblick', 'erste-schritte'],
          relatedArticles: ['school-setup', 'inviting-users']
        }
      ]
    }
  ],

  // French translations
  fr: [
    {
      id: 'getting-started',
      title: 'Prise en main',
      icon: '🚀',
      articles: [
        {
          id: 'welcome',
          title: 'Bienvenue dans LearnKick Admin',
          content: `
# Bienvenue dans LearnKick Admin

Bienvenue dans le panneau d'administration complet de LearnKick. Ce tableau de bord puissant vous donne un contrôle total sur la plateforme de technologie éducative de votre école.

## Ce que vous pouvez faire

- **Gérer les utilisateurs** : Inviter des enseignants, gérer les comptes étudiants et contrôler les permissions d'accès
- **Banque de questions** : Créer, importer et organiser du contenu éducatif pour tous les niveaux scolaires
- **Analyses** : Suivre les performances et l'engagement des étudiants avec des rapports détaillés
- **Gestion des offres** : Créer des prix personnalisés et des offres promotionnelles pour votre école
- **Paramètres de l'école** : Configurer les préférences et intégrations de votre école

## Guide de démarrage rapide

1. **Configurer votre école** : Complétez le profil de votre école dans les Paramètres
2. **Inviter des enseignants** : Utilisez les Actions rapides pour inviter votre personnel enseignant
3. **Ajouter du contenu** : Importez des questions ou créez du contenu éducatif personnalisé
4. **Surveiller les progrès** : Utilisez les Analyses pour suivre l'engagement et les performances des étudiants

## Obtenir de l'aide

- Utilisez la fonction de recherche ci-dessus pour trouver des sujets d'aide spécifiques
- Consultez la section FAQ pour les questions courantes
- Contactez le support pour une assistance personnalisée

Commençons à créer une expérience d'apprentissage incroyable pour vos étudiants !
          `,
          lastUpdated: '2024-01-15',
          readTime: 3,
          difficulty: 'beginner',
          tags: ['bienvenue', 'aperçu', 'démarrage'],
          relatedArticles: ['school-setup', 'inviting-users']
        }
      ]
    }
  ],

  // Albanian translations
  sq: [
    {
      id: 'getting-started',
      title: 'Fillimi',
      icon: '🚀',
      articles: [
        {
          id: 'welcome',
          title: 'Mirësevini në LearnKick Admin',
          content: `
# Mirësevini në LearnKick Admin

Mirësevini në panelin gjithëpërfshirës admin të LearnKick. Ky panel i fuqishëm ju jep kontroll të plotë mbi platformën e teknologjisë arsimore të shkollës suaj.

## Çfarë mund të bëni

- **Menaxhoni përdoruesit**: Ftoni mësues, menaxhoni llogaritë e studentëve dhe kontrolloni lejet e qasjes
- **Banka e pyetjeve**: Krijoni, importoni dhe organizoni përmbajtje arsimore për të gjitha nivelet e shkollës
- **Analitika**: Ndiqni performancën dhe angazhimin e studentëve me raportim të detajuar
- **Menaxhimi i ofertave**: Krijoni çmime të personalizuara dhe oferta promovuese për shkollën tuaj
- **Cilësimet e shkollës**: Konfiguroni preferencat dhe integrimet e shkollës suaj

## Udhëzues fillestar i shpejtë

1. **Vendosni shkollën tuaj**: Plotësoni profilin e shkollës në Cilësime
2. **Ftoni mësues**: Përdorni Veprimet e shpejta për të ftuar stafin mësimor
3. **Shtoni përmbajtje**: Importoni pyetje ose krijoni përmbajtje arsimore të personalizuar
4. **Monitoroni përparimin**: Përdorni Analizat për të ndjekur angazhimin dhe performancën e studentëve

## Marrja e ndihmës

- Përdorni funksionin e kërkimit më lart për të gjetur tema specifike ndihmë
- Kontrolloni seksionin FAQ për pyetje të zakonshme
- Kontaktoni mbështetjen për ndihmë të personalizuar

Le të fillojmë të krijojmë një përvojë të mrekullueshme mësimi për studentët tuaj!
          `,
          lastUpdated: '2024-01-15',
          readTime: 3,
          difficulty: 'beginner',
          tags: ['mirësevini', 'përmbledhje', 'fillimi'],
          relatedArticles: ['school-setup', 'inviting-users']
        }
      ]
    }
  ]
}