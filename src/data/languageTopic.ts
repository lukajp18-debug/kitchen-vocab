import { TopicDef, LessonDef } from '../types/vocab'
import { LanguageContent } from '../types/language'

export const LANGUAGE_LESSONS: LessonDef[] = [
  { id: 'la-articles-a-an',   name: 'Articles: A or An',      icon: '🔤', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Choose "a" or "an" for each word',           xpReward: 80  },
  { id: 'la-articles-the',    name: 'Articles: A / An / The', icon: '📝', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Choose the correct article',                  xpReward: 80  },
  { id: 'la-there-is-are',    name: 'There is / There are',   icon: '👥', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Is or are? Fill in the sentence',             xpReward: 80  },
  { id: 'la-action-words',    name: 'Action Words',           icon: '🏃', color: '#58CC02', bgColor: '#E5F9D0', description: 'Match the picture to the action word',        xpReward: 80  },
  { id: 'la-present-tense',   name: 'Simple Present Tense',   icon: '⏱️', color: '#FFB700', bgColor: '#FFF0CC', description: 'Choose the correct verb form',                xpReward: 100 },
]

// Exact content from "Language Arts Workshop 3rd Term - 2025 - 2026.pdf"
const LANGUAGE_CONTENT: LanguageContent = {
  // Exercise 1: Fill in "a or an" — 16 words with pictures
  articlesAorAn: [
    { word: 'apple',    emoji: '🍎', answer: 'an' },
    { word: 'pen',      emoji: '🖊️', answer: 'a'  },
    { word: 'orange',   emoji: '🍊', answer: 'an' },
    { word: 'chair',    emoji: '🪑', answer: 'a'  },
    { word: 'desk',     emoji: '🖥️', answer: 'a'  },
    { word: 'umbrella', emoji: '☂️', answer: 'an' },
    { word: 'giraffe',  emoji: '🦒', answer: 'a'  },
    { word: 'teacher',  emoji: '👩‍🏫', answer: 'a' },
    { word: 'kite',     emoji: '🪁', answer: 'a'  },
    { word: 'car',      emoji: '🚗', answer: 'a'  },
    { word: 'elephant', emoji: '🐘', answer: 'an' },
    { word: 'shirt',    emoji: '👕', answer: 'a'  },
    { word: 'rabbit',   emoji: '🐰', answer: 'a'  },
    { word: 'egg',      emoji: '🥚', answer: 'an' },
    { word: 'eraser',   emoji: '🧹', answer: 'an' },
    { word: 'tree',     emoji: '🌳', answer: 'a'  },
  ],

  // Exercise 2: Fill in "a", "an", "the" + Exercise 3: complete with "the"
  articlesAAnThe: [
    // Exercise 2 words
    { word: 'elephant', emoji: '🐘',  answer: 'an'  },
    { word: 'sun',      emoji: '☀️',  answer: 'the' },
    { word: 'bicycle',  emoji: '🚲',  answer: 'a'   },
    { word: 'earth',    emoji: '🌍',  answer: 'the' },
    { word: 'doll',     emoji: '🪆',  answer: 'a'   },
    { word: 'turtle',   emoji: '🐢',  answer: 'a'   },
    { word: 'orange',   emoji: '🍊',  answer: 'an'  },
    { word: 'owl',      emoji: '🦉',  answer: 'an'  },
    { word: 'umbrella', emoji: '☂️',  answer: 'an'  },
    { word: 'moon',     emoji: '🌙',  answer: 'the' },
    { word: 'ant',      emoji: '🐜',  answer: 'an'  },
    { word: 'pencil',   emoji: '✏️',  answer: 'a'   },
    // Exercise 3 sentences — all use "the"
    { word: 'sun',      emoji: '☀️',  answer: 'the', sentence: '___ sun is yellow.'                    },
    { word: 'sky',      emoji: '🌤️', answer: 'the', sentence: '___ sky is blue.'                      },
    { word: 'Earth',    emoji: '🌍',  answer: 'the', sentence: '___ Earth is a planet.'                },
    { word: 'wind',     emoji: '💨',  answer: 'the', sentence: '___ wind is blowing.'                  },
    { word: 'stars',    emoji: '⭐',  answer: 'the', sentence: '___ stars are shining in the sky.'     },
    { word: 'children', emoji: '👧', answer: 'the', sentence: '___ children are playing in the park.' },
  ],

  // Exercises 4 & 5: There is / There are
  thereIsAre: [
    { emoji: '🐱',       noun: 'a cat',              answer: 'is'  },
    { emoji: '🐒🐒🐒',  noun: 'three monkeys',       answer: 'are' },
    { emoji: '⚽',       noun: 'one ball',            answer: 'is'  },
    { emoji: '🍎🍎',    noun: 'two apples',          answer: 'are' },
    { emoji: '✈️✈️✈️✈️✈️', noun: 'five planes',    answer: 'are' },
    { emoji: '🤖',       noun: 'one robot',           answer: 'is'  },
    { emoji: '🍅🍅🍅🍅', noun: 'four tomatoes',     answer: 'are' },
    { emoji: '🐕🐕🐕',  noun: 'three dogs',          answer: 'are' },
    { emoji: '🚚🚚',    noun: 'two trucks',          answer: 'are' },
    { emoji: '🖊️🖊️🖊️🖊️🖊️🖊️🖊️🖊️🖊️🖊️🖊️', noun: 'eleven green markers', answer: 'are' },
    { emoji: '🪑',       noun: 'one table',           answer: 'is'  },
    { emoji: '🦅',       noun: 'an eagle',            answer: 'is'  },
    { emoji: '🍫',       noun: 'a bar of chocolate',  answer: 'is'  },
    { emoji: '🔘🔘🔘🔘🔘🔘🔘🔘🔘', noun: 'nine white buttons', answer: 'are' },
  ],

  // Exercise 10: Action Words (15 verbs)
  actionWords: [
    { emoji: '🧗', word: 'climb'  },
    { emoji: '🪑', word: 'sit'    },
    { emoji: '🏊', word: 'swim'   },
    { emoji: '🦘', word: 'jump'   },
    { emoji: '👂', word: 'listen' },
    { emoji: '🥤', word: 'drink'  },
    { emoji: '🧼', word: 'wash'   },
    { emoji: '🎤', word: 'sing'   },
    { emoji: '👏', word: 'clap'   },
    { emoji: '🚶', word: 'walk'   },
    { emoji: '✍️', word: 'write'  },
    { emoji: '💃', word: 'dance'  },
    { emoji: '🏃', word: 'run'    },
    { emoji: '🎮', word: 'play'   },
    { emoji: '🍽️', word: 'eat'   },
  ],

  // Exercise 11: Simple Present Tense (14 sentences)
  presentTense: [
    { subject: 'I',             verbPhrase: '_____ my room',        options: ['clean',    'cleans'],    answer: 'clean'    },
    { subject: 'He',            verbPhrase: '_____ the dishes',     options: ['do',       'does'],      answer: 'does'     },
    { subject: 'We',            verbPhrase: '_____ food',           options: ['buy',      'buys'],      answer: 'buy'      },
    { subject: 'She',           verbPhrase: '_____ to bed late',    options: ['go',       'goes'],      answer: 'goes'     },
    { subject: 'You',           verbPhrase: '_____ here',           options: ['sleep',    'sleeps'],    answer: 'sleep'    },
    { subject: 'They never',    verbPhrase: '_____ dinner',         options: ['cook',     'cooks'],     answer: 'cook'     },
    { subject: 'It',            verbPhrase: '_____ in the park',    options: ['run',      'runs'],      answer: 'runs'     },
    { subject: 'Emma and I',    verbPhrase: '_____ TV',             options: ['watch',    'watches'],   answer: 'watch'    },
    { subject: 'The dog',       verbPhrase: '_____ with me',        options: ['walk',     'walks'],     answer: 'walks'    },
    { subject: 'The kids',      verbPhrase: '_____ a lot',          options: ['play',     'plays'],     answer: 'play'     },
    { subject: 'We',            verbPhrase: '_____ the recorder',   options: ['practice', 'practices'], answer: 'practice' },
    { subject: 'Cats',          verbPhrase: '_____ mice',           options: ['chase',    'chases'],    answer: 'chases'   },
    { subject: 'Emily and Tom', verbPhrase: '_____',                options: ['sing',     'sings'],     answer: 'sing'     },
    { subject: 'You',           verbPhrase: '_____ apples',         options: ['like',     'likes'],     answer: 'like'     },
  ],
}

export const LANGUAGE_TOPIC: TopicDef = {
  id: 'language',
  name: 'Language Arts',
  displayName: 'Language Arts',
  icon: '📖',
  color: '#FF86D0',
  bgColor: '#FFD8EE',
  kind: 'language',
  words: [],
  languageLessons: LANGUAGE_LESSONS,
  languageContent: LANGUAGE_CONTENT,
  rewards: [
    { id: 'bookmark',  name: 'Marcapáginas', image: '/images/rewards/bookmark.svg',  lessonsRequired: 2, description: 'Complete 2 lessons (40%)',      is3D: false },
    { id: 'notebook',  name: 'Cuaderno',     image: '/images/rewards/notebook.svg',  lessonsRequired: 4, description: 'Complete 4 lessons (80%)',      is3D: false },
    { id: 'trophy-la', name: 'Trofeo',       image: '/images/rewards/trophy-la.svg', lessonsRequired: 5, description: 'Complete ALL lessons (100%)',   is3D: false },
  ],
}
