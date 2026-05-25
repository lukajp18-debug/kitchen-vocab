'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// ============ TYPES ============
type ViewType =
  | 'dashboard'
  | 'flashcards'
  | 'picture-match'
  | 'listen-choose'
  | 'sentence-builder'
  | 'grammar-practice'
  | 'spelling-challenge'
  | 'final-test'
  | 'lesson-complete'
  | 'game-over'

type LessonViewType = Exclude<ViewType, 'dashboard' | 'lesson-complete' | 'game-over'>

interface ActionWord {
  word: string
  image: string
}

interface SentenceExercise {
  sentence: string
  options: [string, string]
  answer: string
}

interface ProgressData {
  xp: number
  streak: number
  completedLessons: string[]
  lastPlayedDate: string
}

interface LessonDef {
  id: LessonViewType
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
  xpReward: number
}

// ============ CONSTANTS ============
const ACTION_WORDS: ActionWord[] = [
  { word: 'run', image: '/images/actions/run.png' },
  { word: 'write', image: '/images/actions/write.png' },
  { word: 'sing', image: '/images/actions/sing.png' },
  { word: 'read', image: '/images/actions/read.png' },
  { word: 'eat', image: '/images/actions/eat.png' },
  { word: 'jump', image: '/images/actions/jump.png' },
  { word: 'exercise', image: '/images/actions/exercise.png' },
  { word: 'swim', image: '/images/actions/swim.png' },
  { word: 'play', image: '/images/actions/play.png' },
  { word: 'laugh', image: '/images/actions/laugh.png' },
  { word: 'sleep', image: '/images/actions/sleep.png' },
  { word: 'climb', image: '/images/actions/climb.png' },
]

const SENTENCE_EXERCISES_3: SentenceExercise[] = [
  { sentence: 'My mother ____ on Sundays.', options: ['work', 'works'], answer: 'works' },
  { sentence: 'We ____ the answers.', options: ['write', 'writes'], answer: 'write' },
  { sentence: 'It ____ grass.', options: ['eat', 'eats'], answer: 'eats' },
  { sentence: 'I ____ more ice cream.', options: ['want', 'wants'], answer: 'want' },
  { sentence: 'She never ____ chess.', options: ['play', 'plays'], answer: 'plays' },
  { sentence: 'They ____ to school.', options: ['walk', 'walks'], answer: 'walk' },
  { sentence: 'He ____ a bus.', options: ['drive', 'drives'], answer: 'drives' },
  { sentence: 'Monkeys ____ a lot of noise.', options: ['make', 'makes'], answer: 'make' },
  { sentence: 'This girl ____ Italian.', options: ['speak', 'speaks'], answer: 'speaks' },
]

const SENTENCE_EXERCISES_4: SentenceExercise[] = [
  { sentence: 'She ____ that toy.', options: ['want', 'wants'], answer: 'wants' },
  { sentence: 'Ben and his mom ____ home.', options: ['drive', 'drives'], answer: 'drive' },
  { sentence: 'The girls ____ at the park.', options: ['play', 'plays'], answer: 'play' },
  { sentence: 'My dog ____ his bone.', options: ['bury', 'buries'], answer: 'buries' },
  { sentence: 'Sal and I ____ a cake.', options: ['bake', 'bakes'], answer: 'bake' },
  { sentence: 'Dr. Bell ____ the cat.', options: ['feed', 'feeds'], answer: 'feeds' },
  { sentence: 'Her dad ____ the red van.', options: ['clean', 'cleans'], answer: 'cleans' },
  { sentence: 'Our friends ____ outside.', options: ['run', 'runs'], answer: 'run' },
  { sentence: 'Three birds ____ in the tree.', options: ['sit', 'sits'], answer: 'sits' },
  { sentence: 'Tom ____ a pretty picture.', options: ['paint', 'paints'], answer: 'paints' },
]

const LESSONS: LessonDef[] = [
  { id: 'flashcards', name: 'Learn Action Words', icon: '📚', color: '#58CC02', bgColor: '#E5F9D0', description: 'Learn 12 action words with pictures!', xpReward: 50 },
  { id: 'picture-match', name: 'Picture Match', icon: '🖼️', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Match words to pictures!', xpReward: 50 },
  { id: 'listen-choose', name: 'Listen & Choose', icon: '👂', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Listen and pick the right word!', xpReward: 50 },
  { id: 'sentence-builder', name: 'Sentence Builder', icon: '🏗️', color: '#FFC800', bgColor: '#FFF3CC', description: 'Complete sentences with verbs!', xpReward: 50 },
  { id: 'grammar-practice', name: 'Grammar Rules', icon: '📝', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Learn He/She/It verb rules!', xpReward: 50 },
  { id: 'spelling-challenge', name: 'Spelling Challenge', icon: '✏️', color: '#00CD9C', bgColor: '#CCF5EA', description: 'Spell the words you hear!', xpReward: 50 },
  { id: 'final-test', name: 'Final Test', icon: '🏆', color: '#FFB700', bgColor: '#FFF0CC', description: 'Show what you know!', xpReward: 100 },
]

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCB77', '#9B59B6', '#58CC02', '#CE82FF']
const ENCOURAGEMENTS = ['Amazing! 🌟', 'Great job! 🎉', 'You rock! 🎸', 'Fantastic! ✨', 'Super! 🦸', 'Wow! 🎊', 'Brilliant! 💡', 'Awesome! 🚀']

// ============ UTILITY FUNCTIONS ============
function speakWord(word: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.8
  utterance.pitch = 1.1
  window.speechSynthesis.speak(utterance)
}

function spellAndSpeak(word: string): ReturnType<typeof setTimeout> | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  window.speechSynthesis.cancel()
  const letters = word.split('')
  let delay = 0
  letters.forEach((letter) => {
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(letter.toUpperCase())
      u.lang = 'en-US'
      u.rate = 0.7
      u.pitch = 1.2
      window.speechSynthesis.speak(u)
    }, delay)
    delay += 800
  })
  return setTimeout(() => {
    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'
    u.rate = 0.8
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  }, delay + 500)
}

function speakSentence(sentence: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(sentence)
  u.lang = 'en-US'
  u.rate = 0.75
  u.pitch = 1.0
  window.speechSynthesis.speak(u)
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getRandomItems<T>(array: T[], count: number, exclude?: T[]): T[] {
  const filtered = exclude ? array.filter((item) => !exclude.includes(item)) : [...array]
  return shuffleArray(filtered).slice(0, count)
}

function loadProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return { xp: 0, streak: 0, completedLessons: [], lastPlayedDate: '' }
  }
  try {
    const stored = localStorage.getItem('wordwizard-progress')
    if (stored) return JSON.parse(stored) as ProgressData
  } catch { /* ignore */ }
  return { xp: 0, streak: 0, completedLessons: [], lastPlayedDate: '' }
}

function saveProgress(progress: ProgressData) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('wordwizard-progress', JSON.stringify(progress)) } catch { /* ignore */ }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function generateConfettiParticles() {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 1.5,
    size: Math.random() * 8 + 5,
    isCircle: Math.random() > 0.5,
  }))
}

function randomEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
}

// ============ CONFETTI COMPONENT ============
function ConfettiEffect() {
  const particles = useMemo(() => generateConfettiParticles(), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ============ MASCOT COMPONENT ============
function Mascot({ mood = 'happy', size = 48 }: { mood?: 'happy' | 'sad' | 'excited'; size?: number }) {
  const faces = { happy: '(ᵔᴗᵔ)', sad: '(ᵕ̩̩ㅅᵕ̩̩)', excited: '(★ᴗ★)' }
  return (
    <div className="select-none animate-float" style={{ fontSize: `${size}px`, lineHeight: 1 }}>
      {faces[mood]}
    </div>
  )
}

// ============ HEARTS DISPLAY ============
function HeartsDisplay({ hearts, max = 3 }: { hearts: number; max?: number }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`text-xl transition-all duration-300 ${i < hearts ? 'opacity-100 scale-100' : 'opacity-30 scale-75'}`}>
          ❤️
        </span>
      ))}
    </div>
  )
}

// ============ LESSON HEADER ============
function LessonHeader({ title, hearts, current, total, onBack }: {
  title: string; hearts: number; current: number; total: number; onBack: () => void
}) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm pb-3">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-10 w-10 rounded-full">✕</Button>
        <div className="flex-1 duo-progress">
          <Progress value={progressPercent} className="h-4 rounded-full" />
        </div>
        <HeartsDisplay hearts={hearts} />
      </div>
      <h2 className="text-center font-bold text-gray-700 text-sm">{title}</h2>
    </div>
  )
}

// ============ DASHBOARD ============
function Dashboard({ progress, onSelectLesson }: { progress: ProgressData; onSelectLesson: (id: LessonViewType) => void }) {
  const isUnlocked = (index: number): boolean => {
    if (index === 0) return true
    return progress.completedLessons.includes(LESSONS[index - 1].id)
  }

  const isCompleted = (id: string): boolean => progress.completedLessons.includes(id)

  const totalLessons = LESSONS.length
  const completedCount = progress.completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length
  const overallProgress = (completedCount / totalLessons) * 100

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦉</span>
            <span className="font-bold text-lg text-gray-800">Word Wizard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-orange-600">{progress.streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-yellow-600">{progress.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Welcome */}
          <div className="text-center mb-6">
            <Mascot mood={overallProgress === 100 ? 'excited' : 'happy'} size={56} />
            <h1 className="text-2xl font-bold text-gray-800 mt-2">
              {overallProgress === 100 ? 'You did it! All done! 🎉' : "Let's learn Action Words!"}
            </h1>
            <p className="text-gray-500 mt-1">Action Words & Simple Present Tense</p>
          </div>

          {/* Overall Progress */}
          <Card className="mb-6 border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Overall Progress</span>
                <span className="text-sm font-bold text-duo-green">{completedCount}/{totalLessons} lessons</span>
              </div>
              <div className="duo-progress">
                <Progress value={overallProgress} className="h-3 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Lesson Path */}
          <div className="flex flex-col items-center">
            {LESSONS.map((lesson, index) => {
              const unlocked = isUnlocked(index)
              const completed = isCompleted(lesson.id)

              return (
                <div key={lesson.id} className="flex flex-col items-center w-full">
                  {index > 0 && (
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: isCompleted(LESSONS[index - 1].id) ? lesson.color : '#E0E0E0' }} />
                  )}
                  <button
                    onClick={() => unlocked && onSelectLesson(lesson.id)}
                    disabled={!unlocked}
                    className={`w-full max-w-xs mb-2 transition-all duration-200 ${unlocked ? 'lesson-card-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <Card
                      className={`border-0 shadow-md overflow-hidden ${completed ? 'ring-2' : ''}`}
                      style={{ backgroundColor: unlocked ? lesson.bgColor : '#F5F5F5', ...(completed ? { ringColor: lesson.color } : {}) }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: unlocked ? lesson.color : '#D0D0D0' }}>
                            {unlocked ? lesson.icon : '🔒'}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-bold text-sm" style={{ color: unlocked ? '#333' : '#999' }}>{lesson.name}</h3>
                            <p className="text-xs mt-0.5" style={{ color: unlocked ? '#666' : '#BBB' }}>{lesson.description}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            {completed && <span className="text-xl animate-pop-in">✅</span>}
                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: unlocked ? `${lesson.color}20` : '#E8E8E8', color: unlocked ? lesson.color : '#BBB' }}>
                              +{lesson.xpReward}XP
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Grammar Rules Card */}
          <Card className="mt-6 border-0 shadow-md bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-purple-700 mb-2">📖 Grammar Rules</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-duo-green font-bold shrink-0">I, You, We, They</span>
                  <span className="text-gray-600">→ base verb (no -s)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-duo-purple font-bold shrink-0">He, She, It</span>
                  <span className="text-gray-600">→ verb + s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============ LESSON COMPLETE VIEW ============
function LessonCompleteView({ xpEarned, lessonName, onContinue }: { xpEarned: number; lessonName: string; onContinue: () => void }) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-duo-green/10 to-duo-blue/10 flex flex-col items-center justify-center p-6">
      {showConfetti && <ConfettiEffect />}
      <div className="text-center animate-bounce-custom"><Mascot mood="excited" size={64} /></div>
      <h1 className="text-3xl font-bold text-gray-800 mt-4 animate-slide-up">Lesson Complete! 🎉</h1>
      <p className="text-lg text-gray-600 mt-2 animate-slide-up">{lessonName}</p>
      <div className="mt-6 animate-star-burst">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="text-5xl font-bold text-duo-green">+{xpEarned}</div>
          <div className="text-xl text-gray-600 mt-1">XP Earned ⭐</div>
        </div>
      </div>
      <Button onClick={onContinue} className="mt-8 duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg px-12 py-6 rounded-2xl" size="lg">
        Continue 🚀
      </Button>
    </div>
  )
}

// ============ GAME OVER VIEW ============
function GameOverView({ xpEarned, lessonName, onRetry, onBack }: { xpEarned: number; lessonName: string; onRetry: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex flex-col items-center justify-center p-6">
      <div className="text-center"><Mascot mood="sad" size={64} /></div>
      <h1 className="text-2xl font-bold text-gray-800 mt-4">Oh no! 😢</h1>
      <p className="text-lg text-gray-600 mt-2">You ran out of hearts in</p>
      <p className="text-lg font-bold text-gray-700">{lessonName}</p>
      <div className="mt-4 bg-white rounded-2xl shadow-md p-6 text-center">
        <div className="text-3xl font-bold text-duo-orange">+{xpEarned}</div>
        <div className="text-gray-600">XP Earned ⭐</div>
      </div>
      <div className="flex gap-4 mt-6">
        <Button onClick={onBack} variant="outline" className="rounded-2xl px-6 py-5 font-bold">Go Back</Button>
        <Button onClick={onRetry} className="duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold rounded-2xl px-6 py-5">Try Again! 💪</Button>
      </div>
    </div>
  )
}

// ============ FLASHCARD VIEW ============
function FlashcardView({ onComplete, onBack }: { onComplete: (xp: number) => void; onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animClass, setAnimClass] = useState('')
  const total = ACTION_WORDS.length
  const currentWord = ACTION_WORDS[currentIndex]

  const handleSpeak = useCallback(() => {
    speakWord(currentWord.word)
    setAnimClass('animate-pulse-grow')
    setTimeout(() => setAnimClass(''), 500)
  }, [currentWord.word])

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setAnimClass('animate-slide-in-right')
      setTimeout(() => setAnimClass(''), 400)
      setCurrentIndex((prev) => prev + 1)
    } else {
      onComplete(50)
    }
  }, [currentIndex, total, onComplete])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1)
  }, [currentIndex])

  useEffect(() => {
    const timer = setTimeout(() => speakWord(currentWord.word), 300)
    return () => clearTimeout(timer)
  }, [currentIndex, currentWord.word])

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Learn Action Words" hearts={3} current={currentIndex + 1} total={total} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <Card className="border-0 shadow-lg cursor-pointer clickable-image overflow-hidden mb-4" onClick={handleSpeak}>
            <CardContent className="p-6 flex flex-col items-center">
              <img src={currentWord.image} alt={currentWord.word} className="w-48 h-48 object-contain mb-4" />
              <div className="text-3xl font-bold text-gray-800 animate-slide-up">{currentWord.word.toUpperCase()}</div>
              <p className="text-sm text-gray-400 mt-2">Tap the picture to hear it! 🔊</p>
            </CardContent>
          </Card>
          <Button onClick={handleSpeak} className="w-full duo-button bg-duo-blue hover:bg-duo-blue/90 text-white font-bold text-lg py-6 rounded-2xl mb-4">
            🔊 Hear &quot;{currentWord.word}&quot;
          </Button>
          <div className="flex gap-3">
            <Button onClick={handlePrev} disabled={currentIndex === 0} variant="outline" className="flex-1 rounded-2xl py-5 font-bold text-base">← Back</Button>
            <Button onClick={handleNext} className="flex-1 duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-base py-5 rounded-2xl">
              {currentIndex === total - 1 ? 'Finish! 🎉' : 'Next →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ PICTURE MATCH VIEW ============
function createPictureMatchRound(): { targetWord: ActionWord; options: ActionWord[] } {
  const shuffled = shuffleArray(ACTION_WORDS)
  const target = shuffled[0]
  const distractors = getRandomItems(ACTION_WORDS, 3, [target])
  const options = shuffleArray([target, ...distractors])
  return { targetWord: target, options }
}

function PictureMatchView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [roundData, setRoundData] = useState(() => createPictureMatchRound())
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    setRoundData(createPictureMatchRound())
    setSelected(null)
    setFeedback(null)
    setAnimClass('animate-slide-up')
    setTimeout(() => setAnimClass(''), 400)
  }, [])

  const handleSelect = useCallback((word: string) => {
    if (feedback || !roundData) return
    setSelected(word)

    if (word === roundData.targetWord.word) {
      setFeedback('correct')
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      speakWord(word)
      setTimeout(() => {
        if (round + 1 >= totalRounds) onComplete(newXp)
        else {
          setRound((prev) => prev + 1)
          advanceRound()
        }
      }, 1200)
    } else {
      setFeedback('wrong')
      setAnimClass('animate-shake')
      setTimeout(() => setAnimClass(''), 500)
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1000)
      }
    }
  }, [feedback, roundData, hearts, xpEarned, round, totalRounds, onComplete, onGameOver, advanceRound])

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Picture Match" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 animate-slide-up">
            Find: <span className="text-duo-blue">{roundData.targetWord.word.toUpperCase()}</span>
          </h2>
          <Button variant="ghost" size="sm" className="mt-1 text-duo-blue" onClick={() => speakWord(roundData.targetWord.word)}>🔊 Hear again</Button>
        </div>
        <div className={`grid grid-cols-2 gap-3 w-full max-w-sm ${animClass}`}>
          {roundData.options.map((option) => {
            const isCorrect = option.word === roundData.targetWord.word
            const isSelected = option.word === selected
            let cardClass = 'border-0 shadow-md cursor-pointer transition-all duration-200'
            if (feedback === 'correct' && isCorrect) cardClass += ' ring-4 ring-duo-green bg-green-50 animate-pulse-grow'
            else if (feedback === 'wrong' && isSelected && !isCorrect) cardClass += ' ring-4 ring-duo-red bg-red-50 animate-shake'
            return (
              <Card key={option.word} className={cardClass} onClick={() => handleSelect(option.word)}>
                <CardContent className="p-3 flex flex-col items-center">
                  <img src={option.image} alt={option.word} className="w-28 h-28 object-contain" />
                  {feedback && (isCorrect || isSelected) && (
                    <span className="text-sm font-bold mt-1">{isCorrect ? '✅' : '❌'}</span>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
        {feedback && (
          <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
            {feedback === 'correct' ? randomEncouragement() : 'Try again! 💪'}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ LISTEN & CHOOSE VIEW ============
function createListenRound(): { targetWord: ActionWord; options: string[] } {
  const shuffled = shuffleArray(ACTION_WORDS)
  const target = shuffled[0]
  const distractors = getRandomItems(ACTION_WORDS.map((w) => w.word), 3, [target.word])
  const options = shuffleArray([target.word, ...distractors])
  return { targetWord: target, options }
}

function ListenChooseView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [roundData, setRoundData] = useState(() => createListenRound())
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const [isSpelling, setIsSpelling] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    setRoundData(createListenRound())
    setSelected(null)
    setFeedback(null)
    setIsSpelling(false)
    setAnimClass('animate-slide-up')
    setTimeout(() => setAnimClass(''), 400)
  }, [])

  const playSpelling = useCallback(() => {
    if (!roundData || isSpelling) return
    setIsSpelling(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = spellAndSpeak(roundData.targetWord.word)
  }, [roundData, isSpelling])

  // Auto-spell when round data changes (new round)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpelling(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = spellAndSpeak(roundData.targetWord.word)
    }, 500)
    return () => clearTimeout(timer)
  }, [roundData.targetWord.word])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const handleSelect = useCallback((word: string) => {
    if (feedback || !roundData) return
    setSelected(word)

    if (word === roundData.targetWord.word) {
      setFeedback('correct')
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      speakWord(word)
      setTimeout(() => {
        if (round + 1 >= totalRounds) onComplete(newXp)
        else {
          setRound((prev) => prev + 1)
          advanceRound()
        }
      }, 1500)
    } else {
      setFeedback('wrong')
      setAnimClass('animate-shake')
      setTimeout(() => setAnimClass(''), 500)
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1000)
      }
    }
  }, [feedback, roundData, hearts, xpEarned, round, totalRounds, onComplete, onGameOver, advanceRound])

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Listen & Choose" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className="mb-6 text-center">
          <button
            onClick={playSpelling}
            disabled={isSpelling}
            className={`w-24 h-24 rounded-full bg-duo-purple text-white flex items-center justify-center text-4xl shadow-lg transition-all ${isSpelling ? 'animate-pulse-grow' : 'clickable-image'}`}
          >🔊</button>
          <p className="text-sm text-gray-500 mt-2">{isSpelling ? 'Spelling the word...' : 'Tap to hear the word!'}</p>
        </div>
        <div className={`w-full max-w-sm space-y-3 ${animClass}`}>
          {roundData.options.map((option) => {
            const isCorrect = option === roundData.targetWord.word
            const isSelected = option === selected
            let btnClass = 'w-full duo-button text-lg font-bold py-5 rounded-2xl transition-all'
            if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white animate-pulse-grow'
            else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white animate-shake'
            else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
            else btnClass += ' bg-white text-gray-800 border-2 border-gray-200 hover:border-duo-purple'
            return (
              <button key={option} className={btnClass} onClick={() => handleSelect(option)}>
                {option.toUpperCase()}
              </button>
            )
          })}
        </div>
        {feedback && (
          <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
            {feedback === 'correct' ? randomEncouragement() : 'Not quite! Try again 💪'}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ SENTENCE BUILDER VIEW ============
function SentenceBuilderView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const allExercises = useMemo(() => shuffleArray([...SENTENCE_EXERCISES_3, ...SENTENCE_EXERCISES_4]), [])
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('')
  const [showHint, setShowHint] = useState(false)

  const totalRounds = Math.min(10, allExercises.length)
  const currentExercise = allExercises[round]

  const handleSelect = useCallback((option: string) => {
    if (feedback || !currentExercise) return
    setSelected(option)

    if (option === currentExercise.answer) {
      setFeedback('correct')
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      const fullSentence = currentExercise.sentence.replace('____', option)
      setTimeout(() => speakSentence(fullSentence), 300)
      setTimeout(() => {
        if (round + 1 >= totalRounds) onComplete(newXp)
        else {
          setRound((prev) => prev + 1)
          setSelected(null)
          setFeedback(null)
          setShowHint(false)
          setAnimClass('animate-slide-in-right')
          setTimeout(() => setAnimClass(''), 400)
        }
      }, 1800)
    } else {
      setFeedback('wrong')
      setAnimClass('animate-shake')
      setTimeout(() => setAnimClass(''), 500)
      setShowHint(true)
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1500)
      }
    }
  }, [feedback, currentExercise, hearts, xpEarned, round, totalRounds, onComplete, onGameOver])

  if (!currentExercise) return null

  const needsS = ['he', 'she', 'it'].some((p) => currentExercise.sentence.toLowerCase().includes(p))
  const grammarHint = needsS ? '💡 Hint: He/She/It needs verb + s!' : '💡 Hint: I/You/We/They use the base verb (no -s)!'

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Sentence Builder" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-xl font-bold text-gray-800">{currentExercise.sentence.replace('____', '______')}</p>
            </CardContent>
          </Card>
          {showHint && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3 text-center animate-slide-up">
              <p className="text-sm font-semibold text-yellow-700">{grammarHint}</p>
            </div>
          )}
          <div className="flex gap-3">
            {currentExercise.options.map((option) => {
              const isCorrect = option === currentExercise.answer
              const isSelected = option === selected
              let btnClass = 'flex-1 duo-button text-xl font-bold py-6 rounded-2xl transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white animate-pulse-grow'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white animate-shake'
              else btnClass += ' bg-white text-gray-800 border-2 border-gray-200 hover:border-duo-orange'
              return (
                <button key={option} className={btnClass} onClick={() => handleSelect(option)}>
                  {option}
                </button>
              )
            })}
          </div>
          {feedback && (
            <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
              {feedback === 'correct' ? randomEncouragement() : 'Oops! Wrong form! 💪'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ GRAMMAR PRACTICE VIEW ============
function GrammarPracticeView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const ADD_S_PRONOUNS = ['He', 'She', 'It']
  const ALL_PRONOUNS = ['I', 'You', 'We', 'They', 'He', 'She', 'It']

  const [phase, setPhase] = useState<'sort' | 'practice'>('sort')
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [addSGroup, setAddSGroup] = useState<string[]>([])
  const [noSGroup, setNoSGroup] = useState<string[]>([])
  const [unsorted, setUnsorted] = useState<string[]>(ALL_PRONOUNS)
  const [sortFeedback, setSortFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [practiceRound, setPracticeRound] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('')

  const practiceQuestions = useMemo(() => [
    { pronoun: 'He', verb: 'run', correct: 'runs' },
    { pronoun: 'They', verb: 'swim', correct: 'swim' },
    { pronoun: 'She', verb: 'read', correct: 'reads' },
    { pronoun: 'I', verb: 'play', correct: 'play' },
    { pronoun: 'It', verb: 'eat', correct: 'eats' },
    { pronoun: 'We', verb: 'sing', correct: 'sing' },
    { pronoun: 'You', verb: 'jump', correct: 'jump' },
    { pronoun: 'He', verb: 'write', correct: 'writes' },
  ], [])

  const handleSortPronoun = useCallback((pronoun: string, group: 'add-s' | 'no-s') => {
    if (sortFeedback) return
    const isAddS = ADD_S_PRONOUNS.includes(pronoun)
    const correctGroup = isAddS ? 'add-s' : 'no-s'

    if (group === correctGroup) {
      let newAddS = addSGroup
      let newNoS = noSGroup
      if (group === 'add-s') {
        newAddS = [...addSGroup, pronoun]
        setAddSGroup(newAddS)
      } else {
        newNoS = [...noSGroup, pronoun]
        setNoSGroup(newNoS)
      }
      setUnsorted((prev) => prev.filter((p) => p !== pronoun))
      speakWord(pronoun)

      // Check if sorting is complete after this placement
      const willBeComplete = newAddS.length === 3 && newNoS.length === 4
      if (willBeComplete) {
        setSortFeedback('correct')
        setXpEarned((prev) => prev + 30)
        setTimeout(() => setPhase('practice'), 1500)
      }
    } else {
      setSortFeedback('wrong')
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 500)
        return
      }
      setTimeout(() => setSortFeedback(null), 1000)
    }
  }, [sortFeedback, hearts, xpEarned, onGameOver, ADD_S_PRONOUNS, addSGroup, noSGroup])

  const currentPractice = practiceQuestions[practiceRound]

  const handlePracticeSelect = useCallback((option: string) => {
    if (feedback || !currentPractice) return
    setSelected(option)

    if (option === currentPractice.correct) {
      setFeedback('correct')
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      speakWord(`${currentPractice.pronoun} ${option}`)
      setTimeout(() => {
        if (practiceRound + 1 >= practiceQuestions.length) onComplete(newXp)
        else {
          setPracticeRound((prev) => prev + 1)
          setSelected(null)
          setFeedback(null)
          setAnimClass('animate-slide-in-right')
          setTimeout(() => setAnimClass(''), 400)
        }
      }, 1500)
    } else {
      setFeedback('wrong')
      setAnimClass('animate-shake')
      setTimeout(() => setAnimClass(''), 500)
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1000)
      }
    }
  }, [feedback, currentPractice, hearts, xpEarned, practiceRound, practiceQuestions.length, onComplete, onGameOver])

  // SORT PHASE
  if (phase === 'sort') {
    return (
      <div className="min-h-screen bg-duo-bg flex flex-col">
        <div className="px-4 pt-4">
          <LessonHeader title="Grammar Rules - Sort" hearts={hearts} current={addSGroup.length + noSGroup.length} total={7} onBack={onBack} />
        </div>
        <div className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto custom-scrollbar">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-4 text-center">
            <p className="font-bold text-purple-700">📖 He, She, It → Add -s</p>
            <p className="font-bold text-duo-green mt-1">📖 I, You, We, They → No -s</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {unsorted.map((pronoun) => {
              const isAddS = ADD_S_PRONOUNS.includes(pronoun)
              return (
                <button
                  key={pronoun}
                  className="px-5 py-3 rounded-2xl bg-white shadow-md font-bold text-lg text-gray-800 clickable-image border-2 border-gray-200"
                  onClick={() => handleSortPronoun(pronoun, isAddS ? 'add-s' : 'no-s')}
                >
                  {pronoun}
                </button>
              )
            })}
            {unsorted.length === 0 && !sortFeedback && <p className="text-gray-400 text-sm">All sorted! ✨</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border-2 border-duo-green/30 rounded-2xl p-3 min-h-[120px]">
              <p className="text-xs font-bold text-duo-green mb-2 text-center">➕ Add -s</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {addSGroup.map((p) => (
                  <span key={p} className="px-3 py-1.5 bg-duo-green text-white rounded-xl text-sm font-bold animate-pop-in">{p}</span>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border-2 border-duo-blue/30 rounded-2xl p-3 min-h-[120px]">
              <p className="text-xs font-bold text-duo-blue mb-2 text-center">✖️ No -s</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {noSGroup.map((p) => (
                  <span key={p} className="px-3 py-1.5 bg-duo-blue text-white rounded-xl text-sm font-bold animate-pop-in">{p}</span>
                ))}
              </div>
            </div>
          </div>
          {sortFeedback && (
            <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${sortFeedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
              {sortFeedback === 'correct' ? 'Perfect! All sorted! 🎉' : 'Wrong group! Try again! 💪'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // PRACTICE PHASE
  if (!currentPractice) return null
  const options = [currentPractice.verb, currentPractice.correct].sort()

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Grammar Practice" hearts={hearts} current={practiceRound + 1} total={practiceQuestions.length} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 mb-4 text-center">
            <p className="text-sm font-bold text-purple-700">
              {ADD_S_PRONOUNS.includes(currentPractice.pronoun)
                ? `${currentPractice.pronoun} → Add -s to the verb!`
                : `${currentPractice.pronoun} → Base verb, no -s!`}
            </p>
          </div>
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6 text-center">
              <span className="text-3xl font-bold text-duo-purple">{currentPractice.pronoun}</span>
              <span className="text-2xl text-gray-400 mx-2">→</span>
              <span className="text-3xl font-bold text-gray-800">{currentPractice.verb}</span>
              <p className="text-sm text-gray-500 mt-2">What is the correct form?</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            {options.map((option) => {
              const isCorrect = option === currentPractice.correct
              const isSelected = option === selected
              let btnClass = 'flex-1 duo-button text-xl font-bold py-6 rounded-2xl transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white animate-pulse-grow'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white animate-shake'
              else btnClass += ' bg-white text-gray-800 border-2 border-gray-200 hover:border-duo-pink'
              return (
                <button key={option} className={btnClass} onClick={() => handlePracticeSelect(option)}>
                  {option}
                </button>
              )
            })}
          </div>
          {feedback && (
            <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
              {feedback === 'correct' ? `${currentPractice.pronoun} ${currentPractice.correct} ✅` : 'Try again! 💪'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ SPELLING CHALLENGE VIEW ============
function createSpellingRound(roundIndex: number): { roundData: ActionWord; scrambledLetters: string[] } {
  const words = shuffleArray(ACTION_WORDS)
  const target = words[roundIndex % ACTION_WORDS.length]
  return { roundData: target, scrambledLetters: shuffleArray(target.word.split('')) }
}

function SpellingChallengeView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [spelledLetters, setSpelledLetters] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const [roundData, setRoundData] = useState(() => {
    const r = createSpellingRound(0)
    speakWord(r.roundData.word)
    return r.roundData
  })
  const [scrambledLetters, setScrambledLetters] = useState(() => createSpellingRound(0).scrambledLetters)
  const totalRounds = 8

  const advanceRound = useCallback((nextRound: number) => {
    const r = createSpellingRound(nextRound)
    setRoundData(r.roundData)
    setScrambledLetters(r.scrambledLetters)
    setSpelledLetters([])
    setFeedback(null)
    setAnimClass('animate-slide-up')
    setTimeout(() => setAnimClass(''), 400)
    speakWord(r.roundData.word)
  }, [])

  const handleLetterClick = useCallback((letter: string, index: number) => {
    if (feedback || !roundData) return
    const newSpelled = [...spelledLetters, letter]
    setSpelledLetters(newSpelled)
    setScrambledLetters((prev) => prev.filter((_, i) => i !== index))

    if (newSpelled.length === roundData.word.length) {
      const spelled = newSpelled.join('')
      if (spelled === roundData.word) {
        setFeedback('correct')
        const newXp = xpEarned + 10
        setXpEarned(newXp)
        speakWord(roundData.word)
        setTimeout(() => {
          if (round + 1 >= totalRounds) onComplete(newXp)
          else {
            setRound((prev) => prev + 1)
            advanceRound(round + 1)
          }
        }, 1500)
      } else {
        setFeedback('wrong')
        setAnimClass('animate-shake')
        setTimeout(() => setAnimClass(''), 500)
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts <= 0) {
          setTimeout(() => onGameOver(xpEarned), 800)
        } else {
          setTimeout(() => {
            setSpelledLetters([])
            if (roundData) setScrambledLetters(shuffleArray(roundData.word.split('')))
            setFeedback(null)
          }, 1200)
        }
      }
    }
  }, [feedback, roundData, spelledLetters, hearts, xpEarned, round, totalRounds, onComplete, onGameOver, advanceRound])

  const handleClear = useCallback(() => {
    if (feedback || !roundData) return
    setSpelledLetters([])
    setScrambledLetters(shuffleArray(roundData.word.split('')))
  }, [feedback, roundData])

  if (!roundData) return null

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Spelling Challenge" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <div className="flex justify-center mb-4">
            <Card className="border-0 shadow-md cursor-pointer clickable-image" onClick={() => speakWord(roundData.word)}>
              <CardContent className="p-3">
                <img src={roundData.image} alt={roundData.word} className="w-28 h-28 object-contain" />
              </CardContent>
            </Card>
          </div>
          <Button variant="ghost" size="sm" className="text-duo-teal mb-3" onClick={() => speakWord(roundData.word)}>🔊 Hear the word</Button>
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4 min-h-[60px] flex items-center justify-center gap-2">
            {spelledLetters.length === 0 ? (
              <p className="text-gray-300 text-sm">Tap letters to spell the word!</p>
            ) : (
              spelledLetters.map((letter, i) => (
                <span key={i} className="w-10 h-10 flex items-center justify-center bg-duo-teal/10 rounded-xl text-xl font-bold text-duo-teal animate-pop-in">
                  {letter.toUpperCase()}
                </span>
              ))
            )}
          </div>
          {spelledLetters.length > 0 && !feedback && (
            <Button variant="ghost" size="sm" className="text-gray-400 mb-2 w-full" onClick={handleClear}>↩ Clear</Button>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            {scrambledLetters.map((letter, i) => (
              <button
                key={`${letter}-${i}`}
                className="letter-tile w-12 h-12 flex items-center justify-center bg-white shadow-md rounded-xl text-xl font-bold text-gray-800 border-2 border-gray-100"
                onClick={() => handleLetterClick(letter, i)}
              >
                {letter.toUpperCase()}
              </button>
            ))}
          </div>
          {feedback && (
            <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
              {feedback === 'correct' ? `${roundData.word.toUpperCase()} - ${randomEncouragement()}` : `The word is: ${roundData.word.toUpperCase()} 💪`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ FINAL TEST VIEW ============
interface TestQuestion {
  type: 'picture-match' | 'sentence' | 'listen' | 'grammar'
  target?: ActionWord
  options: ActionWord[] | string[] | [string, string]
  sentence?: string
  answer: string
  pronoun?: string
  verb?: string
}

function FinalTestView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [questions] = useState<TestQuestion[]>(() => {
    const qs: TestQuestion[] = []

    // Picture match (3)
    const shuffledWords = shuffleArray(ACTION_WORDS)
    for (let i = 0; i < 3; i++) {
      const word = shuffledWords[i]
      const distractors = getRandomItems(ACTION_WORDS, 3, [word])
      const options = shuffleArray([word, ...distractors])
      qs.push({ type: 'picture-match', target: word, options, answer: word.word })
    }

    // Sentence (4)
    const sentenceQs = shuffleArray([...SENTENCE_EXERCISES_3, ...SENTENCE_EXERCISES_4]).slice(0, 4)
    sentenceQs.forEach((q) => {
      qs.push({ type: 'sentence', sentence: q.sentence, options: q.options, answer: q.answer })
    })

    // Listen (3)
    for (let i = 3; i < 6; i++) {
      const word = shuffledWords[i % ACTION_WORDS.length]
      const distractors = getRandomItems(ACTION_WORDS.map((w) => w.word), 3, [word.word])
      const options = shuffleArray([word.word, ...distractors])
      qs.push({ type: 'listen', target: word, options, answer: word.word })
    }

    // Grammar (2)
    const grammarQs = [
      { pronoun: 'She', verb: 'dance', correct: 'dances', wrong: 'dance' },
      { pronoun: 'They', verb: 'laugh', correct: 'laugh', wrong: 'laughs' },
    ]
    grammarQs.forEach((q) => {
      qs.push({ type: 'grammar', pronoun: q.pronoun, verb: q.verb, options: [q.correct, q.wrong].sort() as [string, string], answer: q.correct })
    })

    return shuffleArray(qs)
  })

  const [currentQ, setCurrentQ] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('')

  const totalQuestions = questions.length
  const question = questions[currentQ]

  const handleAnswer = useCallback((answer: string) => {
    if (feedback || !question) return
    setSelected(answer)

    const isCorrect = answer === question.answer
    if (isCorrect) {
      setFeedback('correct')
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      if (question.type === 'listen') speakWord(answer)
      setTimeout(() => {
        if (currentQ + 1 >= totalQuestions) onComplete(newXp)
        else {
          setCurrentQ((prev) => prev + 1)
          setSelected(null)
          setFeedback(null)
          setAnimClass('animate-slide-in-right')
          setTimeout(() => setAnimClass(''), 400)
        }
      }, 1200)
    } else {
      setFeedback('wrong')
      setAnimClass('animate-shake')
      setTimeout(() => setAnimClass(''), 500)
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1000)
      }
    }
  }, [feedback, question, hearts, xpEarned, currentQ, totalQuestions, onComplete, onGameOver])

  if (!question) return null

  const renderQuestion = () => {
    if (question.type === 'picture-match' && question.target) {
      const target = question.target
      const options = question.options as ActionWord[]
      return (
        <div className={animClass}>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
            Find: <span className="text-duo-blue">{target.word.toUpperCase()}</span>
          </h2>
          <Button variant="ghost" size="sm" className="text-duo-blue mb-2 w-full" onClick={() => speakWord(target.word)}>🔊 Hear the word</Button>
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const isCorrect = opt.word === target.word
              const isSelected = opt.word === selected
              let cardClass = 'border-0 shadow-md cursor-pointer transition-all'
              if (feedback === 'correct' && isCorrect) cardClass += ' ring-4 ring-duo-green bg-green-50'
              else if (feedback === 'wrong' && isSelected && !isCorrect) cardClass += ' ring-4 ring-duo-red bg-red-50'
              return (
                <Card key={opt.word} className={cardClass} onClick={() => handleAnswer(opt.word)}>
                  <CardContent className="p-2 flex flex-col items-center">
                    <img src={opt.image} alt={opt.word} className="w-24 h-24 object-contain" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )
    }

    if (question.type === 'sentence' && question.sentence) {
      const options = question.options as [string, string]
      return (
        <div className={animClass}>
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-gray-800">{question.sentence.replace('____', '______')}</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            {options.map((option) => {
              const isCorrect = option === question.answer
              const isSelected = option === selected
              let btnClass = 'flex-1 duo-button text-lg font-bold py-5 rounded-2xl transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white'
              else btnClass += ' bg-white text-gray-800 border-2 border-gray-200'
              return <button key={option} className={btnClass} onClick={() => handleAnswer(option)}>{option}</button>
            })}
          </div>
        </div>
      )
    }

    if (question.type === 'listen' && question.target) {
      const target = question.target
      const options = question.options as string[]
      return (
        <div className={animClass}>
          <div className="text-center mb-4">
            <button
              onClick={() => spellAndSpeak(target.word)}
              className="w-20 h-20 rounded-full bg-duo-purple text-white flex items-center justify-center text-3xl shadow-lg mx-auto clickable-image"
            >🔊</button>
            <p className="text-sm text-gray-500 mt-2">Listen and choose!</p>
          </div>
          <div className="space-y-2">
            {options.map((option) => {
              const isCorrect = option === target.word
              const isSelected = option === selected
              let btnClass = 'w-full duo-button text-base font-bold py-4 rounded-2xl transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white'
              else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
              else btnClass += ' bg-white text-gray-800 border-2 border-gray-200'
              return <button key={option} className={btnClass} onClick={() => handleAnswer(option)}>{option.toUpperCase()}</button>
            })}
          </div>
        </div>
      )
    }

    if (question.type === 'grammar' && question.pronoun && question.verb) {
      const options = question.options as [string, string]
      return (
        <div className={animClass}>
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-4 text-center">
              <span className="text-2xl font-bold text-duo-purple">{question.pronoun}</span>
              <span className="text-xl text-gray-400 mx-2">→</span>
              <span className="text-2xl font-bold text-gray-800">{question.verb}</span>
              <p className="text-sm text-gray-500 mt-1">Choose the correct form</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            {options.map((option) => {
              const isCorrect = option === question.answer
              const isSelected = option === selected
              let btnClass = 'flex-1 duo-button text-lg font-bold py-5 rounded-2xl transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white'
              else btnClass += ' bg-white text-gray-800 border-2 border-gray-200'
              return <button key={option} className={btnClass} onClick={() => handleAnswer(option)}>{option}</button>
            })}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="🏆 Final Test" hearts={hearts} current={currentQ + 1} total={totalQuestions} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className="w-full max-w-sm">{renderQuestion()}</div>
        {feedback && (
          <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
            {feedback === 'correct' ? randomEncouragement() : 'Keep trying! 💪'}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ MAIN APP ============
export default function Home() {
  const [view, setView] = useState<ViewType>('dashboard')
  const [progress, setProgress] = useState<ProgressData>(() => {
    if (typeof window !== 'undefined') return loadProgress()
    return { xp: 0, streak: 0, completedLessons: [], lastPlayedDate: '' }
  })
  const [currentLessonName, setCurrentLessonName] = useState('')
  const [lastXpEarned, setLastXpEarned] = useState(0)
  const [activeLessonId, setActiveLessonId] = useState<LessonViewType>('flashcards')

  const updateProgress = useCallback((lessonId: string, xpGained: number) => {
    const today = getTodayString()
    const yesterday = getYesterdayString()

    setProgress((prev) => {
      const newCompleted = prev.completedLessons.includes(lessonId) ? prev.completedLessons : [...prev.completedLessons, lessonId]
      let newStreak = prev.streak
      if (prev.lastPlayedDate !== today && prev.lastPlayedDate === yesterday) newStreak = prev.streak + 1
      else if (prev.lastPlayedDate !== today) newStreak = 1

      const newProgress: ProgressData = { xp: prev.xp + xpGained, streak: newStreak, completedLessons: newCompleted, lastPlayedDate: today }
      saveProgress(newProgress)
      return newProgress
    })
  }, [])

  const handleSelectLesson = useCallback((lessonId: LessonViewType) => {
    const lesson = LESSONS.find((l) => l.id === lessonId)
    setCurrentLessonName(lesson?.name ?? '')
    setActiveLessonId(lessonId)
    setView(lessonId)
  }, [])

  const handleLessonComplete = useCallback((xpGained: number) => {
    updateProgress(activeLessonId, xpGained)
    setLastXpEarned(xpGained)
    setView('lesson-complete')
  }, [activeLessonId, updateProgress])

  const handleGameOver = useCallback((xpGained: number) => {
    // Still give XP for what they accomplished
    updateProgress(activeLessonId, xpGained)
    setLastXpEarned(xpGained)
    setView('game-over')
  }, [activeLessonId, updateProgress])

  const handleBackToDashboard = useCallback(() => {
    window.speechSynthesis?.cancel()
    setView('dashboard')
    setProgress(loadProgress())
  }, [])

  const handleRetry = useCallback(() => {
    window.speechSynthesis?.cancel()
    setView(activeLessonId)
  }, [activeLessonId])

  const lessonProps = { onComplete: handleLessonComplete, onGameOver: handleGameOver, onBack: handleBackToDashboard }

  const renderCurrentView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard progress={progress} onSelectLesson={handleSelectLesson} />
      case 'flashcards':
        return <FlashcardView onComplete={handleLessonComplete} onBack={handleBackToDashboard} />
      case 'picture-match':
        return <PictureMatchView {...lessonProps} />
      case 'listen-choose':
        return <ListenChooseView {...lessonProps} />
      case 'sentence-builder':
        return <SentenceBuilderView {...lessonProps} />
      case 'grammar-practice':
        return <GrammarPracticeView {...lessonProps} />
      case 'spelling-challenge':
        return <SpellingChallengeView {...lessonProps} />
      case 'final-test':
        return <FinalTestView {...lessonProps} />
      case 'lesson-complete':
        return <LessonCompleteView xpEarned={lastXpEarned} lessonName={currentLessonName} onContinue={handleBackToDashboard} />
      case 'game-over':
        return <GameOverView xpEarned={lastXpEarned} lessonName={currentLessonName} onRetry={handleRetry} onBack={handleBackToDashboard} />
      default:
        return <Dashboard progress={progress} onSelectLesson={handleSelectLesson} />
    }
  }

  return <main className="min-h-screen">{renderCurrentView()}</main>
}
