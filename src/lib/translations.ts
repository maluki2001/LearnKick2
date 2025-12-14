export type Language = 'en' | 'de' | 'fr' | 'sq'

export interface Translations {
  // General
  welcome: string
  welcomeSubtitle: string
  startPlaying: string
  backToMenu: string
  loading: string
  error: string
  start: string

  // Player Setup
  playerSetup: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    gradeLabel: string
    languageLabel: string
    wherePlayingLabel: string
    grades: {
      [key: number]: string
    }
    helpText: string
    settingsSaved: string
    errors: {
      nameRequired: string
      nameTooShort: string
      modeRequired: string
    }
  }

  // Game Modes
  gameModes: {
    title: string
    subtitle: string
    family: {
      name: string
      description: string
      subtitle: string
      features: string[]
      bestFor: string[]
    }
    school: {
      name: string
      description: string
      subtitle: string
      features: string[]
      bestFor: string[]
    }
    continue: string
    selected: string
  }

  // Game Setup
  gameSetup: {
    title: string
    arena: string
    subject: string
    language: string
    grade: string
    questionLanguage: string
    subjects: {
      all: string
      math: string
      german: string
      french: string
      english: string
      science: string
      geography: string
      history: string
      music: string
      art: string
      sports: string
      digital: string
      language: string
      'general-knowledge': string
    }
    arenas: {
      soccer: string
      hockey: string
    }
  }

  // Team Builder
  team: {
    myTeam: string
    formation: string
    elixir: string
    league: string
    train: string
    playMatch: string
    stats: string
    goalkeeper: string
    defense: string
    midfield: string
    attack: string
    positions: {
      GK: string
      RB: string
      CB: string
      LB: string
      CM: string
      CAM: string
      LW: string
      ST: string
      RW: string
      LD: string
      RD: string
      C: string
      G: string
    }
    cardRarity: {
      bronze: string
      silver: string
      gold: string
      diamond: string
      champion: string
    }
    level: string
    overall: string
    accuracy: string
    speed: string
    consistency: string
    difficulty: string
    xp: string
    trainPlayer: string
    elixirNeeded: string
    chooseGoalkeeper: string
    chooseGoalkeeperDesc: string
    // Training
    standardTraining: string
    standardTrainingDesc: string
    quickLevel: string
    quickLevelDesc: string
    available: string
    trainingComplete: string
    training: string
    train: string
    leveling: string
    needMore: string
    // Lobby
    battle: string
    practice: string
    online: string
    offline: string
    selectSubject: string
    selectArena: string
    leagueTable: string
    viewLeague: string
    closeLeague: string
    // League
    schoolLeague: string
    globalLeague: string
    tierProgress: string
    rank: string
    played: string
    won: string
    drawn: string
    lost: string
    goalsFor: string
    goalsAgainst: string
    goalDiff: string
    points: string
    promotionZone: string
    relegationZone: string
    leagueTiers: {
      bronze: string
      silver: string
      gold: string
      platinum: string
      diamond: string
      champion: string
      legend: string
    }
    // Match Results
    matchComplete: string
    elixirEarned: string
    xpDistributed: string
    cardsLeveledUp: string
    leaguePointsChange: string
    viewTeam: string
    // TeamView
    teamRating: string
    pts: string
    avgLevel: string
    playersCount: string
    squad: string
    posAbbrev: string
    subjectCol: string
    lvlAbbrev: string
    ovrAbbrev: string
    rarityCol: string
    ratingsLabel: string
    tapToTrain: string
    // PlayerCard
    lvPrefix: string
    accAbbrev: string
    spdAbbrev: string
    conAbbrev: string
    difAbbrev: string
    xpLabel: string
    gkLabel: string
    // LeagueTable
    school: string
    global: string
    teamCol: string
    pAbbrev: string
    wAbbrev: string
    dAbbrev: string
    lAbbrev: string
    gdAbbrev: string
    ptsAbbrev: string
    youLabel: string
    nextTier: string
    ptsNeeded: string
    maxTier: string
    // ElixirBar
    dailyEarned: string
    dailyCapReached: string
    trainCost: string
    xpGain: string
    weekBonus: string
    speedBonus: string
    streakBonus: string
    elixirGain: string
  }

  // Settings
  settings: {
    title: string
    playingAs: string
    mode: string
    gradeLevel: string
    subject: string
    arena: string
    questionLanguage: string
    dangerZone: string
    resetProfile: string
    resetConfirm: string
    saveSettings: string
    cancel: string
    yesDelete: string
    // New keys for SettingsModal
    gameTab: string
    accessibilityTab: string
    selectArena: string
    selectSubject: string
    appLanguage: string
    gameMode: string
    visual: string
    dyslexiaFont: string
    dyslexiaFontDesc: string
    fontSize: string
    controls: string
    largerButtons: string
    largerButtonsDesc: string
    moreTime: string
    moreTimeDesc: string
    audio: string
    soundEffects: string
    soundEffectsDesc: string
    backgroundMusic: string
    on: string
    off: string
    home: string
    simpleMode: string
    simpleModeDesc: string
    dangerZoneTitle: string
    resetAllProgress: string
    confirmResetModal: string
    done: string
    delete: string
  }

  // Game Interface
  game: {
    pause: string
    resume: string
    goals: string
    streak: string
    question: string
    timeUp: string
    correct: string
    incorrect: string
    nextQuestion: string
    gameOver: string
    winner: string
    finalScore: string
    accuracy: string
    correctAnswers: string
    maxStreak: string
    playAgain: string
    you: string
    aiRival: string
    rival: string
    vs: string
    getReady: string
    gameStartsSoon: string
    loadingQuestion: string
    gamePaused: string
    clickResume: string
    grade: string
    trueLabel: string
    falseLabel: string
    battle: string
    access: string
    gameActive: string
    waiting: string
    questionImageAlt: string
    // Loading screen
    loadingScreen: {
      preparingStadium: string
      settingUpField: string
      loadingQuestions: string
      downloadingOffline: string
      syncingData: string
      savingProgress: string
      preparingMatch: string
      gettingTeamReady: string
      ready: string
      letsPlay: string
      tip: string
      questions: string
      complete: string
      elixirTip: string
      // Tips
      tips: {
        answerQuickly: string
        streakBonus: string
        practicePerfect: string
        checkStats: string
        threeCorrectGoal: string
        slidePuck: string
        questionsAdapt: string
        offlinePlay: string
        improveCards: string
      }
    }
  }

  // Profile
  profile: {
    ranks: {
      champion: string
      diamond: string
      gold: string
      silver: string
      bronze: string
      rookie: string
    }
    rating: string
    wins: string
    bestStreak: string
    gamesPlayed: string
  }

  // Match Results Screen
  matchResults: {
    victory: string
    draw: string
    defeat: string
    you: string
    opponent: string
    elixirEarned: string
    leaguePoints: string
    xpGained: string
    playersLeveledUp: string
    playerLeveledUp: string
    questions: string
    accuracy: string
    bestStreak: string
    total: string
    continueButton: string
  }

  // Player Setup Screen
  playerSetup: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    gradeLabel: string
    gradeOption: string
    languageLabel: string
    startButton: string
  }

  // Matchmaking
  matchmaking: {
    findingOpponent: string
    playersOnline: string
    position: string
    cancel: string
    goBack: string
    error: string
    somethingWrong: string
    tips: {
      lookingSkillLevel: string
      expandingSearch: string
      almostThere: string
      hangTight: string
    }
    matchFound: string
    you: string
    vs: string
    trophies: string
    matchQuality: {
      perfect: string
      great: string
      good: string
      found: string
    }
    gameStartingIn: string
    startingGame: string
    go: string
    playMultiplayer: string
  }

  // Accessibility
  accessibility: {
    title: string
    subtitle: string
    sections: {
      visual: string
      motor: string
      cognitive: string
      audio: string
    }
    theme: string
    fontSize: string
    themes: {
      light: string
      dark: string
      highContrast: string
    }
    fontSizes: {
      small: string
      medium: string
      large: string
      extraLarge: string
    }
    dyslexiaFont: string
    dyslexiaFontDesc: string
    largerTargets: string
    largerTargetsDesc: string
    stickyButtons: string
    stickyButtonsDesc: string
    simplifiedUI: string
    simplifiedUIDesc: string
    extendedTimeouts: string
    extendedTimeoutsDesc: string
    soundEffects: string
    soundEffectsDesc: string
    screenReader: string
    screenReaderDesc: string
    done: string
  }

  // Lobby
  lobby: {
    tapToChange: string
    clickToChange: string
    tap: string
    level: string
    elo: string
    games: string
    wins: string
    accuracy: string
    bestStreak: string
    onlineBattleAvailable: string
    offlinePracticeOnly: string
    practice: string
    battle: string
    noTrophies: string
    earnTrophies: string
    requiresWifi: string
    finding: string
    rankedEarnTrophies: string
    trainingNoTrophies: string
    requiresInternet: string
    connectToInternet: string
    online: string
    offline: string
    teamNav: string
    leagueNav: string
    settingsNav: string
    profileNav: string
    myTeam: string
    leagueTable: string
    gameSettings: string
    leaderboard: string
    topPlayers: string
    fullProfile: string
    shopComingSoon: string
    playerProfile: string
    close: string
    comingSoonMultiplayer: string
    creatingTeam: string
    lvl: string
    // Email linking
    linkAccount: string
    accountLinked: string
    linkAccountDescription: string
    link: string
    change: string
  }

  // Languages
  languages: {
    en: string
    de: string
    fr: string
    sq: string
  }

  // Admin
  admin: {
    // Login
    title: string
    welcomeBack: string
    signInToAccess: string
    email: string
    password: string
    login: string
    signIn: string
    signingIn: string

    // School Setup
    schoolAdmin: string
    parent: string
    createSchoolAccount: string
    joinSchoolAsParent: string
    fullName: string
    schoolName: string
    schoolCode: string
    confirmPassword: string
    createAccount: string
    creating: string

    // Navigation
    overview: string
    dashboard: string
    questionBank: string
    userManagement: string
    analytics: string
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
  }

  // Kid Registration Flow (Supercell-style)
  kidRegistration: {
    // Step 1: Username
    whatsYourName: string
    enterUsername: string
    usernamePlaceholder: string
    characters: string
    nameTooShort: string
    nameTooLong: string
    next: string

    // Step 2: Age/Grade
    hello: string
    pickGrade: string
    pickAge: string
    years: string
    grade: string
    letsGo: string
    back: string

    // Step 3: Connect
    saveProgress: string
    connectOptional: string
    schoolCode: string
    schoolCodeDesc: string
    parentEmail: string
    parentEmailDesc: string
    googleSignIn: string
    googleDesc: string
    skip: string
    playNow: string
    backToOptions: string
    enterSchoolCode: string
    enterParentEmail: string
    parentEmailNote: string
    connect: string
    sendToParents: string
    whyConnect: string
    benefitSave: string
    benefitDevices: string
    benefitFriends: string

    // Connect Reminder
    learnKickId: string
    secureProgress: string
    couldBeLost: string
    connectNow: string
    remindLater: string
    neverAsk: string
  }

  // Offline Mode
  offlineMode: {
    online: string
    offline: string
    onlineMode: string
    offlineMode: string
    cachedQuestions: string
    serviceWorker: string
    active: string
    inactive: string
    storageUsed: string
    downloadForOffline: string
    downloading: string
    downloadComplete: string
    downloadFailed: string
    clearOfflineData: string
    offlineReady: string
    noQuestionsAvailable: string
    connectToDownload: string
    cached: string
    questionsReady: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    welcome: 'LearnKick',
    welcomeSubtitle: 'Sports-themed learning duels for kids!',
    startPlaying: 'Start Playing!',
    backToMenu: 'Back to Menu',
    loading: 'Loading...',
    error: 'Error',
    start: 'START',

    playerSetup: {
      title: 'Welcome to LearnKick!',
      subtitle: 'Let\'s set up your player profile',
      nameLabel: 'What\'s your name?',
      namePlaceholder: 'Enter your name...',
      gradeLabel: 'What grade are you in?',
      languageLabel: 'Choose your language',
      wherePlayingLabel: 'Where are you playing?',
      grades: {
        1: 'Grade 1 (Age 6-7)',
        2: 'Grade 2 (Age 7-8)',
        3: 'Grade 3 (Age 8-9)',
        4: 'Grade 4 (Age 9-10)',
        5: 'Grade 5 (Age 10-11)',
        6: 'Grade 6 (Age 11-12)'
      },
      helpText: 'Your information helps us provide age-appropriate questions',
      settingsSaved: 'Your settings are saved automatically',
      errors: {
        nameRequired: 'Please enter your name',
        nameTooShort: 'Name must be at least 2 characters',
        modeRequired: 'Please select School or Home'
      }
    },

    gameModes: {
      title: 'Choose Your Game Mode',
      subtitle: 'Select the learning experience that works best for you',
      family: {
        name: 'Family Mode',
        description: 'Fun learning experience for family game time',
        subtitle: 'Family mode',
        features: [
          'Relaxed timing (20 seconds per question)',
          'Encouraging celebrations and messages',
          'Multiple attempts allowed',
          'Focus on learning and fun'
        ],
        bestFor: ['Family bonding time', 'Casual practice', 'Building confidence']
      },
      school: {
        name: 'School Mode',
        description: 'Structured learning environment for educational assessment',
        subtitle: 'Teacher mode',
        features: [
          'Standard timing (15 seconds per question)',
          'Detailed performance metrics',
          'Single attempt per question',
          'Progress reports'
        ],
        bestFor: ['Classroom use', 'Formal assessment', 'Progress monitoring']
      },
      continue: 'Continue with',
      selected: 'Selected!'
    },

    gameSetup: {
      title: 'Game Setup',
      arena: 'Arena',
      subject: 'Subject',
      language: 'Language',
      grade: 'Grade',
      questionLanguage: 'Question Language',
      subjects: {
        all: 'All Subjects',
        math: 'Mathematics',
        german: 'German',
        french: 'French',
        english: 'English',
        science: 'Science',
        geography: 'Geography',
        history: 'History',
        music: 'Music',
        art: 'Art',
        sports: 'Sports',
        digital: 'Digital Skills',
        language: 'Language',
        'general-knowledge': 'General Knowledge'
      },
      arenas: {
        soccer: 'Soccer',
        hockey: 'Hockey'
      }
    },

    team: {
      myTeam: 'My Team',
      formation: 'Formation',
      elixir: 'Elixir',
      league: 'League',
      train: 'Train',
      playMatch: 'Play Match',
      stats: 'Stats',
      goalkeeper: 'Goalkeeper',
      defense: 'Defense',
      midfield: 'Midfield',
      attack: 'Attack',
      positions: {
        GK: 'Goalkeeper',
        RB: 'Right Back',
        CB: 'Center Back',
        LB: 'Left Back',
        CM: 'Central Mid',
        CAM: 'Attacking Mid',
        LW: 'Left Wing',
        ST: 'Striker',
        RW: 'Right Wing',
        LD: 'Left Defense',
        RD: 'Right Defense',
        C: 'Center',
        G: 'Goalie'
      },
      cardRarity: {
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        diamond: 'Diamond',
        champion: 'Champion'
      },
      level: 'Level',
      overall: 'Overall',
      accuracy: 'Accuracy',
      speed: 'Speed',
      consistency: 'Consistency',
      difficulty: 'Difficulty',
      xp: 'XP',
      trainPlayer: 'Train Player',
      elixirNeeded: 'Elixir needed',
      chooseGoalkeeper: 'Choose Your Goalkeeper',
      chooseGoalkeeperDesc: 'Pick which subject will be your goalkeeper - your last line of defense!',
      // Training
      standardTraining: 'Standard Training',
      standardTrainingDesc: 'Basic XP boost',
      quickLevel: 'Quick Level',
      quickLevelDesc: '5x the XP boost!',
      available: 'available',
      trainingComplete: 'Training Complete!',
      training: 'Training...',
      train: 'Train',
      leveling: 'Leveling...',
      needMore: 'Need {amount} more',
      // Lobby
      battle: 'Battle',
      practice: 'Practice',
      online: 'Online',
      offline: 'Offline',
      selectSubject: 'Select Subject',
      selectArena: 'Select Arena',
      leagueTable: 'League Table',
      viewLeague: 'View League',
      closeLeague: 'Close League',
      // League
      schoolLeague: 'School League',
      globalLeague: 'Global League',
      tierProgress: 'Tier Progress',
      rank: 'Rank',
      played: 'P',
      won: 'W',
      drawn: 'D',
      lost: 'L',
      goalsFor: 'GF',
      goalsAgainst: 'GA',
      goalDiff: 'GD',
      points: 'Pts',
      promotionZone: 'Promotion Zone',
      relegationZone: 'Relegation Zone',
      leagueTiers: {
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        platinum: 'Platinum',
        diamond: 'Diamond',
        champion: 'Champion',
        legend: 'Legend'
      },
      // Match Results
      matchComplete: 'Match Complete!',
      elixirEarned: 'Elixir Earned',
      xpDistributed: 'XP Distributed',
      cardsLeveledUp: 'Cards Leveled Up!',
      leaguePointsChange: 'League Points',
      viewTeam: 'View Team',
      // TeamView
      teamRating: 'Team Rating',
      pts: 'pts',
      avgLevel: 'Avg Level',
      playersCount: 'players',
      squad: 'Squad',
      posAbbrev: 'POS',
      subjectCol: 'SUBJECT',
      lvlAbbrev: 'LVL',
      ovrAbbrev: 'OVR',
      rarityCol: 'RARITY',
      ratingsLabel: 'Ratings:',
      tapToTrain: 'Tap a player to train them with elixir',
      // PlayerCard
      lvPrefix: 'Lv.',
      accAbbrev: 'ACC',
      spdAbbrev: 'SPD',
      conAbbrev: 'CON',
      difAbbrev: 'DIF',
      xpLabel: 'XP:',
      gkLabel: 'GK',
      // LeagueTable
      school: 'School',
      global: 'Global',
      teamCol: 'TEAM',
      pAbbrev: 'P',
      wAbbrev: 'W',
      dAbbrev: 'D',
      lAbbrev: 'L',
      gdAbbrev: 'GD',
      ptsAbbrev: 'PTS',
      youLabel: 'You',
      nextTier: 'Next Tier:',
      ptsNeeded: 'pts needed',
      maxTier: 'Max',
      // ElixirBar
      dailyEarned: 'Daily Earned',
      dailyCapReached: 'Daily cap reached! Come back tomorrow.',
      trainCost: 'Train Cost',
      xpGain: 'XP Gain',
      weekBonus: 'Week Bonus',
      speedBonus: 'Speed Bonus:',
      streakBonus: 'Streak Bonus:',
      elixirGain: 'Elixir'
    },

    settings: {
      title: 'Settings',
      playingAs: 'Playing as',
      mode: 'Mode',
      gradeLevel: 'Grade Level',
      subject: 'Subject',
      arena: 'Arena',
      questionLanguage: 'Question Language',
      dangerZone: 'Danger Zone',
      resetProfile: 'Reset Profile & Data',
      resetConfirm: 'This will delete all your progress, stats, and settings. Are you sure?',
      saveSettings: 'Save Settings',
      cancel: 'Cancel',
      yesDelete: 'Yes, Delete',
      gameTab: 'GAME',
      accessibilityTab: 'ACCESSIBILITY',
      selectArena: 'SELECT ARENA',
      selectSubject: 'SELECT SUBJECT',
      appLanguage: 'APP LANGUAGE',
      gameMode: 'GAME MODE',
      visual: 'VISUAL',
      dyslexiaFont: 'Dyslexia-Friendly Font',
      dyslexiaFontDesc: 'Easier to read for dyslexia',
      fontSize: 'Font Size',
      controls: 'CONTROLS',
      largerButtons: 'Larger Buttons',
      largerButtonsDesc: 'Easier to tap',
      moreTime: 'More Time',
      moreTimeDesc: 'Extended time limits',
      audio: 'AUDIO',
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Game sounds & music',
      backgroundMusic: 'Background Music',
      on: 'ON',
      off: 'OFF',
      home: 'Home',
      simpleMode: 'Simple Mode',
      simpleModeDesc: 'Less animations',
      dangerZoneTitle: 'DANGER ZONE',
      resetAllProgress: 'Reset All Progress',
      confirmResetModal: 'Are you sure? This will delete all your progress!',
      done: 'DONE',
      delete: 'Delete'
    },

    game: {
      pause: 'Pause',
      resume: 'Resume',
      goals: 'Goals',
      streak: 'Streak',
      question: 'Question',
      timeUp: 'Time\'s Up!',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      nextQuestion: 'Next Question',
      gameOver: 'Game Over!',
      winner: 'Winner',
      finalScore: 'Final Score',
      accuracy: 'Accuracy',
      correctAnswers: 'Correct',
      maxStreak: 'Max Streak',
      playAgain: 'Play Again',
      you: 'YOU',
      aiRival: 'AI RIVAL',
      rival: 'RIVAL',
      vs: 'VS',
      getReady: 'Get Ready!',
      gameStartsSoon: 'Game starts in a moment...',
      loadingQuestion: 'Loading Question...',
      gamePaused: 'Game Paused',
      clickResume: 'Click Resume to continue',
      grade: 'Grade',
      trueLabel: 'True',
      falseLabel: 'False',
      battle: 'BATTLE',
      access: 'Access',
      gameActive: 'Game Active',
      waiting: 'Waiting',
      questionImageAlt: 'Question image',
      goal: 'GOAL!',
      miss: 'MISS!',
      towardGoal: '+1 toward goal',
      keepGoing: 'Keep going!',
      youScored: 'You scored!',
      opponentScored: 'Opponent scored!',
      yourGoal: 'Your Goal',
      theirGoal: 'Their Goal',
      loading: 'Loading...',
      seconds: 'seconds',
      loadingQuestion: 'Loading question...',
      opponentAnswered: 'Opponent has answered!',
      opponentDisconnected: 'Opponent disconnected. Waiting for reconnection...',
      loadingScreen: {
        preparingStadium: 'Preparing the Stadium',
        settingUpField: 'Setting up the field...',
        loadingQuestions: 'Loading Questions',
        downloadingOffline: 'Downloading questions for offline play...',
        syncingData: 'Syncing Data',
        savingProgress: 'Saving your progress...',
        preparingMatch: 'Preparing Match',
        gettingTeamReady: 'Getting your team ready...',
        ready: 'Ready!',
        letsPlay: "Let's play!",
        tip: 'Tip',
        questions: 'questions',
        complete: 'Complete!',
        elixirTip: 'Answer quickly for bonus elixir!',
        tips: {
          answerQuickly: 'Answer quickly to score more goals!',
          streakBonus: 'A correct streak earns bonus elixir!',
          practicePerfect: 'Practice makes perfect - keep playing!',
          checkStats: 'Check your team stats after the match.',
          threeCorrectGoal: 'Each goal needs 3 correct answers!',
          slidePuck: 'Slide the puck with fast answers!',
          questionsAdapt: 'Questions adapt to your skill level.',
          offlinePlay: 'Play offline anytime - questions are cached!',
          improveCards: 'Your answers help improve your player cards.'
        }
      }
    },

    multiplayer: {
      title: 'Multiplayer',
      subtitle: 'Challenge real players worldwide!',
      findMatch: 'Find Match',
      backToHome: 'Back to Home',
      skillLevelInfo: 'Match against players at your skill level',
      trophiesInfo: 'Win matches to earn trophies and climb the leaderboard!',
      matchReady: 'Match Ready!',
      connecting: 'Connecting...',
      ready: 'Ready!',
      notReady: 'Not Ready',
      waitingFor: 'Waiting...',
      waitingForOpponent: 'Waiting for opponent...',
      correct: 'correct'
    },

    profile: {
      ranks: {
        champion: 'Champion',
        diamond: 'Diamond',
        gold: 'Gold',
        silver: 'Silver',
        bronze: 'Bronze',
        rookie: 'Rookie'
      },
      rating: 'Rating',
      wins: 'Wins',
      bestStreak: 'Best Streak',
      gamesPlayed: 'games played'
    },

    matchResults: {
      victory: 'VICTORY!',
      draw: 'DRAW',
      defeat: 'DEFEAT',
      you: 'You',
      opponent: 'Opponent',
      elixirEarned: 'Elixir Earned',
      leaguePoints: 'League Points',
      xpGained: 'XP Gained',
      playersLeveledUp: 'Players Leveled Up!',
      playerLeveledUp: 'Player Leveled Up!',
      questions: 'Questions',
      accuracy: 'Accuracy',
      bestStreak: 'Best Streak',
      total: 'total',
      continueButton: 'Continue'
    },

    playerSetup: {
      title: 'Player Setup',
      subtitle: "Let's get you ready to play!",
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name',
      gradeLabel: 'Grade Level',
      gradeOption: 'Grade',
      languageLabel: 'Language',
      startButton: 'Start Playing!'
    },

    matchmaking: {
      findingOpponent: 'Finding Opponent',
      playersOnline: 'players online',
      position: 'Position:',
      cancel: 'Cancel',
      goBack: 'Go Back',
      error: 'Error',
      somethingWrong: 'Something went wrong',
      tips: {
        lookingSkillLevel: 'Looking for players at your skill level...',
        expandingSearch: 'Expanding search to find you a great match...',
        almostThere: 'Almost there! Finding any available opponent...',
        hangTight: 'Hang tight! Sometimes it takes a moment to find the perfect match.'
      },
      matchFound: 'MATCH FOUND!',
      you: 'You',
      vs: 'VS',
      trophies: 'trophies',
      matchQuality: {
        perfect: 'Perfect Match!',
        great: 'Great Match!',
        good: 'Good Match!',
        found: 'Match Found!'
      },
      gameStartingIn: 'Game starting in...',
      startingGame: 'Starting game...',
      go: 'GO!',
      playMultiplayer: 'Play Multiplayer'
    },

    accessibility: {
      title: 'Accessibility Settings',
      subtitle: 'Customize your learning experience',
      sections: {
        visual: 'Visual',
        motor: 'Motor',
        cognitive: 'Cognitive',
        audio: 'Audio'
      },
      theme: 'Theme',
      fontSize: 'Font Size',
      themes: {
        light: 'Light',
        dark: 'Dark',
        highContrast: 'High Contrast'
      },
      fontSizes: {
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        extraLarge: 'Extra Large'
      },
      dyslexiaFont: 'Dyslexia-Friendly Font',
      dyslexiaFontDesc: 'Uses OpenDyslexic font for better readability',
      largerTargets: 'Larger Click Targets',
      largerTargetsDesc: 'Makes buttons and interactive elements bigger',
      stickyButtons: 'Sticky Buttons',
      stickyButtonsDesc: 'Buttons stay pressed longer for easier interaction',
      simplifiedUI: 'Simplified UI',
      simplifiedUIDesc: 'Reduces visual complexity and distractions',
      extendedTimeouts: 'Extended Timeouts',
      extendedTimeoutsDesc: 'Gives more time to read and answer questions',
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Plays sounds for correct/incorrect answers',
      screenReader: 'Screen Reader Support',
      screenReaderDesc: 'Enhanced compatibility with screen readers',
      done: 'Done'
    },

    languages: {
      en: '🇬🇧 English',
      de: '🇩🇪 German',
      fr: '🇫🇷 French',
      sq: '🇦🇱 Albanian'
    },

    lobby: {
      tapToChange: 'tap to change',
      clickToChange: 'click to change',
      tap: 'tap',
      level: 'Level',
      elo: 'ELO',
      games: 'Games',
      wins: 'Wins',
      accuracy: 'Accuracy',
      bestStreak: 'Best Streak',
      onlineBattleAvailable: 'Online - Battle Mode Available',
      offlinePracticeOnly: 'Offline - Practice Only',
      practice: 'PRACTICE',
      battle: 'BATTLE!',
      noTrophies: 'No Trophies',
      earnTrophies: '+Trophies',
      requiresWifi: 'Requires WiFi',
      finding: 'FINDING...',
      rankedEarnTrophies: 'Ranked - Earn Trophies',
      trainingNoTrophies: 'Training - No Trophies',
      requiresInternet: 'Requires Internet',
      connectToInternet: 'Connect to internet for ranked battles',
      online: 'Online',
      offline: 'Offline',
      teamNav: 'Team',
      leagueNav: 'League',
      settingsNav: 'Settings',
      profileNav: 'Profile',
      myTeam: 'MY TEAM',
      leagueTable: 'LEAGUE TABLE',
      gameSettings: 'GAME SETTINGS',
      leaderboard: 'LEADERBOARD',
      topPlayers: 'Top Players',
      fullProfile: 'Full Profile',
      shopComingSoon: 'Shop Coming Soon!',
      playerProfile: 'PLAYER PROFILE',
      close: 'CLOSE',
      comingSoonMultiplayer: 'Coming soon with multiplayer!',
      creatingTeam: 'Creating your team...',
      lvl: 'Lvl',
      // Email linking
      linkAccount: 'Link Account',
      accountLinked: 'Account Linked',
      linkAccountDescription: 'Never lose your progress',
      link: 'Link',
      change: 'Change'
    },

    admin: {
      // Login
      title: 'Admin Panel',
      welcomeBack: 'Welcome Back',
      signInToAccess: 'Sign in to access the admin panel',
      email: 'Email Address',
      password: 'Password',
      login: 'Login',
      signIn: 'Sign In',
      signingIn: 'Signing in...',

      // School Setup
      schoolAdmin: 'School Admin',
      parent: 'Parent',
      createSchoolAccount: 'Create your school account',
      joinSchoolAsParent: 'Join a school as a parent',
      fullName: 'Full Name',
      schoolName: 'School Name',
      schoolCode: 'School Code',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      creating: 'Creating...',

      // Navigation
      overview: 'Overview',
      dashboard: 'Dashboard',
      questionBank: 'Question Bank',
      userManagement: 'User Management',
      analytics: 'Analytics',
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
      importCSV: 'Import CSV',
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
      schoolSettingsTitle: 'School Settings',

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
      never: 'Never'
    },

    // Kid Registration Flow
    kidRegistration: {
      whatsYourName: "What's your name?",
      enterUsername: 'Enter your player name',
      usernamePlaceholder: 'Your name...',
      characters: 'characters',
      nameTooShort: 'Name too short (min. 2 characters)',
      nameTooLong: 'Name too long (max. 15 characters)',
      next: 'Next',
      hello: 'Hello',
      pickGrade: 'Grade',
      pickAge: 'Age',
      years: 'years',
      grade: 'Grade',
      letsGo: "Let's go!",
      back: 'Back',
      saveProgress: 'Save your progress!',
      connectOptional: 'Optional - you can connect later',
      schoolCode: 'Enter school code',
      schoolCodeDesc: 'Play with your school',
      parentEmail: 'Parent email',
      parentEmailDesc: 'Parents can watch',
      googleSignIn: 'Sign in with Google',
      googleDesc: 'Quick & easy',
      skip: 'Skip',
      playNow: 'Play now!',
      backToOptions: 'Back to options',
      enterSchoolCode: 'Enter school code',
      enterParentEmail: 'Enter parent email',
      parentEmailNote: 'Your parents will receive a confirmation',
      connect: 'Connect',
      sendToParents: 'Send to parents',
      whyConnect: 'Why connect?',
      benefitSave: 'Save progress',
      benefitDevices: 'Play on other devices',
      benefitFriends: 'Add friends',
      learnKickId: 'LearnKick ID',
      secureProgress: 'Secure your progress!',
      couldBeLost: 'This data could be lost!',
      connectNow: 'Connect now',
      remindLater: 'Later',
      neverAsk: 'Never ask again'
    },

    offlineMode: {
      online: 'Online',
      offline: 'Offline',
      onlineMode: 'Online Mode',
      offlineMode: 'Offline Mode',
      cachedQuestions: 'Cached Questions',
      serviceWorker: 'Service Worker',
      active: 'Active',
      inactive: 'Inactive',
      storageUsed: 'Storage Used',
      downloadForOffline: 'Download for Offline',
      downloading: 'Downloading...',
      downloadComplete: 'Downloaded {count} new questions for offline play!',
      downloadFailed: 'Failed to download questions',
      clearOfflineData: 'Clear offline data',
      offlineReady: 'Ready to play offline!',
      noQuestionsAvailable: 'No cached questions available. Connect to internet and download questions for offline play.',
      connectToDownload: 'Download questions to play offline without internet.',
      cached: 'cached',
      questionsReady: 'You can still play practice games with your {count} cached questions!'
    }
  },

  de: {
    welcome: 'LearnKick',
    welcomeSubtitle: 'Sportliche Lernspiele für Kinder!',
    startPlaying: 'Los geht\'s!',
    backToMenu: 'Zurück zum Menü',
    loading: 'Lädt...',
    error: 'Fehler',
    start: 'START',

    playerSetup: {
      title: 'Willkommen bei LearnKick!',
      subtitle: 'Lass uns dein Spielerprofil erstellen',
      nameLabel: 'Wie heisst du?',
      namePlaceholder: 'Gib deinen Namen ein...',
      gradeLabel: 'In welche Klasse gehst du?',
      languageLabel: 'Wähle deine Sprache',
      wherePlayingLabel: 'Wo spielst du?',
      grades: {
        1: 'Klasse 1 (Alter 6-7)',
        2: 'Klasse 2 (Alter 7-8)',
        3: 'Klasse 3 (Alter 8-9)',
        4: 'Klasse 4 (Alter 9-10)',
        5: 'Klasse 5 (Alter 10-11)',
        6: 'Klasse 6 (Alter 11-12)'
      },
      helpText: 'Deine Angaben helfen uns, altersgerechte Fragen zu stellen',
      settingsSaved: 'Deine Einstellungen werden automatisch gespeichert',
      errors: {
        nameRequired: 'Bitte gib deinen Namen ein',
        nameTooShort: 'Der Name muss mindestens 2 Zeichen haben',
        modeRequired: 'Bitte wähle Schule oder Zuhause'
      }
    },

    gameModes: {
      title: 'Wähle deinen Spielmodus',
      subtitle: 'Wähle die Lernerfahrung, die am besten zu dir passt',
      family: {
        name: 'Familienmodus',
        description: 'Spassige Lernerfahrung für die Familienzeit',
        subtitle: 'Familienmodus',
        features: [
          'Entspannte Zeitlimits (20 Sekunden pro Frage)',
          'Ermutigende Nachrichten und Belohnungen',
          'Mehrere Versuche erlaubt',
          'Fokus auf Lernen und Spass'
        ],
        bestFor: ['Familienzeit', 'Entspanntes Üben', 'Selbstvertrauen aufbauen']
      },
      school: {
        name: 'Schulmodus',
        description: 'Strukturierte Lernumgebung für Bildungsbewertung',
        subtitle: 'Lehrermodus',
        features: [
          'Standardzeit (15 Sekunden pro Frage)',
          'Detaillierte Leistungsstatistiken',
          'Ein Versuch pro Frage',
          'Fortschrittsberichte'
        ],
        bestFor: ['Klassenraum-Nutzung', 'Formale Bewertung', 'Fortschrittskontrolle']
      },
      continue: 'Weiter mit',
      selected: 'Ausgewählt!'
    },

    gameSetup: {
      title: 'Spiel-Einstellungen',
      arena: 'Arena',
      subject: 'Fach',
      language: 'Sprache',
      grade: 'Klasse',
      questionLanguage: 'Fragensprache',
      subjects: {
        all: 'Alle Fächer',
        math: 'Mathematik',
        german: 'Deutsch',
        french: 'Französisch',
        english: 'Englisch',
        science: 'Naturwissenschaft',
        geography: 'Geographie',
        history: 'Geschichte',
        music: 'Musik',
        art: 'Kunst',
        sports: 'Sport',
        digital: 'Digitale Kompetenz',
        language: 'Sprache',
        'general-knowledge': 'Allgemeinwissen'
      },
      arenas: {
        soccer: 'Fussball',
        hockey: 'Eishockey'
      }
    },

    team: {
      myTeam: 'Mein Team',
      formation: 'Formation',
      elixir: 'Elixier',
      league: 'Liga',
      train: 'Training',
      playMatch: 'Spiel starten',
      stats: 'Statistiken',
      goalkeeper: 'Torwart',
      defense: 'Verteidigung',
      midfield: 'Mittelfeld',
      attack: 'Angriff',
      positions: {
        GK: 'Torwart',
        RB: 'Rechter Verteidiger',
        CB: 'Innenverteidiger',
        LB: 'Linker Verteidiger',
        CM: 'Zentrales Mittelfeld',
        CAM: 'Offensives Mittelfeld',
        LW: 'Linker Flügel',
        ST: 'Stürmer',
        RW: 'Rechter Flügel',
        LD: 'Linke Verteidigung',
        RD: 'Rechte Verteidigung',
        C: 'Center',
        G: 'Torhüter'
      },
      cardRarity: {
        bronze: 'Bronze',
        silver: 'Silber',
        gold: 'Gold',
        diamond: 'Diamant',
        champion: 'Champion'
      },
      level: 'Level',
      overall: 'Gesamt',
      accuracy: 'Genauigkeit',
      speed: 'Geschwindigkeit',
      consistency: 'Beständigkeit',
      difficulty: 'Schwierigkeit',
      xp: 'EP',
      trainPlayer: 'Spieler trainieren',
      elixirNeeded: 'Elixier benötigt',
      chooseGoalkeeper: 'Wähle deinen Torwart',
      chooseGoalkeeperDesc: 'Wähle welches Fach dein Torwart sein soll - deine letzte Verteidigungslinie!',
      // Training
      standardTraining: 'Standard-Training',
      standardTrainingDesc: 'Einfacher EP-Boost',
      quickLevel: 'Schnell-Level',
      quickLevelDesc: '5x der EP-Boost!',
      available: 'verfügbar',
      trainingComplete: 'Training abgeschlossen!',
      training: 'Training...',
      train: 'Trainieren',
      leveling: 'Aufleveln...',
      needMore: 'Noch {amount} nötig',
      // Lobby
      battle: 'Kampf',
      practice: 'Übung',
      online: 'Online',
      offline: 'Offline',
      selectSubject: 'Fach wählen',
      selectArena: 'Arena wählen',
      leagueTable: 'Ligatabelle',
      viewLeague: 'Liga anzeigen',
      closeLeague: 'Liga schliessen',
      // League
      schoolLeague: 'Schulliga',
      globalLeague: 'Globale Liga',
      tierProgress: 'Stufenfortschritt',
      rank: 'Rang',
      played: 'Sp',
      won: 'S',
      drawn: 'U',
      lost: 'N',
      goalsFor: 'T+',
      goalsAgainst: 'T-',
      goalDiff: 'TD',
      points: 'Pkt',
      promotionZone: 'Aufstiegszone',
      relegationZone: 'Abstiegszone',
      leagueTiers: {
        bronze: 'Bronze',
        silver: 'Silber',
        gold: 'Gold',
        platinum: 'Platin',
        diamond: 'Diamant',
        champion: 'Champion',
        legend: 'Legende'
      },
      // Match Results
      matchComplete: 'Spiel beendet!',
      elixirEarned: 'Elixier verdient',
      xpDistributed: 'EP verteilt',
      cardsLeveledUp: 'Karten aufgelevelt!',
      leaguePointsChange: 'Ligapunkte',
      viewTeam: 'Team anzeigen',
      // TeamView
      teamRating: 'Teambewertung',
      pts: 'Pkt',
      avgLevel: 'Ø Level',
      playersCount: 'Spieler',
      squad: 'Kader',
      posAbbrev: 'POS',
      subjectCol: 'FACH',
      lvlAbbrev: 'LVL',
      ovrAbbrev: 'GES',
      rarityCol: 'SELTENHEIT',
      ratingsLabel: 'Bewertungen:',
      tapToTrain: 'Tippe auf einen Spieler um ihn mit Elixir zu trainieren',
      // PlayerCard
      lvPrefix: 'Lv.',
      accAbbrev: 'GEN',
      spdAbbrev: 'GES',
      conAbbrev: 'KON',
      difAbbrev: 'SCH',
      xpLabel: 'EP:',
      gkLabel: 'TW',
      // LeagueTable
      school: 'Schule',
      global: 'Global',
      teamCol: 'TEAM',
      pAbbrev: 'S',
      wAbbrev: 'G',
      dAbbrev: 'U',
      lAbbrev: 'V',
      gdAbbrev: 'TD',
      ptsAbbrev: 'PKT',
      youLabel: 'Du',
      nextTier: 'Nächste Liga:',
      ptsNeeded: 'Pkt nötig',
      maxTier: 'Max',
      // ElixirBar
      dailyEarned: 'Heute verdient',
      dailyCapReached: 'Tageslimit erreicht! Komm morgen wieder.',
      trainCost: 'Trainingskosten',
      xpGain: 'EP-Gewinn',
      weekBonus: 'Wochenbonus',
      speedBonus: 'Geschwindigkeitsbonus:',
      streakBonus: 'Serienbonus:',
      elixirGain: 'Elixir'
    },

    settings: {
      title: 'Einstellungen',
      playingAs: 'Spielen als',
      mode: 'Modus',
      gradeLevel: 'Klassenstufe',
      subject: 'Fach',
      arena: 'Arena',
      questionLanguage: 'Fragensprache',
      dangerZone: 'Gefahrenzone',
      resetProfile: 'Profil & Daten zurücksetzen',
      resetConfirm: 'Dies löscht alle deine Fortschritte, Statistiken und Einstellungen. Bist du sicher?',
      saveSettings: 'Einstellungen speichern',
      cancel: 'Abbrechen',
      yesDelete: 'Ja, löschen',
      gameTab: 'SPIEL',
      accessibilityTab: 'BARRIEREFREIHEIT',
      selectArena: 'ARENA WÄHLEN',
      selectSubject: 'FACH WÄHLEN',
      appLanguage: 'APP-SPRACHE',
      gameMode: 'SPIELMODUS',
      visual: 'VISUELL',
      dyslexiaFont: 'Legasthenie-Schriftart',
      dyslexiaFontDesc: 'Leichter lesbar bei Legasthenie',
      fontSize: 'Schriftgrösse',
      controls: 'STEUERUNG',
      largerButtons: 'Grössere Buttons',
      largerButtonsDesc: 'Leichter zu tippen',
      moreTime: 'Mehr Zeit',
      moreTimeDesc: 'Verlängerte Zeitlimits',
      audio: 'AUDIO',
      soundEffects: 'Soundeffekte',
      soundEffectsDesc: 'Spielsounds & Musik',
      backgroundMusic: 'Hintergrundmusik',
      on: 'AN',
      off: 'AUS',
      home: 'Startseite',
      simpleMode: 'Einfacher Modus',
      simpleModeDesc: 'Weniger Animationen',
      dangerZoneTitle: 'GEFAHRENZONE',
      resetAllProgress: 'Alle Fortschritte zurücksetzen',
      confirmResetModal: 'Bist du sicher? Dies löscht alle deine Fortschritte!',
      done: 'FERTIG',
      delete: 'Löschen'
    },

    game: {
      pause: 'Pause',
      resume: 'Fortsetzen',
      goals: 'Tore',
      streak: 'Serie',
      question: 'Frage',
      timeUp: 'Zeit ist um!',
      correct: 'Richtig!',
      incorrect: 'Falsch',
      nextQuestion: 'Nächste Frage',
      gameOver: 'Spiel beendet!',
      winner: 'Sieger',
      finalScore: 'Endergebnis',
      accuracy: 'Genauigkeit',
      correctAnswers: 'Richtig',
      maxStreak: 'Beste Serie',
      playAgain: 'Nochmal spielen',
      you: 'DU',
      aiRival: 'KI-GEGNER',
      rival: 'GEGNER',
      vs: 'VS',
      getReady: 'Mach dich bereit!',
      gameStartsSoon: 'Das Spiel startet gleich...',
      loadingQuestion: 'Frage wird geladen...',
      gamePaused: 'Spiel pausiert',
      clickResume: 'Klicke auf Fortsetzen um weiterzuspielen',
      grade: 'Klasse',
      trueLabel: 'Wahr',
      falseLabel: 'Falsch',
      battle: 'KAMPF',
      access: 'Zugang',
      gameActive: 'Spiel läuft',
      waiting: 'Warten',
      questionImageAlt: 'Fragenbild',
      goal: 'TOR!',
      miss: 'DANEBEN!',
      towardGoal: '+1 zum Tor',
      keepGoing: 'Weiter so!',
      youScored: 'Du hast getroffen!',
      opponentScored: 'Gegner hat getroffen!',
      yourGoal: 'Dein Tor',
      theirGoal: 'Ihr Tor',
      loading: 'Lädt...',
      seconds: 'Sekunden',
      loadingQuestion: 'Frage wird geladen...',
      opponentAnswered: 'Gegner hat geantwortet!',
      opponentDisconnected: 'Gegner getrennt. Warte auf Neuverbindung...',
      loadingScreen: {
        preparingStadium: 'Das Stadion wird vorbereitet',
        settingUpField: 'Das Spielfeld wird aufgebaut...',
        loadingQuestions: 'Fragen werden geladen',
        downloadingOffline: 'Fragen für Offline-Spiel werden heruntergeladen...',
        syncingData: 'Daten synchronisieren',
        savingProgress: 'Dein Fortschritt wird gespeichert...',
        preparingMatch: 'Match wird vorbereitet',
        gettingTeamReady: 'Dein Team wird vorbereitet...',
        ready: 'Bereit!',
        letsPlay: 'Los geht\'s!',
        tip: 'Tipp',
        questions: 'Fragen',
        complete: 'Fertig!',
        elixirTip: 'Antworte schnell für Bonus-Elixier!',
        tips: {
          answerQuickly: 'Antworte schnell, um mehr Tore zu schiessen!',
          streakBonus: 'Eine Richtig-Serie bringt Bonus-Elixier!',
          practicePerfect: 'Übung macht den Meister - spiel weiter!',
          checkStats: 'Schau dir nach dem Spiel deine Team-Statistiken an.',
          threeCorrectGoal: 'Jedes Tor braucht 3 richtige Antworten!',
          slidePuck: 'Schnelle Antworten lassen den Puck gleiten!',
          questionsAdapt: 'Die Fragen passen sich deinem Level an.',
          offlinePlay: 'Spiel jederzeit offline - Fragen werden gespeichert!',
          improveCards: 'Deine Antworten verbessern deine Spielerkarten.'
        }
      }
    },

    multiplayer: {
      title: 'Mehrspieler',
      subtitle: 'Fordere echte Spieler weltweit heraus!',
      findMatch: 'Spiel finden',
      backToHome: 'Zurück zur Startseite',
      skillLevelInfo: 'Spiele gegen Spieler auf deinem Niveau',
      trophiesInfo: 'Gewinne Spiele, um Trophäen zu verdienen und aufzusteigen!',
      matchReady: 'Spiel bereit!',
      connecting: 'Verbinde...',
      ready: 'Bereit!',
      notReady: 'Nicht bereit',
      waitingFor: 'Warten...',
      waitingForOpponent: 'Warte auf Gegner...',
      correct: 'richtig'
    },

    profile: {
      ranks: {
        champion: 'Champion',
        diamond: 'Diamant',
        gold: 'Gold',
        silver: 'Silber',
        bronze: 'Bronze',
        rookie: 'Anfänger'
      },
      rating: 'Bewertung',
      wins: 'Siege',
      bestStreak: 'Beste Serie',
      gamesPlayed: 'Spiele gespielt'
    },

    matchResults: {
      victory: 'SIEG!',
      draw: 'UNENTSCHIEDEN',
      defeat: 'NIEDERLAGE',
      you: 'Du',
      opponent: 'Gegner',
      elixirEarned: 'Elixir verdient',
      leaguePoints: 'Liga-Punkte',
      xpGained: 'XP erhalten',
      playersLeveledUp: 'Spieler aufgestiegen!',
      playerLeveledUp: 'Spieler aufgestiegen!',
      questions: 'Fragen',
      accuracy: 'Genauigkeit',
      bestStreak: 'Beste Serie',
      total: 'gesamt',
      continueButton: 'Weiter'
    },

    playerSetup: {
      title: 'Spieler-Einrichtung',
      subtitle: 'Mach dich bereit zum Spielen!',
      nameLabel: 'Dein Name',
      namePlaceholder: 'Gib deinen Namen ein',
      gradeLabel: 'Klassenstufe',
      gradeOption: 'Klasse',
      languageLabel: 'Sprache',
      startButton: 'Jetzt spielen!'
    },

    matchmaking: {
      findingOpponent: 'Gegner suchen',
      playersOnline: 'Spieler online',
      position: 'Position:',
      cancel: 'Abbrechen',
      goBack: 'Zurück',
      error: 'Fehler',
      somethingWrong: 'Etwas ist schief gelaufen',
      tips: {
        lookingSkillLevel: 'Suche nach Spielern auf deinem Niveau...',
        expandingSearch: 'Erweitere Suche für ein gutes Match...',
        almostThere: 'Fast geschafft! Suche nach verfügbaren Gegnern...',
        hangTight: 'Geduld! Manchmal dauert es einen Moment, das perfekte Match zu finden.'
      },
      matchFound: 'MATCH GEFUNDEN!',
      you: 'Du',
      vs: 'VS',
      trophies: 'Trophäen',
      matchQuality: {
        perfect: 'Perfektes Match!',
        great: 'Tolles Match!',
        good: 'Gutes Match!',
        found: 'Match gefunden!'
      },
      gameStartingIn: 'Spiel startet in...',
      startingGame: 'Spiel startet...',
      go: 'LOS!',
      playMultiplayer: 'Mehrspieler'
    },

    accessibility: {
      title: 'Barrierefreiheit',
      subtitle: 'Passe deine Lernerfahrung an',
      sections: {
        visual: 'Visuell',
        motor: 'Motorik',
        cognitive: 'Kognitiv',
        audio: 'Audio'
      },
      theme: 'Design',
      fontSize: 'Schriftgrösse',
      themes: {
        light: 'Hell',
        dark: 'Dunkel',
        highContrast: 'Hoher Kontrast'
      },
      fontSizes: {
        small: 'Klein',
        medium: 'Mittel',
        large: 'Gross',
        extraLarge: 'Sehr gross'
      },
      dyslexiaFont: 'Legasthenie-Schrift',
      dyslexiaFontDesc: 'Verwendet OpenDyslexic für bessere Lesbarkeit',
      largerTargets: 'Grössere Klickflächen',
      largerTargetsDesc: 'Macht Buttons und interaktive Elemente grösser',
      stickyButtons: 'Haftende Buttons',
      stickyButtonsDesc: 'Buttons bleiben länger gedrückt für einfachere Bedienung',
      simplifiedUI: 'Vereinfachte Oberfläche',
      simplifiedUIDesc: 'Reduziert visuelle Komplexität und Ablenkungen',
      extendedTimeouts: 'Verlängerte Zeitlimits',
      extendedTimeoutsDesc: 'Gibt mehr Zeit zum Lesen und Beantworten',
      soundEffects: 'Soundeffekte',
      soundEffectsDesc: 'Spielt Töne bei richtigen/falschen Antworten',
      screenReader: 'Screenreader-Unterstützung',
      screenReaderDesc: 'Verbesserte Kompatibilität mit Screenreadern',
      done: 'Fertig'
    },

    languages: {
      en: '🇬🇧 Englisch',
      de: '🇩🇪 Deutsch',
      fr: '🇫🇷 Französisch',
      sq: '🇦🇱 Albanisch'
    },

    lobby: {
      tapToChange: 'tippen zum Ändern',
      clickToChange: 'klicken zum Ändern',
      tap: 'tippen',
      level: 'Level',
      elo: 'ELO',
      games: 'Spiele',
      wins: 'Siege',
      accuracy: 'Genauigkeit',
      bestStreak: 'Beste Serie',
      onlineBattleAvailable: 'Online - Kampfmodus verfügbar',
      offlinePracticeOnly: 'Offline - Nur Übungsmodus',
      practice: 'ÜBUNG',
      battle: 'KAMPF!',
      noTrophies: 'Keine Trophäen',
      earnTrophies: '+Trophäen',
      requiresWifi: 'WLAN erforderlich',
      finding: 'SUCHE...',
      rankedEarnTrophies: 'Rangliste - Verdiene Trophäen',
      trainingNoTrophies: 'Training - Keine Trophäen',
      requiresInternet: 'Internet erforderlich',
      connectToInternet: 'Für Ranglistenspiele Internet verbinden',
      online: 'Online',
      offline: 'Offline',
      teamNav: 'Team',
      leagueNav: 'Liga',
      settingsNav: 'Einstellungen',
      profileNav: 'Profil',
      myTeam: 'MEIN TEAM',
      leagueTable: 'LIGATABELLE',
      gameSettings: 'SPIELEINSTELLUNGEN',
      leaderboard: 'BESTENLISTE',
      topPlayers: 'Top-Spieler',
      fullProfile: 'Vollständiges Profil',
      shopComingSoon: 'Shop kommt bald!',
      playerProfile: 'SPIELERPROFIL',
      close: 'SCHLIESSEN',
      comingSoonMultiplayer: 'Bald verfügbar mit Mehrspieler!',
      creatingTeam: 'Dein Team wird erstellt...',
      lvl: 'Lvl',
      // Email linking
      linkAccount: 'Konto verknüpfen',
      accountLinked: 'Konto verknüpft',
      linkAccountDescription: 'Verliere nie deinen Fortschritt',
      link: 'Verknüpfen',
      change: 'Ändern'
    },

    admin: {
      title: 'Admin-Panel',
      welcomeBack: 'Willkommen zurück',
      signInToAccess: 'Anmelden für Zugang zum Admin-Panel',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      login: 'Anmelden',
      signIn: 'Anmelden',
      signingIn: 'Anmeldung läuft...',

      schoolAdmin: 'Schul-Administrator',
      parent: 'Elternteil',
      createSchoolAccount: 'Schulkonto erstellen',
      joinSchoolAsParent: 'Als Elternteil einer Schule beitreten',
      fullName: 'Vollständiger Name',
      schoolName: 'Schulname',
      schoolCode: 'Schulcode',
      confirmPassword: 'Passwort bestätigen',
      createAccount: 'Konto erstellen',
      creating: 'Erstellen...',

      overview: 'Übersicht',
      dashboard: 'Dashboard',
      questionBank: 'Fragenbank',
      userManagement: 'Benutzerverwaltung',
      analytics: 'Analysen',
      schoolSettings: 'Schuleinstellungen',

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

      quickActions: 'Schnellaktionen',
      addQuestions: 'Fragen hinzufügen',
      importCSV: 'CSV importieren',
      inviteTeacher: 'Lehrer einladen',
      exportData: 'Daten exportieren',
      viewAnalytics: 'Analysen anzeigen',

      recentActivity: 'Letzte Aktivitäten',
      recentGameSessions: 'Letzte Spielsitzungen',
      noGameSessions: 'Noch keine Spielsitzungen',
      studentsWillAppear: 'Schüler erscheinen hier nach dem Spielen',

      questionManagement: 'Fragenverwaltung',
      addQuestion: 'Frage hinzufügen',
      editQuestion: 'Frage bearbeiten',
      deleteQuestion: 'Frage löschen',
      exportCSV: 'CSV exportieren',
      totalQuestionsAvailable: 'Verfügbare Fragen gesamt',
      questionsBySubject: 'Fragen nach Fach',
      questionsByGrade: 'Fragen nach Klasse',
      importFromCSV: 'Aus CSV importieren',

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

      analyticsTitle: 'Analyse-Dashboard',
      trackPerformance: 'Schülerleistung und Lernfortschritt verfolgen',
      performanceBySubject: 'Leistung nach Fach',
      performanceByGrade: 'Leistung nach Klasse',
      performanceTrends: 'Leistungstrends',
      topPerformers: 'Top-Performer dieser Woche',
      accuracy: 'Genauigkeit',
      questionsAnswered: 'Beantwortete Fragen',

      settings: 'Einstellungen',
      schoolSettingsTitle: 'Schuleinstellungen',

      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      view: 'Anzeigen',
      close: 'Schliessen',
      refresh: 'Aktualisieren',

      justNow: 'Gerade eben',
      hoursAgo: 'Std. her',
      daysAgo: 'T. her',
      never: 'Niemals'
    },

    // Kid Registration Flow (German - Default)
    kidRegistration: {
      whatsYourName: 'Wie heisst du?',
      enterUsername: 'Gib deinen Spielernamen ein',
      usernamePlaceholder: 'Dein Name...',
      characters: 'Zeichen',
      nameTooShort: 'Name zu kurz (min. 2 Zeichen)',
      nameTooLong: 'Name zu lang (max. 15 Zeichen)',
      next: 'Weiter',
      hello: 'Hallo',
      pickGrade: 'Klasse',
      pickAge: 'Alter',
      years: 'Jahre',
      grade: 'Klasse',
      letsGo: "Los geht's!",
      back: 'Zuruck',
      saveProgress: 'Speichere deinen Fortschritt!',
      connectOptional: 'Optional - du kannst auch spater verbinden',
      schoolCode: 'Schulcode eingeben',
      schoolCodeDesc: 'Mit deiner Schule spielen',
      parentEmail: 'Eltern-Email',
      parentEmailDesc: 'Eltern konnen zusehen',
      googleSignIn: 'Mit Google anmelden',
      googleDesc: 'Schnell & einfach',
      skip: 'Uberspringen',
      playNow: 'Jetzt spielen!',
      backToOptions: 'Zuruck zu Optionen',
      enterSchoolCode: 'Schulcode eingeben',
      enterParentEmail: 'Eltern-Email eingeben',
      parentEmailNote: 'Deine Eltern bekommen eine Bestatigung',
      connect: 'Verbinden',
      sendToParents: 'An Eltern senden',
      whyConnect: 'Warum verbinden?',
      benefitSave: 'Fortschritt speichern',
      benefitDevices: 'Auf anderen Geraten spielen',
      benefitFriends: 'Freunde hinzufugen',
      learnKickId: 'LearnKick ID',
      secureProgress: 'Sichere deinen Fortschritt!',
      couldBeLost: 'Diese Daten konnten verloren gehen!',
      connectNow: 'Jetzt verbinden',
      remindLater: 'Spater',
      neverAsk: 'Nicht mehr fragen'
    },

    offlineMode: {
      online: 'Online',
      offline: 'Offline',
      onlineMode: 'Online-Modus',
      offlineMode: 'Offline-Modus',
      cachedQuestions: 'Gespeicherte Fragen',
      serviceWorker: 'Service Worker',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      storageUsed: 'Speicher verwendet',
      downloadForOffline: 'Für Offline herunterladen',
      downloading: 'Wird heruntergeladen...',
      downloadComplete: '{count} neue Fragen für Offline-Spiel heruntergeladen!',
      downloadFailed: 'Fragen konnten nicht heruntergeladen werden',
      clearOfflineData: 'Offline-Daten löschen',
      offlineReady: 'Bereit zum Offline-Spielen!',
      noQuestionsAvailable: 'Keine gespeicherten Fragen verfügbar. Verbinde dich mit dem Internet und lade Fragen herunter.',
      connectToDownload: 'Lade Fragen herunter, um ohne Internet zu spielen.',
      cached: 'gespeichert',
      questionsReady: 'Du kannst noch mit deinen {count} gespeicherten Fragen üben!'
    }
  },

  fr: {
    welcome: 'LearnKick',
    welcomeSubtitle: 'Jeux d\'apprentissage sportifs pour enfants!',
    startPlaying: 'Commencer à jouer!',
    backToMenu: 'Retour au menu',
    loading: 'Chargement...',
    error: 'Erreur',
    start: 'DÉMARRER',

    playerSetup: {
      title: 'Bienvenue dans LearnKick!',
      subtitle: 'Créons ton profil de joueur',
      nameLabel: 'Comment tu t\'appelles?',
      namePlaceholder: 'Écris ton nom...',
      gradeLabel: 'En quelle classe es-tu?',
      languageLabel: 'Choisis ta langue',
      wherePlayingLabel: 'Où joues-tu?',
      grades: {
        1: '1ère année (6-7 ans)',
        2: '2ème année (7-8 ans)',
        3: '3ème année (8-9 ans)',
        4: '4ème année (9-10 ans)',
        5: '5ème année (10-11 ans)',
        6: '6ème année (11-12 ans)'
      },
      helpText: 'Tes informations nous aident à proposer des questions adaptées à ton âge',
      settingsSaved: 'Tes paramètres sont sauvegardés automatiquement',
      errors: {
        nameRequired: 'Entre ton nom s\'il te plaît',
        nameTooShort: 'Le nom doit avoir au moins 2 caractères',
        modeRequired: 'Choisis École ou Maison s\'il te plaît'
      }
    },

    gameModes: {
      title: 'Choisis ton mode de jeu',
      subtitle: 'Sélectionne l\'expérience d\'apprentissage qui te convient',
      family: {
        name: 'Mode Famille',
        description: 'Expérience d\'apprentissage amusante pour le temps en famille',
        subtitle: 'Mode famille',
        features: [
          'Temps détendu (20 secondes par question)',
          'Messages encourageants et célébrations',
          'Plusieurs tentatives autorisées',
          'Focus sur l\'apprentissage et le plaisir'
        ],
        bestFor: ['Temps en famille', 'Pratique décontractée', 'Renforcer la confiance']
      },
      school: {
        name: 'Mode École',
        description: 'Environnement d\'apprentissage structuré pour l\'évaluation éducative',
        subtitle: 'Mode professeur',
        features: [
          'Temps standard (15 secondes par question)',
          'Statistiques de performance détaillées',
          'Une seule tentative par question',
          'Rapports de progression'
        ],
        bestFor: ['Usage en classe', 'Évaluation formelle', 'Suivi des progrès']
      },
      continue: 'Continuer avec',
      selected: 'Sélectionné!'
    },

    gameSetup: {
      title: 'Configuration du jeu',
      arena: 'Arène',
      subject: 'Matière',
      language: 'Langue',
      grade: 'Niveau',
      questionLanguage: 'Langue des questions',
      subjects: {
        all: 'Toutes les matières',
        math: 'Mathématiques',
        german: 'Allemand',
        french: 'Français',
        english: 'Anglais',
        science: 'Sciences',
        geography: 'Géographie',
        history: 'Histoire',
        music: 'Musique',
        art: 'Arts visuels',
        sports: 'Sport',
        digital: 'Compétences numériques',
        language: 'Langue',
        'general-knowledge': 'Culture générale'
      },
      arenas: {
        soccer: 'Football',
        hockey: 'Hockey'
      }
    },

    team: {
      myTeam: 'Mon équipe',
      formation: 'Formation',
      elixir: 'Élixir',
      league: 'Ligue',
      train: 'Entraîner',
      playMatch: 'Jouer un match',
      stats: 'Statistiques',
      goalkeeper: 'Gardien',
      defense: 'Défense',
      midfield: 'Milieu de terrain',
      attack: 'Attaque',
      positions: {
        GK: 'Gardien',
        RB: 'Arrière droit',
        CB: 'Défenseur central',
        LB: 'Arrière gauche',
        CM: 'Milieu central',
        CAM: 'Milieu offensif',
        LW: 'Ailier gauche',
        ST: 'Attaquant',
        RW: 'Ailier droit',
        LD: 'Défense gauche',
        RD: 'Défense droite',
        C: 'Centre',
        G: 'Gardien'
      },
      cardRarity: {
        bronze: 'Bronze',
        silver: 'Argent',
        gold: 'Or',
        diamond: 'Diamant',
        champion: 'Champion'
      },
      level: 'Niveau',
      overall: 'Global',
      accuracy: 'Précision',
      speed: 'Vitesse',
      consistency: 'Régularité',
      difficulty: 'Difficulté',
      xp: 'XP',
      trainPlayer: 'Entraîner joueur',
      elixirNeeded: 'Élixir nécessaire',
      chooseGoalkeeper: 'Choisis ton gardien',
      chooseGoalkeeperDesc: 'Choisis quelle matière sera ton gardien - ta dernière ligne de défense!',
      // Training
      standardTraining: 'Entraînement standard',
      standardTrainingDesc: 'Boost XP de base',
      quickLevel: 'Niveau rapide',
      quickLevelDesc: '5x le boost XP!',
      available: 'disponible',
      trainingComplete: 'Entraînement terminé!',
      training: 'Entraînement...',
      train: 'Entraîner',
      leveling: 'Montée de niveau...',
      needMore: 'Il te faut encore {amount}',
      // Lobby
      battle: 'Combat',
      practice: 'Entraînement',
      online: 'En ligne',
      offline: 'Hors ligne',
      selectSubject: 'Choisir matière',
      selectArena: 'Choisir arène',
      leagueTable: 'Classement',
      viewLeague: 'Voir la ligue',
      closeLeague: 'Fermer la ligue',
      // League
      schoolLeague: 'Ligue scolaire',
      globalLeague: 'Ligue mondiale',
      tierProgress: 'Progression de niveau',
      rank: 'Rang',
      played: 'J',
      won: 'V',
      drawn: 'N',
      lost: 'D',
      goalsFor: 'BP',
      goalsAgainst: 'BC',
      goalDiff: 'DB',
      points: 'Pts',
      promotionZone: 'Zone de promotion',
      relegationZone: 'Zone de relégation',
      leagueTiers: {
        bronze: 'Bronze',
        silver: 'Argent',
        gold: 'Or',
        platinum: 'Platine',
        diamond: 'Diamant',
        champion: 'Champion',
        legend: 'Légende'
      },
      // Match Results
      matchComplete: 'Match terminé!',
      elixirEarned: 'Élixir gagné',
      xpDistributed: 'XP distribué',
      cardsLeveledUp: 'Cartes améliorées!',
      leaguePointsChange: 'Points de ligue',
      viewTeam: 'Voir l\'équipe',
      // TeamView
      teamRating: 'Note d\'équipe',
      pts: 'pts',
      avgLevel: 'Niveau moy.',
      playersCount: 'joueurs',
      squad: 'Effectif',
      posAbbrev: 'POS',
      subjectCol: 'MATIÈRE',
      lvlAbbrev: 'NIV',
      ovrAbbrev: 'GEN',
      rarityCol: 'RARETÉ',
      ratingsLabel: 'Notes:',
      tapToTrain: 'Touche un joueur pour l\'entraîner avec de l\'élixir',
      // PlayerCard
      lvPrefix: 'Niv.',
      accAbbrev: 'PRE',
      spdAbbrev: 'VIT',
      conAbbrev: 'CON',
      difAbbrev: 'DIF',
      xpLabel: 'XP:',
      gkLabel: 'GB',
      // LeagueTable
      school: 'École',
      global: 'Global',
      teamCol: 'ÉQUIPE',
      pAbbrev: 'J',
      wAbbrev: 'G',
      dAbbrev: 'N',
      lAbbrev: 'P',
      gdAbbrev: 'DB',
      ptsAbbrev: 'PTS',
      youLabel: 'Toi',
      nextTier: 'Prochain niveau:',
      ptsNeeded: 'pts requis',
      maxTier: 'Max',
      // ElixirBar
      dailyEarned: 'Gagné aujourd\'hui',
      dailyCapReached: 'Limite journalière atteinte! Reviens demain.',
      trainCost: 'Coût d\'entraînement',
      xpGain: 'Gain XP',
      weekBonus: 'Bonus semaine',
      speedBonus: 'Bonus vitesse:',
      streakBonus: 'Bonus série:',
      elixirGain: 'Élixir'
    },

    settings: {
      title: 'Paramètres',
      playingAs: 'Jouer en tant que',
      mode: 'Mode',
      gradeLevel: 'Niveau de classe',
      subject: 'Matière',
      arena: 'Arène',
      questionLanguage: 'Langue des questions',
      dangerZone: 'Zone dangereuse',
      resetProfile: 'Réinitialiser profil et données',
      resetConfirm: 'Cela supprimera tous tes progrès, statistiques et paramètres. Es-tu sûr?',
      saveSettings: 'Sauvegarder les paramètres',
      cancel: 'Annuler',
      yesDelete: 'Oui, supprimer',
      gameTab: 'JEU',
      accessibilityTab: 'ACCESSIBILITÉ',
      selectArena: 'CHOISIR L\'ARÈNE',
      selectSubject: 'CHOISIR LA MATIÈRE',
      appLanguage: 'LANGUE DE L\'APP',
      gameMode: 'MODE DE JEU',
      visual: 'VISUEL',
      dyslexiaFont: 'Police dyslexie',
      dyslexiaFontDesc: 'Plus facile à lire pour la dyslexie',
      fontSize: 'Taille de police',
      controls: 'CONTRÔLES',
      largerButtons: 'Boutons plus grands',
      largerButtonsDesc: 'Plus facile à toucher',
      moreTime: 'Plus de temps',
      moreTimeDesc: 'Délais prolongés',
      audio: 'AUDIO',
      soundEffects: 'Effets sonores',
      soundEffectsDesc: 'Sons et musique du jeu',
      backgroundMusic: 'Musique de fond',
      on: 'OUI',
      off: 'NON',
      home: 'Accueil',
      simpleMode: 'Mode simple',
      simpleModeDesc: 'Moins d\'animations',
      dangerZoneTitle: 'ZONE DANGEREUSE',
      resetAllProgress: 'Réinitialiser tous les progrès',
      confirmResetModal: 'Es-tu sûr? Cela supprimera tous tes progrès!',
      done: 'TERMINÉ',
      delete: 'Supprimer'
    },

    game: {
      pause: 'Pause',
      resume: 'Reprendre',
      goals: 'Buts',
      streak: 'Série',
      question: 'Question',
      timeUp: 'Temps écoulé!',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      nextQuestion: 'Question suivante',
      gameOver: 'Fin du jeu!',
      winner: 'Gagnant',
      finalScore: 'Score final',
      accuracy: 'Précision',
      correctAnswers: 'Correct',
      maxStreak: 'Meilleure série',
      playAgain: 'Rejouer',
      you: 'TOI',
      aiRival: 'RIVAL IA',
      rival: 'RIVAL',
      vs: 'VS',
      getReady: 'Prépare-toi!',
      gameStartsSoon: 'Le jeu commence dans un instant...',
      loadingQuestion: 'Chargement de la question...',
      gamePaused: 'Jeu en pause',
      clickResume: 'Clique sur Reprendre pour continuer',
      grade: 'Classe',
      trueLabel: 'Vrai',
      falseLabel: 'Faux',
      battle: 'COMBAT',
      access: 'Accès',
      gameActive: 'Jeu actif',
      waiting: 'En attente',
      questionImageAlt: 'Image de la question',
      goal: 'BUT!',
      miss: 'RATÉ!',
      towardGoal: '+1 vers le but',
      keepGoing: 'Continue!',
      youScored: 'Tu as marqué!',
      opponentScored: 'L\'adversaire a marqué!',
      yourGoal: 'Ton but',
      theirGoal: 'Leur but',
      loading: 'Chargement...',
      seconds: 'secondes',
      opponentAnswered: 'L\'adversaire a répondu!',
      opponentDisconnected: 'Adversaire déconnecté. En attente de reconnexion...',
      loadingScreen: {
        preparingStadium: 'Préparation du stade',
        settingUpField: 'Installation du terrain...',
        loadingQuestions: 'Chargement des questions',
        downloadingOffline: 'Téléchargement des questions pour jouer hors ligne...',
        syncingData: 'Synchronisation des données',
        savingProgress: 'Sauvegarde de ta progression...',
        preparingMatch: 'Préparation du match',
        gettingTeamReady: 'Préparation de ton équipe...',
        ready: 'Prêt!',
        letsPlay: 'C\'est parti!',
        tip: 'Astuce',
        questions: 'questions',
        complete: 'Terminé!',
        elixirTip: 'Réponds vite pour des élixirs bonus!',
        tips: {
          answerQuickly: 'Réponds vite pour marquer plus de buts!',
          streakBonus: 'Une série de bonnes réponses rapporte des élixirs bonus!',
          practicePerfect: 'C\'est en forgeant qu\'on devient forgeron - continue à jouer!',
          checkStats: 'Consulte les statistiques de ton équipe après le match.',
          threeCorrectGoal: 'Chaque but nécessite 3 bonnes réponses!',
          slidePuck: 'Des réponses rapides font glisser le palet!',
          questionsAdapt: 'Les questions s\'adaptent à ton niveau.',
          offlinePlay: 'Joue hors ligne à tout moment - les questions sont sauvegardées!',
          improveCards: 'Tes réponses améliorent tes cartes de joueurs.'
        }
      }
    },

    multiplayer: {
      title: 'Multijoueur',
      subtitle: 'Défie des joueurs du monde entier!',
      findMatch: 'Trouver un match',
      backToHome: 'Retour à l\'accueil',
      skillLevelInfo: 'Affronte des joueurs de ton niveau',
      trophiesInfo: 'Gagne des matchs pour obtenir des trophées et grimper au classement!',
      matchReady: 'Match prêt!',
      connecting: 'Connexion...',
      ready: 'Prêt!',
      notReady: 'Pas prêt',
      waitingFor: 'En attente...',
      waitingForOpponent: 'En attente de l\'adversaire...',
      correct: 'correct'
    },

    profile: {
      ranks: {
        champion: 'Champion',
        diamond: 'Diamant',
        gold: 'Or',
        silver: 'Argent',
        bronze: 'Bronze',
        rookie: 'Débutant'
      },
      rating: 'Classement',
      wins: 'Victoires',
      bestStreak: 'Meilleure série',
      gamesPlayed: 'parties jouées'
    },

    matchResults: {
      victory: 'VICTOIRE!',
      draw: 'MATCH NUL',
      defeat: 'DÉFAITE',
      you: 'Toi',
      opponent: 'Adversaire',
      elixirEarned: 'Élixir gagné',
      leaguePoints: 'Points de ligue',
      xpGained: 'XP gagné',
      playersLeveledUp: 'Joueurs montés de niveau!',
      playerLeveledUp: 'Joueur monté de niveau!',
      questions: 'Questions',
      accuracy: 'Précision',
      bestStreak: 'Meilleure série',
      total: 'total',
      continueButton: 'Continuer'
    },

    playerSetup: {
      title: 'Configuration du joueur',
      subtitle: 'Prépare-toi à jouer!',
      nameLabel: 'Ton nom',
      namePlaceholder: 'Entre ton nom',
      gradeLabel: 'Niveau scolaire',
      gradeOption: 'Classe',
      languageLabel: 'Langue',
      startButton: 'Commencer à jouer!'
    },

    matchmaking: {
      findingOpponent: 'Recherche d\'adversaire',
      playersOnline: 'joueurs en ligne',
      position: 'Position:',
      cancel: 'Annuler',
      goBack: 'Retour',
      error: 'Erreur',
      somethingWrong: 'Quelque chose s\'est mal passé',
      tips: {
        lookingSkillLevel: 'Recherche de joueurs à ton niveau...',
        expandingSearch: 'Élargissement de la recherche...',
        almostThere: 'Presque! Recherche d\'adversaires disponibles...',
        hangTight: 'Patience! Parfois il faut un moment pour trouver le match parfait.'
      },
      matchFound: 'MATCH TROUVÉ!',
      you: 'Toi',
      vs: 'VS',
      trophies: 'trophées',
      matchQuality: {
        perfect: 'Match parfait!',
        great: 'Super match!',
        good: 'Bon match!',
        found: 'Match trouvé!'
      },
      gameStartingIn: 'La partie commence dans...',
      startingGame: 'Démarrage...',
      go: 'C\'EST PARTI!',
      playMultiplayer: 'Multijoueur'
    },

    accessibility: {
      title: 'Accessibilité',
      subtitle: 'Personnalise ton expérience',
      sections: {
        visual: 'Visuel',
        motor: 'Moteur',
        cognitive: 'Cognitif',
        audio: 'Audio'
      },
      theme: 'Thème',
      fontSize: 'Taille de police',
      themes: {
        light: 'Clair',
        dark: 'Sombre',
        highContrast: 'Contraste élevé'
      },
      fontSizes: {
        small: 'Petit',
        medium: 'Moyen',
        large: 'Grand',
        extraLarge: 'Très grand'
      },
      dyslexiaFont: 'Police dyslexie',
      dyslexiaFontDesc: 'Utilise OpenDyslexic pour une meilleure lisibilité',
      largerTargets: 'Cibles plus grandes',
      largerTargetsDesc: 'Agrandit les boutons et éléments interactifs',
      stickyButtons: 'Boutons adhésifs',
      stickyButtonsDesc: 'Les boutons restent enfoncés plus longtemps',
      simplifiedUI: 'Interface simplifiée',
      simplifiedUIDesc: 'Réduit la complexité visuelle et les distractions',
      extendedTimeouts: 'Délais prolongés',
      extendedTimeoutsDesc: 'Donne plus de temps pour lire et répondre',
      soundEffects: 'Effets sonores',
      soundEffectsDesc: 'Joue des sons pour les réponses correctes/incorrectes',
      screenReader: 'Support lecteur d\'écran',
      screenReaderDesc: 'Compatibilité améliorée avec les lecteurs d\'écran',
      done: 'Terminé'
    },

    languages: {
      en: '🇬🇧 Anglais',
      de: '🇩🇪 Allemand',
      fr: '🇫🇷 Français',
      sq: '🇦🇱 Albanais'
    },

    lobby: {
      tapToChange: 'toucher pour changer',
      clickToChange: 'cliquer pour changer',
      tap: 'toucher',
      level: 'Niveau',
      elo: 'ELO',
      games: 'Parties',
      wins: 'Victoires',
      accuracy: 'Précision',
      bestStreak: 'Meilleure série',
      onlineBattleAvailable: 'En ligne - Mode combat disponible',
      offlinePracticeOnly: 'Hors ligne - Entraînement seulement',
      practice: 'ENTRAÎNEMENT',
      battle: 'COMBAT!',
      noTrophies: 'Sans trophées',
      earnTrophies: '+Trophées',
      requiresWifi: 'WiFi requis',
      finding: 'RECHERCHE...',
      rankedEarnTrophies: 'Classé - Gagne des trophées',
      trainingNoTrophies: 'Entraînement - Sans trophées',
      requiresInternet: 'Internet requis',
      connectToInternet: 'Connecte-toi à internet pour les combats classés',
      online: 'En ligne',
      offline: 'Hors ligne',
      teamNav: 'Équipe',
      leagueNav: 'Ligue',
      settingsNav: 'Paramètres',
      profileNav: 'Profil',
      myTeam: 'MON ÉQUIPE',
      leagueTable: 'CLASSEMENT',
      gameSettings: 'PARAMÈTRES',
      leaderboard: 'CLASSEMENT',
      topPlayers: 'Meilleurs joueurs',
      fullProfile: 'Profil complet',
      shopComingSoon: 'Boutique bientôt disponible!',
      playerProfile: 'PROFIL JOUEUR',
      close: 'FERMER',
      comingSoonMultiplayer: 'Bientôt disponible avec le multijoueur!',
      creatingTeam: 'Création de ton équipe...',
      lvl: 'Niv',
      // Email linking
      linkAccount: 'Lier le compte',
      accountLinked: 'Compte lié',
      linkAccountDescription: 'Ne perdez jamais votre progression',
      link: 'Lier',
      change: 'Changer'
    },

    admin: {
      title: 'Panneau d\'administration',
      welcomeBack: 'Bon retour',
      signInToAccess: 'Connectez-vous pour accéder au panneau d\'administration',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      login: 'Connexion',
      signIn: 'Se connecter',
      signingIn: 'Connexion en cours...',

      schoolAdmin: 'Administrateur d\'école',
      parent: 'Parent',
      createSchoolAccount: 'Créer votre compte d\'école',
      joinSchoolAsParent: 'Rejoindre une école en tant que parent',
      fullName: 'Nom complet',
      schoolName: 'Nom de l\'école',
      schoolCode: 'Code de l\'école',
      confirmPassword: 'Confirmer le mot de passe',
      createAccount: 'Créer un compte',
      creating: 'Création...',

      overview: 'Vue d\'ensemble',
      dashboard: 'Tableau de bord',
      questionBank: 'Banque de questions',
      userManagement: 'Gestion des utilisateurs',
      analytics: 'Analyses',
      schoolSettings: 'Paramètres de l\'école',

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

      quickActions: 'Actions rapides',
      addQuestions: 'Ajouter des questions',
      importCSV: 'Importer CSV',
      inviteTeacher: 'Inviter un enseignant',
      exportData: 'Exporter les données',
      viewAnalytics: 'Voir les analyses',

      recentActivity: 'Activité récente',
      recentGameSessions: 'Sessions de jeu récentes',
      noGameSessions: 'Aucune session de jeu encore',
      studentsWillAppear: 'Les étudiants apparaîtront ici après avoir joué',

      questionManagement: 'Gestion des questions',
      addQuestion: 'Ajouter une question',
      editQuestion: 'Modifier la question',
      deleteQuestion: 'Supprimer la question',
      exportCSV: 'Exporter CSV',
      totalQuestionsAvailable: 'Questions disponibles au total',
      questionsBySubject: 'Questions par matière',
      questionsByGrade: 'Questions par classe',
      importFromCSV: 'Importer depuis CSV',

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

      analyticsTitle: 'Tableau de bord d\'analyse',
      trackPerformance: 'Suivre les performances des étudiants et les progrès d\'apprentissage',
      performanceBySubject: 'Performance par matière',
      performanceByGrade: 'Performance par classe',
      performanceTrends: 'Tendances de performance',
      topPerformers: 'Meilleurs performeurs cette semaine',
      accuracy: 'Précision',
      questionsAnswered: 'Questions répondues',

      settings: 'Paramètres',
      schoolSettingsTitle: 'Paramètres de l\'école',

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

      justNow: 'À l\'instant',
      hoursAgo: 'h',
      daysAgo: 'j',
      never: 'Jamais'
    },

    kidRegistration: {
      whatsYourName: 'Comment t\'appelles-tu ?',
      enterUsername: 'Entre ton nom de joueur',
      usernamePlaceholder: 'Ton nom...',
      characters: 'caractères',
      nameTooShort: 'Nom trop court (min. 2 caractères)',
      nameTooLong: 'Nom trop long (max. 15 caractères)',
      next: 'Suivant',
      back: 'Retour',
      hello: 'Salut',
      pickGrade: 'Classe',
      pickAge: 'Âge',
      years: 'ans',
      grade: 'Classe',
      letsGo: 'C\'est parti !',
      saveProgress: 'Sauvegarde ta progression !',
      connectOptional: 'Optionnel - tu peux te connecter plus tard',
      schoolCode: 'Code école',
      schoolCodeDesc: 'Joue avec ton école',
      parentEmail: 'Email des parents',
      parentEmailDesc: 'Les parents peuvent suivre',
      googleSignIn: 'Connexion Google',
      googleDesc: 'Rapide et facile',
      skip: 'Passer',
      playNow: 'Jouer maintenant !',
      whyConnect: 'Pourquoi se connecter ?',
      benefitSave: 'Sauvegarder la progression',
      benefitDevices: 'Jouer sur d\'autres appareils',
      benefitFriends: 'Ajouter des amis',
      backToOptions: 'Retour aux options',
      enterSchoolCode: 'Entre le code école',
      connect: 'Connecter',
      enterParentEmail: 'Entre l\'email des parents',
      parentEmailNote: 'Tes parents recevront une confirmation',
      sendToParents: 'Envoyer aux parents',
      connectReminder: {
        title: 'Sauvegarde ta progression !',
        subtitle: 'Tu as joué {games} parties. Connecte-toi pour ne rien perdre !',
        currentStats: 'Tes statistiques actuelles',
        eloRating: 'Classement ELO',
        gamesPlayed: 'Parties jouées',
        bestStreak: 'Meilleure série',
        connectNow: 'Connecter maintenant',
        remindLater: 'Me rappeler plus tard',
        neverAsk: 'Ne plus demander'
      }
    },

    // Offline Mode
    offlineMode: {
      online: 'En ligne',
      offline: 'Hors ligne',
      onlineMode: 'Mode en ligne',
      offlineMode: 'Mode hors ligne',
      cachedQuestions: 'Questions en cache',
      serviceWorker: 'Service Worker',
      active: 'Actif',
      inactive: 'Inactif',
      storageUsed: 'Stockage utilisé',
      downloadForOffline: 'Télécharger pour hors ligne',
      downloading: 'Téléchargement...',
      downloadComplete: 'Téléchargé {count} nouvelles questions pour le mode hors ligne !',
      downloadFailed: 'Échec du téléchargement des questions',
      clearOfflineData: 'Effacer les données hors ligne',
      offlineReady: 'Prêt à jouer hors ligne !',
      noQuestionsAvailable: 'Aucune question disponible. Connectez-vous pour télécharger.',
      connectToDownload: 'Connectez-vous à Internet pour télécharger des questions',
      cached: 'en cache',
      questionsReady: 'questions prêtes'
    }
  },

  sq: {
    welcome: 'LearnKick',
    welcomeSubtitle: 'Lojëra mësimore sportive për fëmijë!',
    startPlaying: 'Fillo të luash!',
    backToMenu: 'Kthehu te menuja',
    loading: 'Po ngarkon...',
    error: 'Gabim',
    start: 'FILLO',

    playerSetup: {
      title: 'Mirë se vjen në LearnKick!',
      subtitle: 'Le të krijojmë profilin tënd të lojtarit',
      nameLabel: 'Si të quajnë?',
      namePlaceholder: 'Shkruaj emrin tënd...',
      gradeLabel: 'Në cilën klasë je?',
      languageLabel: 'Zgjidh gjuhën tënde',
      wherePlayingLabel: 'Ku po luan?',
      grades: {
        1: 'Klasa 1 (Mosha 6-7)',
        2: 'Klasa 2 (Mosha 7-8)',
        3: 'Klasa 3 (Mosha 8-9)',
        4: 'Klasa 4 (Mosha 9-10)',
        5: 'Klasa 5 (Mosha 10-11)',
        6: 'Klasa 6 (Mosha 11-12)'
      },
      helpText: 'Informacioni yt na ndihmon të ofrojmë pyetje të përshtatshme për moshën',
      settingsSaved: 'Cilësimet e tua ruhen automatikisht',
      errors: {
        nameRequired: 'Ju lutem shkruani emrin tuaj',
        nameTooShort: 'Emri duhet të ketë të paktën 2 karaktere',
        modeRequired: 'Ju lutem zgjidhni Shkollë ose Shtëpi'
      }
    },

    gameModes: {
      title: 'Zgjidh mënyrën e lojës',
      subtitle: 'Zgjidh eksperiencën e mësimit që të përshtatet më mirë',
      family: {
        name: 'Mënyra Familjare',
        description: 'Eksperiencë mësimore argëtuese për kohën familjare',
        subtitle: 'Mënyra familjare',
        features: [
          'Kohë e relaksuar (20 sekonda për pyetje)',
          'Mesazhe dhe festime inkurajuese',
          'Lejohen shumë përpjekje',
          'Fokus në mësim dhe argëtim'
        ],
        bestFor: ['Koha familjare', 'Praktikë e qetë', 'Ndërtimi i besimit']
      },
      school: {
        name: 'Mënyra Shkollore',
        description: 'Mjedis mësimor i strukturuar për vlerësim arsimor',
        subtitle: 'Mënyra e mësuesit',
        features: [
          'Kohë standarde (15 sekonda për pyetje)',
          'Statistika të hollësishme të performancës',
          'Një përpjekje për pyetje',
          'Raporte progresi'
        ],
        bestFor: ['Përdorim në klasë', 'Vlerësim formal', 'Monitorim i progresit']
      },
      continue: 'Vazhdo me',
      selected: 'E zgjedhur!'
    },

    gameSetup: {
      title: 'Konfigurimi i lojës',
      arena: 'Arena',
      subject: 'Lënda',
      language: 'Gjuha',
      grade: 'Klasa',
      questionLanguage: 'Gjuha e pyetjeve',
      subjects: {
        all: 'Të gjitha lëndët',
        math: 'Matematikë',
        german: 'Gjermanisht',
        french: 'Frëngjisht',
        english: 'Anglisht',
        science: 'Shkencë',
        geography: 'Gjeografi',
        history: 'Histori',
        music: 'Muzikë',
        art: 'Art',
        sports: 'Sport',
        digital: 'Aftësi digjitale',
        language: 'Gjuhë',
        'general-knowledge': 'Njohuri të përgjithshme'
      },
      arenas: {
        soccer: 'Futboll',
        hockey: 'Hokej'
      }
    },

    team: {
      myTeam: 'Ekipi im',
      formation: 'Formacioni',
      elixir: 'Eliksir',
      league: 'Liga',
      train: 'Stërvit',
      playMatch: 'Luaj ndeshje',
      stats: 'Statistika',
      goalkeeper: 'Portier',
      defense: 'Mbrojtje',
      midfield: 'Mesfushë',
      attack: 'Sulm',
      positions: {
        GK: 'Portier',
        RB: 'Mbrojtës i djathtë',
        CB: 'Mbrojtës qendror',
        LB: 'Mbrojtës i majtë',
        CM: 'Mesfushor qendror',
        CAM: 'Mesfushor sulmuesi',
        LW: 'Krah i majtë',
        ST: 'Sulmues',
        RW: 'Krah i djathtë',
        LD: 'Mbrojtje e majtë',
        RD: 'Mbrojtje e djathtë',
        C: 'Qendër',
        G: 'Portier'
      },
      cardRarity: {
        bronze: 'Bronz',
        silver: 'Argjend',
        gold: 'Ar',
        diamond: 'Diamant',
        champion: 'Kampion'
      },
      level: 'Niveli',
      overall: 'Gjithsej',
      accuracy: 'Saktësia',
      speed: 'Shpejtësia',
      consistency: 'Qëndrueshmëria',
      difficulty: 'Vështirësia',
      xp: 'XP',
      trainPlayer: 'Stërvit lojtarin',
      elixirNeeded: 'Eliksir i nevojshëm',
      chooseGoalkeeper: 'Zgjidh portirin tënd',
      chooseGoalkeeperDesc: 'Zgjidh cilën lëndë do të jetë portieri yt - linja e fundit e mbrojtjes!',
      // Training
      standardTraining: 'Stërvitje standarde',
      standardTrainingDesc: 'Rritje bazë e XP',
      quickLevel: 'Level i shpejtë',
      quickLevelDesc: '5x rritje XP!',
      available: 'në dispozicion',
      trainingComplete: 'Stërvitja u krye!',
      training: 'Duke stërvitur...',
      train: 'Stërvit',
      leveling: 'Duke ngritur nivelin...',
      needMore: 'Të duhen edhe {amount}',
      // Lobby
      battle: 'Luftë',
      practice: 'Praktikë',
      online: 'Online',
      offline: 'Offline',
      selectSubject: 'Zgjidh lëndën',
      selectArena: 'Zgjidh arenën',
      leagueTable: 'Tabela e ligës',
      viewLeague: 'Shiko ligën',
      closeLeague: 'Mbyll ligën',
      // League
      schoolLeague: 'Liga e shkollës',
      globalLeague: 'Liga globale',
      tierProgress: 'Progresi i nivelit',
      rank: 'Renditja',
      played: 'L',
      won: 'F',
      drawn: 'B',
      lost: 'H',
      goalsFor: 'G+',
      goalsAgainst: 'G-',
      goalDiff: 'DG',
      points: 'Pik',
      promotionZone: 'Zona e ngritjes',
      relegationZone: 'Zona e rënies',
      leagueTiers: {
        bronze: 'Bronz',
        silver: 'Argjend',
        gold: 'Ar',
        platinum: 'Platin',
        diamond: 'Diamant',
        champion: 'Kampion',
        legend: 'Legjendë'
      },
      // Match Results
      matchComplete: 'Ndeshja përfundoi!',
      elixirEarned: 'Eliksir i fituar',
      xpDistributed: 'XP e shpërndarë',
      cardsLeveledUp: 'Kartat u ngritën!',
      leaguePointsChange: 'Pikët e ligës',
      viewTeam: 'Shiko ekipin',
      // TeamView
      teamRating: 'Vlerësimi i ekipit',
      pts: 'pik',
      avgLevel: 'Niveli mes.',
      playersCount: 'lojtarë',
      squad: 'Skuadra',
      posAbbrev: 'POZ',
      subjectCol: 'LËNDA',
      lvlAbbrev: 'NIV',
      ovrAbbrev: 'GJI',
      rarityCol: 'RRALËSIA',
      ratingsLabel: 'Vlerësimet:',
      tapToTrain: 'Kliko një lojtar për ta stërvitur me eliksir',
      // PlayerCard
      lvPrefix: 'Niv.',
      accAbbrev: 'SAK',
      spdAbbrev: 'SHP',
      conAbbrev: 'QËN',
      difAbbrev: 'VËS',
      xpLabel: 'XP:',
      gkLabel: 'POR',
      // LeagueTable
      school: 'Shkolla',
      global: 'Globale',
      teamCol: 'EKIPI',
      pAbbrev: 'L',
      wAbbrev: 'F',
      dAbbrev: 'B',
      lAbbrev: 'H',
      gdAbbrev: 'DG',
      ptsAbbrev: 'PIK',
      youLabel: 'Ti',
      nextTier: 'Niveli tjetër:',
      ptsNeeded: 'pikë të nevojshme',
      maxTier: 'Maks',
      // ElixirBar
      dailyEarned: 'E fituar sot',
      dailyCapReached: 'Kufiri ditor u arrit! Kthehu nesër.',
      trainCost: 'Kosto stërvitjes',
      xpGain: 'Fitim XP',
      weekBonus: 'Bonus javore',
      speedBonus: 'Bonus shpejtësie:',
      streakBonus: 'Bonus serie:',
      elixirGain: 'Eliksir'
    },

    settings: {
      title: 'Cilësimet',
      playingAs: 'Duke luajtur si',
      mode: 'Mënyra',
      gradeLevel: 'Niveli i klasës',
      subject: 'Lënda',
      arena: 'Arena',
      questionLanguage: 'Gjuha e pyetjeve',
      dangerZone: 'Zona e rrezikshme',
      resetProfile: 'Rivendos profilin dhe të dhënat',
      resetConfirm: 'Kjo do të fshijë të gjithë progresin, statistikat dhe cilësimet tuaja. Je i sigurt?',
      saveSettings: 'Ruaj cilësimet',
      cancel: 'Anulo',
      yesDelete: 'Po, fshij',
      gameTab: 'LOJA',
      accessibilityTab: 'QASJA',
      selectArena: 'ZGJIDH ARENËN',
      selectSubject: 'ZGJIDH LËNDËN',
      appLanguage: 'GJUHA E APLIKACIONIT',
      gameMode: 'MËNYRA E LOJËS',
      visual: 'VIZUALE',
      dyslexiaFont: 'Shkronja për disleksi',
      dyslexiaFontDesc: 'Më e lehtë për të lexuar me disleksi',
      fontSize: 'Madhësia e shkronjave',
      controls: 'KONTROLLET',
      largerButtons: 'Butona më të mëdhenj',
      largerButtonsDesc: 'Më e lehtë për të prekur',
      moreTime: 'Më shumë kohë',
      moreTimeDesc: 'Kohë e zgjatur',
      audio: 'AUDIO',
      soundEffects: 'Efektet e zërit',
      soundEffectsDesc: 'Zërat dhe muzika e lojës',
      backgroundMusic: 'Muzika në sfond',
      on: 'PO',
      off: 'JO',
      home: 'Kryefaqja',
      simpleMode: 'Mënyra e thjeshtë',
      simpleModeDesc: 'Më pak animacione',
      dangerZoneTitle: 'ZONA E RREZIKSHME',
      resetAllProgress: 'Rivendos të gjithë progresin',
      confirmResetModal: 'Je i sigurt? Kjo do të fshijë të gjithë progresin tënd!',
      done: 'GATI',
      delete: 'Fshi'
    },

    game: {
      pause: 'Ndalo',
      resume: 'Vazhdo',
      goals: 'Gola',
      streak: 'Seri',
      question: 'Pyetje',
      timeUp: 'Koha mbaroi!',
      correct: 'Saktë!',
      incorrect: 'Gabim',
      nextQuestion: 'Pyetja tjetër',
      gameOver: 'Loja mbaroi!',
      winner: 'Fituesi',
      finalScore: 'Rezultati përfundimtar',
      accuracy: 'Saktësia',
      correctAnswers: 'Saktë',
      maxStreak: 'Seria maksimale',
      playAgain: 'Luaj përsëri',
      you: 'TI',
      aiRival: 'RIVALI IA',
      rival: 'RIVALI',
      vs: 'VS',
      getReady: 'Përgatitu!',
      gameStartsSoon: 'Loja fillon për pak...',
      loadingQuestion: 'Duke ngarkuar pyetjen...',
      gamePaused: 'Loja në pauzë',
      clickResume: 'Kliko Vazhdo për të vazhduar',
      grade: 'Klasa',
      trueLabel: 'E vërtetë',
      falseLabel: 'E rreme',
      battle: 'LUFTË',
      access: 'Qasje',
      gameActive: 'Loja aktive',
      waiting: 'Duke pritur',
      questionImageAlt: 'Imazhi i pyetjes',
      goal: 'GOL!',
      miss: 'HUMBJE!',
      towardGoal: '+1 drejt golit',
      keepGoing: 'Vazhdo kështu!',
      youScored: 'Ti shënove!',
      opponentScored: 'Kundërshtari shënoi!',
      yourGoal: 'Goli yt',
      theirGoal: 'Goli i tyre',
      loading: 'Duke ngarkuar...',
      seconds: 'sekonda',
      opponentAnswered: 'Kundërshtari u përgjigj!',
      opponentDisconnected: 'Kundërshtari u shkëput. Duke pritur rilidhjen...',
      loadingScreen: {
        preparingStadium: 'Stadiumi po përgatitet',
        settingUpField: 'Fusha po rregullohet...',
        loadingQuestions: 'Pyetjet po ngarkohen',
        downloadingOffline: 'Pyetjet po shkarkohen për lojë offline...',
        syncingData: 'Sinkronizimi i të dhënave',
        savingProgress: 'Progresi yt po ruhet...',
        preparingMatch: 'Ndeshja po përgatitet',
        gettingTeamReady: 'Ekipi yt po përgatitet...',
        ready: 'Gati!',
        letsPlay: 'Le të luajmë!',
        tip: 'Këshillë',
        questions: 'pyetje',
        complete: 'Përfunduar!',
        elixirTip: 'Përgjigju shpejt për elixir bonus!',
        tips: {
          answerQuickly: 'Përgjigju shpejt për të shënuar më shumë gola!',
          streakBonus: 'Një seri e saktë fiton elixir bonus!',
          practicePerfect: 'Praktika e bën të përsosur - vazhdo të luash!',
          checkStats: 'Shiko statistikat e ekipit pas ndeshjes.',
          threeCorrectGoal: 'Çdo gol kërkon 3 përgjigje të sakta!',
          slidePuck: 'Përgjigje të shpejta e bëjnë pukun të rrëshqasë!',
          questionsAdapt: 'Pyetjet përshtaten me nivelin tënd.',
          offlinePlay: 'Luaj offline kurdoherë - pyetjet ruhen!',
          improveCards: 'Përgjigjet e tua përmirësojnë kartelat e lojtarëve.'
        }
      }
    },

    multiplayer: {
      title: 'Shumëlojtarësh',
      subtitle: 'Sfido lojtarë nga e gjithë bota!',
      findMatch: 'Gjej ndeshje',
      backToHome: 'Kthehu në fillim',
      skillLevelInfo: 'Luaj kundër lojtarëve në nivelin tënd',
      trophiesInfo: 'Fito ndeshje për të marrë trofe dhe për të ngjitur në renditje!',
      matchReady: 'Ndeshja gati!',
      connecting: 'Duke u lidhur...',
      ready: 'Gati!',
      notReady: 'Jo gati',
      waitingFor: 'Duke pritur...',
      waitingForOpponent: 'Duke pritur kundërshtarin...',
      correct: 'saktë'
    },

    profile: {
      ranks: {
        champion: 'Kampion',
        diamond: 'Diamant',
        gold: 'Ar',
        silver: 'Argjend',
        bronze: 'Bronz',
        rookie: 'Fillestar'
      },
      rating: 'Vlerësimi',
      wins: 'Fitore',
      bestStreak: 'Seria më e mirë',
      gamesPlayed: 'lojëra të luajtura'
    },

    matchResults: {
      victory: 'FITORE!',
      draw: 'BARAZIM',
      defeat: 'HUMBJE',
      you: 'Ti',
      opponent: 'Kundërshtari',
      elixirEarned: 'Eliksir i fituar',
      leaguePoints: 'Pikët e ligës',
      xpGained: 'XP i fituar',
      playersLeveledUp: 'Lojtarët u ngritën nivel!',
      playerLeveledUp: 'Lojtari u ngrit nivel!',
      questions: 'Pyetje',
      accuracy: 'Saktësia',
      bestStreak: 'Seria më e mirë',
      total: 'gjithsej',
      continueButton: 'Vazhdo'
    },

    playerSetup: {
      title: 'Konfigurimi i Lojtarit',
      subtitle: 'Përgatitu për të luajtur!',
      nameLabel: 'Emri yt',
      namePlaceholder: 'Shkruaj emrin tënd',
      gradeLabel: 'Niveli shkollor',
      gradeOption: 'Klasa',
      languageLabel: 'Gjuha',
      startButton: 'Fillo të luash!'
    },

    kidRegistration: {
      whatsYourName: 'Si të quajnë?',
      enterUsername: 'Shkruaj emrin tënd të lojtarit',
      usernamePlaceholder: 'Emri yt...',
      characters: 'karaktere',
      nameTooShort: 'Emri shumë i shkurtër (min. 2 karaktere)',
      nameTooLong: 'Emri shumë i gjatë (maks. 15 karaktere)',
      next: 'Tjetër',
      back: 'Kthehu',
      hello: 'Përshëndetje',
      pickGrade: 'Klasa',
      pickAge: 'Mosha',
      years: 'vjeç',
      grade: 'Klasa',
      letsGo: 'Nisemi!',
      saveProgress: 'Ruaj progresin tënd!',
      connectOptional: 'Opsionale - mund të lidhesh më vonë',
      schoolCode: 'Kodi i shkollës',
      schoolCodeDesc: 'Luaj me shkollën tënde',
      parentEmail: 'Email i prindërve',
      parentEmailDesc: 'Prindërit mund të shohin',
      googleSignIn: 'Lidhu me Google',
      googleDesc: 'Shpejt dhe lehtë',
      skip: 'Kapërce',
      playNow: 'Luaj tani!',
      whyConnect: 'Pse të lidhesh?',
      benefitSave: 'Ruaj progresin',
      benefitDevices: 'Luaj në pajisje të tjera',
      benefitFriends: 'Shto miq',
      backToOptions: 'Kthehu te opsionet',
      enterSchoolCode: 'Shkruaj kodin e shkollës',
      connect: 'Lidhu',
      enterParentEmail: 'Shkruaj email-in e prindërve',
      parentEmailNote: 'Prindërit e tu do të marrin konfirmim',
      sendToParents: 'Dërgo te prindërit',
      connectReminder: {
        title: 'Ruaj progresin tënd!',
        subtitle: 'Ke luajtur {games} lojëra. Lidhu për të mos humbur asgjë!',
        currentStats: 'Statistikat e tua aktuale',
        eloRating: 'Vlerësimi ELO',
        gamesPlayed: 'Lojëra të luajtura',
        bestStreak: 'Seria më e mirë',
        connectNow: 'Lidhu tani',
        remindLater: 'Më kujto më vonë',
        neverAsk: 'Mos pyet më'
      }
    },

    // Offline Mode
    offlineMode: {
      online: 'Online',
      offline: 'Offline',
      onlineMode: 'Mënyra online',
      offlineMode: 'Mënyra offline',
      cachedQuestions: 'Pyetje të ruajtura',
      serviceWorker: 'Service Worker',
      active: 'Aktiv',
      inactive: 'Joaktiv',
      storageUsed: 'Ruajtja e përdorur',
      downloadForOffline: 'Shkarko për offline',
      downloading: 'Duke shkarkuar...',
      downloadComplete: 'Shkarkuar {count} pyetje të reja për lojë offline!',
      downloadFailed: 'Dështoi shkarkimi i pyetjeve',
      clearOfflineData: 'Fshi të dhënat offline',
      offlineReady: 'Gati për lojë offline!',
      noQuestionsAvailable: 'Nuk ka pyetje. Lidhu për të shkarkuar.',
      connectToDownload: 'Lidhu me internet për të shkarkuar pyetje',
      cached: 'të ruajtura',
      questionsReady: 'pyetje gati'
    },

    matchmaking: {
      findingOpponent: 'Kërkim kundërshtari',
      playersOnline: 'lojtarë online',
      position: 'Pozicioni:',
      cancel: 'Anulo',
      goBack: 'Kthehu',
      error: 'Gabim',
      somethingWrong: 'Diçka shkoi keq',
      tips: {
        lookingSkillLevel: 'Kërkim lojtarësh në nivelin tënd...',
        expandingSearch: 'Zgjerim kërkimi për një ndeshje të mirë...',
        almostThere: 'Pothuajse! Kërkim kundërshtarësh të disponueshëm...',
        hangTight: 'Durimi! Ndonjëherë duhet pak kohë për të gjetur ndeshjen perfekte.'
      },
      matchFound: 'NDESHJE E GJETUR!',
      you: 'Ti',
      vs: 'VS',
      trophies: 'trofe',
      matchQuality: {
        perfect: 'Ndeshje perfekte!',
        great: 'Ndeshje e shkëlqyer!',
        good: 'Ndeshje e mirë!',
        found: 'Ndeshje e gjetur!'
      },
      gameStartingIn: 'Loja fillon në...',
      startingGame: 'Duke filluar lojën...',
      go: 'NISUNI!',
      playMultiplayer: 'Lojë shumëlojtarëshe'
    },

    accessibility: {
      title: 'Aksesueshmëria',
      subtitle: 'Personalizo eksperiencën tënde',
      sections: {
        visual: 'Vizuale',
        motor: 'Motorike',
        cognitive: 'Kognitive',
        audio: 'Audio'
      },
      theme: 'Tema',
      fontSize: 'Madhësia e shkronjave',
      themes: {
        light: 'E ndritshme',
        dark: 'E errët',
        highContrast: 'Kontrast i lartë'
      },
      fontSizes: {
        small: 'E vogël',
        medium: 'Mesatare',
        large: 'E madhe',
        extraLarge: 'Shumë e madhe'
      },
      dyslexiaFont: 'Font për disleksinë',
      dyslexiaFontDesc: 'Përdor OpenDyslexic për lexueshmëri më të mirë',
      largerTargets: 'Zona më të mëdha klikimi',
      largerTargetsDesc: 'Bën butonat dhe elementet interaktive më të mëdha',
      stickyButtons: 'Butona ngjitës',
      stickyButtonsDesc: 'Butonat qëndrojnë të shtypur më gjatë',
      simplifiedUI: 'Ndërfaqe e thjeshtuar',
      simplifiedUIDesc: 'Redukton kompleksitetin vizual dhe shpërqendrimet',
      extendedTimeouts: 'Kohë të zgjatura',
      extendedTimeoutsDesc: 'Jep më shumë kohë për të lexuar dhe përgjigjur',
      soundEffects: 'Efekte zanore',
      soundEffectsDesc: 'Luan tinguj për përgjigjet e sakta/gabuara',
      screenReader: 'Mbështetje për lexues ekrani',
      screenReaderDesc: 'Përputhshmëri e përmirësuar me lexuesit e ekranit',
      done: 'Gati'
    },

    languages: {
      en: '🇬🇧 Anglisht',
      de: '🇩🇪 Gjermanisht',
      fr: '🇫🇷 Frëngjisht',
      sq: '🇦🇱 Shqip'
    },

    lobby: {
      tapToChange: 'prek për të ndryshuar',
      clickToChange: 'kliko për të ndryshuar',
      tap: 'prek',
      level: 'Niveli',
      elo: 'ELO',
      games: 'Lojëra',
      wins: 'Fitore',
      accuracy: 'Saktësia',
      bestStreak: 'Seria më e mirë',
      onlineBattleAvailable: 'Beteja online e disponueshme',
      offlinePracticeOnly: 'Vetëm stërvitje offline',
      practice: 'Stërvitje',
      battle: 'Betejë!',
      noTrophies: 'Pa trofe',
      earnTrophies: 'Fito trofe',
      requiresWifi: 'Kërkon WiFi',
      finding: 'Duke kërkuar...',
      rankedEarnTrophies: 'Renditur - Fito trofe',
      trainingNoTrophies: 'Stërvitje - Pa trofe',
      requiresInternet: 'Kërkon internet',
      connectToInternet: 'Lidhu me internetin',
      online: 'Online',
      offline: 'Offline',
      teamNav: 'Ekipi',
      leagueNav: 'Liga',
      settingsNav: 'Cilësimet',
      profileNav: 'Profili',
      myTeam: 'Ekipi im',
      leagueTable: 'Tabela e ligës',
      gameSettings: 'Cilësimet e lojës',
      leaderboard: 'Renditja',
      topPlayers: 'Lojtarët më të mirë',
      fullProfile: 'Profili i plotë',
      shopComingSoon: 'Dyqani - Së shpejti',
      playerProfile: 'Profili i lojtarit',
      close: 'Mbyll',
      comingSoonMultiplayer: 'Së shpejti - Shumëlojtarësh',
      creatingTeam: 'Duke krijuar ekipin...',
      lvl: 'Niv',
      // Email linking
      linkAccount: 'Lidh llogarinë',
      accountLinked: 'Llogaria e lidhur',
      linkAccountDescription: 'Mos e humb kurrë përparimin',
      link: 'Lidh',
      change: 'Ndrysho'
    },

    admin: {
      title: 'Paneli Admin',
      welcomeBack: 'Mirë se u ktheve',
      signInToAccess: 'Hyni për të hyrë në panelin admin',
      email: 'Adresa e email-it',
      password: 'Fjalëkalimi',
      login: 'Hyni',
      signIn: 'Hyni',
      signingIn: 'Po hyni...',

      schoolAdmin: 'Administratori i shkollës',
      parent: 'Prindi',
      createSchoolAccount: 'Krijoni llogarinë tuaj të shkollës',
      joinSchoolAsParent: 'Bashkohuni me një shkollë si prind',
      fullName: 'Emri i plotë',
      schoolName: 'Emri i shkollës',
      schoolCode: 'Kodi i shkollës',
      confirmPassword: 'Konfirmoni fjalëkalimin',
      createAccount: 'Krijoni llogari',
      creating: 'Po krijohet...',

      overview: 'Përmbledhje',
      dashboard: 'Paneli kryesor',
      questionBank: 'Banka e pyetjeve',
      userManagement: 'Menaxhimi i përdoruesve',
      analytics: 'Analizat',
      schoolSettings: 'Cilësimet e shkollës',

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

      quickActions: 'Veprime të shpejta',
      addQuestions: 'Shtoni pyetje',
      importCSV: 'Importoni CSV',
      inviteTeacher: 'Ftoni mësues',
      exportData: 'Eksportoni të dhënat',
      viewAnalytics: 'Shikoni analizat',

      recentActivity: 'Aktiviteti i fundit',
      recentGameSessions: 'Sesionet e fundit të lojës',
      noGameSessions: 'Asnjë sesion loje ende',
      studentsWillAppear: 'Studentët do të shfaqen këtu pas lojës',

      questionManagement: 'Menaxhimi i pyetjeve',
      addQuestion: 'Shtoni pyetje',
      editQuestion: 'Editoni pyetjen',
      deleteQuestion: 'Fshini pyetjen',
      exportCSV: 'Eksportoni CSV',
      totalQuestionsAvailable: 'Pyetjet e disponueshme gjithsej',
      questionsBySubject: 'Pyetjet sipas lëndës',
      questionsByGrade: 'Pyetjet sipas klasës',
      importFromCSV: 'Importoni nga CSV',

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

      analyticsTitle: 'Paneli i analizave',
      trackPerformance: 'Ndiqni performancën e studentëve dhe përparimin në mësim',
      performanceBySubject: 'Performanca sipas lëndës',
      performanceByGrade: 'Performanca sipas klasës',
      performanceTrends: 'Tendencat e performancës',
      topPerformers: 'Performuesit më të mirë këtë javë',
      accuracy: 'Saktësia',
      questionsAnswered: 'Pyetjet e përgjigjura',

      settings: 'Cilësimet',
      schoolSettingsTitle: 'Cilësimet e shkollës',

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

      justNow: 'Tani pak',
      hoursAgo: 'orë më parë',
      daysAgo: 'ditë më parë',
      never: 'Kurrë'
    }
  }
}

// Translation hook
export function useTranslation(language: Language) {
  const t = translations[language] || translations.en

  return {
    t,
    language,
    availableLanguages: Object.keys(translations) as Language[]
  }
}
