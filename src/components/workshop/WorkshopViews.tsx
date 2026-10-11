'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/I18nProvider'
import { lessonTitle } from '@/lib/lessonText'
import { LAHeader, Feedback, shuffle } from '@/components/language/LanguageViews'
import { TypedItem, WhQuestionItem, LongAnswerItem, WorkshopContent } from '@/types/workshop'

interface LessonProps {
  xp: number
  onComplete: (xp: number) => void
  onGameOver: (xp: number) => void
  onBack: () => void
}

// ============ HELPERS ============
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.8
  u.pitch = 1.1
  window.speechSynthesis.speak(u)
}

// setTimeout that is cancelled when the view unmounts (e.g. the student taps ✕ mid-feedback).
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])
  return useCallback((fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }, [])
}

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
const inputCls = 'w-full max-w-sm text-center text-2xl font-bold rounded-2xl border-4 px-4 py-3 outline-none transition-all '

// ============ TYPED ANSWER (dictation / picture / complete the sentence) ============
function TypedLesson({ title, items, bank, xp, onComplete, onGameOver, onBack }: LessonProps & {
  title: string; items: TypedItem[]; bank?: string[]
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  const later = useLater()
  const rounds = useMemo(() => shuffle(items), [items])
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const item = rounds[round]
  const total = rounds.length

  useEffect(() => {
    if (!item.speak) return
    const t = setTimeout(() => speak(item.speak!), 300)
    return () => clearTimeout(t)
  }, [item])

  const check = useCallback(() => {
    if (feedback || !value.trim()) return
    if (value.trim().toLowerCase() === item.answer.toLowerCase()) {
      setFeedback('correct')
      setCorrect((c) => c + 1)
      later(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound((r) => r + 1); setValue(''); setFeedback(null); setAnim('animate-slide-up'); later(() => setAnim(''), 400) }
      }, 1200)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); later(() => setAnim(''), 500)
      const nh = hearts - 1
      setHearts(nh)
      if (nh <= 0) later(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else later(() => setFeedback(null), 1000)
    }
  }, [feedback, value, item, round, total, hearts, correct, xp, onComplete, onGameOver, later])

  const sentenceParts = item.sentence?.split('___')

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={title} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-5">
        <div className={`flex flex-col items-center gap-4 ${anim}`}>
          {item.image && <img src={item.image} alt="" className="max-h-44 max-w-[16rem] object-contain rounded-2xl bg-surface p-2 shadow-sm" />}
          {item.speak && (
            <button
              onClick={() => speak(item.speak!)}
              className="w-24 h-24 rounded-full bg-duo-blue text-white text-5xl shadow-lg hover:scale-105 transition-all cursor-pointer"
              aria-label="Listen"
            >🔊</button>
          )}
          {sentenceParts && (
            <p className="text-2xl font-bold text-gray-700 text-center max-w-xs">
              {sentenceParts[0]}<span className="inline-block min-w-[6rem] border-b-4 border-gray-400 text-duo-green">{feedback === 'correct' ? item.answer : ' '}</span>{sentenceParts[1]}
            </p>
          )}
          {!item.speak && !sentenceParts && <p className="text-gray-500 font-semibold">{tx.writeTheWord}</p>}
          {item.speak && <p className="text-gray-500 font-semibold">{tx.listenAndWrite}</p>}
        </div>

        {bank && (
          <div className="flex gap-2 flex-wrap justify-center">
            {bank.map((w) => (
              <span key={w} className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">{w}</span>
            ))}
          </div>
        )}

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') check() }}
          disabled={!!feedback}
          autoFocus
          autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
          placeholder={tx.typeHere}
          className={inputCls + (feedback === 'correct' ? 'border-duo-green bg-green-50 text-duo-green' : feedback === 'wrong' ? 'border-duo-red bg-red-50 text-duo-red' : 'border-gray-200 bg-surface text-gray-800 focus:border-duo-blue')}
        />
        <Button onClick={check} disabled={!!feedback || !value.trim()} className="duo-button bg-duo-green hover:bg-duo-green/90 text-white font-black text-lg px-10 py-6 rounded-2xl">
          {tx.check}
        </Button>
        {feedback === 'correct' && <p className="font-bold text-duo-green text-xl">{item.answer}</p>}
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}

export function DictationView({ items, ...p }: LessonProps & { items: TypedItem[] }) {
  const { t, lang } = useI18n()
  const tx = t.study
  return <TypedLesson title={lessonTitle('ws-dictation', lang)} items={items} {...p} />
}

export function ImageWordsView({ items, ...p }: LessonProps & { items: TypedItem[] }) {
  const { t, lang } = useI18n()
  const tx = t.study
  return <TypedLesson title={lessonTitle('ws-image-words', lang)} items={items} {...p} />
}

export function CompleteSentencesView({ items, bank, ...p }: LessonProps & { items: TypedItem[]; bank: string[] }) {
  const { t, lang } = useI18n()
  const tx = t.study
  return <TypedLesson title={lessonTitle('ws-complete-sentences', lang)} items={items} bank={bank} {...p} />
}

// ============ FREE-TEXT SHELL (Wh questions / long answers) ============
// No hearts are lost here: the app cannot grade open writing, so it checks the basics
// (right words, enough words, question mark) and coaches with a hint instead.
function FreeTextLesson({ title, total, round, prompt, extra, value, setValue, hint, done, onSubmit, onBack, rows = 3 }: {
  title: string; total: number; round: number; prompt: React.ReactNode; extra?: React.ReactNode
  value: string; setValue: (v: string) => void; hint: string | null; done: boolean
  onSubmit: () => void; onBack: () => void; rows?: number
}) {
  const { t, lang } = useI18n()
  const tx = t.study
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={title} hearts={3} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-4">
        {prompt}
        {extra}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={done}
          rows={rows}
          autoCorrect="off" autoComplete="off" spellCheck={false}
          placeholder={tx.typeAnswer}
          className={'w-full max-w-sm text-lg font-semibold rounded-2xl border-4 px-4 py-3 outline-none transition-all resize-none ' + (done ? 'border-duo-green bg-green-50 text-duo-green' : 'border-gray-200 bg-surface text-gray-800 focus:border-duo-blue')}
        />
        {hint && !done && <p className="text-sm font-bold text-duo-orange text-center max-w-sm">💡 {hint}</p>}
        {done && <p className="font-bold text-duo-green text-xl animate-slide-up">{tx.greatWriting}</p>}
        <Button onClick={onSubmit} disabled={done || !value.trim()} className="duo-button bg-duo-green hover:bg-duo-green/90 text-white font-black text-lg px-10 py-6 rounded-2xl">
          {tx.check}
        </Button>
      </div>
    </div>
  )
}

// ============ WH QUESTIONS ============
const WH_WORDS = ['What', 'When', 'Why', 'Where', 'Who', 'How']

export function WhQuestionsView({ words, xp, onComplete, onBack }: { words: WhQuestionItem[] } & Pick<LessonProps, 'xp' | 'onComplete' | 'onBack'>) {
  const { t, lang } = useI18n()
  const tx = t.study
  const later = useLater()
  const [round, setRound] = useState(0)
  const [value, setValue] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const item = words[round]

  const submit = useCallback(() => {
    const text = value.trim()
    const first = text.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '')
    let problem: string | null = null
    if (!WH_WORDS.some((w) => w.toLowerCase() === first)) problem = tx.whStart
    else if (!text.toLowerCase().includes(item.word.toLowerCase())) problem = tx.whUseWord(item.word)
    else if (countWords(text) < 4) problem = tx.whLonger
    else if (!text.endsWith('?')) problem = tx.whQuestionMark
    setHint(problem)
    if (problem) return
    setDone(true)
    later(() => {
      if (round + 1 >= words.length) onComplete(xp)
      else { setRound((r) => r + 1); setValue(''); setHint(null); setDone(false) }
    }, 1400)
  }, [value, item, round, words.length, xp, onComplete, later])

  return (
    <FreeTextLesson
      title={lessonTitle('ws-wh-questions', lang)} total={words.length} round={round} value={value} setValue={setValue}
      hint={hint} done={done} onSubmit={submit} onBack={onBack}
      prompt={
        <div className="flex flex-col items-center gap-2">
          {item.image && <img src={item.image} alt="" className="max-h-32 max-w-[12rem] object-contain rounded-2xl bg-surface p-2 shadow-sm" />}
          <p className="text-gray-500 font-semibold text-center">{tx.writeQuestionWith}</p>
          <p className="text-4xl font-black text-duo-purple capitalize">{item.word}</p>
        </div>
      }
      extra={
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {WH_WORDS.map((w) => (
            <button
              key={w}
              disabled={done}
              onClick={() => setValue(`${w} `)}
              className="px-3 py-1.5 rounded-full border-2 border-purple-200 bg-purple-50 text-purple-700 font-black text-sm hover:bg-purple-100 cursor-pointer"
            >{w}</button>
          ))}
        </div>
      }
    />
  )
}

// ============ LONG ANSWERS ============
export function LongAnswersView({ questions, xp, onComplete, onBack }: { questions: LongAnswerItem[] } & Pick<LessonProps, 'xp' | 'onComplete' | 'onBack'>) {
  const { t, lang } = useI18n()
  const tx = t.study
  const later = useLater()
  const [round, setRound] = useState(0)
  const [value, setValue] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const item = questions[round]

  useEffect(() => {
    const t = setTimeout(() => speak(item.question), 300)
    return () => clearTimeout(t)
  }, [item])

  const submit = useCallback(() => {
    const problem = countWords(value) < 3 ? tx.longAnswerHint(item.starter) : null
    setHint(problem)
    if (problem) return
    setDone(true)
    later(() => {
      if (round + 1 >= questions.length) onComplete(xp)
      else { setRound((r) => r + 1); setValue(''); setHint(null); setDone(false) }
    }, 1400)
  }, [value, item, round, questions.length, xp, onComplete, later])

  return (
    <FreeTextLesson
      title={lessonTitle('ws-long-answers', lang)} total={questions.length} round={round} value={value} setValue={setValue}
      hint={hint} done={done} onSubmit={submit} onBack={onBack}
      prompt={
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl font-black text-gray-800 text-center max-w-xs">{item.question}</p>
          <Button variant="ghost" size="sm" className="text-duo-blue" onClick={() => speak(item.question)}>{tx.hearAgain}</Button>
        </div>
      }
      extra={<p className="text-sm text-gray-400 font-semibold text-center max-w-sm">{tx.startLike} {item.starter}</p>}
    />
  )
}

// ============ GROUP & CIRCLE ============
export function SortCircleView({ content, xp, onComplete, onGameOver, onBack }: LessonProps & { content: WorkshopContent['sort'] }) {
  const { t, lang } = useI18n()
  const tx = t.study
  const later = useLater()
  const items = useMemo(() => shuffle(content.items), [content.items])
  const circleOptions = useMemo(() => shuffle([...content.circle.options]), [content.circle.options])
  const total = items.length + 1 // sorting rounds + the final "circle" question
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [anim, setAnim] = useState('animate-slide-up')

  const isCircle = round >= items.length
  const item = items[round]
  const right = isCircle ? content.circle.answer : item.group

  const pick = useCallback((choice: string) => {
    if (feedback) return
    setSelected(choice)
    if (choice === right) {
      setFeedback('correct')
      setCorrect((c) => c + 1)
      later(() => {
        if (round + 1 >= total) onComplete(xp)
        else { setRound((r) => r + 1); setSelected(null); setFeedback(null); setAnim('animate-slide-up'); later(() => setAnim(''), 400) }
      }, 1000)
    } else {
      setFeedback('wrong'); setAnim('animate-shake'); later(() => setAnim(''), 500)
      const nh = hearts - 1
      setHearts(nh)
      if (nh <= 0) later(() => onGameOver(Math.round((correct / total) * xp)), 800)
      else later(() => { setFeedback(null); setSelected(null) }, 1000)
    }
  }, [feedback, right, round, total, hearts, correct, xp, onComplete, onGameOver, later])

  const options = isCircle ? circleOptions : [...content.groups]

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4"><LAHeader title={lessonTitle('ws-sort-circle', lang)} hearts={hearts} current={round + 1} total={total} onBack={onBack} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 gap-6">
        <div className={`flex flex-col items-center gap-3 ${anim}`}>
          {isCircle ? (
            <p className="text-xl font-black text-gray-800 text-center max-w-xs">{content.circle.prompt}</p>
          ) : (
            <>
              <p className="text-gray-500 font-semibold">{tx.putInGroup}</p>
              <p className="text-5xl font-black text-gray-800">{item.word}</p>
              <button onClick={() => speak(item.word)} className="text-duo-blue font-bold text-sm cursor-pointer">{tx.hearIt}</button>
            </>
          )}
        </div>
        <div className="flex gap-4">
          {options.map((opt) => {
            const isSel = selected === opt
            const isRight = opt === right
            let cls = 'min-w-[8rem] h-20 px-4 text-2xl font-black rounded-3xl border-4 transition-all cursor-pointer '
            if (feedback === 'correct' && isRight) cls += 'bg-green-100 border-duo-green text-duo-green scale-105'
            else if (feedback === 'wrong' && isSel) cls += 'bg-red-100 border-duo-red text-duo-red'
            else cls += 'bg-surface border-gray-200 text-gray-700 hover:border-duo-blue hover:bg-blue-50'
            return <button key={opt} disabled={!!feedback} onClick={() => pick(opt)} className={cls}>{opt}</button>
          })}
        </div>
        <Feedback feedback={feedback} />
      </div>
    </div>
  )
}
