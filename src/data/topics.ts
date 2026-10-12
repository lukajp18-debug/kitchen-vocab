import { TopicDef, LessonDef } from '../types/vocab'
import { MATH_TOPIC } from './mathTopic'
import { LANGUAGE_TOPIC } from './languageTopic'
import { WORKSHOP_3_TOPIC } from './workshopTopic'

export const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCB77', '#9B59B6', '#58CC02', '#CE82FF', '#FF9600', '#FFC800'
]

export const ENCOURAGEMENTS = [
  'Amazing! 🌟', 'Great job! 🎉', 'You rock! 🎸', 'Fantastic! ✨', 'Super! 🦸', 'Wow! 🎊', 'Brilliant! 💡', 'Awesome! 🚀', 'Nice one! 🎯', 'Perfect! 💯'
]

export const LESSONS: LessonDef[] = [
  { id: 'flashcards', name: 'Learn the Words', nameEs: 'Aprende las palabras', icon: '📚', color: '#58CC02', bgColor: '#E5F9D0', description: 'Learn the words with pictures!', descriptionEs: '¡Aprende las palabras con imágenes!', xpReward: 10 },
  { id: 'picture-match', name: 'Match the Picture', nameEs: 'Une la imagen', icon: '🖼️', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Match words to pictures!', descriptionEs: '¡Une las palabras con las imágenes!', xpReward: 80 },
  { id: 'listen-choose', name: 'Listen and Pick', nameEs: 'Escucha y elige', icon: '👂', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Listen and pick the right word!', descriptionEs: '¡Escucha y elige la palabra correcta!', xpReward: 80 },
  { id: 'spelling-challenge', name: 'Spell the Word', nameEs: 'Deletrea la palabra', icon: '✏️', color: '#00CD9C', bgColor: '#CCF5EA', description: 'Spell the words you hear!', descriptionEs: '¡Deletrea las palabras que escuchas!', xpReward: 80 },
  { id: 'whats-missing', name: 'Fill the Blank', nameEs: 'Completa la palabra', icon: '❓', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Find the missing letter!', descriptionEs: '¡Encuentra la letra que falta!', xpReward: 80 },
  { id: 'final-test', name: 'Show What You Know!', nameEs: '¡Demuestra lo que sabes!', icon: '🏆', color: '#FFB700', bgColor: '#FFF0CC', description: 'Final test - prove your skills!', descriptionEs: 'Prueba final: ¡demuestra lo que aprendiste!', xpReward: 120 },
]

export const TOPICS: TopicDef[] = [
  WORKSHOP_3_TOPIC,
  {
    id: 'vocab-week-5',
    name: 'Vocabulario del Colegio - Semana 5',
    displayName: 'School Vocab - Week 5',
    icon: '🏫',
    color: '#4C6FFF',
    bgColor: '#E3E8FF',
    weekLabel: 'Vocabulary #3 · Semana 5',
    sentDate: '2026-10-03',
    words: [
      { word: 'hour', image: '/images/vocab-weekly/week5/hour.png' },
      { word: 'between', image: '/images/vocab-weekly/week5/between.png' },
      { word: 'protect', image: '/images/vocab-weekly/week5/protect.png' },
      { word: 'planet', image: '/images/vocab-weekly/week5/planet.png' },
      { word: 'different', image: '/images/vocab-weekly/week5/different.png' },
      { word: 'rainbow', image: '/images/vocab-weekly/week5/rainbow.png' },
      { word: 'colors', image: '/images/vocab-weekly/week5/colors.png' },
      { word: 'school', image: '/images/vocab-weekly/week5/school.webp' },
      { word: 'history', image: '/images/vocab-weekly/week5/history.webp' },
      { word: 'symbol', image: '/images/vocab-weekly/week5/symbol.png' },
      { word: 'same', image: '/images/vocab-weekly/week5/same.webp' },
      { word: 'water', image: '/images/vocab-weekly/week5/water.png' },
      { word: 'light', image: '/images/vocab-weekly/week5/light.png' },
      { word: 'ruler', image: '/images/vocab-weekly/week5/ruler.png' },
      { word: 'build', image: '/images/vocab-weekly/week5/build.png' },
    ],
    rewards: [
      { id: 'sticker-pack', name: 'Sticker Pack', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
      { id: 'extra-playtime', name: 'Tiempo Extra de Juego', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: false },
      { id: 'surprise-prize', name: 'Premio Sorpresa', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: false },
    ]
  },
  {
    id: 'vocab-week-2',
    name: 'Vocabulario del Colegio - Semana 2',
    displayName: 'School Vocab - Week 2',
    icon: '🏫',
    color: '#4C6FFF',
    bgColor: '#E3E8FF',
    weekLabel: 'Semana del 7 al 11 de septiembre',
    quizDate: 'Examen: jueves 10 de septiembre',
    words: [
      { word: 'time', image: '/images/vocab-weekly/week2/time.png' },
      { word: 'minute', image: '/images/vocab-weekly/week2/minute.png' },
      { word: 'poster', image: '/images/vocab-weekly/week2/poster.png' },
      { word: 'animal', image: '/images/vocab-weekly/week2/animal.png' },
      { word: 'question', image: '/images/vocab-weekly/week2/question.png' },
      { word: 'first', image: '/images/vocab-weekly/week2/first.png' },
      { word: 'next', image: '/images/vocab-weekly/week2/next.png' },
      { word: 'scientist', image: '/images/vocab-weekly/week2/scientist.png' },
      { word: 'observe', image: '/images/vocab-weekly/week2/observe.png' },
      { word: 'see', image: '/images/vocab-weekly/week2/see.png' },
      { word: 'hear', image: '/images/vocab-weekly/week2/hear.png' },
      { word: 'community', image: '/images/vocab-weekly/week2/community.png' },
      { word: 'clock', image: '/images/vocab-weekly/week2/clock.png' },
      { word: 'group', image: '/images/vocab-weekly/week2/group.png' },
      { word: 'answer', image: '/images/vocab-weekly/week2/answer.png' },
    ],
    rewards: [
      { id: 'sticker-pack', name: 'Sticker Pack', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
      { id: 'extra-playtime', name: 'Tiempo Extra de Juego', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: false },
      { id: 'surprise-prize', name: 'Premio Sorpresa', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: false },
    ]
  },
  {
    id: 'kitchen',
    name: 'Palabras de la Cocina',
    displayName: 'Kitchen Vocab',
    icon: '🍳',
    color: '#FFB700',
    bgColor: '#FFF0CC',
    words: [
      { word: 'spoon', image: '/images/kitchen/spoon.png' },
      { word: 'fork', image: '/images/kitchen/fork.png' },
      { word: 'cup', image: '/images/kitchen/cup.png' },
      { word: 'pan', image: '/images/kitchen/pan.png' },
      { word: 'knife', image: '/images/kitchen/knife.png' },
      { word: 'glass', image: '/images/kitchen/glass.png' },
      { word: 'blender', image: '/images/kitchen/blender.png' },
      { word: 'plate', image: '/images/kitchen/plate.png' },
      { word: 'pot', image: '/images/kitchen/pot.png' },
      { word: 'kettle', image: '/images/kitchen/kettle.png' },
    ],
    rewards: [
      { id: 'panelita', name: 'Panelita de leche', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
      { id: 'trululu', name: 'Gomas Trululu', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: true },
      { id: 'hotwheels', name: 'Carro Hotwheels', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: true },
    ]
  },
  {
    id: 'vacation',
    name: 'Vocabulario de Vacaciones',
    displayName: 'Vacation Vocab',
    icon: '🏖️',
    color: '#00CD9C',
    bgColor: '#CCF5EA',
    words: [
      { word: 'sunscreen', image: '/images/vacation/sunscreen.webp' },
      { word: 'beach', image: '/images/vacation/beach.webp' },
      { word: 'swimsuit', image: '/images/vacation/swimsuit.webp' },
      { word: 'sunglasses', image: '/images/vacation/sunglasses.webp' },
      { word: 'towel', image: '/images/vacation/towel.webp' },
      { word: 'sand', image: '/images/vacation/sand.webp' },
      { word: 'hat', image: '/images/vacation/hat.svg' },
      { word: 'vacation', image: '/images/vacation/vacation.svg' },
      { word: 'suitcase', image: '/images/vacation/suitcase.svg' },
      { word: 'pool', image: '/images/vacation/pool.svg' },
    ],
    rewards: [
      { id: 'icecream', name: 'Helado', image: '/images/rewards/icecream.svg', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
      { id: 'floatie', name: 'Flotador', image: '/images/rewards/floatie.svg', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: false },
      { id: 'watergun', name: 'Pistola de Agua', image: '/images/rewards/watergun.svg', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: false },
    ]
  },
  MATH_TOPIC,
  LANGUAGE_TOPIC,
]
