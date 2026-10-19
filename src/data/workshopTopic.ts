import { TopicDef, LessonDef } from '../types/vocab'
import { WorkshopContent } from '../types/workshop'

// Lessons shared by the "Preparation Workshop" topics (Quiz #3, Quiz #4). Ids map to the
// workshop view dispatch in page.tsx.
export const WORKSHOP_3_LESSONS: LessonDef[] = [
  { id: 'ws-dictation', name: 'Listen and Write', nameEs: 'Escucha y escribe', icon: '🎧', color: '#58CC02', bgColor: '#E5F9D0', description: 'Listen and write the word', descriptionEs: 'Escucha y escribe la palabra', xpReward: 80 },
  { id: 'ws-image-words', name: 'Look and Write', nameEs: 'Mira y escribe', icon: '🖼️', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Look at the picture and write the word', descriptionEs: 'Mira la imagen y escribe la palabra', xpReward: 60 },
  { id: 'ws-wh-questions', name: 'Wh Questions', nameEs: 'Preguntas Wh', icon: '❓', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Write questions with What, Where, Why...', descriptionEs: 'Escribe preguntas con What, Where, Why...', xpReward: 80 },
  { id: 'ws-complete-sentences', name: 'Complete the Sentence', nameEs: 'Completa la oración', icon: '✏️', color: '#FFB700', bgColor: '#FFF0CC', description: 'Fill in with the correct word', descriptionEs: 'Completa con la palabra correcta', xpReward: 60 },
  { id: 'ws-sort-circle', name: 'Group and Circle', nameEs: 'Agrupa y elige', icon: '🗂️', color: '#00CD9C', bgColor: '#CCF5EA', description: 'Sort the words and pick the right one', descriptionEs: 'Clasifica las palabras y escoge la correcta', xpReward: 60 },
  { id: 'ws-long-answers', name: 'Long Answers', nameEs: 'Respuestas largas', icon: '💬', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Answer with full sentences', descriptionEs: 'Responde con oraciones completas', xpReward: 100 },
]

// Content from "PREPARATION WORKSHOP VOCABULARY QUIZ #3" (Second Grade, October 2nd 2026).
// Pictures are the ones from the school's Vocabulary #3 list (see vocab-week-5).
const W5 = '/images/vocab-weekly/week5'

const WORKSHOP_3_CONTENT: WorkshopContent = {
  // Exercise 1: "Listen to the teacher and write the word that you hear."
  // The worksheet leaves the dictated words to the teacher, so these are Vocabulary #3 words.
  dictation: ['hour', 'rainbow', 'color', 'history', 'same', 'build', 'light', 'water'].map((w) => ({ answer: w, speak: w })),

  // Exercise 2: "Look at the images and write the word in the line."
  imageWords: [
    { answer: 'symbol', image: `${W5}/symbol.png` },
    { answer: 'different', image: `${W5}/different.png` },
  ],

  // Exercise 3: "Write sentences with the words below using Wh questions."
  whWords: [
    { word: 'color', image: `${W5}/colors.png` },
    { word: 'protect', image: `${W5}/protect.png` },
    { word: 'school', image: `${W5}/school.png` },
  ],

  // Exercise 4: "Complete the sentences with the correct word." (word bank: between - protect)
  completeSentences: [
    { sentence: 'We must ___ our planet.', answer: 'protect', image: `${W5}/planet.png` },
    { sentence: 'The cat is ___ the boxes.', answer: 'between', image: `${W5}/between.png` },
  ],
  wordBank: ['between', 'protect'],

  // Exercises 5 & 6: put each word in the correct group; circle the most important word.
  sort: {
    groups: ['Nature', 'School'],
    items: [
      { word: 'Planet', group: 'Nature' },
      { word: 'School', group: 'School' },
      { word: 'Water', group: 'Nature' },
      { word: 'Ruler', group: 'School' },
    ],
    circles: [{
      prompt: 'Circle the word that is the most important to protect our planet:',
      options: ['Water', 'Light'],
      answer: 'Water',
    }],
  },

  // Exercise 7: "Questions Fun for Starters: Write long answers"
  longAnswers: [
    { question: 'What is your favorite subject at school?', starter: 'My favorite subject is ...' },
    { question: 'Do you have any pets?', starter: 'Yes, I have ... / No, I do not have any pets.' },
    { question: 'What is your favorite day of the week?', starter: 'My favorite day of the week is ...' },
  ],
}

export const WORKSHOP_3_TOPIC: TopicDef = {
  id: 'workshop-vocab-3',
  name: 'Taller de Repaso - Quiz de Vocabulario #3',
  displayName: 'Vocab Quiz #3 Workshop',
  icon: '📝',
  color: '#FF6B6B',
  bgColor: '#FFE3E3',
  kind: 'workshop',
  sentDate: '2026-10-03',
  words: [], // unused for workshop topics
  workshopLessons: WORKSHOP_3_LESSONS,
  workshopContent: WORKSHOP_3_CONTENT,
  rewards: [
    { id: 'sticker-pack', name: 'Sticker Pack', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
    { id: 'extra-playtime', name: 'Tiempo Extra de Juego', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: false },
    { id: 'surprise-prize', name: 'Premio Sorpresa', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: false },
  ],
}

// ============ QUIZ #4 (Vocabulary #4, Week 6) ============
// The school sent only the word list and the "Questions Fun for Starters" below, so this
// practice quiz is built from those: the 15 words, the 3 questions copied as written, and
// sentences / groups written for these words (not from the school).
const W6 = '/images/vocab-weekly/week6'
const w6 = (word: string) => `${W6}/${word}.webp`
const WEEK_6_WORDS = ['start', 'finish', 'friend', 'friendship', 'think', 'together', 'rules', 'class', 'guess', 'heavy', 'technology', 'after', 'before', 'neighborhood', 'neighbor']

const WORKSHOP_4_CONTENT: WorkshopContent = {
  // Dictation: ten of the fifteen words, a different sample each time.
  dictation: WEEK_6_WORDS.map((w) => ({ answer: w, speak: w })),

  // Look at the picture and write the word: ten of the fifteen, a different sample each time.
  imageWords: WEEK_6_WORDS.map((w) => ({ answer: w, image: w6(w) })),

  limits: { dictation: 10, imageWords: 10 },

  // Wh questions with three of the words.
  whWords: [
    { word: 'friend', image: w6('friend') },
    { word: 'rules', image: w6('rules') },
    { word: 'neighbor', image: w6('neighbor') },
  ],

  // Each sentence fits one word of the bank only (checked against all fifteen words).
  completeSentences: [
    { sentence: 'First we ___ the game, and then we play.', answer: 'start', image: w6('start') },
    { sentence: 'The runner will ___ the race at the red ribbon.', answer: 'finish', image: w6('finish') },
    { sentence: 'Sharing and helping make our ___ strong.', answer: 'friendship', image: w6('friendship') },
    { sentence: 'Please follow the ___ at school.', answer: 'rules', image: w6('rules') },
    { sentence: 'This box is too ___ for me to lift.', answer: 'heavy', image: w6('heavy') },
    { sentence: 'Computers and tablets are examples of ___.', answer: 'technology', image: w6('technology') },
    { sentence: 'Monday comes ___ Sunday.', answer: 'after', image: w6('after') },
    { sentence: 'Sunday comes ___ Monday.', answer: 'before', image: w6('before') },
    { sentence: 'A ___ is a person who lives near you.', answer: 'neighbor', image: w6('neighbor') },
  ],
  wordBank: ['start', 'finish', 'friendship', 'rules', 'heavy', 'technology', 'after', 'before', 'neighbor'],

  sort: {
    groups: ['Action words', 'People'],
    items: [
      { word: 'start', group: 'Action words' },
      { word: 'finish', group: 'Action words' },
      { word: 'think', group: 'Action words' },
      { word: 'guess', group: 'Action words' },
      { word: 'friend', group: 'People' },
      { word: 'neighbor', group: 'People' },
    ],
    circles: [
      { prompt: 'Circle the opposite of START:', options: ['finish', 'think'], answer: 'finish' },
      { prompt: 'Circle the opposite of BEFORE:', options: ['after', 'heavy'], answer: 'after' },
    ],
  },

  // "Questions Fun for Starters: Write long answers" (copied from the worksheet).
  longAnswers: [
    { question: 'What do you have for breakfast?', starter: 'For breakfast I have ...' },
    { question: 'What colour are your eyes?', starter: 'My eyes are ...' },
    { question: 'Where are you from?', starter: 'I am from ...' },
  ],
}

export const WORKSHOP_4_TOPIC: TopicDef = {
  id: 'workshop-vocab-4',
  name: 'Taller de Repaso - Quiz #4 (semana del lunes 19 oct)',
  displayName: 'Vocab Quiz #4 Workshop (week of Mon Oct 19)',
  icon: '📝',
  color: '#FF6B6B',
  bgColor: '#FFE3E3',
  kind: 'workshop',
  words: [],
  workshopLessons: WORKSHOP_3_LESSONS,
  workshopContent: WORKSHOP_4_CONTENT,
  rewards: [
    { id: 'sticker-pack', name: 'Sticker Pack', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
    { id: 'extra-playtime', name: 'Tiempo Extra de Juego', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: false },
    { id: 'surprise-prize', name: 'Premio Sorpresa', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: false },
  ],
}
