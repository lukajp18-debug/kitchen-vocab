import { TopicDef, LessonDef } from '../types/vocab'
import { MathContent } from '../types/math'

// Lessons for the Math Workshop topic. Same shape as vocab LessonDef so the
// Dashboard can render them uniformly; ids map to the math view dispatch in page.tsx.
export const MATH_LESSONS: LessonDef[] = [
  { id: 'math-addition', name: '3-Digit Addition', icon: '➕', color: '#58CC02', bgColor: '#E5F9D0', description: 'Suma de 3 dígitos con reagrupación', xpReward: 80 },
  { id: 'math-subtraction', name: '3-Digit Subtraction', icon: '➖', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Resta de 3 dígitos con reagrupación', xpReward: 80 },
  { id: 'math-word-problems', name: 'Word Problems', icon: '🧠', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Resuelve los problemas', xpReward: 100 },
  { id: 'math-money', name: 'Money & Coins', icon: '🪙', color: '#FFB700', bgColor: '#FFF0CC', description: 'Nombra y cuenta monedas', xpReward: 80 },
  { id: 'math-time', name: 'Telling the Time', icon: '🕐', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Lee y pon la hora en el reloj', xpReward: 80 },
]

// Exact content taken from "Math Workshop 3rd Term - 2025 - 2026.pdf".
const MATH_CONTENT: MathContent = {
  addition: {
    columns: [
      { a: 586, b: 179, op: 'add' },
      { a: 297, b: 484, op: 'add' },
    ],
    breakApart: [
      { a: 413, b: 264 },
      { a: 185, b: 514 },
    ],
  },
  subtraction: {
    columns: [
      { a: 925, b: 389, op: 'sub' },
      { a: 842, b: 478, op: 'sub' },
      { a: 523, b: 297, op: 'sub' },
      { a: 634, b: 379, op: 'sub' },
      { a: 832, b: 556, op: 'sub' },
      { a: 726, b: 447, op: 'sub' },
    ],
  },
  wordProblems: [
    {
      image: '/images/math/bike.png',
      sentenceEs: 'Tomás recorrió 237 millas en bici una semana y 498 millas la siguiente. ¿Cuántas millas recorrió en total?',
      sentenceEn: 'Tomas rode his bike for 237 miles one week and 498 miles the next week. How many total miles did Tomas ride?',
      a: 237, b: 498, op: 'add', answerSuffix: 'miles',
    },
    {
      image: '/images/math/piggybank.png',
      sentenceEs: 'Anita ahorró 488 dólares en junio y 703 dólares en julio. ¿Cuánto ahorró en total?',
      sentenceEn: 'Anita saved 488 dollars in June, and 703 dollars in July. How many dollars did she save in all?',
      a: 488, b: 703, op: 'add', answerSuffix: 'dollars', isMoney: true,
    },
    {
      image: '/images/math/pencils.png',
      sentenceEs: 'Tomás compró 678 lápices. Le dio 239 lápices a su maestra. ¿Cuántos lápices le quedaron?',
      sentenceEn: 'Tomas bought 678 pencils from the store. He gave 239 pencils to his teacher. How many pencils were left?',
      a: 678, b: 239, op: 'sub', answerSuffix: 'pencils',
    },
    {
      image: '/images/math/chicks.png',
      sentenceEs: 'Hay 532 pollos en la granja y el granjero vendió 278 pollos. ¿Cuántos pollos quedaron?',
      sentenceEn: 'There are 532 chickens in the farm, and the farmer sold 278 chickens. How many chickens were left?',
      a: 532, b: 278, op: 'sub', answerSuffix: 'chickens',
    },
  ],
  money: {
    countRounds: [
      { coins: ['nickel', 'nickel', 'nickel', 'penny'] },        // 16¢
      { coins: ['nickel', 'nickel', 'penny'] },                  // 11¢
      { coins: ['quarter', 'dime', 'nickel'] },                  // 40¢
      { coins: ['dime', 'dime', 'penny', 'penny'] },             // 22¢
      { coins: ['quarter', 'penny', 'penny'] },                  // 27¢
      { coins: ['quarter', 'quarter', 'penny'] },                // 51¢
    ],
  },
  time: {
    times: [
      { hour: 1, minute: 30 },
      { hour: 5, minute: 0 },
      { hour: 3, minute: 15 },
      { hour: 12, minute: 30 },
      { hour: 6, minute: 45 },
      { hour: 7, minute: 30 },
      { hour: 11, minute: 0 },
      { hour: 8, minute: 15 },
      { hour: 2, minute: 30 },
    ],
  },
}

export const MATH_TOPIC: TopicDef = {
  id: 'math',
  name: 'Taller de Matemáticas',
  displayName: 'Math Workshop',
  icon: '🔢',
  color: '#1CB0F6',
  bgColor: '#D0EFFA',
  kind: 'math',
  words: [], // unused for math topics
  mathLessons: MATH_LESSONS,
  mathContent: MATH_CONTENT,
  rewards: [
    { id: 'sticker', name: 'Calcomanía', image: '/images/rewards/sticker.svg', lessonsRequired: 2, description: 'Complete 2 lessons (40%)', is3D: false },
    { id: 'chocolate', name: 'Chocolate', image: '/images/rewards/chocolate.svg', lessonsRequired: 4, description: 'Complete 4 lessons (80%)', is3D: false },
    { id: 'surprise', name: 'Sorpresa', image: '/images/rewards/surprise.svg', lessonsRequired: 5, description: 'Complete ALL lessons (100%)', is3D: false },
  ],
}
