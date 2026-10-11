import { TopicDef, LessonDef } from '../types/vocab'
import { WorkshopContent } from '../types/workshop'

// Lessons for the "Preparation Workshop - Vocabulary Quiz #3" topic. Ids map to the
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
    circle: {
      prompt: 'Circle the word that is the most important to protect our planet:',
      options: ['Water', 'Light'],
      answer: 'Water',
    },
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
  words: [], // unused for workshop topics
  workshopLessons: WORKSHOP_3_LESSONS,
  workshopContent: WORKSHOP_3_CONTENT,
  rewards: [
    { id: 'sticker-pack', name: 'Sticker Pack', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
    { id: 'extra-playtime', name: 'Tiempo Extra de Juego', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: false },
    { id: 'surprise-prize', name: 'Premio Sorpresa', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: false },
  ],
}
