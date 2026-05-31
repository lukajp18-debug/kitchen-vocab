import { TopicDef, LessonDef } from '../types/vocab'

export const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCB77', '#9B59B6', '#58CC02', '#CE82FF', '#FF9600', '#FFC800'
]

export const ENCOURAGEMENTS = [
  'Amazing! 🌟', 'Great job! 🎉', 'You rock! 🎸', 'Fantastic! ✨', 'Super! 🦸', 'Wow! 🎊', 'Brilliant! 💡', 'Awesome! 🚀', 'Nice one! 🎯', 'Perfect! 💯'
]

export const LESSONS: LessonDef[] = [
  { id: 'flashcards', name: 'Learn the Words', icon: '📚', color: '#58CC02', bgColor: '#E5F9D0', description: 'Learn 10 words with pictures!', xpReward: 10 },
  { id: 'picture-match', name: 'Match the Picture', icon: '🖼️', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Match words to pictures!', xpReward: 80 },
  { id: 'listen-choose', name: 'Listen and Pick', icon: '👂', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Listen and pick the right word!', xpReward: 80 },
  { id: 'spelling-challenge', name: 'Spell the Word', icon: '✏️', color: '#00CD9C', bgColor: '#CCF5EA', description: 'Spell the words you hear!', xpReward: 80 },
  { id: 'whats-missing', name: 'Fill the Blank', icon: '❓', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Find the missing letter!', xpReward: 80 },
  { id: 'final-test', name: 'Show What You Know!', icon: '🏆', color: '#FFB700', bgColor: '#FFF0CC', description: 'Final test - prove your skills!', xpReward: 120 },
]

export const TOPICS: TopicDef[] = [
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
      { word: 'sunscreen', image: '/images/vacation/sunscreen.png' },
      { word: 'beach', image: '/images/vacation/beach.png' },
      { word: 'swimsuit', image: '/images/vacation/swimsuit.png' },
      { word: 'sunglasses', image: '/images/vacation/sunglasses.png' },
      { word: 'towel', image: '/images/vacation/towel.png' },
      { word: 'sand', image: '/images/vacation/sand.png' },
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
  }
]
