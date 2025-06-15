export const difficulties = ['mastered', 'easy', 'medium', 'hard', 'new'];

export const difficultyColors = {
  mastered: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    text: 'text-emerald-600',
    badge: 'text-emerald-600 bg-emerald-100',
    button: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700',
    primary: 'text-emerald-500',
    light: 'bg-emerald-50',
    helper: 'bg-emerald-50 text-emerald-700'
  },
  easy: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-600',
    badge: 'text-blue-600 bg-blue-100',
    button: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    primary: 'text-blue-500',
    light: 'bg-blue-50',
    helper: 'bg-blue-50 text-blue-700'
  },
  medium: {
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    text: 'text-amber-600',
    badge: 'text-amber-600 bg-amber-100',
    button: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700',
    primary: 'text-amber-500',
    light: 'bg-amber-50',
    helper: 'bg-amber-50 text-amber-700'
  },
  hard: {
    bg: 'bg-gradient-to-br from-red-500 to-red-600',
    text: 'text-red-600',
    badge: 'text-red-600 bg-red-100',
    button: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    primary: 'text-red-500',
    light: 'bg-red-50',
    helper: 'bg-red-50 text-red-700'
  },
  new: {
    bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    text: 'text-violet-600',
    badge: 'text-violet-600 bg-violet-100',
    button: 'bg-violet-500 hover:bg-violet-600 active:bg-violet-700',
    primary: 'text-violet-500',
    light: 'bg-violet-50',
    helper: 'bg-violet-50 text-violet-700'
  }
};

export const welcomeMessages = {
  mastered: "These are your mastered cards. Keep reviewing them occasionally to maintain your knowledge!",
  easy: "You're doing great with these cards! A few more reviews and they'll be mastered.",
  medium: "Keep practicing these cards. You're making steady progress!",
  hard: "Don't worry about these challenging cards. With practice, they'll become easier!",
  new: "Welcome to your new cards! Time to start learning!"
};

export const progressionRules = {
  // When answered correctly
  right: {
    'new': 'hard',      // New -> Hard
    'hard': 'medium',   // Hard -> Medium
    'medium': 'easy',   // Medium -> Easy
    'easy': 'mastered', // Easy -> Mastered
    'mastered': 'mastered' // Mastered stays Mastered
  },
  // When answered incorrectly
  wrong: {
    'new': 'hard',      // New cards stay in Hard if wrong
    'hard': 'hard',     // Hard cards stay in Hard if wrong
    'medium': 'hard',   // Medium goes back to Hard
    'easy': 'medium',   // Easy goes back to Medium
    'mastered': 'easy'  // Mastered goes back to Easy
  }
};

export const progressionMessages = {
  right: {
    'new': 'Moving to Hard - Keep practicing!',
    'hard': 'Great! Moving to Medium difficulty',
    'medium': 'Well done! Moving to Easy',
    'easy': 'Perfect! Card Mastered!',
    'mastered': 'Excellent! Keeping in Mastered'
  },
  wrong: {
    'new': 'Keep practicing in Hard',
    'hard': 'Stay in Hard - Keep trying!',
    'medium': 'Moving back to Hard',
    'easy': 'Moving back to Medium',
    'mastered': 'Moving back to Easy'
  }
};

export const guideSteps = [
  {
    icon: '👋',
    title: 'Welcome to Flashcards!',
    content: 'This feature is for students only. You can create, review, and master your own flashcards to help you study and remember important information.'
  },
  {
    icon: '➕',
    title: 'Create Your Cards',
    content: 'Click the "Add Card" button to create a new flashcard. If you are in a specific difficulty category (like Hard), your new card will be created in that category. Otherwise, it will start as New.'
  },
  {
    icon: '🔄',
    title: 'How Cards Move',
    content: 'When you answer a card correctly, it moves up to the next difficulty. If you answer incorrectly, it may stay or move down, depending on its current level. This helps you focus on what you need to practice most.'
  },
  {
    icon: '📈',
    title: 'Difficulty Levels',
    content: 'Cards move through these levels: New → Hard → Medium → Easy → Mastered. The more you practice and answer correctly, the closer your cards get to Mastered!'
  },
  {
    icon: '🚦',
    title: 'Transition Rules',
    content: 'Correct answer: New→Hard, Hard→Medium, Medium→Easy, Easy→Mastered, Mastered stays. Wrong answer: New stays, Hard stays, Medium→Hard, Easy→Medium, Mastered→Easy.'
  },
/*   {
    icon: '🧑‍🎓',
    title: 'Student Only',
    content: 'Only students can use flashcards. Teachers and admins do not have access to this feature.'
  }, */
  {
    icon: '✅',
    title: 'Get Started!',
    content: 'Start adding your cards, practice regularly, and watch your progress. Good luck mastering your material!'
  }
];

// Study session settings
export const studySessionConfig = {
  minCardsPerSession: 5,
  maxCardsPerSession: 20,
  defaultSessionLength: 10, // minutes
  breakInterval: 15 // minutes
};

// Performance tracking thresholds
export const performanceThresholds = {
  mastery: 0.9,    // 90% correct
  proficient: 0.75, // 75% correct
  learning: 0.5,    // 50% correct
  struggling: 0.25  // 25% correct
};

// Card content limits
export const contentLimits = {
  questionMaxLength: 500,
  answerMaxLength: 1000,
  minQuestionLength: 3,
  minAnswerLength: 3
};

// Card animation settings
export const animations = {
  flipDuration: 600,
  moveDuration: 300,
  easingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  scaleOnHover: 1.02,
  entranceDelay: 50
};

// Card identification
export const cardIdentifiers = {
  idPrefix: 'flashcard_',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  separator: '-'
};