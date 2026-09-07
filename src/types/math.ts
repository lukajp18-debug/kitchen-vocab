// Types for the interactive Math Workshop topic (3rd Term).
// Kept independent from vocab.ts so it can be imported there without a cycle.

export type MathOp = 'add' | 'sub'

export interface ColumnProblem {
  a: number
  b: number
  op: MathOp
}

export interface BreakApartProblem {
  a: number
  b: number
}

export interface WordProblem {
  image: string
  sentenceEs: string
  sentenceEn: string
  a: number
  b: number
  op: MathOp
  answerSuffix: string // e.g. "miles", "dollars", "pencils"
  isMoney?: boolean // render answer with a $ prefix
}

export type CoinType = 'penny' | 'nickel' | 'dime' | 'quarter'

export const COIN_VALUE: Record<CoinType, number> = {
  penny: 1,
  nickel: 5,
  dime: 10,
  quarter: 25,
}

export interface CountCoinsRound {
  coins: CoinType[]
}

export interface ClockTime {
  hour: number // 1-12
  minute: number // 0,15,30,45
}

export interface MathContent {
  addition: { columns: ColumnProblem[]; breakApart: BreakApartProblem[] }
  subtraction: { columns: ColumnProblem[] }
  wordProblems: WordProblem[]
  money: { countRounds: CountCoinsRound[] }
  time: { times: ClockTime[] }
}
