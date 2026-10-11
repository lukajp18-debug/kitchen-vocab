// Types for a school "Preparation Workshop" (vocabulary quiz prep) topic.

// A typed-answer round: the student writes a word (dictation, picture, or blank).
export interface TypedItem {
  answer: string        // the exact word the student must write
  image?: string        // optional picture shown with the prompt
  sentence?: string     // optional sentence with "___" where the word goes
  speak?: string        // if set, the prompt is audio-only (dictation): the text to read aloud
}

export interface WhQuestionItem {
  word: string          // the word the question must contain (e.g. "color")
  image?: string
}

export interface SortItem {
  word: string
  group: string         // must match one of SortContent.groups
}

export interface CircleItem {
  prompt: string
  options: [string, string]
  answer: string
}

export interface LongAnswerItem {
  question: string
  starter: string       // sentence starter shown as a hint
}

export interface WorkshopContent {
  dictation: TypedItem[]
  imageWords: TypedItem[]
  whWords: WhQuestionItem[]
  completeSentences: TypedItem[]
  wordBank: string[]
  sort: { groups: [string, string]; items: SortItem[]; circle: CircleItem }
  longAnswers: LongAnswerItem[]
}
