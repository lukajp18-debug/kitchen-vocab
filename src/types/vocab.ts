export interface WordDef {
  word: string
  image: string
}

export interface RewardDef {
  id: string
  name: string
  image: string
  lessonsRequired: number
  description: string
  is3D: boolean
}

export interface LessonDef {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
  xpReward: number
}

import type { MathContent } from './math'
import type { LanguageContent } from './language'

export interface TopicDef {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
  bgColor: string
  words: WordDef[]
  rewards: RewardDef[]
  // Optional Math Workshop fields. Vocab topics omit these (default kind: 'vocab').
  kind?: 'vocab' | 'math' | 'language'
  mathLessons?: LessonDef[]
  mathContent?: MathContent
  languageLessons?: LessonDef[]
  languageContent?: LanguageContent
}
