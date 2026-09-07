// Types for the Language Arts Workshop topic (3rd Term).

export type Article = 'a' | 'an' | 'the'

export interface ArticleWord {
  word: string
  emoji: string
  answer: 'a' | 'an'
}

export interface ArticleTheWord {
  word: string
  emoji: string
  answer: Article
  // Full sentence context for "the" exercises (e.g., "___ sun is yellow.")
  sentence?: string
}

export interface ThereIsAreItem {
  emoji: string
  noun: string         // display noun phrase
  answer: 'is' | 'are'
  negative?: boolean   // if true, use "There is not" / "There are not"
}

export interface ActionWordItem {
  emoji: string
  word: string         // the correct action word
}

export interface PresentTenseItem {
  subject: string      // e.g. "I"
  verbPhrase: string   // e.g. "_____ my room"
  options: [string, string]
  answer: string
}

export interface LanguageContent {
  articlesAorAn: ArticleWord[]
  articlesAAnThe: ArticleTheWord[]
  thereIsAre: ThereIsAreItem[]
  actionWords: ActionWordItem[]
  presentTense: PresentTenseItem[]
}
