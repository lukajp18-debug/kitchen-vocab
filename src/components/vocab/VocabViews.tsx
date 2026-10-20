'use client'

// The six standard vocabulary lessons (flashcards, picture match, listen and pick, spell
// the word, fill the blank, final test). Moved out of page.tsx and rebuilt on one runner:
//   - Hearts, XP, rounds and "go to the next question" live in <Runner>, so the last round
//     can never leave a blank screen and a late timer can never finish a lesson that was
//     already closed.
//   - Each round is its own component, mounted fresh for every question (key = round).
//   - Rounds come from a deck: no word repeats within a lesson and the Final Test never
//     asks about the same word twice.
//   - Whenever the student hears a word, it is also spelled out letter by letter, with the
//     letters lighting up in sync (SpellStrip). Where seeing/hearing the spelling first
//     would give the answer away (Spell the Word, Fill the Blank), the word is spelled
//     right after the answer instead.
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'
import { lessonTitle } from '@/lib/lessonText'
import { FeedbackSheet } from '@/components/kid/FeedbackSheet'
import { SpellStrip } from '@/components/kid/SpellStrip'
import { LAHeader, shuffle } from '@/components/language/LanguageViews'
import {
  Feedback, Mode, Handlers, Runner, SkipButton, HelpPanels, HelpSpellButton,
  buildDeck, sample, scramble, useAutoPlay, useMissHelp, useSpeechCleanup, CELEBRATION_MAX_MS,
} from '@/components/kid/lessonKit'
import { playWord, stopSpeech, useSpeechView } from '@/lib/speech'
import { useLater } from '@/lib/useLater'
import type { WordDef } from '@/types/vocab'

interface LessonProps {
  words: WordDef[]
  onComplete: (xp: number) => void
  onGameOver: (xp: number) => void
  onBack: () => void
}

const ROUNDS = 8
const TEST_ROUNDS = 12
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

// ============ HELPERS ============
const sameWord = (a: WordDef, b: WordDef) => a.word === b.word
const deckOf = (words: WordDef[], n: number) => buildDeck(words, n, sameWord)

function pictureOptions(target: WordDef, words: WordDef[]): WordDef[] {
  return shuffle([target, ...sample(words.filter((w) => w.word !== target.word), 3)])
}

function wordOptions(target: WordDef, words: WordDef[]): string[] {
  return shuffle([target.word, ...sample(words.filter((w) => w.word !== target.word).map((w) => w.word), 3)])
}

function missingRound(word: string) {
  const idx = word.length > 1 ? 1 + Math.floor(Math.random() * (word.length - 1)) : 0
  const letter = word[idx]
  const display = word.slice(0, idx) + '_' + word.slice(idx + 1)
  const wrong = sample(ALPHABET.split('').filter((l) => l !== letter && !word.includes(l)), 3)
  return { display, letter, options: shuffle([letter, ...wrong]) }
}

// ============ 1. FLASHCARDS ============
export function FlashcardView({ words, onComplete, onBack }: Pick<LessonProps, 'words' | 'onComplete' | 'onBack'>) {
  const { t, lang } = useI18n()
  const tx = t.study
  const later = useLater()
  useSpeechCleanup()
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState('')
  const total = words.length
  const current = words[index]

  useAutoPlay(current.word, 'full', 300)

  const hear = useCallback(() => {
    playWord(current.word, 'full')
    setAnim('animate-pulse-grow')
    later(() => setAnim(''), 500)
  }, [current.word, later])

  const move = (to: number) => {
    setAnim('animate-slide-in-right')
    later(() => setAnim(''), 400)
    setIndex(to)
  }

  const next = () => {
    if (index < total - 1) move(index + 1)
    else { stopSpeech(); onComplete(10) }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-4 pt-4">
        <LAHeader title={lessonTitle('flashcards', lang)} hearts={3} current={index + 1} total={total} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${anim}`}>
          <Card className="border-0 shadow-lg cursor-pointer clickable-image overflow-hidden mb-4" onClick={hear} role="button" tabIndex={0} aria-label={tx.hearQuoted(current.word)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') hear() }}>
            <CardContent className="p-6 flex flex-col items-center">
              <img src={current.image} alt={current.word} className="w-48 h-48 object-contain mb-4" />
              <SpellStrip word={current.word} size="lg" className="animate-slide-up" />
              <p className="text-sm text-gray-400 mt-3">{tx.tapPicture}</p>
            </CardContent>
          </Card>
          <Button onClick={hear} className="w-full duo-button bg-duo-blue hover:bg-duo-blue/90 text-white font-bold text-lg py-6 rounded-2xl mb-4">
            {tx.hearQuoted(current.word)}
          </Button>
          <div className="flex gap-3">
            <Button onClick={() => index > 0 && move(index - 1)} disabled={index === 0} variant="outline" className="flex-1 rounded-2xl py-5 font-bold text-base">{tx.back}</Button>
            <Button onClick={next} className="flex-1 duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-base py-5 rounded-2xl">
              {index === total - 1 ? tx.finish : tx.next}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 2. PICTURE MATCH ============
function PictureQuestion({ target, options, mode, h }: { target: WordDef; options: WordDef[]; mode: Mode; h: Handlers }) {
  const { t } = useI18n()
  const tx = t.study
  const later = useLater()
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shake, setShake] = useState(false)
  const [dead, setDead] = useState(false)
  useAutoPlay(target.word, 'spell', 400, feedback !== null)

  const pick = (word: string) => {
    if (feedback || dead) return
    setSelected(word)
    if (word === target.word) {
      setFeedback('correct')
      h.correct()
      playWord(target.word, 'word')
      later(h.next, 1200)
      return
    }
    setFeedback('wrong')
    setShake(true)
    later(() => setShake(false), 500)
    if (h.miss() <= 0) { setDead(true); return }
    if (mode === 'test') { playWord(target.word, 'word'); later(h.next, 1800) }
    else later(() => { setSelected(null); setFeedback(null) }, 1000)
  }

  return (
    <>
      <div className="mb-5 text-center">
        <h2 className="text-lg font-bold text-gray-600 mb-2">{tx.find}</h2>
        <SpellStrip word={target.word} size="lg" />
        <Button variant="ghost" size="sm" className="mt-2 text-duo-blue" onClick={() => playWord(target.word, 'spell')}>{tx.hearAgain}</Button>
      </div>
      <div className={`grid grid-cols-2 gap-3 w-full ${shake ? 'animate-shake' : ''}`}>
        {options.map((option) => {
          const isCorrect = option.word === target.word
          const isSelected = option.word === selected
          let cls = 'border-0 shadow-md cursor-pointer transition-all duration-200'
          if (feedback === 'correct' && isCorrect) cls += ' ring-4 ring-duo-green bg-green-50 animate-pulse-grow'
          else if (feedback === 'wrong' && isSelected) cls += ' ring-4 ring-duo-red bg-red-50 animate-shake'
          else if (feedback === 'wrong' && mode === 'test' && isCorrect) cls += ' ring-4 ring-duo-green bg-green-50'
          return (
            <Card key={option.word} className={cls} onClick={() => pick(option.word)} role="button" tabIndex={0} aria-label={option.word} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick(option.word) }}>
              <CardContent className="p-3 flex flex-col items-center">
                <img src={option.image} alt="" className="w-28 h-28 object-contain" />
                {feedback && (isSelected || (isCorrect && (feedback === 'correct' || mode === 'test'))) && (
                  <span className="text-sm font-bold mt-1">{isCorrect ? '✅' : '❌'}</span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <FeedbackSheet feedback={feedback} message={feedback === 'wrong' ? (mode === 'test' ? tx.answerWas(target.word) : tx.tryAgain) : undefined} />
    </>
  )
}

export function PictureMatchView({ words, onComplete, onGameOver, onBack }: LessonProps) {
  const rounds = useMemo(() => deckOf(words, ROUNDS).map((target) => ({ target, options: pictureOptions(target, words) })), [words])
  return (
    <Runner lessonId="picture-match" questions={rounds} onComplete={onComplete} onGameOver={onGameOver} onBack={onBack}>
      {(q, h) => <PictureQuestion target={q.target} options={q.options} mode="practice" h={h} />}
    </Runner>
  )
}

// ============ 3. LISTEN AND PICK ============
function ListenQuestion({ target, options, mode, h }: { target: WordDef; options: string[]; mode: Mode; h: Handlers }) {
  const { t } = useI18n()
  const tx = t.study
  const later = useLater()
  const speech = useSpeechView()
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shake, setShake] = useState(false)
  const [dead, setDead] = useState(false)
  const { misses, addMiss } = useMissHelp(target.word, mode === 'practice', feedback === 'correct')
  useAutoPlay(target.word, 'full', 500, feedback !== null)

  const pick = (word: string) => {
    if (feedback || dead) return
    setSelected(word)
    if (word === target.word) {
      setFeedback('correct')
      h.correct()
      playWord(target.word, 'word')
      later(h.next, 1500)
      return
    }
    setFeedback('wrong')
    setShake(true)
    later(() => setShake(false), 500)
    addMiss()
    if (h.miss() <= 0) { setDead(true); return }
    if (mode === 'test') { playWord(target.word, 'word'); later(h.next, 1800) }
    else later(() => { setSelected(null); setFeedback(null) }, 1000)
  }

  const speaking = speech.phase !== 'idle'
  const revealed = !!feedback || misses >= 3
  return (
    <>
      <div className="mb-5 text-center">
        <button
          onClick={() => playWord(target.word, 'full')}
          className={`w-24 h-24 rounded-full bg-duo-purple text-white flex items-center justify-center text-4xl shadow-lg transition-all mx-auto ${speaking ? 'animate-pulse-grow' : 'clickable-image'}`}
          aria-label={tx.tapToHear}
        >🔊</button>
        <p className="text-sm text-gray-500 mt-2 mb-3">{speaking ? tx.spelling : tx.tapToHear}</p>
        <SpellStrip word={target.word} reveal={revealed} />
      </div>
      <HelpPanels word={target.word} misses={misses} learningText={tx.learningSpelling} />
      <div className={`w-full space-y-3 ${shake ? 'animate-shake' : ''}`}>
        {options.map((option) => {
          const isCorrect = option === target.word
          const isSelected = option === selected
          let cls = 'w-full duo-button text-lg font-bold py-5 rounded-2xl transition-all'
          if (feedback === 'correct' && isCorrect) cls += ' bg-duo-green text-white animate-pulse-grow'
          else if (feedback === 'wrong' && isSelected) cls += ' bg-duo-red text-white animate-shake'
          else if (feedback === 'wrong' && mode === 'test' && isCorrect) cls += ' bg-duo-green text-white'
          else if (feedback && (feedback === 'correct' || mode === 'test') && !isCorrect) cls += ' bg-gray-100 text-gray-400'
          else if (misses >= 3 && isCorrect && !feedback) cls += ' bg-duo-green/20 text-duo-green border-2 border-duo-green animate-pulse'
          else cls += ' bg-surface text-gray-800 border-2 border-gray-200 hover:border-duo-purple'
          return <button key={option} className={cls} onClick={() => pick(option)}>{option.toUpperCase()}</button>
        })}
      </div>
      <FeedbackSheet feedback={feedback} message={feedback === 'wrong' ? (mode === 'test' ? tx.answerWas(target.word) : tx.notQuite) : undefined} />
    </>
  )
}

export function ListenChooseView({ words, onComplete, onGameOver, onBack }: LessonProps) {
  const rounds = useMemo(() => deckOf(words, ROUNDS).map((target) => ({ target, options: wordOptions(target, words) })), [words])
  return (
    <Runner lessonId="listen-choose" questions={rounds} onComplete={onComplete} onGameOver={onGameOver} onBack={onBack}>
      {(q, h) => <ListenQuestion target={q.target} options={q.options} mode="practice" h={h} />}
    </Runner>
  )
}

// ============ 4. SPELL THE WORD ============
function SpellQuestion({ target, tiles, mode, h }: { target: WordDef; tiles: string[]; mode: Mode; h: Handlers }) {
  const { t } = useI18n()
  const tx = t.study
  const later = useLater()
  const word = target.word
  // Each slot holds the index of the tile placed there, so duplicate letters never get mixed up.
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(word.length).fill(null))
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shake, setShake] = useState(false)
  const [dead, setDead] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const { misses, addMiss } = useMissHelp(word, mode === 'practice', feedback === 'correct', h.helped)
  useAutoPlay(word, 'word', 300, feedback !== null)

  const used = new Set(slots.filter((s): s is number => s !== null))

  const celebrate = () => {
    h.correct()
    if (mode === 'practice') {
      playWord(word, 'spell', () => later(h.next, 500))
      later(h.next, CELEBRATION_MAX_MS)
    } else { playWord(word, 'word'); later(h.next, 1200) }
  }

  const tap = (tileIndex: number) => {
    if (feedback || dead || used.has(tileIndex)) return
    const empty = slots.indexOf(null)
    if (empty === -1) return
    const next = [...slots]
    next[empty] = tileIndex
    setSlots(next)
    if (next.includes(null)) return
    const attempt = next.map((i) => tiles[i!]).join('')
    if (attempt === word) {
      setFeedback('correct')
      celebrate()
      return
    }
    setFeedback('wrong')
    setShake(true)
    later(() => setShake(false), 500)
    addMiss()
    if (h.miss() <= 0) { setDead(true); return }
    if (mode === 'test') {
      setShowAnswer(true)
      playWord(word, 'word')
      later(h.next, 1800)
    } else {
      later(() => {
        setSlots(Array(word.length).fill(null))
        setFeedback(null)
        if (misses + 1 < 2) playWord(word, 'word')
      }, 1200)
    }
  }

  const remove = (slot: number) => {
    if (feedback || slots[slot] === null) return
    setSlots((s) => s.map((v, i) => (i === slot ? null : v)))
  }

  return (
    <>
      <div className="text-center mb-4">
        <Card className="border-0 shadow-md inline-block">
          <CardContent className="p-4 flex flex-col items-center">
            <img src={target.image} alt="" className="w-32 h-32 object-contain" />
          </CardContent>
        </Card>
      </div>
      <Button onClick={() => playWord(word, 'word')} className="w-full duo-button bg-duo-blue hover:bg-duo-blue/90 text-white font-bold text-base py-4 rounded-2xl mb-3">
        {tx.hearWord}
      </Button>
      <div className="mb-3 flex justify-center">
        <HelpSpellButton word={word} h={h} disabled={feedback !== null} />
      </div>
      <HelpPanels word={word} misses={misses} learningText={tx.learningSpellAlong} />

      <div className={`flex justify-center mb-6 ${word.length > 8 ? 'gap-1' : 'gap-2 flex-wrap'} ${shake ? 'animate-shake' : ''}`}>
        {feedback === 'correct' || showAnswer ? (
          <SpellStrip word={word} size="lg" />
        ) : (
          slots.map((tileIndex, i) => (
            <button
              key={i}
              onClick={() => remove(i)}
              className={`spelling-slot ${tileIndex !== null ? 'filled' : ''} ${feedback === 'wrong' && tileIndex !== null ? 'wrong' : ''}`}
              style={word.length > 8 ? { minWidth: word.length > 10 ? 24 : 30, fontSize: '1.2rem' } : undefined}
              disabled={feedback !== null}
              aria-label={tileIndex !== null ? tiles[tileIndex] : '_'}
            >
              {tileIndex !== null ? tiles[tileIndex].toUpperCase() : ''}
            </button>
          ))
        )}
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {tiles.map((letter, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            disabled={used.has(i) || feedback !== null}
            className={`w-12 h-12 rounded-xl font-bold text-xl flex items-center justify-center letter-tile ${
              used.has(i) ? 'bg-gray-200 text-gray-400 opacity-30 pointer-events-none' : 'bg-surface text-gray-800 border-2 border-gray-300 shadow-md hover:border-duo-teal hover:shadow-lg'
            }`}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      {feedback === 'correct' && mode === 'practice' && <SkipButton onClick={h.next} />}
      <FeedbackSheet feedback={feedback} message={feedback === 'wrong' ? (mode === 'test' ? tx.answerWas(word) : tx.itWas(word.toUpperCase())) : undefined} />
    </>
  )
}

export function SpellingChallengeView({ words, onComplete, onGameOver, onBack }: LessonProps) {
  const rounds = useMemo(() => deckOf(words, ROUNDS).map((target) => ({ target, tiles: scramble(target.word) })), [words])
  return (
    <Runner lessonId="spelling-challenge" questions={rounds} rebuild={(q) => ({ target: q.target, tiles: scramble(q.target.word) })} onComplete={onComplete} onGameOver={onGameOver} onBack={onBack}>
      {(q, h) => <SpellQuestion target={q.target} tiles={q.tiles} mode="practice" h={h} />}
    </Runner>
  )
}

// ============ 5. FILL THE BLANK ============
function MissingQuestion({ target, display, letter, options, mode, h }: {
  target: WordDef; display: string; letter: string; options: string[]; mode: Mode; h: Handlers
}) {
  const { t } = useI18n()
  const tx = t.study
  const later = useLater()
  const word = target.word
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shake, setShake] = useState(false)
  const [dead, setDead] = useState(false)
  const { misses, addMiss } = useMissHelp(word, mode === 'practice', feedback === 'correct', h.helped)
  useAutoPlay(word, 'word', 300, feedback !== null)

  const pick = (choice: string) => {
    if (feedback || dead) return
    setSelected(choice)
    if (choice === letter) {
      setFeedback('correct')
      h.correct()
      if (mode === 'practice') {
        playWord(word, 'spell', () => later(h.next, 500))
        later(h.next, CELEBRATION_MAX_MS)
      } else { playWord(word, 'word'); later(h.next, 1200) }
      return
    }
    setFeedback('wrong')
    setShake(true)
    later(() => setShake(false), 500)
    addMiss()
    if (h.miss() <= 0) { setDead(true); return }
    if (mode === 'test') { playWord(word, 'word'); later(h.next, 1800) }
    else later(() => { setSelected(null); setFeedback(null) }, 1000)
  }

  return (
    <>
      <div className="text-center mb-4">
        <Card className="border-0 shadow-md inline-block">
          <CardContent className="p-4 flex flex-col items-center">
            <img src={target.image} alt="" className="w-28 h-28 object-contain" />
          </CardContent>
        </Card>
      </div>

      <div className={`flex justify-center mb-3 flex-wrap ${shake ? 'animate-shake' : ''}`}>
        {feedback === 'correct' ? (
          <SpellStrip word={word} size="lg" />
        ) : (
          display.split('').map((ch, i) => (
            <span
              key={i}
              className={`inline-block w-9 h-12 leading-[48px] text-center text-2xl font-bold border-b-4 mx-0.5 ${
                ch === '_' ? 'border-duo-pink bg-pink-50 rounded-lg' : 'border-gray-300'
              }`}
            >
              {ch === '_' ? (feedback === 'wrong' && mode === 'test' ? letter.toUpperCase() : '?') : ch.toUpperCase()}
            </span>
          ))
        )}
      </div>

      <HelpPanels word={word} misses={misses} learningText={tx.learningListen} />

      <div className="grid grid-cols-4 gap-3">
        {options.map((opt) => {
          const isCorrect = opt === letter
          const isSelected = opt === selected
          let cls = 'w-full aspect-square rounded-2xl text-2xl font-bold flex items-center justify-center transition-all'
          if (feedback === 'correct' && isCorrect) cls += ' bg-duo-green text-white animate-pulse-grow shadow-lg'
          else if (feedback === 'wrong' && isSelected) cls += ' bg-duo-red text-white animate-shake'
          else if (feedback === 'wrong' && mode === 'test' && isCorrect) cls += ' bg-duo-green text-white'
          else if (feedback && (feedback === 'correct' || mode === 'test') && !isCorrect) cls += ' bg-gray-100 text-gray-400'
          else if (misses >= 3 && isCorrect && !feedback) cls += ' bg-duo-green/20 text-duo-green border-2 border-duo-green animate-pulse'
          else cls += ' bg-surface text-gray-800 border-2 border-gray-200 shadow-md hover:border-duo-pink'
          return <button key={opt} className={cls} onClick={() => pick(opt)}>{opt.toUpperCase()}</button>
        })}
      </div>

      <Button variant="ghost" className="w-full mt-4 text-duo-blue font-bold" onClick={() => playWord(word, 'word')}>{tx.hearWord}</Button>
      <div className="mt-1 flex justify-center">
        <HelpSpellButton word={word} h={h} disabled={feedback !== null} />
      </div>
      {feedback === 'correct' && mode === 'practice' && <SkipButton onClick={h.next} />}
      <FeedbackSheet feedback={feedback} message={feedback === 'wrong' ? (mode === 'test' ? tx.answerWas(word) : tx.notQuite) : undefined} />
    </>
  )
}

export function WhatsMissingView({ words, onComplete, onGameOver, onBack }: LessonProps) {
  const rounds = useMemo(() => deckOf(words, ROUNDS).map((target) => ({ target, ...missingRound(target.word) })), [words])
  return (
    <Runner lessonId="whats-missing" questions={rounds} rebuild={(q) => ({ target: q.target, ...missingRound(q.target.word) })} onComplete={onComplete} onGameOver={onGameOver} onBack={onBack}>
      {(q, h) => <MissingQuestion target={q.target} display={q.display} letter={q.letter} options={q.options} mode="practice" h={h} />}
    </Runner>
  )
}

// ============ 6. FINAL TEST ============
type FinalQuestion =
  | { type: 'picture-match'; target: WordDef; options: WordDef[] }
  | { type: 'listen-choose'; target: WordDef; options: string[] }
  | { type: 'spelling'; target: WordDef; tiles: string[] }
  | { type: 'whats-missing'; target: WordDef; display: string; letter: string; options: string[] }

const FINAL_LABEL: Record<FinalQuestion['type'], { icon: string; lesson: string }> = {
  'picture-match': { icon: '🖼️', lesson: 'picture-match' },
  'listen-choose': { icon: '👂', lesson: 'listen-choose' },
  spelling: { icon: '✏️', lesson: 'spelling-challenge' },
  'whats-missing': { icon: '❓', lesson: 'whats-missing' },
}

// 12 questions about 12 different words: three of each kind, in random order.
function buildFinalTest(words: WordDef[]): FinalQuestion[] {
  const deck = deckOf(words, TEST_ROUNDS)
  const kinds: FinalQuestion['type'][] = shuffle(
    (['picture-match', 'listen-choose', 'spelling', 'whats-missing'] as const).flatMap((k) => [k, k, k])
  )
  return deck.map((target, i): FinalQuestion => {
    switch (kinds[i]) {
      case 'picture-match': return { type: 'picture-match', target, options: pictureOptions(target, words) }
      case 'listen-choose': return { type: 'listen-choose', target, options: wordOptions(target, words) }
      case 'spelling': return { type: 'spelling', target, tiles: scramble(target.word) }
      default: return { type: 'whats-missing', target, ...missingRound(target.word) }
    }
  })
}

// A question solved with the spelling help comes back (same word, new arrangement).
function rebuildFinal(q: FinalQuestion): FinalQuestion {
  switch (q.type) {
    case 'spelling': return { type: 'spelling', target: q.target, tiles: scramble(q.target.word) }
    case 'whats-missing': return { type: 'whats-missing', target: q.target, ...missingRound(q.target.word) }
    default: return q
  }
}

export function FinalTestView({ words, onComplete, onGameOver, onBack }: LessonProps) {
  const { lang } = useI18n()
  const questions = useMemo(() => buildFinalTest(words), [words])
  return (
    <Runner
      lessonId="final-test"
      questions={questions}
      onComplete={onComplete}
      onGameOver={onGameOver}
      onBack={onBack}
      label={(q) => `${FINAL_LABEL[q.type].icon} ${lessonTitle(FINAL_LABEL[q.type].lesson, lang)}`}
      rebuild={rebuildFinal}
    >
      {(q, h) => {
        switch (q.type) {
          case 'picture-match': return <PictureQuestion target={q.target} options={q.options} mode="test" h={h} />
          case 'listen-choose': return <ListenQuestion target={q.target} options={q.options} mode="test" h={h} />
          case 'spelling': return <SpellQuestion target={q.target} tiles={q.tiles} mode="test" h={h} />
          case 'whats-missing': return <MissingQuestion target={q.target} display={q.display} letter={q.letter} options={q.options} mode="test" h={h} />
        }
      }}
    </Runner>
  )
}
