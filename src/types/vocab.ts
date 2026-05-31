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

export interface TopicDef {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
  bgColor: string
  words: WordDef[]
  rewards: RewardDef[]
}
