'use client'

// Shared pieces for the question-by-question lessons (vocabulary lessons and the
// workshop typed/sort lessons): the runner that owns hearts, XP and "next question",
// deck building without repeats, voice helpers, and the hint panels.
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/I18nProvider'
import { lessonTitle } from '@/lib/lessonText'
import { LAHeader, shuffle } from '@/components/language/LanguageViews'
import { playWord, speakText, stopSpeech } from '@/lib/speech'
import { useLater } from '@/lib/useLater'

export type Feedback = 'correct' | 'wrong' | null
// practice: a wrong answer costs a heart and the student tries again.
// test: a wrong answer costs a heart, shows the right answer and moves on.
export type Mode = 'practice' | 'test'

export interface Handlers {
  correct: () => void // adds XP for this question (none if the student used the spelling help)
  miss: () => number // loses a heart, returns hearts left
  helped: () => void // the student used the spelling help: this word comes back later, without help
  next: () => void // goes to the next question (or finishes); safe to call twice
}

// ============ DECKS ============
export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

// n items with no repeats (a fresh shuffle is appended only when the list is shorter
// than n), and never the same item twice in a row at a cycle boundary.
export function buildDeck<T>(items: T[], n: number, same: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  const deck: T[] = []
  while (deck.length < n) {
    let batch = shuffle(items)
    if (deck.length && batch.length > 1 && same(batch[0], deck[deck.length - 1])) {
      batch = [...batch.slice(1), batch[0]]
    }
    deck.push(...batch)
  }
  return deck.slice(0, n)
}

// Letters in a shuffled order that is never already the right spelling.
// Letters only: a space ("t shirt") is a fixed gap on screen, never a tile to place.
export const isLetter = (ch: string) => /[a-z]/i.test(ch)
export const lettersOf = (word: string) => word.split('').filter(isLetter).join('')

export function scramble(word: string): string[] {
  const plain = lettersOf(word)
  const letters = plain.split('')
  if (new Set(letters).size < 2) return letters
  let out = shuffle(letters)
  for (let i = 0; i < 12 && out.join('') === plain; i++) out = shuffle(letters)
  return out
}

// ============ VOICE ============
export function useSpeechCleanup() {
  useEffect(() => () => { stopSpeech() }, [])
}

// Runs `fn` (something spoken) shortly after the round appears. If the student has already
// answered by then (`cancelled`), it does not run: a late "intro" must never talk over the
// celebration, whose end is what moves the lesson on.
export function useDelayed(fn: () => void, delay: number, cancelled: boolean, key: unknown) {
  const latest = useRef({ fn, cancelled })
  useEffect(() => { latest.current = { fn, cancelled } })
  useEffect(() => {
    const id = setTimeout(() => { if (!latest.current.cancelled) latest.current.fn() }, delay)
    return () => clearTimeout(id)
  }, [key, delay])
}

// Says `word` shortly after the round appears (the delay lets the slide-in finish and
// gives the browser time to cancel the previous round's audio).
export function useAutoPlay(word: string, mode: 'word' | 'spell' | 'full', delay = 400, cancelled = false) {
  useDelayed(() => playWord(word, mode), delay, cancelled, `${word}|${mode}`)
}

// Same, for a sentence or question that is read as it is.
export function useAutoText(text: string, delay = 400, cancelled = false) {
  useDelayed(() => speakText(text), delay, cancelled, text)
}

// Wrong answers in a practice round: after 2 misses the word is spelled aloud with a hint,
// after 3 "learning mode" keeps spelling it every few seconds until the round is solved.
// Once the round is solved (`solved`) the hints stay quiet.
export function useMissHelp(word: string, enabled: boolean, solved: boolean, onHelp?: () => void) {
  const [misses, setMisses] = useState(0)
  const solvedRef = useRef(solved)
  const onHelpRef = useRef(onHelp)
  useEffect(() => { solvedRef.current = solved; onHelpRef.current = onHelp })
  const hint = misses >= 2
  const learning = misses >= 3
  useEffect(() => {
    if (!enabled || !hint) return
    onHelpRef.current?.() // the spelled hint counts as help
    const id = setTimeout(() => { if (!solvedRef.current) playWord(word, 'spell') }, 1300)
    return () => clearTimeout(id)
  }, [enabled, hint, word])
  useEffect(() => {
    if (!enabled || !learning) return
    const id = setInterval(() => { if (!solvedRef.current) playWord(word, 'spell') }, 10000)
    return () => clearInterval(id)
  }, [enabled, learning, word])
  return { misses, addMiss: () => setMisses((m) => m + 1) }
}

// Safety net for celebrations that wait for the voice to finish: if the browser never
// reports the end of the speech, the lesson still moves on.
export const CELEBRATION_MAX_MS = 14000

export function HelpPanels({ word, misses, learningText }: { word: string; misses: number; learningText: string }) {
  const { t } = useI18n()
  const tx = t.study
  if (misses >= 3) {
    return (
      <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-4 py-2 text-center animate-slide-up">
        <p className="text-sm font-bold text-yellow-700">{learningText}</p>
        <p className="text-2xl font-black text-yellow-800 mt-1 tracking-widest">{word.toUpperCase()}</p>
      </div>
    )
  }
  if (misses >= 2) {
    return (
      <div className="mb-4 bg-brand-soft border-2 border-brand/30 rounded-xl px-4 py-2 text-center animate-slide-up">
        <p className="text-sm font-bold text-brand">{tx.hint} {word.toUpperCase().split('').join(' - ')}</p>
      </div>
    )
  }
  return null
}

// Button under a finished round so the student does not have to wait for the spelling.
export function SkipButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return (
    <Button onClick={onClick} variant="outline" className="w-full mt-4 rounded-2xl py-5 font-bold text-base">
      {t.study.skipWait}
    </Button>
  )
}

// Help for the exercises where the spelling is NOT given up front: the student can ask for
// the word to be spelled, but then it counts as "helped" and comes back at the end of the
// lesson until it is written without help.
export function HelpSpellButton({ word, h, disabled }: { word: string; h: Handlers; disabled?: boolean }) {
  const { t } = useI18n()
  const tx = t.study
  const [used, setUsed] = useState(false)
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => { h.helped(); setUsed(true); playWord(word, 'spell') }}
        className="rounded-2xl py-5 font-bold"
      >
        {tx.spellHelp}
      </Button>
      {used && <p className="text-xs font-semibold text-ink-soft text-center max-w-xs">{tx.helpUsedNote}</p>}
    </div>
  )
}

// ============ RUNNER ============
class Score {
  private xp = 0
  private hearts = 3
  private lastAdvanced = -1
  private helpedRounds = new Set<number>()
  markHelped(round: number) { this.helpedRounds.add(round) }
  wasHelped(round: number) { return this.helpedRounds.has(round) }
  addXp(n: number) { this.xp += n }
  xpRounded() { return Math.round(this.xp) }
  loseHeart() { this.hearts -= 1; return this.hearts }
  // true the first time it is called for a round, false after (so "next" is idempotent)
  advance(round: number) {
    if (this.lastAdvanced === round) return false
    this.lastAdvanced = round
    return true
  }
}

// One component owns hearts, XP and the round counter; each question is its own component,
// mounted fresh for every round (key = round), so no state leaks between questions and
// the last round always finishes instead of running off the end of the list.
// When a question was solved with the spelling help and `rebuild` is given, the same word is
// added at the end as a new question, so the lesson only ends once it is solved without help.
export function Runner<Q>({ lessonId, questions, xpPerCorrect = 10, completeXp, onComplete, onGameOver, onBack, label, rebuild, children }: {
  lessonId: string
  questions: Q[]
  xpPerCorrect?: number
  completeXp?: number // when set, finishing always awards this amount (workshop lessons)
  onComplete: (xp: number) => void
  onGameOver: (xp: number) => void
  onBack: () => void
  label?: (q: Q) => string
  rebuild?: (q: Q) => Q
  children: (q: Q, h: Handlers) => ReactNode
}) {
  const { t, lang } = useI18n()
  const later = useLater()
  useSpeechCleanup()
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [entries, setEntries] = useState(() => questions.map((q) => ({ q, retry: false })))
  // Running totals live in a small object of their own so timers (the celebration ends
  // a second after the answer) always see the latest values.
  const [score] = useState(() => new Score())

  const handlers = useMemo<Handlers>(() => ({
    correct: () => score.addXp(score.wasHelped(round) ? 0 : xpPerCorrect),
    miss: () => {
      const left = score.loseHeart()
      setHearts(left)
      if (left <= 0) later(() => { stopSpeech(); onGameOver(score.xpRounded()) }, 800)
      return left
    },
    helped: () => score.markHelped(round),
    next: () => {
      if (!score.advance(round)) return
      stopSpeech()
      const again = score.wasHelped(round) && !!rebuild
      if (again) setEntries((e) => [...e, { q: rebuild!(e[round].q), retry: true }])
      if (!again && round + 1 >= entries.length) onComplete(completeXp ?? score.xpRounded())
      else setRound(round + 1)
    },
  }), [score, round, entries.length, rebuild, xpPerCorrect, completeXp, onComplete, onGameOver, later])

  const entry = entries[round]
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4">
        <LAHeader title={lessonTitle(lessonId, lang)} hearts={hearts} current={round + 1} total={entries.length} onBack={onBack} />
      </div>
      {/* Bottom padding keeps the question and the Skip button clear of the answer sheet that slides up from the bottom. */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-36">
        <div key={round} className="w-full max-w-sm animate-slide-up">
          {(label || entry.retry) && (
            <div className="text-center mb-3 flex flex-col items-center gap-1">
              {label && <span className="text-xs font-bold px-3 py-1 rounded-full bg-duo-gold/20 text-duo-gold">{label(entry.q)}</span>}
              {entry.retry && <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-soft text-brand">{t.study.retryNoHelp}</span>}
            </div>
          )}
          {children(entry.q, handlers)}
        </div>
      </div>
    </div>
  )
}
