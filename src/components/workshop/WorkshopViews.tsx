'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/I18nProvider'
import { lessonTitle } from '@/lib/lessonText'
import { FeedbackSheet } from '@/components/kid/FeedbackSheet'
import { SpellStrip } from '@/components/kid/SpellStrip'
import { LAHeader, shuffle } from '@/components/language/LanguageViews'
import {
  Feedback, Handlers, Runner, SkipButton, HelpSpellButton, buildDeck, useAutoText, useDelayed, useSpeechCleanup, CELEBRATION_MAX_MS,
} from '@/components/kid/lessonKit'
import { playWord, speakText, useSpeechView } from '@/lib/speech'
import { useLater } from '@/lib/useLater'
import { TypedItem, WhQuestionItem, LongAnswerItem, WorkshopContent } from '@/types/workshop'

interface LessonProps {
  xp: number
  onComplete: (xp: number) => void
  onGameOver: (xp: number) => void
  onBack: () => void
}

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
const norm = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/, '')
const inputCls = 'w-full max-w-sm text-center text-2xl font-bold rounded-2xl border-4 px-4 py-3 outline-none transition-all '

// ============ TYPED ANSWER (dictation / picture / complete the sentence) ============
// First miss: a hint with the first letter and the length. Second miss: the word is
// shown and spelled aloud so the student can copy it; from then on mistakes cost no hearts
// (they are copying, not guessing).
type TypedKind = 'dictation' | 'picture' | 'sentence'

function TypedQuestion({ item, bank, kind, h }: { item: TypedItem; bank?: string[]; kind: TypedKind; h: Handlers }) {
  const { t } = useI18n()
  const tx = t.study
  const later = useLater()
  const speech = useSpeechView()
  const word = item.answer
  const accepted = useMemo(() => [item.answer, ...(item.alsoAccept ?? [])].map(norm), [item])
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shake, setShake] = useState(false)
  const [misses, setMisses] = useState(0)
  const [dead, setDead] = useState(false)

  const sentenceParts = item.sentence?.split('___')
  const sentenceAloud = item.sentence?.replace('___', 'blank')
  const fullSentence = item.sentence?.replace('___', word)

  // What the student hears when the round starts.
  useDelayed(() => {
    if (kind === 'dictation') playWord(item.speak ?? word, 'word')
    else if (kind === 'sentence' && sentenceAloud) speakText(sentenceAloud)
  }, 450, feedback === 'correct', word)

  const check = useCallback(() => {
    if (feedback || dead || !value.trim()) return
    if (accepted.includes(norm(value))) {
      setFeedback('correct')
      h.correct()
      const spellOut = () => playWord(word, 'spell', () => later(h.next, 500))
      if (kind === 'sentence' && fullSentence) speakText(fullSentence, spellOut)
      else spellOut()
      later(h.next, CELEBRATION_MAX_MS + 6000)
      return
    }
    setFeedback('wrong')
    setShake(true)
    later(() => setShake(false), 500)
    const nm = misses + 1
    setMisses(nm)
    if (nm === 2) {
      h.helped() // the word is shown and spelled for the student: it comes back later, without help
      setValue('') // start the copy from a clean box
      later(() => playWord(word, 'spell'), 900)
    }
    // Copying the revealed word costs nothing.
    if (misses < 2 && h.miss() <= 0) { setDead(true); return }
    later(() => setFeedback(null), 1000)
  }, [feedback, dead, value, accepted, misses, word, kind, fullSentence, h, later])

  const speaking = speech.phase !== 'idle'
  const showHear = kind === 'dictation' || (kind === 'picture' && misses >= 1)

  return (
    <div className="flex flex-col items-center gap-5">
      <div className={`flex flex-col items-center gap-4 ${shake ? 'animate-shake' : ''}`}>
        {item.image && <img src={item.image} alt="" className="max-h-44 max-w-[16rem] object-contain rounded-2xl bg-surface p-2 shadow-sm" />}
        {showHear && (
          <button
            onClick={() => playWord(item.speak ?? word, 'word')}
            className={`w-24 h-24 rounded-full bg-duo-blue text-white text-5xl shadow-lg transition-all cursor-pointer ${speaking ? 'animate-pulse-grow' : 'hover:scale-105'}`}
            aria-label={tx.hearWord}
          >🔊</button>
        )}
        {sentenceParts && (
          <>
            <p className="text-2xl font-bold text-gray-700 text-center max-w-xs">
              {sentenceParts[0]}<span className="inline-block min-w-[6rem] border-b-4 border-gray-400 text-duo-green">{feedback === 'correct' ? word : ' '}</span>{sentenceParts[1]}
            </p>
            <Button variant="ghost" size="sm" className="text-duo-blue" onClick={() => speakText(sentenceAloud!)}>{tx.hearSentence}</Button>
          </>
        )}
        {kind === 'dictation' && <p className="text-gray-500 font-semibold">{tx.listenAndWrite}</p>}
        {kind === 'picture' && <p className="text-gray-500 font-semibold">{tx.writeTheWord}</p>}
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
        disabled={feedback === 'correct'}
        autoFocus
        autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
        placeholder={tx.typeHere}
        aria-label={tx.typeHere}
        className={inputCls + (feedback === 'correct' ? 'border-duo-green bg-green-50 text-duo-green' : feedback === 'wrong' ? 'border-duo-red bg-red-50 text-duo-red' : 'border-gray-200 bg-surface text-gray-800 focus:border-duo-blue')}
      />
      <div className="flex gap-3 items-center">
        <Button onClick={check} disabled={!!feedback || !value.trim()} className="duo-button bg-duo-green hover:bg-duo-green/90 text-white font-black text-lg px-10 py-6 rounded-2xl">
          {tx.check}
        </Button>
      </div>
      {feedback !== 'correct' && <HelpSpellButton word={word} h={h} />}

      {misses === 1 && feedback !== 'correct' && (
        <p className="text-sm font-bold text-duo-orange text-center">💡 {tx.startsWith(word[0].toUpperCase(), word.length)}</p>
      )}
      {(misses >= 2 || feedback === 'correct') && (
        <div className="flex flex-col items-center gap-2">
          <SpellStrip word={word} size="lg" />
          {feedback !== 'correct' && <p className="text-sm font-bold text-duo-orange text-center">{tx.copyIt}</p>}
        </div>
      )}
      {feedback === 'correct' && <SkipButton onClick={h.next} />}
      <FeedbackSheet feedback={feedback} message={feedback === 'wrong' && misses === 1 ? tx.tryAgain : feedback === 'wrong' ? tx.answerWas(word) : undefined} />
    </div>
  )
}

function TypedLesson({ lessonId, items, bank, kind, limit, xp, onComplete, onGameOver, onBack }: LessonProps & {
  lessonId: string; items: TypedItem[]; bank?: string[]; kind: TypedKind; limit?: number
}) {
  const rounds = useMemo(() => buildDeck(items, Math.min(limit ?? items.length, items.length), (a, b) => a.answer === b.answer), [items, limit])
  return (
    <Runner
      lessonId={lessonId} questions={rounds} rebuild={(q) => q}
      xpPerCorrect={xp / rounds.length} completeXp={xp}
      onComplete={onComplete} onGameOver={onGameOver} onBack={onBack}
    >
      {(q, h) => <TypedQuestion item={q} bank={bank} kind={kind} h={h} />}
    </Runner>
  )
}

export function DictationView({ items, limit, ...p }: LessonProps & { items: TypedItem[]; limit?: number }) {
  return <TypedLesson lessonId="ws-dictation" kind="dictation" items={items} limit={limit} {...p} />
}

export function ImageWordsView({ items, limit, ...p }: LessonProps & { items: TypedItem[]; limit?: number }) {
  return <TypedLesson lessonId="ws-image-words" kind="picture" items={items} limit={limit} {...p} />
}

export function CompleteSentencesView({ items, bank, ...p }: LessonProps & { items: TypedItem[]; bank: string[] }) {
  return <TypedLesson lessonId="ws-complete-sentences" kind="sentence" items={items} bank={bank} {...p} />
}

// ============ FREE-TEXT SHELL (Wh questions / long answers) ============
// No hearts are lost here: the app cannot grade open writing, so it checks the basics
// (right words, enough words, question mark) and coaches with a hint instead.
function FreeTextLesson({ title, total, round, prompt, extra, value, setValue, hint, done, onSubmit, onBack, rows = 3 }: {
  title: string; total: number; round: number; prompt: React.ReactNode; extra?: React.ReactNode
  value: string; setValue: (v: string) => void; hint: string | null; done: boolean
  onSubmit: () => void; onBack: () => void; rows?: number
}) {
  const { t } = useI18n()
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
          aria-label={tx.typeAnswer}
          className={'w-full max-w-sm text-lg font-semibold rounded-2xl border-4 px-4 py-3 outline-none transition-all resize-none ' + (done ? 'border-duo-green bg-green-50 text-duo-green' : 'border-gray-200 bg-surface text-gray-800 focus:border-duo-blue')}
        />
        {hint && !done && <p className="text-sm font-bold text-duo-orange text-center max-w-sm">💡 {hint}</p>}
        <FeedbackSheet feedback={done ? 'correct' : null} message={tx.greatWriting} />
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
  useSpeechCleanup()
  const [round, setRound] = useState(0)
  const [value, setValue] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const item = words[round]

  // The keyword is read (and spelled) when it appears; the student then writes the question.
  useDelayed(() => playWord(item.word, 'spell'), 500, done, item.word)

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
  }, [value, item, round, words.length, xp, onComplete, later, tx])

  return (
    <FreeTextLesson
      title={lessonTitle('ws-wh-questions', lang)} total={words.length} round={round} value={value} setValue={setValue}
      hint={hint} done={done} onSubmit={submit} onBack={onBack}
      prompt={
        <div className="flex flex-col items-center gap-2">
          {item.image && <img src={item.image} alt="" className="max-h-32 max-w-[12rem] object-contain rounded-2xl bg-surface p-2 shadow-sm" />}
          <p className="text-gray-500 font-semibold text-center">{tx.writeQuestionWith}</p>
          <p className="text-4xl font-black text-duo-purple capitalize">{item.word}</p>
          <SpellStrip word={item.word} />
          <Button variant="ghost" size="sm" className="text-duo-blue" onClick={() => playWord(item.word, 'spell')}>{tx.hearAgain}</Button>
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
  useSpeechCleanup()
  const [round, setRound] = useState(0)
  const [value, setValue] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const item = questions[round]

  useAutoText(item.question, 400, done)

  const submit = useCallback(() => {
    const problem = countWords(value) < 3 ? tx.longAnswerHint(item.starter) : null
    setHint(problem)
    if (problem) return
    setDone(true)
    later(() => {
      if (round + 1 >= questions.length) onComplete(xp)
      else { setRound((r) => r + 1); setValue(''); setHint(null); setDone(false) }
    }, 1400)
  }, [value, item, round, questions.length, xp, onComplete, later, tx])

  return (
    <FreeTextLesson
      title={lessonTitle('ws-long-answers', lang)} total={questions.length} round={round} value={value} setValue={setValue}
      hint={hint} done={done} onSubmit={submit} onBack={onBack}
      prompt={
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl font-black text-gray-800 text-center max-w-xs">{item.question}</p>
          <Button variant="ghost" size="sm" className="text-duo-blue" onClick={() => speakText(item.question)}>{tx.hearAgain}</Button>
        </div>
      }
      extra={<p className="text-sm text-gray-400 font-semibold text-center max-w-sm">{tx.startLike} {item.starter}</p>}
    />
  )
}

// ============ GROUP & CIRCLE ============
type SortQuestion =
  | { kind: 'sort'; word: string; group: string }
  | { kind: 'circle'; prompt: string; options: string[]; answer: string }

function SortQuestionView({ q, groups, h }: { q: SortQuestion; groups: [string, string]; h: Handlers }) {
  const { t } = useI18n()
  const tx = t.study
  const later = useLater()
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shake, setShake] = useState(false)
  const [dead, setDead] = useState(false)
  const options = useMemo(() => (q.kind === 'circle' ? shuffle(q.options) : [...groups]), [q, groups])
  const right = q.kind === 'circle' ? q.answer : q.group

  // The word to sort is heard and spelled; for a circle question the prompt is read aloud.
  useDelayed(() => {
    if (q.kind === 'sort') playWord(q.word, 'spell')
    else speakText(q.prompt)
  }, 450, feedback !== null, q)

  const pick = (choice: string) => {
    if (feedback || dead) return
    setSelected(choice)
    if (choice === right) {
      setFeedback('correct')
      h.correct()
      if (q.kind === 'circle') playWord(q.answer, 'spell', () => later(h.next, 400))
      else playWord(q.word, 'word', () => later(h.next, 400))
      later(h.next, CELEBRATION_MAX_MS)
      return
    }
    setFeedback('wrong')
    setShake(true)
    later(() => setShake(false), 500)
    if (h.miss() <= 0) { setDead(true); return }
    later(() => { setFeedback(null); setSelected(null) }, 1000)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3">
        {q.kind === 'circle' ? (
          <>
            <p className="text-xl font-black text-gray-800 text-center max-w-xs">{q.prompt}</p>
            <Button variant="ghost" size="sm" className="text-duo-blue" onClick={() => speakText(q.prompt)}>{tx.hearAgain}</Button>
          </>
        ) : (
          <>
            <p className="text-gray-500 font-semibold">{tx.putInGroup}</p>
            <p className="text-5xl font-black text-gray-800">{q.word}</p>
            <SpellStrip word={q.word} />
            <button onClick={() => playWord(q.word, 'spell')} className="text-duo-blue font-bold text-sm cursor-pointer">{tx.hearIt}</button>
          </>
        )}
      </div>
      <div className={`flex gap-4 flex-wrap justify-center ${shake ? 'animate-shake' : ''}`}>
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
      <FeedbackSheet feedback={feedback} />
    </div>
  )
}

export function SortCircleView({ content, xp, onComplete, onGameOver, onBack }: LessonProps & { content: WorkshopContent['sort'] }) {
  const questions = useMemo<SortQuestion[]>(() => [
    ...shuffle(content.items).map((i): SortQuestion => ({ kind: 'sort', word: i.word, group: i.group })),
    ...content.circles.map((c): SortQuestion => ({ kind: 'circle', prompt: c.prompt, options: [...c.options], answer: c.answer })),
  ], [content])
  return (
    <Runner
      lessonId="ws-sort-circle" questions={questions}
      xpPerCorrect={xp / questions.length} completeXp={xp}
      onComplete={onComplete} onGameOver={onGameOver} onBack={onBack}
    >
      {(q, h) => <SortQuestionView q={q} groups={content.groups} h={h} />}
    </Runner>
  )
}
