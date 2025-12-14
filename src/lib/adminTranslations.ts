export type AdminLanguage = 'en' | 'de' | 'fr' | 'sq'

export interface AdminTranslations {
  // Login
  title: string
  welcomeBack: string
  signInToAccess: string
  email: string
  password: string
  login: string
  signIn: string
  signingIn: string
  signInToDashboard: string
  educationalManagementSystem: string
  createSchoolAdmin: string
  createAdminAccount: string
  createParentAccount: string
  joinChildLearningJourney: string
  emailPlaceholder: string
  passwordPlaceholder: string
  fullNamePlaceholder: string
  schoolNamePlaceholder: string
  createPasswordPlaceholder: string
  confirmPasswordPlaceholder: string
  parentEmailPlaceholder: string
  schoolCodePlaceholder: string

  // School Setup
  schoolAdmin: string
  parent: string
  createSchoolAccount: string
  joinSchoolAsParent: string
  fullName: string
  confirmPassword: string
  createAccount: string
  creating: string
  
  // Navigation
  overview: string
  dashboard: string
  questionBank: string
  userManagement: string
  analytics: string
  offersManagement: string
  schoolSettings: string
  
  // Dashboard
  dashboardOverview: string
  welcomeMessage: string
  totalQuestions: string
  schoolUsers: string
  gamesPlayed: string
  avgAccuracy: string
  active: string
  setupNeeded: string
  noGames: string
  noData: string
  good: string
  fair: string
  
  // Quick Actions
  quickActions: string
  addQuestions: string
  importCSV: string
  inviteTeacher: string
  exportData: string
  viewAnalytics: string
  
  // Recent Activity
  recentActivity: string
  recentGameSessions: string
  noGameSessions: string
  studentsWillAppear: string
  
  // Question Management
  questionManagement: string
  addQuestion: string
  editQuestion: string
  deleteQuestion: string
  exportCSV: string
  totalQuestionsAvailable: string
  questionsBySubject: string
  questionsByGrade: string
  importFromCSV: string
  
  // User Management
  userManagementTitle: string
  manageUsers: string
  inviteUser: string
  teachers: string
  parents: string
  students: string
  pendingInvites: string
  user: string
  role: string
  status: string
  lastActive: string
  actions: string
  noUsersFound: string
  inviteTeachersParents: string
  
  // Analytics
  analyticsTitle: string
  trackPerformance: string
  performanceBySubject: string
  performanceByGrade: string
  performanceTrends: string
  topPerformers: string
  accuracy: string
  questionsAnswered: string
  
  // Settings
  settings: string
  schoolSettingsTitle: string
  
  // Common
  loading: string
  error: string
  success: string
  save: string
  cancel: string
  delete: string
  edit: string
  view: string
  close: string
  refresh: string
  
  // Time
  justNow: string
  hoursAgo: string
  daysAgo: string
  never: string
  last7Days: string
  last30Days: string
  last3Months: string
  lastYear: string
  
  // Additional Analytics
  unknownStudent: string
  grade: string
  estimated: string
  chartsWillBeImplemented: string
  withChartingLibrary: string
  min: string
  questions: string
  
  // Question Bank Manager
  questionBankManager: string
  manageContent: string
  filtersAndSearch: string
  searchQuestions: string
  searchPlaceholder: string
  subject: string
  allSubjects: string
  mathematics: string
  geography: string
  language: string
  generalKnowledge: string
  allGrades: string
  difficulty: string
  allDifficulties: string
  veryEasy: string
  easy: string
  medium: string
  hard: string
  veryHard: string
  questionType: string
  allTypes: string
  multipleChoice: string
  trueFalse: string
  numberInput: string
  imageQuestion: string
  allLanguages: string
  bulkActions: string
  importing: string
  deleteSelected: string
  showingQuestions: string
  selectAll: string
  loadingQuestions: string
  noQuestionsFound: string
  adjustFilters: string
  answers: string
  correct: string
  created: string
  unknown: string
  page: string
  of: string
  previous: string
  next: string
  
  // School Settings
  configureSettings: string
  schoolInformation: string
  schoolName: string
  schoolCode: string
  copy: string
  shareCode: string
  subscriptionPlan: string
  freePlan: string
  accessControl: string
  allowParentRegistration: string
  parentsCanJoin: string
  requireAdminApproval: string
  newUsersApproval: string
  gameSettings: string
  defaultTimeLimit: string
  maxStudentsPerClass: string
  generateNewCode: string
  inviteTeachers: string
  emailAllParents: string
  currentPlan: string
  youreOnFreePlan: string
  upTo50Students: string
  threeTeachers: string
  basicAnalytics: string
  communitySupport: string
  upgradePlan: string
  saveSettings: string
  
  // Missing Dashboard Elements
  signOut: string
  schoolCodeLabel: string
  
  // Quick Action Labels & Descriptions  
  addQuestionsLabel: string
  addQuestionsDesc: string
  inviteTeacherLabel: string
  inviteTeacherDesc: string
  exportDataLabel: string
  exportDataDesc: string
  viewAnalyticsLabel: string
  viewAnalyticsDesc: string
  student: string
  completed: string
  
  // Subject Management
  subjectManagement: string
  subjects: string
  addSubject: string
  editSubject: string
  deleteSubject: string
  subjectName: string
  subjectSlug: string
  subjectIcon: string
  subjectColor: string
  subjectDescription: string
  createSubject: string
  updateSubject: string
  manageSubjects: string
  availableSubjects: string
  systemSubjects: string
  schoolSubjects: string
  
  // Add Question Modal
  addNewQuestion: string
  createQuestion: string
  questionText: string
  statement: string
  answerOptions: string
  correctAnswer: string
  timeLimit: string
  tags: string
  explanation: string
  tolerance: string
  unit: string
  imageUrl: string
  preview: string
  required: string
  optional: string
  seconds: string
  
  // User Management Actions
  editUser: string
  deleteUser: string
  suspendUser: string
  activateUser: string
  viewDetails: string
  userActions: string
  editUserProfile: string
  deleteUserConfirm: string
  suspendUserConfirm: string
  permanentlyDelete: string
  cannotBeUndone: string
  
  // School Settings Functions
  saveChanges: string
  generateCode: string
  exportUserData: string
  saveNotifications: string
  uploadLogo: string
  settingsSaved: string
  codeGenerated: string
  dataExported: string
  
  // Offers Manager
  useTemplate: string
  createTemplate: string
  editTemplate: string
  newQuote: string
  viewQuote: string
  editQuote: string
  sendQuote: string
  createSegment: string
  editSegment: string
  targetSegment: string
  createTargetedOffer: string
  totalRevenue: string
  activeOffers: string
  conversionRate: string
  totalLeads: string
  
  // Analytics Dashboard
  performanceTrendsChart: string
  averageAccuracyOverTime: string
  studentPerformanceTrends: string
  noDataAvailable: string
  
  // General Actions (unique entries only)
  send: string
  create: string
  update: string
  confirm: string
  yes: string
  no: string
  warning: string
  info: string
  
  // Validation Messages
  fieldRequired: string
  invalidEmail: string
  passwordTooShort: string
  passwordMismatch: string
  invalidSlug: string
  slugTaken: string
  invalidColor: string
  invalidUrl: string
  minimumAnswers: string
  validNumber: string
  timeLimitRange: string

  // Platform (optional - may not be in all languages)
  learnKickPlatform?: string
  platformOwner?: string
  educationalManagement?: string

  // Documentation (optional - may not be in all languages)
  documentation?: string
  documentationDesc?: string

  // Languages
  languages: {
    en: string
    de: string
    fr: string
    sq: string
  }

  // Allow additional string properties not explicitly defined
  [key: string]: string | { en: string; de: string; fr: string; sq: string } | undefined
}

export const adminTranslations: Record<AdminLanguage, AdminTranslations> = {
  en: {
    // Login
    title: 'LearnKick Admin',
    welcomeBack: 'Welcome Back',
    signInToAccess: 'Sign in to access the admin panel',
    email: 'Email Address',
    password: 'Password',
    login: 'Login',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    signInToDashboard: 'Sign In to Dashboard',
    educationalManagementSystem: 'Educational Management System',
    createSchoolAdmin: 'Create School Admin',
    createAdminAccount: 'Create Admin Account',
    createParentAccount: 'Create Parent Account',
    joinChildLearningJourney: 'Join your child\'s learning journey',
    emailPlaceholder: 'admin@school.com',
    passwordPlaceholder: 'Enter your password',
    fullNamePlaceholder: 'Your full name',
    schoolNamePlaceholder: 'Your school name',
    createPasswordPlaceholder: 'Create a password',
    confirmPasswordPlaceholder: 'Confirm password',
    parentEmailPlaceholder: 'parent@email.com',
    schoolCodePlaceholder: 'Enter school code',

    // School Setup
    schoolAdmin: 'School Admin',
    parent: 'Parent',
    createSchoolAccount: 'Create your school account',
    joinSchoolAsParent: 'Join a school as a parent',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    creating: 'Creating...',
    
    // Navigation
    overview: 'Overview',
    dashboard: 'Dashboard',
    questionBank: 'Question Bank',
    userManagement: 'User Management',
    analytics: 'Analytics',
    offersManagement: 'Offers Management',
    schoolSettings: 'School Settings',
    
    // Dashboard
    dashboardOverview: 'Dashboard Overview',
    welcomeMessage: 'Here\'s what\'s happening in your school',
    totalQuestions: 'Total Questions',
    schoolUsers: 'School Users',
    gamesPlayed: 'Games Played',
    avgAccuracy: 'Avg. Accuracy',
    active: 'Active',
    setupNeeded: 'Setup Needed',
    noGames: 'No Games',
    noData: 'No Data',
    good: 'Good',
    fair: 'Fair',
    
    // Quick Actions
    quickActions: 'Quick Actions',
    addQuestions: 'Add Questions',
    importCSV: 'Import CSV or create new',
    inviteTeacher: 'Invite Teacher',
    exportData: 'Export Data',
    viewAnalytics: 'View Analytics',
    
    // Recent Activity
    recentActivity: 'Recent Activity',
    recentGameSessions: 'Recent Game Sessions',
    noGameSessions: 'No game sessions yet',
    studentsWillAppear: 'Students will appear here after playing games',
    
    // Question Management
    questionManagement: 'Question Management',
    addQuestion: 'Add Question',
    editQuestion: 'Edit Question',
    deleteQuestion: 'Delete Question',
    exportCSV: 'Export CSV',
    totalQuestionsAvailable: 'Total Questions Available',
    questionsBySubject: 'Questions by Subject',
    questionsByGrade: 'Questions by Grade',
    importFromCSV: 'Import from CSV',
    
    // User Management
    userManagementTitle: 'User Management',
    manageUsers: 'Manage teachers, parents, and students in your school',
    inviteUser: 'Invite User',
    teachers: 'Teachers',
    parents: 'Parents',
    students: 'Students',
    pendingInvites: 'Pending Invites',
    user: 'User',
    role: 'Role',
    status: 'Status',
    lastActive: 'Last Active',
    actions: 'Actions',
    noUsersFound: 'No users found',
    inviteTeachersParents: 'Invite teachers and parents to get started',
    
    // Analytics
    analyticsTitle: 'Analytics Dashboard',
    trackPerformance: 'Track student performance and learning progress',
    performanceBySubject: 'Performance by Subject',
    performanceByGrade: 'Performance by Grade',
    performanceTrends: 'Performance Trends',
    topPerformers: 'Top Performers This Week',
    accuracy: 'Accuracy',
    questionsAnswered: 'Questions Answered',
    
    // Settings
    settings: 'Settings',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    refresh: 'Refresh',
    
    // Time
    justNow: 'Just now',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    never: 'Never',
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    last3Months: 'Last 3 months',
    lastYear: 'Last year',
    
    // Additional Analytics
    unknownStudent: 'Unknown Student',
    grade: 'Grade',
    estimated: 'estimated',
    chartsWillBeImplemented: 'Interactive charts will be implemented',
    withChartingLibrary: 'with a charting library like Chart.js',
    min: 'min',
    questions: 'questions',
    
    // Question Bank Manager
    questionBankManager: 'Question Bank Manager',
    manageContent: 'Manage and organize educational content for your school',
    filtersAndSearch: 'Filters & Search',
    searchQuestions: 'Search Questions',
    searchPlaceholder: 'Search questions, answers...',
    subject: 'Subject',
    allSubjects: 'All Subjects',
    mathematics: 'Mathematics',
    geography: 'Geography',
    language: 'Language',
    generalKnowledge: 'General Knowledge',
    allGrades: 'All Grades',
    difficulty: 'Difficulty',
    allDifficulties: 'All Difficulties',
    veryEasy: '⭐ Very Easy',
    easy: '⭐⭐ Easy',
    medium: '⭐⭐⭐ Medium',
    hard: '⭐⭐⭐⭐ Hard',
    veryHard: '⭐⭐⭐⭐⭐ Very Hard',
    questionType: 'Question Type',
    allTypes: 'All Types',
    multipleChoice: 'Multiple Choice',
    trueFalse: 'True/False',
    numberInput: 'Number Input',
    imageQuestion: 'Image Question',
    allLanguages: 'All Languages',
    bulkActions: 'Bulk Actions',
    importing: 'Importing...',
    deleteSelected: 'Delete Selected',
    showingQuestions: 'Showing',
    selectAll: 'Select All',
    loadingQuestions: 'Loading questions...',
    noQuestionsFound: 'No questions found',
    adjustFilters: 'Try adjusting your filters or add some questions',
    answers: 'Answers',
    correct: 'Correct',
    created: 'Created',
    unknown: 'Unknown',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    
    // School Settings
    schoolSettingsTitle: 'School Settings',
    configureSettings: 'Configure your school\'s LearnKick settings and preferences',
    schoolInformation: 'School Information',
    schoolName: 'School Name',
    schoolCode: 'School Code',
    copy: 'Copy',
    shareCode: 'Share this code with parents to join your school',
    subscriptionPlan: 'Subscription Plan',
    freePlan: 'Free Plan',
    accessControl: 'Access Control',
    allowParentRegistration: 'Allow Parent Self-Registration',
    parentsCanJoin: 'Parents can join using the school code',
    requireAdminApproval: 'Require Admin Approval',
    newUsersApproval: 'New users must be approved before accessing',
    gameSettings: 'Game Settings',
    defaultTimeLimit: 'Default Time Limit (seconds)',
    maxStudentsPerClass: 'Max Students per Class',
    generateNewCode: 'Generate New School Code',
    inviteTeachers: 'Invite Teachers',
    emailAllParents: 'Email All Parents',
    currentPlan: 'Current Plan',
    youreOnFreePlan: 'You\'re on the Free plan',
    upTo50Students: '• Up to 50 students',
    threeTeachers: '• 3 teachers',
    basicAnalytics: '• Basic analytics',
    communitySupport: '• Community support',
    upgradePlan: 'Upgrade Plan',
    saveSettings: 'Save Settings',
    
    // Missing Dashboard Elements
    signOut: 'Sign Out',
    schoolCodeLabel: 'School Code:',
    
    // Quick Action Labels & Descriptions  
    addQuestionsLabel: 'Add Questions',
    addQuestionsDesc: 'Import CSV or create new',
    inviteTeacherLabel: 'Invite Teacher',
    inviteTeacherDesc: 'Add new team members',
    exportDataLabel: 'Export Data',
    exportDataDesc: 'Download reports',
    viewAnalyticsLabel: 'View Analytics',
    viewAnalyticsDesc: 'Student performance',
    student: 'Student',
    completed: 'completed',
    
    // Subject Management
    subjectManagement: 'Subject Management',
    subjects: 'Subjects',
    addSubject: 'Add Subject',
    editSubject: 'Edit Subject',
    deleteSubject: 'Delete Subject',
    subjectName: 'Subject Name',
    subjectSlug: 'Slug (URL-friendly identifier)',
    subjectIcon: 'Icon',
    subjectColor: 'Color',
    subjectDescription: 'Description',
    createSubject: 'Create Subject',
    updateSubject: 'Update Subject',
    manageSubjects: 'Manage available subjects for questions',
    availableSubjects: 'Available Subjects',
    systemSubjects: 'System',
    schoolSubjects: 'School Custom',
    
    // Add Question Modal
    addNewQuestion: 'Add New Question',
    createQuestion: 'Create Question',
    questionText: 'Question',
    statement: 'Statement',
    answerOptions: 'Answer Options',
    correctAnswer: 'Correct Answer',
    timeLimit: 'Time Limit',
    tags: 'Tags',
    explanation: 'Explanation',
    tolerance: 'Tolerance',
    unit: 'Unit',
    imageUrl: 'Image URL',
    preview: 'Preview',
    required: 'required',
    optional: 'optional',
    seconds: 'seconds',
    
    // User Management Actions
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    suspendUser: 'Suspend User',
    activateUser: 'Activate User',
    viewDetails: 'View Details',
    userActions: 'User Actions',
    editUserProfile: 'Edit User Profile',
    deleteUserConfirm: 'Are you sure you want to delete this user?',
    suspendUserConfirm: 'Are you sure you want to suspend this user?',
    permanentlyDelete: 'Permanently Delete User',
    cannotBeUndone: 'This action cannot be undone.',
    
    // School Settings Functions
    saveChanges: 'Save Changes',
    generateCode: 'Generate New Code',
    exportUserData: 'Export User Data',
    saveNotifications: 'Save Notifications',
    uploadLogo: 'Upload Logo',
    settingsSaved: 'Settings saved successfully!',
    codeGenerated: 'New school code generated!',
    dataExported: 'Data exported successfully!',
    
    // Offers Manager
    useTemplate: 'Use Template',
    createTemplate: 'Create Template',
    editTemplate: 'Edit Template',
    newQuote: 'New Quote',
    viewQuote: 'View Quote',
    editQuote: 'Edit Quote',
    sendQuote: 'Send Quote',
    createSegment: 'Create Segment',
    editSegment: 'Edit Segment',
    targetSegment: 'Target Segment',
    createTargetedOffer: 'Create Targeted Offer',
    totalRevenue: 'Total Revenue',
    activeOffers: 'Active Offers',
    conversionRate: 'Conversion Rate',
    totalLeads: 'Total Leads',
    
    // Analytics Dashboard
    performanceTrendsChart: 'Performance Trends',
    averageAccuracyOverTime: 'Average Accuracy Over Time',
    studentPerformanceTrends: 'Student Performance Trends',
    noDataAvailable: 'No data available',

    // General Actions (non-duplicate only)
    send: 'Send',
    create: 'Create',
    update: 'Update',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    warning: 'Warning',
    info: 'Info',

    // Validation Messages
    fieldRequired: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    invalidSlug: 'Slug can only contain lowercase letters, numbers, and hyphens',
    slugTaken: 'This slug is already taken',
    invalidColor: 'Please enter a valid hex color code',
    invalidUrl: 'Please enter a valid URL',
    minimumAnswers: 'At least 2 answer options are required',
    validNumber: 'Please enter a valid number',
    timeLimitRange: 'Time limit must be between 5 and 300 seconds',

    // Invite Dialog (User Management)
    inviteDialogDescription: 'Send invitations to new users or generate invite links for your school.',
    invitationMethod: 'Invitation Method',
    sendEmail: 'Send Email',
    generateLink: 'Generate Link',
    emailAddresses: 'Email Addresses',
    userEmailPlaceholder: 'user@example.com',
    addAnotherEmail: 'Add another email',
    emailInviteInstruction: 'Users will receive an email invitation to join. They\'ll need to click the link and complete registration.',
    linkInviteInstruction: 'Generate an invitation link that you can share directly. Anyone with this link can join.',
    sending: 'Sending...',
    generating: 'Generating...',
    sendInvitations: 'Send Invitations',
    invitationCodes: 'Invitation Codes:',
    copied: 'Copied',
    sendMoreInvitations: 'Send More Invitations',
    done: 'Done',
    updateUserInfoDescription: 'Update user information and role assignments.',
    enterFullName: 'Enter full name',
    enterEmail: 'Enter email',
    deleteUserConfirmMessage: 'Are you sure you want to delete {name}? This action cannot be undone and will permanently remove the user from your school.',
    schoolIdNotFound: 'School ID not found',
    inviteCreatedSuccess: 'Successfully created {count} invitation(s)! Share the codes with users.',
    inviteLinkGenerated: 'Invitation link generated! Share this code with users.',

    // School Settings Additional
    settingsSavedSuccess: 'Settings saved successfully!',
    newSchoolCodeGenerated: 'New school code generated: {code}',
    generatingCode: 'Generating...',
    saving: 'Saving...',
    inviteTeachersTitle: 'Invite Teachers',
    useUserManagementForInvites: 'Use the User Management tab to send teacher invitations with full control over the invitation process.',
    goToUserManagement: 'Go to User Management',
    pleaseGoToUserManagement: 'Please go to the User Management tab to invite teachers',
    emailAllParentsTitle: 'Email All Parents',
    emailSubject: 'Subject',
    emailSubjectPlaceholder: 'Important school announcement',
    message: 'Message',
    messagePlaceholder: 'Dear parents, we wanted to inform you about...',
    emailWillBeSentToAllParents: 'This will send an email to all registered parents in your school.',
    sendEmailBtn: 'Send Email',
    upgradeYourPlan: 'Upgrade Your Plan',
    basicPlan: 'Basic Plan',
    premiumPlan: 'Premium Plan',
    perMonth: '/month',
    upTo100Students: 'Up to 100 students',
    fiveTeachers: '5 teachers',
    emailSupport: 'Email support',
    customQuestions: 'Custom questions',
    chooseBasic: 'Choose Basic',
    unlimitedStudents: 'Unlimited students',
    unlimitedTeachers: 'Unlimited teachers',
    advancedAnalytics: 'Advanced analytics',
    prioritySupport: 'Priority support',
    customBranding: 'Custom branding',
    apiAccess: 'API access',
    dataExport: 'Data export',
    choosePremium: 'Choose Premium',
    freeTrial14Days: 'All plans include a 14-day free trial. Cancel anytime.',

    // Documentation
    documentation: 'Documentation',
    documentationDesc: 'Complete guide to using LearnKick Admin',

    // Languages
    languages: {
      en: '🇬🇧 English',
      de: '🇩🇪 German',
      fr: '🇫🇷 French',
      sq: '🇦🇱 Albanian'
    }
  },
  
  de: {
    // Login
    title: 'LearnKick Admin',
    welcomeBack: 'Willkommen zurück',
    signInToAccess: 'Anmelden für Zugang zum Admin-Panel',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    login: 'Anmelden',
    signIn: 'Anmelden',
    signingIn: 'Anmeldung läuft...',
    
    // School Setup
    schoolAdmin: 'Schul-Administrator',
    parent: 'Elternteil',
    createSchoolAccount: 'Schulkonto erstellen',
    joinSchoolAsParent: 'Als Elternteil einer Schule beitreten',
    fullName: 'Vollständiger Name',
    confirmPassword: 'Passwort bestätigen',
    createAccount: 'Konto erstellen',
    creating: 'Erstellen...',
    
    // Navigation
    overview: 'Übersicht',
    dashboard: 'Dashboard',
    questionBank: 'Fragenbank',
    userManagement: 'Benutzerverwaltung',
    analytics: 'Analysen',
    offersManagement: 'Angebotsverwaltung',
    schoolSettings: 'Schuleinstellungen',
    
    // Dashboard
    dashboardOverview: 'Dashboard-Übersicht',
    welcomeMessage: 'Das passiert in Ihrer Schule',
    totalQuestions: 'Fragen gesamt',
    schoolUsers: 'Schulbenutzer',
    gamesPlayed: 'Gespielte Spiele',
    avgAccuracy: 'Durchschn. Genauigkeit',
    active: 'Aktiv',
    setupNeeded: 'Einrichtung erforderlich',
    noGames: 'Keine Spiele',
    noData: 'Keine Daten',
    good: 'Gut',
    fair: 'Ausreichend',
    
    // Quick Actions
    quickActions: 'Schnellaktionen',
    addQuestions: 'Fragen hinzufügen',
    importCSV: 'CSV importieren oder neu erstellen',
    inviteTeacher: 'Lehrer einladen',
    exportData: 'Daten exportieren',
    viewAnalytics: 'Analysen anzeigen',
    
    // Recent Activity
    recentActivity: 'Letzte Aktivitäten',
    recentGameSessions: 'Letzte Spielsitzungen',
    noGameSessions: 'Noch keine Spielsitzungen',
    studentsWillAppear: 'Schüler erscheinen hier nach dem Spielen',
    
    // Question Management
    questionManagement: 'Fragenverwaltung',
    addQuestion: 'Frage hinzufügen',
    editQuestion: 'Frage bearbeiten',
    deleteQuestion: 'Frage löschen',
    exportCSV: 'CSV exportieren',
    totalQuestionsAvailable: 'Verfügbare Fragen gesamt',
    questionsBySubject: 'Fragen nach Fach',
    questionsByGrade: 'Fragen nach Klasse',
    importFromCSV: 'Aus CSV importieren',
    
    // User Management
    userManagementTitle: 'Benutzerverwaltung',
    manageUsers: 'Lehrer, Eltern und Schüler in Ihrer Schule verwalten',
    inviteUser: 'Benutzer einladen',
    teachers: 'Lehrer',
    parents: 'Eltern',
    students: 'Schüler',
    pendingInvites: 'Ausstehende Einladungen',
    user: 'Benutzer',
    role: 'Rolle',
    status: 'Status',
    lastActive: 'Zuletzt aktiv',
    actions: 'Aktionen',
    noUsersFound: 'Keine Benutzer gefunden',
    inviteTeachersParents: 'Lehrer und Eltern einladen zum Anfangen',
    
    // Analytics
    analyticsTitle: 'Analyse-Dashboard',
    trackPerformance: 'Schülerleistung und Lernfortschritt verfolgen',
    performanceBySubject: 'Leistung nach Fach',
    performanceByGrade: 'Leistung nach Klasse',
    performanceTrends: 'Leistungstrends',
    topPerformers: 'Top-Performer dieser Woche',
    accuracy: 'Genauigkeit',
    questionsAnswered: 'Beantwortete Fragen',
    
    // Settings
    settings: 'Einstellungen',

    // Common
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    view: 'Anzeigen',
    close: 'Schließen',
    refresh: 'Aktualisieren',
    
    // Time
    justNow: 'Gerade eben',
    hoursAgo: 'Std. her',
    daysAgo: 'T. her',
    never: 'Niemals',
    last7Days: 'Letzte 7 Tage',
    last30Days: 'Letzte 30 Tage',
    last3Months: 'Letzte 3 Monate',
    lastYear: 'Letztes Jahr',
    
    // Additional Analytics
    unknownStudent: 'Unbekannter Schüler',
    grade: 'Klasse',
    estimated: 'geschätzt',
    chartsWillBeImplemented: 'Interaktive Diagramme werden implementiert',
    withChartingLibrary: 'mit einer Diagramm-Bibliothek wie Chart.js',
    min: 'Min',
    questions: 'Fragen',
    
    // Question Bank Manager
    questionBankManager: 'Fragenbankmanager',
    manageContent: 'Verwalten und organisieren Sie Lehrinhalte für Ihre Schule',
    filtersAndSearch: 'Filter & Suche',
    searchQuestions: 'Fragen suchen',
    searchPlaceholder: 'Fragen, Antworten suchen...',
    subject: 'Fach',
    allSubjects: 'Alle Fächer',
    mathematics: 'Mathematik',
    geography: 'Geographie',
    language: 'Sprache',
    generalKnowledge: 'Allgemeinwissen',
    allGrades: 'Alle Klassen',
    difficulty: 'Schwierigkeit',
    allDifficulties: 'Alle Schwierigkeiten',
    veryEasy: '⭐ Sehr einfach',
    easy: '⭐⭐ Einfach',
    medium: '⭐⭐⭐ Mittel',
    hard: '⭐⭐⭐⭐ Schwer',
    veryHard: '⭐⭐⭐⭐⭐ Sehr schwer',
    questionType: 'Fragetyp',
    allTypes: 'Alle Typen',
    multipleChoice: 'Multiple Choice',
    trueFalse: 'Wahr/Falsch',
    numberInput: 'Zahleneingabe',
    imageQuestion: 'Bildfrage',
    allLanguages: 'Alle Sprachen',
    bulkActions: 'Massenaktionen',
    importing: 'Importiere...',
    deleteSelected: 'Ausgewählte löschen',
    showingQuestions: 'Zeige',
    selectAll: 'Alle auswählen',
    loadingQuestions: 'Lade Fragen...',
    noQuestionsFound: 'Keine Fragen gefunden',
    adjustFilters: 'Versuchen Sie die Filter anzupassen oder Fragen hinzuzufügen',
    answers: 'Antworten',
    correct: 'Korrekt',
    created: 'Erstellt',
    unknown: 'Unbekannt',
    page: 'Seite',
    of: 'von',
    previous: 'Zurück',
    next: 'Weiter',
    
    // School Settings
    schoolSettingsTitle: 'Schuleinstellungen',
    configureSettings: 'Konfigurieren Sie die LearnKick-Einstellungen und -Präferenzen Ihrer Schule',
    schoolInformation: 'Schulinformationen',
    schoolName: 'Schulname',
    schoolCode: 'Schulcode',
    copy: 'Kopieren',
    shareCode: 'Teilen Sie diesen Code mit Eltern, um Ihrer Schule beizutreten',
    subscriptionPlan: 'Abonnementplan',
    freePlan: 'Kostenloser Plan',
    accessControl: 'Zugriffskontrolle',
    allowParentRegistration: 'Eltern-Selbstregistrierung erlauben',
    parentsCanJoin: 'Eltern können mit dem Schulcode beitreten',
    requireAdminApproval: 'Admin-Genehmigung erforderlich',
    newUsersApproval: 'Neue Benutzer müssen vor dem Zugriff genehmigt werden',
    gameSettings: 'Spieleinstellungen',
    defaultTimeLimit: 'Standard-Zeitlimit (Sekunden)',
    maxStudentsPerClass: 'Max. Schüler pro Klasse',
    generateNewCode: 'Neuen Schulcode generieren',
    inviteTeachers: 'Lehrer einladen',
    emailAllParents: 'Alle Eltern per E-Mail kontaktieren',
    currentPlan: 'Aktueller Plan',
    youreOnFreePlan: 'Sie haben den kostenlosen Plan',
    upTo50Students: '• Bis zu 50 Schüler',
    threeTeachers: '• 3 Lehrer',
    basicAnalytics: '• Grundlegende Analytik',
    communitySupport: '• Community-Support',
    upgradePlan: 'Plan upgraden',
    saveSettings: 'Einstellungen speichern',
    
    // Missing Dashboard Elements
    signOut: 'Abmelden',
    schoolCodeLabel: 'Schulcode:',
    
    // Quick Action Labels & Descriptions  
    addQuestionsLabel: 'Fragen hinzufügen',
    addQuestionsDesc: 'CSV importieren oder neu erstellen',
    inviteTeacherLabel: 'Lehrer einladen',
    inviteTeacherDesc: 'Neue Teammitglieder hinzufügen',
    exportDataLabel: 'Daten exportieren',
    exportDataDesc: 'Berichte herunterladen',
    viewAnalyticsLabel: 'Analysen anzeigen',
    viewAnalyticsDesc: 'Schülerleistung',
    student: 'Schüler',
    completed: 'abgeschlossen',

    // Subject Management
    subjectManagement: 'Fächerverwaltung',
    subjects: 'Fächer',
    addSubject: 'Fach hinzufügen',
    editSubject: 'Fach bearbeiten',
    deleteSubject: 'Fach löschen',
    subjectName: 'Fachname',
    subjectSlug: 'Slug (URL-freundlicher Bezeichner)',
    subjectIcon: 'Symbol',
    subjectColor: 'Farbe',
    subjectDescription: 'Beschreibung',
    createSubject: 'Fach erstellen',
    updateSubject: 'Fach aktualisieren',
    manageSubjects: 'Verfügbare Fächer für Fragen verwalten',
    availableSubjects: 'Verfügbare Fächer',
    systemSubjects: 'System',
    schoolSubjects: 'Schulspezifisch',

    // Add Question Modal
    addNewQuestion: 'Neue Frage hinzufügen',
    createQuestion: 'Frage erstellen',
    questionText: 'Frage',
    statement: 'Aussage',
    answerOptions: 'Antwortmöglichkeiten',
    correctAnswer: 'Richtige Antwort',
    timeLimit: 'Zeitlimit',
    tags: 'Tags',
    explanation: 'Erklärung',
    tolerance: 'Toleranz',
    unit: 'Einheit',
    imageUrl: 'Bild-URL',
    preview: 'Vorschau',
    required: 'erforderlich',
    optional: 'optional',
    seconds: 'Sekunden',

    // User Management Actions
    editUser: 'Benutzer bearbeiten',
    deleteUser: 'Benutzer löschen',
    suspendUser: 'Benutzer sperren',
    activateUser: 'Benutzer aktivieren',
    viewDetails: 'Details anzeigen',
    userActions: 'Benutzeraktionen',
    editUserProfile: 'Benutzerprofil bearbeiten',
    deleteUserConfirm: 'Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?',
    suspendUserConfirm: 'Sind Sie sicher, dass Sie diesen Benutzer sperren möchten?',
    permanentlyDelete: 'Benutzer endgültig löschen',
    cannotBeUndone: 'Diese Aktion kann nicht rückgängig gemacht werden.',

    // School Settings Functions
    saveChanges: 'Änderungen speichern',
    generateCode: 'Neuen Code generieren',
    exportUserData: 'Benutzerdaten exportieren',
    saveNotifications: 'Benachrichtigungen speichern',
    uploadLogo: 'Logo hochladen',
    settingsSaved: 'Einstellungen erfolgreich gespeichert!',
    codeGenerated: 'Neuer Schulcode generiert!',
    dataExported: 'Daten erfolgreich exportiert!',

    // Offers Manager
    useTemplate: 'Vorlage verwenden',
    createTemplate: 'Vorlage erstellen',
    editTemplate: 'Vorlage bearbeiten',
    newQuote: 'Neues Angebot',
    viewQuote: 'Angebot anzeigen',
    editQuote: 'Angebot bearbeiten',
    sendQuote: 'Angebot senden',
    createSegment: 'Segment erstellen',
    editSegment: 'Segment bearbeiten',
    targetSegment: 'Zielsegment',
    createTargetedOffer: 'Gezieltes Angebot erstellen',
    totalRevenue: 'Gesamtumsatz',
    activeOffers: 'Aktive Angebote',
    conversionRate: 'Konversionsrate',
    totalLeads: 'Gesamte Leads',

    // Analytics Dashboard
    performanceTrendsChart: 'Leistungstrends',
    averageAccuracyOverTime: 'Durchschnittliche Genauigkeit im Zeitverlauf',
    studentPerformanceTrends: 'Schüler-Leistungstrends',
    noDataAvailable: 'Keine Daten verfügbar',

    // General Actions
    send: 'Senden',
    create: 'Erstellen',
    update: 'Aktualisieren',
    confirm: 'Bestätigen',
    yes: 'Ja',
    no: 'Nein',
    warning: 'Warnung',
    info: 'Info',

    // Validation Messages
    fieldRequired: 'Dieses Feld ist erforderlich',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    passwordTooShort: 'Das Passwort muss mindestens 6 Zeichen lang sein',
    passwordMismatch: 'Die Passwörter stimmen nicht überein',
    invalidSlug: 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    slugTaken: 'Dieser Slug ist bereits vergeben',
    invalidColor: 'Bitte geben Sie einen gültigen Hex-Farbcode ein',
    invalidUrl: 'Bitte geben Sie eine gültige URL ein',
    minimumAnswers: 'Mindestens 2 Antwortmöglichkeiten sind erforderlich',
    validNumber: 'Bitte geben Sie eine gültige Zahl ein',
    timeLimitRange: 'Das Zeitlimit muss zwischen 5 und 300 Sekunden liegen',

    // NEW: Missing keys from audit
    help: 'Hilfe',
    platformOverview: 'Plattformübersicht',
    manageSchools: 'Schulen verwalten',
    globalQuestions: 'Globale Fragen',
    platformAnalytics: 'Plattformanalysen',
    platformSettings: 'Plattformeinstellungen',
    adminActions: 'Admin-Aktionen',
    notifications: 'Benachrichtigungen',
    messages: 'Nachrichten',
    profileSettings: 'Profileinstellungen',
    preferences: 'Einstellungen',
    exportFailed: 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
    uploadCSV: 'CSV hochladen',
    createManually: 'Manuell erstellen',
    importFromTemplate: 'Aus Vorlage importieren',
    manageUsersAction: 'Benutzer verwalten',
    exportAllData: 'Alle Daten exportieren',
    exportUsers: 'Benutzer exportieren',
    exportQuestions: 'Fragen exportieren',
    exportAnalytics: 'Analysen exportieren',
    performanceAnalytics: 'Leistungsanalysen',
    userActivity: 'Benutzeraktivität',
    questionStats: 'Fragenstatistiken',
    commonAdminTasks: 'Häufige Administrationsaufgaben zum Einstieg',
    dismiss: 'Schliessen',
    showingQuestionsCount: 'Zeige {count} von {total} Fragen',
    deleteSelectedCount: 'Ausgewählte löschen ({count})',
    pageXOfY: 'Seite {page} von {total}',
    questionRequired: 'Frage ist erforderlich',
    allAnswersRequired: 'Alle Antwortoptionen sind erforderlich',
    statementRequired: 'Aussage ist erforderlich',
    imageUrlRequired: 'Bild-URL ist erforderlich',
    noFileSelected: 'Keine Datei ausgewählt. Bitte wählen Sie eine CSV-Datei aus.',
    invalidCsvFile: 'Bitte wählen Sie eine gültige CSV-Datei (.csv-Erweiterung erforderlich).',
    processingFile: 'Verarbeite {filename}...',
    importingQuestions: 'Importiere {count} Fragen...',
    importCompleted: 'Import abgeschlossen',
    csvParseFailed: 'CSV-Datei konnte nicht gelesen werden. Bitte überprüfen Sie das Format.',
    failedCreateQuestion: 'Frage konnte nicht erstellt werden',
    searchPlaceholderDetailed: 'Nach Fragetext, Fach oder ID suchen...',
    gradeN: 'Klasse {n}',
    answerN: 'Antwort {n}',
    correctMark: '✓ Korrekt',
    option: 'Option',
    questionPlaceholder: 'Geben Sie hier Ihre Frage ein...',
    statementPlaceholder: 'Geben Sie eine Aussage ein, die wahr oder falsch sein kann...',
    timeLimitSeconds: 'Zeitlimit (Sekunden)',
    tagsPlaceholder: 'mathe, algebra, gleichungen',
    explanationPlaceholder: 'Erklärung für die richtige Antwort...',
    unitExamples: 'cm, kg, °C',
    imageUrlPlaceholder: 'https://beispiel.com/bild.jpg',
    uploadImage: 'Bild hochladen',
    imageQuestionPlaceholder: 'Was sehen Sie in diesem Bild?',
    educationalManagementSystem: 'Bildungsmanagementsystem',
    signInToDashboard: 'Zum Dashboard anmelden',
    createSchoolAdmin: 'Schuladmin erstellen',
    createAdminAccount: 'Admin-Konto erstellen',
    createParentAccount: 'Elternkonto erstellen',
    joinChildLearningJourney: 'Die Lernreise Ihres Kindes begleiten',
    emailPlaceholder: 'admin@schule.ch',
    passwordPlaceholder: 'Passwort eingeben',
    fullNamePlaceholder: 'Ihr vollständiger Name',
    schoolNamePlaceholder: 'Name Ihrer Schule',
    createPasswordPlaceholder: 'Passwort erstellen',
    confirmPasswordPlaceholder: 'Passwort bestätigen',
    parentEmailPlaceholder: 'eltern@email.com',
    schoolCodePlaceholder: 'Schulcode eingeben',
    invitationsCreatedSuccess: '{count} Einladung(en) erfolgreich erstellt! Teilen Sie die Codes mit Benutzern.',
    invitationLinkGenerated: 'Einladungslink generiert! Teilen Sie diesen Code mit Benutzern.',
    inviteDialogDescription: 'Senden Sie Einladungen an neue Benutzer oder generieren Sie Einladungslinks für Ihre Schule.',
    invitationMethod: 'Einladungsmethode',
    sendEmail: 'E-Mail senden',
    generateLink: 'Link generieren',
    emailAddresses: 'E-Mail-Adressen',
    userEmailPlaceholder: 'benutzer@beispiel.com',
    addAnotherEmail: 'Weitere E-Mail hinzufügen',
    inviteEmailInstruction: 'Einladungen werden per E-Mail gesendet',
    inviteLinkInstruction: 'Generieren Sie einen Link zum Teilen',
    sending: 'Sende...',
    generating: 'Generiere...',
    sendInvitations: 'Einladungen senden',
    invitationCodes: 'Einladungscodes:',
    copied: 'Kopiert',
    sendMoreInvitations: 'Weitere Einladungen senden',
    done: 'Fertig',
    updateUserInfoDescription: 'Benutzerinformationen und Rollenzuweisungen aktualisieren.',
    enterFullName: 'Vollständigen Namen eingeben',
    enterEmail: 'E-Mail eingeben',
    teacher: 'Lehrer',
    deleteUserConfirmMessage: 'Sind Sie sicher, dass Sie {name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    newSchoolCodeGenerated: 'Neuer Schulcode generiert: {code}',
    saving: 'Speichere...',
    inviteTeachersInstructions: 'Verwenden Sie die Benutzerverwaltung, um Lehrereinladungen mit voller Kontrolle über den Einladungsprozess zu senden.',
    goToUserManagementPrompt: 'Bitte gehen Sie zur Benutzerverwaltung, um Lehrer einzuladen',
    goToUserManagement: 'Zur Benutzerverwaltung',
    emailSubject: 'Betreff',
    emailSubjectPlaceholder: 'Wichtige Schulankündigung',
    message: 'Nachricht',
    emailMessagePlaceholder: 'Liebe Eltern, wir möchten Sie informieren über...',
    emailAllParentsWarning: 'Dies sendet eine E-Mail an alle registrierten Eltern in Ihrer Schule.',
    upgradeYourPlan: 'Plan upgraden',
    basicPlan: 'Basis-Plan',
    premiumPlan: 'Premium-Plan',
    chooseBasic: 'Basis wählen',
    choosePremium: 'Premium wählen',
    planTrialDisclaimer: 'Alle Pläne beinhalten eine 14-tägige kostenlose Testversion. Jederzeit kündbar.',
    unlimitedStudents: 'Unbegrenzte Schüler',
    unlimitedTeachers: 'Unbegrenzte Lehrer',
    advancedAnalytics: 'Erweiterte Analysen',
    prioritySupport: 'Prioritäts-Support',
    customBranding: 'Benutzerdefiniertes Branding',
    apiAccess: 'API-Zugang',
    dataExport: 'Datenexport',

    // Languages
    languages: {
      en: '🇬🇧 Englisch',
      de: '🇩🇪 Deutsch',
      fr: '🇫🇷 Französisch',
      sq: '🇦🇱 Albanisch'
    }
  },

  fr: {
    // Login
    title: 'Admin LearnKick',
    welcomeBack: 'Bon retour',
    signInToAccess: 'Connectez-vous pour accéder au panneau d\'administration',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    login: 'Connexion',
    signIn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    
    // School Setup
    schoolAdmin: 'Administrateur d\'école',
    parent: 'Parent',
    createSchoolAccount: 'Créer votre compte d\'école',
    joinSchoolAsParent: 'Rejoindre une école en tant que parent',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmer le mot de passe',
    createAccount: 'Créer un compte',
    creating: 'Création...',
    
    // Navigation
    overview: 'Vue d\'ensemble',
    dashboard: 'Tableau de bord',
    questionBank: 'Banque de questions',
    userManagement: 'Gestion des utilisateurs',
    analytics: 'Analyses',
    offersManagement: 'Gestion des offres',
    schoolSettings: 'Paramètres de l\'école',
    
    // Dashboard
    dashboardOverview: 'Vue d\'ensemble du tableau de bord',
    welcomeMessage: 'Voici ce qui se passe dans votre école',
    totalQuestions: 'Total des questions',
    schoolUsers: 'Utilisateurs de l\'école',
    gamesPlayed: 'Jeux joués',
    avgAccuracy: 'Précision moyenne',
    active: 'Actif',
    setupNeeded: 'Configuration requise',
    noGames: 'Aucun jeu',
    noData: 'Aucune donnée',
    good: 'Bon',
    fair: 'Correct',
    
    // Quick Actions
    quickActions: 'Actions rapides',
    addQuestions: 'Ajouter des questions',
    importCSV: 'Importer CSV ou créer nouveau',
    inviteTeacher: 'Inviter un enseignant',
    exportData: 'Exporter les données',
    viewAnalytics: 'Voir les analyses',
    
    // Recent Activity
    recentActivity: 'Activité récente',
    recentGameSessions: 'Sessions de jeu récentes',
    noGameSessions: 'Aucune session de jeu encore',
    studentsWillAppear: 'Les étudiants apparaîtront ici après avoir joué',
    
    // Question Management
    questionManagement: 'Gestion des questions',
    addQuestion: 'Ajouter une question',
    editQuestion: 'Modifier la question',
    deleteQuestion: 'Supprimer la question',
    exportCSV: 'Exporter CSV',
    totalQuestionsAvailable: 'Questions disponibles au total',
    questionsBySubject: 'Questions par matière',
    questionsByGrade: 'Questions par classe',
    importFromCSV: 'Importer depuis CSV',
    
    // User Management
    userManagementTitle: 'Gestion des utilisateurs',
    manageUsers: 'Gérer les enseignants, parents et étudiants de votre école',
    inviteUser: 'Inviter un utilisateur',
    teachers: 'Enseignants',
    parents: 'Parents',
    students: 'Étudiants',
    pendingInvites: 'Invitations en attente',
    user: 'Utilisateur',
    role: 'Rôle',
    status: 'Statut',
    lastActive: 'Dernière activité',
    actions: 'Actions',
    noUsersFound: 'Aucun utilisateur trouvé',
    inviteTeachersParents: 'Inviter des enseignants et des parents pour commencer',
    
    // Analytics
    analyticsTitle: 'Tableau de bord d\'analyse',
    trackPerformance: 'Suivre les performances des étudiants et les progrès d\'apprentissage',
    performanceBySubject: 'Performance par matière',
    performanceByGrade: 'Performance par classe',
    performanceTrends: 'Tendances de performance',
    topPerformers: 'Meilleurs performeurs cette semaine',
    accuracy: 'Précision',
    questionsAnswered: 'Questions répondues',
    
    // Settings
    settings: 'Paramètres',

    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    close: 'Fermer',
    refresh: 'Actualiser',
    
    // Time
    justNow: 'À l\'instant',
    hoursAgo: 'h',
    daysAgo: 'j',
    never: 'Jamais',
    last7Days: '7 derniers jours',
    last30Days: '30 derniers jours',
    last3Months: '3 derniers mois',
    lastYear: 'Dernière année',
    
    // Additional Analytics
    unknownStudent: 'Étudiant inconnu',
    grade: 'Classe',
    estimated: 'estimé',
    chartsWillBeImplemented: 'Les graphiques interactifs seront implémentés',
    withChartingLibrary: 'avec une bibliothèque de graphiques comme Chart.js',
    min: 'min',
    questions: 'questions',
    
    // Question Bank Manager
    questionBankManager: 'Gestionnaire de banque de questions',
    manageContent: 'Gérer et organiser le contenu éducatif de votre école',
    filtersAndSearch: 'Filtres et recherche',
    searchQuestions: 'Rechercher des questions',
    searchPlaceholder: 'Rechercher questions, réponses...',
    subject: 'Matière',
    allSubjects: 'Toutes les matières',
    mathematics: 'Mathématiques',
    geography: 'Géographie',
    language: 'Langue',
    generalKnowledge: 'Culture générale',
    allGrades: 'Toutes les classes',
    difficulty: 'Difficulté',
    allDifficulties: 'Toutes les difficultés',
    veryEasy: '⭐ Très facile',
    easy: '⭐⭐ Facile',
    medium: '⭐⭐⭐ Moyen',
    hard: '⭐⭐⭐⭐ Difficile',
    veryHard: '⭐⭐⭐⭐⭐ Très difficile',
    questionType: 'Type de question',
    allTypes: 'Tous les types',
    multipleChoice: 'Choix multiple',
    trueFalse: 'Vrai/Faux',
    numberInput: 'Saisie numérique',
    imageQuestion: 'Question avec image',
    allLanguages: 'Toutes les langues',
    bulkActions: 'Actions groupées',
    importing: 'Importation...',
    deleteSelected: 'Supprimer sélectionnés',
    showingQuestions: 'Affichage',
    selectAll: 'Tout sélectionner',
    loadingQuestions: 'Chargement des questions...',
    noQuestionsFound: 'Aucune question trouvée',
    adjustFilters: 'Essayez d\'ajuster vos filtres ou d\'ajouter des questions',
    answers: 'Réponses',
    correct: 'Correct',
    created: 'Créé',
    unknown: 'Inconnu',
    page: 'Page',
    of: 'de',
    previous: 'Précédent',
    next: 'Suivant',
    
    // School Settings
    schoolSettingsTitle: 'Paramètres de l\'école',
    configureSettings: 'Configurez les paramètres et préférences LearnKick de votre école',
    schoolInformation: 'Informations de l\'école',
    schoolName: 'Nom de l\'école',
    schoolCode: 'Code de l\'école',
    copy: 'Copier',
    shareCode: 'Partagez ce code avec les parents pour rejoindre votre école',
    subscriptionPlan: 'Plan d\'abonnement',
    freePlan: 'Plan gratuit',
    accessControl: 'Contrôle d\'accès',
    allowParentRegistration: 'Autoriser l\'auto-inscription des parents',
    parentsCanJoin: 'Les parents peuvent rejoindre avec le code de l\'école',
    requireAdminApproval: 'Exiger l\'approbation de l\'administrateur',
    newUsersApproval: 'Les nouveaux utilisateurs doivent être approuvés avant l\'accès',
    gameSettings: 'Paramètres de jeu',
    defaultTimeLimit: 'Limite de temps par défaut (secondes)',
    maxStudentsPerClass: 'Max d\'étudiants par classe',
    generateNewCode: 'Générer un nouveau code d\'école',
    inviteTeachers: 'Inviter des professeurs',
    emailAllParents: 'Envoyer un email à tous les parents',
    currentPlan: 'Plan actuel',
    youreOnFreePlan: 'Vous êtes sur le plan gratuit',
    upTo50Students: '• Jusqu\'à 50 étudiants',
    threeTeachers: '• 3 professeurs',
    basicAnalytics: '• Analyses de base',
    communitySupport: '• Support communautaire',
    upgradePlan: 'Mettre à niveau le plan',
    saveSettings: 'Sauvegarder les paramètres',
    
    // Missing Dashboard Elements
    signOut: 'Se déconnecter',
    schoolCodeLabel: 'Code de l\'école:',
    
    // Quick Action Labels & Descriptions  
    addQuestionsLabel: 'Ajouter des questions',
    addQuestionsDesc: 'Importer CSV ou créer nouveau',
    inviteTeacherLabel: 'Inviter un professeur',
    inviteTeacherDesc: 'Ajouter de nouveaux membres',
    exportDataLabel: 'Exporter les données',
    exportDataDesc: 'Télécharger les rapports',
    viewAnalyticsLabel: 'Voir les analyses',
    viewAnalyticsDesc: 'Performance des étudiants',
    student: 'Étudiant',
    completed: 'terminé',

    // Subject Management
    subjectManagement: 'Gestion des matières',
    subjects: 'Matières',
    addSubject: 'Ajouter une matière',
    editSubject: 'Modifier la matière',
    deleteSubject: 'Supprimer la matière',
    subjectName: 'Nom de la matière',
    subjectSlug: 'Slug (identifiant URL)',
    subjectIcon: 'Icône',
    subjectColor: 'Couleur',
    subjectDescription: 'Description',
    createSubject: 'Créer la matière',
    updateSubject: 'Mettre à jour la matière',
    manageSubjects: 'Gérer les matières disponibles pour les questions',
    availableSubjects: 'Matières disponibles',
    systemSubjects: 'Système',
    schoolSubjects: 'École personnalisé',

    // Add Question Modal
    addNewQuestion: 'Ajouter une nouvelle question',
    createQuestion: 'Créer la question',
    questionText: 'Question',
    statement: 'Déclaration',
    answerOptions: 'Options de réponse',
    correctAnswer: 'Réponse correcte',
    timeLimit: 'Limite de temps',
    tags: 'Tags',
    explanation: 'Explication',
    tolerance: 'Tolérance',
    unit: 'Unité',
    imageUrl: 'URL de l\'image',
    preview: 'Aperçu',
    required: 'requis',
    optional: 'optionnel',
    seconds: 'secondes',

    // User Management Actions
    editUser: 'Modifier l\'utilisateur',
    deleteUser: 'Supprimer l\'utilisateur',
    suspendUser: 'Suspendre l\'utilisateur',
    activateUser: 'Activer l\'utilisateur',
    viewDetails: 'Voir les détails',
    userActions: 'Actions utilisateur',
    editUserProfile: 'Modifier le profil utilisateur',
    deleteUserConfirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur?',
    suspendUserConfirm: 'Êtes-vous sûr de vouloir suspendre cet utilisateur?',
    permanentlyDelete: 'Supprimer définitivement l\'utilisateur',
    cannotBeUndone: 'Cette action ne peut pas être annulée.',

    // School Settings Functions
    saveChanges: 'Enregistrer les modifications',
    generateCode: 'Générer un nouveau code',
    exportUserData: 'Exporter les données utilisateurs',
    saveNotifications: 'Enregistrer les notifications',
    uploadLogo: 'Télécharger le logo',
    settingsSaved: 'Paramètres enregistrés avec succès!',
    codeGenerated: 'Nouveau code d\'école généré!',
    dataExported: 'Données exportées avec succès!',

    // Offers Manager
    useTemplate: 'Utiliser le modèle',
    createTemplate: 'Créer un modèle',
    editTemplate: 'Modifier le modèle',
    newQuote: 'Nouveau devis',
    viewQuote: 'Voir le devis',
    editQuote: 'Modifier le devis',
    sendQuote: 'Envoyer le devis',
    createSegment: 'Créer un segment',
    editSegment: 'Modifier le segment',
    targetSegment: 'Segment cible',
    createTargetedOffer: 'Créer une offre ciblée',
    totalRevenue: 'Revenu total',
    activeOffers: 'Offres actives',
    conversionRate: 'Taux de conversion',
    totalLeads: 'Total des prospects',

    // Analytics Dashboard
    performanceTrendsChart: 'Tendances de performance',
    averageAccuracyOverTime: 'Précision moyenne au fil du temps',
    studentPerformanceTrends: 'Tendances de performance des étudiants',
    noDataAvailable: 'Aucune donnée disponible',

    // General Actions
    send: 'Envoyer',
    create: 'Créer',
    update: 'Mettre à jour',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    warning: 'Avertissement',
    info: 'Info',

    // Validation Messages
    fieldRequired: 'Ce champ est requis',
    invalidEmail: 'Veuillez entrer une adresse email valide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    invalidSlug: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets',
    slugTaken: 'Ce slug est déjà utilisé',
    invalidColor: 'Veuillez entrer un code couleur hexadécimal valide',
    invalidUrl: 'Veuillez entrer une URL valide',
    minimumAnswers: 'Au moins 2 options de réponse sont requises',
    validNumber: 'Veuillez entrer un nombre valide',
    timeLimitRange: 'La limite de temps doit être entre 5 et 300 secondes',

    // NEW: Missing keys from audit
    help: 'Aide',
    platformOverview: 'Vue d\'ensemble de la plateforme',
    manageSchools: 'Gérer les écoles',
    globalQuestions: 'Questions globales',
    platformAnalytics: 'Analyses de la plateforme',
    platformSettings: 'Paramètres de la plateforme',
    adminActions: 'Actions admin',
    notifications: 'Notifications',
    messages: 'Messages',
    profileSettings: 'Paramètres du profil',
    preferences: 'Préférences',
    exportFailed: 'Échec de l\'exportation. Veuillez réessayer.',
    uploadCSV: 'Télécharger CSV',
    createManually: 'Créer manuellement',
    importFromTemplate: 'Importer depuis un modèle',
    manageUsersAction: 'Gérer les utilisateurs',
    exportAllData: 'Exporter toutes les données',
    exportUsers: 'Exporter les utilisateurs',
    exportQuestions: 'Exporter les questions',
    exportAnalytics: 'Exporter les analyses',
    performanceAnalytics: 'Analyses de performance',
    userActivity: 'Activité des utilisateurs',
    questionStats: 'Statistiques des questions',
    commonAdminTasks: 'Tâches administratives courantes pour commencer',
    dismiss: 'Fermer',
    showingQuestionsCount: 'Affichage de {count} sur {total} questions',
    deleteSelectedCount: 'Supprimer sélectionnés ({count})',
    pageXOfY: 'Page {page} sur {total}',
    questionRequired: 'La question est requise',
    allAnswersRequired: 'Toutes les options de réponse sont requises',
    statementRequired: 'La déclaration est requise',
    imageUrlRequired: 'L\'URL de l\'image est requise',
    noFileSelected: 'Aucun fichier sélectionné. Veuillez choisir un fichier CSV.',
    invalidCsvFile: 'Veuillez sélectionner un fichier CSV valide (extension .csv requise).',
    processingFile: 'Traitement de {filename}...',
    importingQuestions: 'Importation de {count} questions...',
    importCompleted: 'Importation terminée',
    csvParseFailed: 'Impossible de lire le fichier CSV. Veuillez vérifier le format.',
    failedCreateQuestion: 'Impossible de créer la question',
    searchPlaceholderDetailed: 'Rechercher par texte, matière ou ID...',
    gradeN: 'Classe {n}',
    answerN: 'Réponse {n}',
    correctMark: '✓ Correct',
    option: 'Option',
    questionPlaceholder: 'Entrez votre question ici...',
    statementPlaceholder: 'Entrez une déclaration qui peut être vraie ou fausse...',
    timeLimitSeconds: 'Limite de temps (secondes)',
    tagsPlaceholder: 'maths, algèbre, équations',
    explanationPlaceholder: 'Explication pour la réponse correcte...',
    unitExamples: 'cm, kg, °C',
    imageUrlPlaceholder: 'https://exemple.com/image.jpg',
    uploadImage: 'Télécharger une image',
    imageQuestionPlaceholder: 'Que voyez-vous dans cette image?',
    educationalManagementSystem: 'Système de gestion éducative',
    signInToDashboard: 'Se connecter au tableau de bord',
    createSchoolAdmin: 'Créer un admin d\'école',
    createAdminAccount: 'Créer un compte admin',
    createParentAccount: 'Créer un compte parent',
    joinChildLearningJourney: 'Accompagner le parcours d\'apprentissage de votre enfant',
    emailPlaceholder: 'admin@ecole.ch',
    passwordPlaceholder: 'Entrez le mot de passe',
    fullNamePlaceholder: 'Votre nom complet',
    schoolNamePlaceholder: 'Nom de votre école',
    createPasswordPlaceholder: 'Créer un mot de passe',
    confirmPasswordPlaceholder: 'Confirmer le mot de passe',
    parentEmailPlaceholder: 'parent@email.com',
    schoolCodePlaceholder: 'Entrez le code de l\'école',
    invitationsCreatedSuccess: '{count} invitation(s) créée(s) avec succès! Partagez les codes avec les utilisateurs.',
    invitationLinkGenerated: 'Lien d\'invitation généré! Partagez ce code avec les utilisateurs.',
    inviteDialogDescription: 'Envoyez des invitations aux nouveaux utilisateurs ou générez des liens d\'invitation pour votre école.',
    invitationMethod: 'Méthode d\'invitation',
    sendEmail: 'Envoyer un email',
    generateLink: 'Générer un lien',
    emailAddresses: 'Adresses email',
    userEmailPlaceholder: 'utilisateur@exemple.com',
    addAnotherEmail: 'Ajouter un autre email',
    inviteEmailInstruction: 'Les invitations seront envoyées par email',
    inviteLinkInstruction: 'Générez un lien à partager',
    sending: 'Envoi...',
    generating: 'Génération...',
    sendInvitations: 'Envoyer les invitations',
    invitationCodes: 'Codes d\'invitation:',
    copied: 'Copié',
    sendMoreInvitations: 'Envoyer plus d\'invitations',
    done: 'Terminé',
    updateUserInfoDescription: 'Mettre à jour les informations utilisateur et les attributions de rôles.',
    enterFullName: 'Entrez le nom complet',
    enterEmail: 'Entrez l\'email',
    teacher: 'Professeur',
    deleteUserConfirmMessage: 'Êtes-vous sûr de vouloir supprimer {name}? Cette action ne peut pas être annulée.',
    newSchoolCodeGenerated: 'Nouveau code d\'école généré: {code}',
    saving: 'Enregistrement...',
    inviteTeachersInstructions: 'Utilisez la gestion des utilisateurs pour envoyer des invitations aux professeurs avec un contrôle total sur le processus.',
    goToUserManagementPrompt: 'Veuillez aller à la gestion des utilisateurs pour inviter des professeurs',
    goToUserManagement: 'Aller à la gestion des utilisateurs',
    emailSubject: 'Sujet',
    emailSubjectPlaceholder: 'Annonce importante de l\'école',
    message: 'Message',
    emailMessagePlaceholder: 'Chers parents, nous souhaitons vous informer...',
    emailAllParentsWarning: 'Cela enverra un email à tous les parents inscrits dans votre école.',
    upgradeYourPlan: 'Mettre à niveau votre plan',
    basicPlan: 'Plan de base',
    premiumPlan: 'Plan premium',
    chooseBasic: 'Choisir le plan de base',
    choosePremium: 'Choisir le plan premium',
    planTrialDisclaimer: 'Tous les plans incluent un essai gratuit de 14 jours. Annulez à tout moment.',
    unlimitedStudents: 'Étudiants illimités',
    unlimitedTeachers: 'Professeurs illimités',
    advancedAnalytics: 'Analyses avancées',
    prioritySupport: 'Support prioritaire',
    customBranding: 'Marque personnalisée',
    apiAccess: 'Accès API',
    dataExport: 'Exportation de données',

    // Languages
    languages: {
      en: '🇬🇧 Anglais',
      de: '🇩🇪 Allemand',
      fr: '🇫🇷 Français',
      sq: '🇦🇱 Albanais'
    }
  },

  sq: {
    // Login
    title: 'Admin LearnKick',
    welcomeBack: 'Mirësevini përsëri',
    signInToAccess: 'Hyni për të hyrë në panelin admin',
    email: 'Adresa e email-it',
    password: 'Fjalëkalimi',
    login: 'Hyni',
    signIn: 'Hyni',
    signingIn: 'Po hyni...',
    
    // School Setup
    schoolAdmin: 'Administratori i shkollës',
    parent: 'Prinditë',
    createSchoolAccount: 'Krijoni llogarinë tuaj të shkollës',
    joinSchoolAsParent: 'Bashkohuni me një shkollë si prinditë',
    fullName: 'Emri i plotë',
    confirmPassword: 'Konfirmoni fjalëkalimin',
    createAccount: 'Krijoni llogari',
    creating: 'Po krijohet...',
    
    // Navigation
    overview: 'Përmbledhje',
    dashboard: 'Paneli kryesor',
    questionBank: 'Banka e pyetjeve',
    userManagement: 'Menaxhimi i përdoruesve',
    analytics: 'Analizat',
    offersManagement: 'Menaxhimi i ofertave',
    schoolSettings: 'Cilësimet e shkollës',
    
    // Dashboard
    dashboardOverview: 'Përmbledhje e panelit',
    welcomeMessage: 'Ja çfarë po ndodh në shkollën tuaj',
    totalQuestions: 'Pyetjet gjithsej',
    schoolUsers: 'Përdoruesit e shkollës',
    gamesPlayed: 'Lojërat e luajtura',
    avgAccuracy: 'Saktësia mesatare',
    active: 'Aktiv',
    setupNeeded: 'Nevojitet konfigurimi',
    noGames: 'Asnjë lojë',
    noData: 'Asnjë të dhënë',
    good: 'Mirë',
    fair: 'E arsyeshme',
    
    // Quick Actions
    quickActions: 'Veprime të shpejta',
    addQuestions: 'Shtoni pyetje',
    importCSV: 'Importoni CSV ose krijoni të ri',
    inviteTeacher: 'Ftoni mësues',
    exportData: 'Eksportoni të dhënat',
    viewAnalytics: 'Shikoni analizat',
    
    // Recent Activity
    recentActivity: 'Aktiviteti i fundit',
    recentGameSessions: 'Sesionet e fundit të lojës',
    noGameSessions: 'Asnjë sesion loje ende',
    studentsWillAppear: 'Studentët do të shfaqen këtu pas lojës',
    
    // Question Management
    questionManagement: 'Menaxhimi i pyetjeve',
    addQuestion: 'Shtoni pyetje',
    editQuestion: 'Editoni pyetjen',
    deleteQuestion: 'Fshini pyetjen',
    exportCSV: 'Eksportoni CSV',
    totalQuestionsAvailable: 'Pyetjet e disponueshme gjithsej',
    questionsBySubject: 'Pyetjet sipas lëndës',
    questionsByGrade: 'Pyetjet sipas klasës',
    importFromCSV: 'Importoni nga CSV',
    
    // User Management
    userManagementTitle: 'Menaxhimi i përdoruesve',
    manageUsers: 'Menaxhoni mësuesit, prindërit dhe studentët në shkollën tuaj',
    inviteUser: 'Ftoni përdorues',
    teachers: 'Mësuesit',
    parents: 'Prindërit',
    students: 'Studentët',
    pendingInvites: 'Ftesat në pritje',
    user: 'Përdoruesi',
    role: 'Roli',
    status: 'Statusi',
    lastActive: 'Aktiv për herë të fundit',
    actions: 'Veprimet',
    noUsersFound: 'Asnjë përdorues nuk u gjet',
    inviteTeachersParents: 'Ftoni mësues dhe prindër për të filluar',
    
    // Analytics
    analyticsTitle: 'Paneli i analizave',
    trackPerformance: 'Ndiqni performancën e studentëve dhe përparimin në mësim',
    performanceBySubject: 'Performanca sipas lëndës',
    performanceByGrade: 'Performanca sipas klasës',
    performanceTrends: 'Tendencat e performancës',
    topPerformers: 'Performuesit më të mirë këtë javë',
    accuracy: 'Saktësia',
    questionsAnswered: 'Pyetjet e përgjigjura',
    
    // Settings
    settings: 'Cilësimet',

    // Common
    loading: 'Po ngarkon...',
    error: 'Gabim',
    success: 'Sukses',
    save: 'Ruaj',
    cancel: 'Anulo',
    delete: 'Fshi',
    edit: 'Edito',
    view: 'Shiko',
    close: 'Mbyll',
    refresh: 'Rifresko',
    
    // Time
    justNow: 'Tani pak',
    hoursAgo: 'orë më parë',
    daysAgo: 'ditë më parë',
    never: 'Kurrë',
    last7Days: '7 ditët e fundit',
    last30Days: '30 ditët e fundit',
    last3Months: '3 muajt e fundit',
    lastYear: 'Viti i kaluar',
    
    // Additional Analytics
    unknownStudent: 'Student i panjohur',
    grade: 'Klasa',
    estimated: 'përllogaritur',
    chartsWillBeImplemented: 'Grafiqet interaktive do të implementohen',
    withChartingLibrary: 'me një librari grafiqesh si Chart.js',
    min: 'min',
    questions: 'pyetje',
    
    // Question Bank Manager
    questionBankManager: 'Menaxhuesi i Bankës së Pyetjeve',
    manageContent: 'Menaxhoni dhe organizoni përmbajtjen arsimore për shkollën tuaj',
    filtersAndSearch: 'Filtra dhe kërkim',
    searchQuestions: 'Kërko pyetje',
    searchPlaceholder: 'Kërko pyetje, përgjigje...',
    subject: 'Lënda',
    allSubjects: 'Të gjitha lëndët',
    mathematics: 'Matematikë',
    geography: 'Gjeografi',
    language: 'Gjuhë',
    generalKnowledge: 'Kultura e përgjithshme',
    allGrades: 'Të gjitha klasat',
    difficulty: 'Vështirësia',
    allDifficulties: 'Të gjitha vështirësitë',
    veryEasy: '⭐ Shumë e lehtë',
    easy: '⭐⭐ E lehtë',
    medium: '⭐⭐⭐ Mesatare',
    hard: '⭐⭐⭐⭐ E vështirë',
    veryHard: '⭐⭐⭐⭐⭐ Shumë e vështirë',
    questionType: 'Lloji i pyetjes',
    allTypes: 'Të gjitha llojet',
    multipleChoice: 'Zgjedhje e shumëfishtë',
    trueFalse: 'E vërtetë/E rreme',
    numberInput: 'Futja e numrit',
    imageQuestion: 'Pyetje me imazh',
    allLanguages: 'Të gjitha gjuhët',
    bulkActions: 'Veprime masive',
    importing: 'Duke importuar...',
    deleteSelected: 'Fshi të zgjedhurit',
    showingQuestions: 'Duke treguar',
    selectAll: 'Zgjidh të gjitha',
    loadingQuestions: 'Duke ngarkuar pyetjet...',
    noQuestionsFound: 'Nuk u gjetën pyetje',
    adjustFilters: 'Provoni të rregulloni filtrat ose shtoni disa pyetje',
    answers: 'Përgjigjet',
    correct: 'Korrekt',
    created: 'Krijuar',
    unknown: 'E panjohur',
    page: 'Faqja',
    of: 'nga',
    previous: 'E mëparshme',
    next: 'Tjetër',
    
    // School Settings
    schoolSettingsTitle: 'Cilësimet e shkollës',
    configureSettings: 'Konfiguroni cilësimet dhe preferencat e LearnKick për shkollën tuaj',
    schoolInformation: 'Informacioni i shkollës',
    schoolName: 'Emri i shkollës',
    schoolCode: 'Kodi i shkollës',
    copy: 'Kopjo',
    shareCode: 'Ndajeni këtë kod me prindërit për t\'u bashkuar me shkollën tuaj',
    subscriptionPlan: 'Plani i abonimit',
    freePlan: 'Plan falas',
    accessControl: 'Kontrolli i qasjes',
    allowParentRegistration: 'Lejo auto-regjistrimin e prindërve',
    parentsCanJoin: 'Prindërit mund të bashkohen duke përdorur kodin e shkollës',
    requireAdminApproval: 'Kërko miratimin e administratorit',
    newUsersApproval: 'Përdoruesit e rinj duhet të miratohen para qasjes',
    gameSettings: 'Cilësimet e lojës',
    defaultTimeLimit: 'Kufiri kohor i paracaktuar (sekonda)',
    maxStudentsPerClass: 'Maks. studentë për klasë',
    generateNewCode: 'Gjenero kod të ri shkolle',
    inviteTeachers: 'Fto mësues',
    emailAllParents: 'Dërgo email të gjithë prindërve',
    currentPlan: 'Plani aktual',
    youreOnFreePlan: 'Jeni në planin falas',
    upTo50Students: '• Deri në 50 studentë',
    threeTeachers: '• 3 mësues',
    basicAnalytics: '• Analiza bazike',
    communitySupport: '• Mbështetje nga komuniteti',
    upgradePlan: 'Përmirëso planin',
    saveSettings: 'Ruaj cilësimet',
    
    // Missing Dashboard Elements
    signOut: 'Dil',
    schoolCodeLabel: 'Kodi i shkollës:',
    
    // Quick Action Labels & Descriptions
    addQuestionsLabel: 'Shto pyetje',
    addQuestionsDesc: 'Importo CSV ose krijo të reja',
    inviteTeacherLabel: 'Fto mësues',
    inviteTeacherDesc: 'Shto anëtarë të rinj të ekipit',
    exportDataLabel: 'Eksporto të dhënat',
    exportDataDesc: 'Shkarko raportet',
    viewAnalyticsLabel: 'Shiko analizat',
    viewAnalyticsDesc: 'Performanca e studentëve',
    student: 'Student',
    completed: 'përfunduar',

    // Subject Management
    subjectManagement: 'Menaxhimi i lëndëve',
    subjects: 'Lëndët',
    addSubject: 'Shto lëndë',
    editSubject: 'Edito lëndën',
    deleteSubject: 'Fshi lëndën',
    subjectName: 'Emri i lëndës',
    subjectSlug: 'Slug (identifikuesi URL)',
    subjectIcon: 'Ikona',
    subjectColor: 'Ngjyra',
    subjectDescription: 'Përshkrimi',
    createSubject: 'Krijo lëndën',
    updateSubject: 'Përditëso lëndën',
    manageSubjects: 'Menaxho lëndët e disponueshme për pyetjet',
    availableSubjects: 'Lëndët e disponueshme',
    systemSubjects: 'Sistemi',
    schoolSubjects: 'Shkolla e personalizuar',

    // Add Question Modal
    addNewQuestion: 'Shto pyetje të re',
    createQuestion: 'Krijo pyetjen',
    questionText: 'Pyetja',
    statement: 'Deklarata',
    answerOptions: 'Opsionet e përgjigjes',
    correctAnswer: 'Përgjigja e saktë',
    timeLimit: 'Kufiri kohor',
    tags: 'Etiketat',
    explanation: 'Shpjegimi',
    tolerance: 'Toleranca',
    unit: 'Njësia',
    imageUrl: 'URL e imazhit',
    preview: 'Paraparje',
    required: 'e detyrueshme',
    optional: 'opsionale',
    seconds: 'sekonda',

    // User Management Actions
    editUser: 'Edito përdoruesin',
    deleteUser: 'Fshi përdoruesin',
    suspendUser: 'Pezullo përdoruesin',
    activateUser: 'Aktivo përdoruesin',
    viewDetails: 'Shiko detajet',
    userActions: 'Veprimet e përdoruesit',
    editUserProfile: 'Edito profilin e përdoruesit',
    deleteUserConfirm: 'Jeni të sigurt që dëshironi të fshini këtë përdorues?',
    suspendUserConfirm: 'Jeni të sigurt që dëshironi të pezulloni këtë përdorues?',
    permanentlyDelete: 'Fshi përdoruesin përgjithmonë',
    cannotBeUndone: 'Ky veprim nuk mund të zhbëhet.',

    // School Settings Functions
    saveChanges: 'Ruaj ndryshimet',
    generateCode: 'Gjenero kod të ri',
    exportUserData: 'Eksporto të dhënat e përdoruesve',
    saveNotifications: 'Ruaj njoftimet',
    uploadLogo: 'Ngarko logon',
    settingsSaved: 'Cilësimet u ruajtën me sukses!',
    codeGenerated: 'Kodi i ri i shkollës u gjenerua!',
    dataExported: 'Të dhënat u eksportuan me sukses!',

    // Offers Manager
    useTemplate: 'Përdor shabllonin',
    createTemplate: 'Krijo shabllonin',
    editTemplate: 'Edito shabllonin',
    newQuote: 'Ofertë e re',
    viewQuote: 'Shiko ofertën',
    editQuote: 'Edito ofertën',
    sendQuote: 'Dërgo ofertën',
    createSegment: 'Krijo segmentin',
    editSegment: 'Edito segmentin',
    targetSegment: 'Segmenti i synuar',
    createTargetedOffer: 'Krijo ofertë të synuar',
    totalRevenue: 'Të ardhurat totale',
    activeOffers: 'Ofertat aktive',
    conversionRate: 'Shkalla e konvertimit',
    totalLeads: 'Prospektet gjithsej',

    // Analytics Dashboard
    performanceTrendsChart: 'Tendencat e performancës',
    averageAccuracyOverTime: 'Saktësia mesatare me kalimin e kohës',
    studentPerformanceTrends: 'Tendencat e performancës së studentëve',
    noDataAvailable: 'Nuk ka të dhëna të disponueshme',

    // General Actions
    send: 'Dërgo',
    create: 'Krijo',
    update: 'Përditëso',
    confirm: 'Konfirmo',
    yes: 'Po',
    no: 'Jo',
    warning: 'Paralajmërim',
    info: 'Info',

    // Validation Messages
    fieldRequired: 'Kjo fushë është e detyrueshme',
    invalidEmail: 'Ju lutem shkruani një adresë email të vlefshme',
    passwordTooShort: 'Fjalëkalimi duhet të jetë të paktën 6 karaktere',
    passwordMismatch: 'Fjalëkalimet nuk përputhen',
    invalidSlug: 'Slug-u mund të përmbajë vetëm shkronja të vogla, numra dhe viza',
    slugTaken: 'Ky slug është tashmë në përdorim',
    invalidColor: 'Ju lutem shkruani një kod ngjyre hexadecimal të vlefshëm',
    invalidUrl: 'Ju lutem shkruani një URL të vlefshme',
    minimumAnswers: 'Nevojiten të paktën 2 opsione përgjigjeje',
    validNumber: 'Ju lutem shkruani një numër të vlefshëm',
    timeLimitRange: 'Kufiri kohor duhet të jetë ndërmjet 5 dhe 300 sekondave',

    // NEW: Missing keys from audit
    help: 'Ndihmë',
    platformOverview: 'Përmbledhje e platformës',
    manageSchools: 'Menaxho shkollat',
    globalQuestions: 'Pyetjet globale',
    platformAnalytics: 'Analizat e platformës',
    platformSettings: 'Cilësimet e platformës',
    adminActions: 'Veprimet admin',
    notifications: 'Njoftimet',
    messages: 'Mesazhet',
    profileSettings: 'Cilësimet e profilit',
    preferences: 'Preferencat',
    exportFailed: 'Eksportimi dështoi. Ju lutem provoni përsëri.',
    uploadCSV: 'Ngarko CSV',
    createManually: 'Krijo manualisht',
    importFromTemplate: 'Importo nga shablloni',
    manageUsersAction: 'Menaxho përdoruesit',
    exportAllData: 'Eksporto të gjitha të dhënat',
    exportUsers: 'Eksporto përdoruesit',
    exportQuestions: 'Eksporto pyetjet',
    exportAnalytics: 'Eksporto analizat',
    performanceAnalytics: 'Analizat e performancës',
    userActivity: 'Aktiviteti i përdoruesit',
    questionStats: 'Statistikat e pyetjeve',
    commonAdminTasks: 'Detyra të zakonshme administrative për të filluar',
    dismiss: 'Mbyll',
    showingQuestionsCount: 'Duke treguar {count} nga {total} pyetje',
    deleteSelectedCount: 'Fshi të zgjedhurit ({count})',
    pageXOfY: 'Faqja {page} nga {total}',
    questionRequired: 'Pyetja është e detyrueshme',
    allAnswersRequired: 'Të gjitha opsionet e përgjigjes janë të detyrueshme',
    statementRequired: 'Deklarata është e detyrueshme',
    imageUrlRequired: 'URL e imazhit është e detyrueshme',
    noFileSelected: 'Asnjë skedar nuk u zgjodh. Ju lutem zgjidhni një skedar CSV.',
    invalidCsvFile: 'Ju lutem zgjidhni një skedar CSV të vlefshëm (zgjerimi .csv kërkohet).',
    processingFile: 'Duke përpunuar {filename}...',
    importingQuestions: 'Duke importuar {count} pyetje...',
    importCompleted: 'Importimi përfundoi',
    csvParseFailed: 'Nuk u arrit të lexohej skedari CSV. Ju lutem kontrolloni formatin.',
    failedCreateQuestion: 'Nuk u arrit të krijohej pyetja',
    searchPlaceholderDetailed: 'Kërko sipas tekstit, lëndës ose ID...',
    gradeN: 'Klasa {n}',
    answerN: 'Përgjigja {n}',
    correctMark: '✓ Korrekt',
    option: 'Opsioni',
    questionPlaceholder: 'Shkruani pyetjen tuaj këtu...',
    statementPlaceholder: 'Shkruani një deklaratë që mund të jetë e vërtetë ose e rreme...',
    timeLimitSeconds: 'Kufiri kohor (sekonda)',
    tagsPlaceholder: 'matematikë, algjebër, ekuacione',
    explanationPlaceholder: 'Shpjegimi për përgjigjen e saktë...',
    unitExamples: 'cm, kg, °C',
    imageUrlPlaceholder: 'https://shembull.com/imazh.jpg',
    uploadImage: 'Ngarko imazh',
    imageQuestionPlaceholder: 'Çfarë shihni në këtë imazh?',
    educationalManagementSystem: 'Sistemi i menaxhimit arsimor',
    signInToDashboard: 'Hyni në panelin kryesor',
    createSchoolAdmin: 'Krijoni admin shkolle',
    createAdminAccount: 'Krijoni llogari admin',
    createParentAccount: 'Krijoni llogari prindi',
    joinChildLearningJourney: 'Bashkohuni me udhëtimin e mësimit të fëmijës suaj',
    emailPlaceholder: 'admin@shkolle.ch',
    passwordPlaceholder: 'Shkruani fjalëkalimin',
    fullNamePlaceholder: 'Emri juaj i plotë',
    schoolNamePlaceholder: 'Emri i shkollës suaj',
    createPasswordPlaceholder: 'Krijoni një fjalëkalim',
    confirmPasswordPlaceholder: 'Konfirmoni fjalëkalimin',
    parentEmailPlaceholder: 'prind@email.com',
    schoolCodePlaceholder: 'Shkruani kodin e shkollës',
    invitationsCreatedSuccess: '{count} ftesë(a) u krijuan me sukses! Ndani kodet me përdoruesit.',
    invitationLinkGenerated: 'Lidhja e ftesës u gjenerua! Ndani këtë kod me përdoruesit.',
    inviteDialogDescription: 'Dërgoni ftesa përdoruesve të rinj ose gjeneroni lidhje ftese për shkollën tuaj.',
    invitationMethod: 'Metoda e ftesës',
    sendEmail: 'Dërgo email',
    generateLink: 'Gjenero lidhje',
    emailAddresses: 'Adresat email',
    userEmailPlaceholder: 'perdorues@shembull.com',
    addAnotherEmail: 'Shto një email tjetër',
    inviteEmailInstruction: 'Ftesat do të dërgohen me email',
    inviteLinkInstruction: 'Gjeneroni një lidhje për të ndarë',
    sending: 'Duke dërguar...',
    generating: 'Duke gjeneruar...',
    sendInvitations: 'Dërgo ftesat',
    invitationCodes: 'Kodet e ftesës:',
    copied: 'U kopjua',
    sendMoreInvitations: 'Dërgo më shumë ftesa',
    done: 'Përfundoi',
    updateUserInfoDescription: 'Përditësoni informacionin e përdoruesit dhe caktimet e rolit.',
    enterFullName: 'Shkruani emrin e plotë',
    enterEmail: 'Shkruani email-in',
    teacher: 'Mësues',
    deleteUserConfirmMessage: 'Jeni të sigurt që dëshironi të fshini {name}? Ky veprim nuk mund të zhbëhet.',
    newSchoolCodeGenerated: 'Kodi i ri i shkollës u gjenerua: {code}',
    saving: 'Duke ruajtur...',
    inviteTeachersInstructions: 'Përdorni menaxhimin e përdoruesve për të dërguar ftesa mësuesve me kontroll të plotë mbi procesin.',
    goToUserManagementPrompt: 'Ju lutem shkoni te menaxhimi i përdoruesve për të ftuar mësues',
    goToUserManagement: 'Shko te menaxhimi i përdoruesve',
    emailSubject: 'Subjekti',
    emailSubjectPlaceholder: 'Njoftim i rëndësishëm nga shkolla',
    message: 'Mesazhi',
    emailMessagePlaceholder: 'Të dashur prindër, dëshirojmë t\'ju njoftojmë...',
    emailAllParentsWarning: 'Kjo do t\'u dërgojë email të gjithë prindërve të regjistruar në shkollën tuaj.',
    upgradeYourPlan: 'Përmirësoni planin tuaj',
    basicPlan: 'Plani bazik',
    premiumPlan: 'Plani premium',
    chooseBasic: 'Zgjidhni planin bazik',
    choosePremium: 'Zgjidhni planin premium',
    planTrialDisclaimer: 'Të gjitha planet përfshijnë një provë falas 14-ditore. Anuloni në çdo kohë.',
    unlimitedStudents: 'Studentë të pakufizuar',
    unlimitedTeachers: 'Mësues të pakufizuar',
    advancedAnalytics: 'Analiza të avancuara',
    prioritySupport: 'Mbështetje prioritare',
    customBranding: 'Markë e personalizuar',
    apiAccess: 'Qasje API',
    dataExport: 'Eksportim të dhënash',

    // Languages
    languages: {
      en: '🇬🇧 Anglisht',
      de: '🇩🇪 Gjermanisht',
      fr: '🇫🇷 Frëngjisht',
      sq: '🇦🇱 Shqip'
    }
  }
}

// English missing keys that were hardcoded in components
const enMissingKeys = {
  help: 'Help',
  platformOverview: 'Platform Overview',
  manageSchools: 'Manage Schools',
  globalQuestions: 'Global Questions',
  platformAnalytics: 'Platform Analytics',
  platformSettings: 'Platform Settings',
  adminActions: 'Admin Actions',
  notifications: 'Notifications',
  messages: 'Messages',
  profileSettings: 'Profile Settings',
  preferences: 'Preferences',
  exportFailed: 'Export failed. Please try again.',
  uploadCSV: 'Upload CSV',
  createManually: 'Create Manually',
  importFromTemplate: 'Import from Template',
  manageUsersAction: 'Manage Users',
  exportAllData: 'Export All Data',
  exportUsers: 'Export Users',
  exportQuestions: 'Export Questions',
  exportAnalytics: 'Export Analytics',
  performanceAnalytics: 'Performance Analytics',
  userActivity: 'User Activity',
  questionStats: 'Question Stats',
  commonAdminTasks: 'Common administrative tasks to get you started',
  viewAndManageSchools: 'View and manage all schools on the platform',
  addSchool: 'Add School',
  schoolsManagement: 'Schools Management',
  schoolsManagementDesc: 'This section will allow you to create, edit, and manage schools.',
  comingSoon: 'Coming soon: Full schools management with subscription plans, user limits, and more.',
  noGameSessionsYet: 'No game sessions yet',
  studentsWillAppearHere: 'Students will appear here after playing games',
  gradeLabel: 'Grade',
  questionsLabel: 'questions',
  accuracyLabel: 'accuracy',
  hAgo: 'h ago',
  dAgo: 'd ago',
  subjects: 'Subjects',
  platformOwner: 'Platform Owner',
  educationalManagement: 'Educational Management',
  inviteTeachers: 'Invite Teachers',
  inviteParents: 'Invite Parents',
}

// Admin translation hook
export function useAdminTranslation(language: AdminLanguage = 'en') {
  const baseTranslations = adminTranslations[language] || adminTranslations.en
  // Merge with missing keys for backwards compatibility
  const t = { ...enMissingKeys, ...baseTranslations }

  return {
    t,
    language,
    availableLanguages: Object.keys(adminTranslations) as AdminLanguage[]
  }
}