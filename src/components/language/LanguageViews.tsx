'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/I18nProvider'
import { lessonTitle } from '@/lib/lessonText'
import { FeedbackSheet } from '@/components/kid/FeedbackSheet'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArticleWord, ArticleTheWord, Article, ThereIsAreItem, ActionWordItem, PresentTenseItem } from '@/types/language'

// ============ HELPERS ============

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ============ SHARED CHROME ============
export function LAHeader({ title, hearts, current, total, onBack }: {
  title: string; hearts: number; current: number; total: number; onBack: () => void
}) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-sm pb-3">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-12 w-12 rounded-full text-xl" aria-label="Close">✕</Button>
        <div className="flex-1 duo-progress">
          <Progress value={pct} className="h-4 rounded-full" />
        </div>
        <div className="flex gap-0.5 text-lg shrink-0">
          {[0, 1, 2].map((i) => <span key={`${i}-${i < hearts}`} className={i < hearts ? '' : 'inline-block animate-heart-break'}>{i < hearts ? '❤️' : '🤍'}</span>)}
        </div>
      </div>
      <h2 className="text-center font-bold text-gray-700 text-sm">{title}</h2>
    </div>
  )
}

export function Feedback({ feedback }: { feedback: 'correct' | 'wrong' | null }) {
  return <FeedbackSheet feedback={feedback} />
}

// ============ LESSON 1: ARTICLES A or AN ============
export function ArticlesAAnView({ words, xp, onComplete, onGameOver, onBack }: {
  words: ArticleWord[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  const shuffled = useMemo(() => shuffle(words), [words])
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const item = shuffled[round]
  const total = shuffled.length

  const pick = useCallback((choice: 'a' | 'an') => {
    if (feedback) return
    setSelected(choice)
    const isRight = choice === item.answer
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound(r => r + 1); setSelected(null); setFeedback(null); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1000)
      setCorrect(nc)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [feedback, item, correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={lessonTitle('la-articles-a-an', lang)} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-6">
        <div className={`flex flex-col items-center gap-2 ${anim}`}>
          <span className="text-8xl">{item.emoji}</span>
          <p className="text-3xl font-black text-gray-800 capitalize">{item.word}</p>
        </div>
        <p className="text-gray-500 font-semibold">___ {item.word}</p>
        <div className="flex gap-4">
          {(['a', 'an'] as const).map((opt) => {
            const isSel = selected === opt
            const isRight = opt === item.answer
            let cls = 'w-28 h-20 text-3xl font-black rounded-3xl border-4 transition-all cursor-pointer '
            if (feedback === 'correct' && isRight) cls += 'bg-green-100 border-duo-green text-duo-green scale-105'
            else if (feedback === 'wrong' && isSel) cls += 'bg-red-100 border-duo-red text-duo-red'
            else cls += 'bg-surface border-gray-200 text-gray-700 hover:border-duo-pink hover:bg-pink-50'
            return (
              <button key={opt} disabled={!!feedback} onClick={() => pick(opt)} className={cls}>
                {opt.toUpperCase()}
              </button>
            )
          })}
        </div>
        {feedback === 'correct' && <p className="font-bold text-duo-green text-xl">{item.answer.toUpperCase()} {item.word}</p>}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ LESSON 2: ARTICLES A / AN / THE ============
export function ArticlesTheView({ words, xp, onComplete, onGameOver, onBack }: {
  words: ArticleTheWord[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  const shuffled = useMemo(() => shuffle(words), [words])
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const item = shuffled[round]
  const total = shuffled.length
  const OPTIONS: Article[] = ['a', 'an', 'the']

  const pick = useCallback((choice: Article) => {
    if (feedback) return
    setSelected(choice)
    const isRight = choice === item.answer
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound(r => r + 1); setSelected(null); setFeedback(null); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1000)
      setCorrect(nc)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [feedback, item, correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={lessonTitle('la-articles-the', lang)} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-5">
        <div className={`flex flex-col items-center gap-2 ${anim}`}>
          <span className="text-8xl">{item.emoji}</span>
          {item.sentence
            ? <p className="text-xl font-semibold text-gray-700 text-center max-w-xs">{item.sentence}</p>
            : <p className="text-3xl font-black text-gray-800 capitalize">{item.word}</p>
          }
        </div>
        <p className="text-gray-500 font-semibold">___ {item.word}</p>
        <div className="flex gap-3">
          {OPTIONS.map((opt) => {
            const isSel = selected === opt
            const isRight = opt === item.answer
            let cls = 'w-24 h-16 text-2xl font-black rounded-3xl border-4 transition-all cursor-pointer '
            if (feedback === 'correct' && isRight) cls += 'bg-green-100 border-duo-green text-duo-green scale-105'
            else if (feedback === 'wrong' && isSel) cls += 'bg-red-100 border-duo-red text-duo-red'
            else cls += 'bg-surface border-gray-200 text-gray-700 hover:border-duo-purple hover:bg-purple-50'
            return (
              <button key={opt} disabled={!!feedback} onClick={() => pick(opt)} className={cls}>
                {opt.toUpperCase()}
              </button>
            )
          })}
        </div>
        {feedback === 'correct' && <p className="font-bold text-duo-green text-xl">{item.answer.toUpperCase()} {item.word}</p>}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ LESSON 3: THERE IS / THERE ARE ============
export function ThereIsAreView({ items, xp, onComplete, onGameOver, onBack }: {
  items: ThereIsAreItem[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  const shuffled = useMemo(() => shuffle(items), [items])
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const item = shuffled[round]
  const total = shuffled.length

  const pick = useCallback((choice: 'is' | 'are') => {
    if (feedback) return
    setSelected(choice)
    const isRight = choice === item.answer
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound(r => r + 1); setSelected(null); setFeedback(null); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1000)
      setCorrect(nc)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [feedback, item, correct, round, total, hearts, xp, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={lessonTitle('la-there-is-are', lang)} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-6">
        <div className={`flex flex-col items-center gap-3 ${anim}`}>
          <span className="text-6xl">{item.emoji}</span>
          <p className="text-xl font-bold text-gray-700 text-center">
            There <span className="text-duo-blue">_____</span> {item.noun}.
          </p>
        </div>
        <div className="flex gap-4">
          {(['is', 'are'] as const).map((opt) => {
            const isSel = selected === opt
            const isRight = opt === item.answer
            let cls = 'w-32 h-16 text-2xl font-black rounded-3xl border-4 transition-all cursor-pointer '
            if (feedback === 'correct' && isRight) cls += 'bg-green-100 border-duo-green text-duo-green scale-105'
            else if (feedback === 'wrong' && isSel) cls += 'bg-red-100 border-duo-red text-duo-red'
            else cls += 'bg-surface border-gray-200 text-gray-700 hover:border-duo-blue hover:bg-blue-50'
            return (
              <button key={opt} disabled={!!feedback} onClick={() => pick(opt)} className={cls}>
                {opt.toUpperCase()}
              </button>
            )
          })}
        </div>
        {feedback === 'correct' && <p className="font-bold text-duo-green text-lg">There {item.answer} {item.noun}.</p>}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ LESSON 4: ACTION WORDS ============
export function ActionWordsView({ actions, xp, onComplete, onGameOver, onBack }: {
  actions: ActionWordItem[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  const shuffled = useMemo(() => shuffle(actions), [actions])
  const allWords = useMemo(() => actions.map(a => a.word), [actions])

  const makeOptions = useCallback((correct: string): string[] => {
    const distractors = shuffle(allWords.filter(w => w !== correct)).slice(0, 3)
    return shuffle([correct, ...distractors])
  }, [allWords])

  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')
  const [options, setOptions] = useState(() => makeOptions(shuffled[0].word))

  const item = shuffled[round]
  const total = shuffled.length

  const pick = useCallback((choice: string) => {
    if (feedback) return
    setSelected(choice)
    const isRight = choice === item.word
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else {
          const nextRound = round + 1
          setRound(nextRound)
          setOptions(makeOptions(shuffled[nextRound].word))
          setSelected(null); setFeedback(null)
          setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400)
        }
      }, 1000)
      setCorrect(nc)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [feedback, item, correct, round, total, hearts, xp, shuffled, makeOptions, onComplete, onGameOver])

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={lessonTitle('la-action-words', lang)} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-6">
        <p className="text-gray-500 font-semibold">{tx.whatAction}</p>
        <div className={`text-9xl ${anim}`}>{item.emoji}</div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((opt) => {
            const isSel = selected === opt
            const isRight = opt === item.word
            let cls = 'py-4 text-lg font-black rounded-2xl border-4 transition-all cursor-pointer '
            if (feedback === 'correct' && isRight) cls += 'bg-green-100 border-duo-green text-duo-green scale-105'
            else if (feedback === 'wrong' && isSel) cls += 'bg-red-100 border-duo-red text-duo-red'
            else cls += 'bg-surface border-gray-200 text-gray-700 hover:border-duo-green hover:bg-green-50'
            return (
              <button key={opt} disabled={!!feedback} onClick={() => pick(opt)} className={cls}>
                {opt}
              </button>
            )
          })}
        </div>
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

// ============ LESSON 5: SIMPLE PRESENT TENSE ============
export function PresentTenseView({ sentences, xp, onComplete, onGameOver, onBack }: {
  sentences: PresentTenseItem[]; xp: number; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  const shuffled = useMemo(() => shuffle(sentences), [sentences])
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const item = shuffled[round]
  const total = shuffled.length

  const pick = useCallback((choice: string) => {
    if (feedback) return
    setSelected(choice)
    const isRight = choice === item.answer
    if (isRight) {
      setFeedback('correct')
      const nc = correct + 1
      setTimeout(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound(r => r + 1); setSelected(null); setFeedback(null); setAnim('animate-slide-up'); setTimeout(() => setAnim(''), 400) }
      }, 1100)
      setCorrect(nc)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); setTimeout(() => setAnim(''), 500)
      const nh = hearts - 1; setHearts(nh)
      if (nh <= 0) setTimeout(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else setTimeout(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [feedback, item, correct, round, total, hearts, xp, onComplete, onGameOver])

  const sentence = item.verbPhrase.replace('_____', `[${item.options.join(' / ')}]`).replace('___', `[${item.options.join(' / ')}]`)

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={lessonTitle('la-present-tense', lang)} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-6">
        <Card className={`border-0 shadow-md w-full max-w-sm ${anim}`}>
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-black text-duo-blue mb-1">{item.subject}</p>
            <p className="text-lg text-gray-600">{item.verbPhrase.replace(/_{2,}/g, '______')}</p>
          </CardContent>
        </Card>
        <p className="text-gray-500 text-sm font-semibold">{tx.chooseForm}</p>
        <div className="flex gap-4">
          {item.options.map((opt) => {
            const isSel = selected === opt
            const isRight = opt === item.answer
            let cls = 'flex-1 min-w-[120px] py-5 text-xl font-black rounded-3xl border-4 transition-all cursor-pointer '
            if (feedback === 'correct' && isRight) cls += 'bg-green-100 border-duo-green text-duo-green scale-105'
            else if (feedback === 'wrong' && isSel) cls += 'bg-red-100 border-duo-red text-duo-red'
            else cls += 'bg-surface border-gray-200 text-gray-700 hover:border-duo-orange hover:bg-orange-50'
            return (
              <button key={opt} disabled={!!feedback} onClick={() => pick(opt)} className={cls}>
                {opt}
              </button>
            )
          })}
        </div>
        {feedback === 'correct' && (
          <p className="font-bold text-duo-green text-lg text-center">
            {item.subject} <span className="underline">{item.answer}</span>{' '}
            {item.verbPhrase.replace(/_{2,}/g, '').trim()}
          </p>
        )}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}
