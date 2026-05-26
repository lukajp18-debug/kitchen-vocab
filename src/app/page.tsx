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
  | 'spelling-challenge'
  | 'whats-missing'
  | 'final-test'
  | 'lesson-complete'
  | 'game-over'

type LessonViewType = Exclude<ViewType, 'dashboard' | 'lesson-complete' | 'game-over'>

interface KitchenWord {
  word: string
  image: string
}

interface ProgressData {
  xp: number
  streak: number
  completedLessons: string[]
  unlockedRewards: string[]
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

interface RewardDef {
  id: string
  name: string
  image: string
  lessonsRequired: number
  description: string
  is3D: boolean
}

// ============ CONSTANTS ============
const KITCHEN_WORDS: KitchenWord[] = [
  { word: 'spoon', image: '/images/kitchen/spoon.png' },
  { word: 'fork', image: '/images/kitchen/fork.png' },
  { word: 'cup', image: '/images/kitchen/cup.png' },
  { word: 'pan', image: '/images/kitchen/pan.png' },
  { word: 'knife', image: '/images/kitchen/knife.png' },
  { word: 'glass', image: '/images/kitchen/glass.png' },
  { word: 'blender', image: '/images/kitchen/blender.png' },
  { word: 'plate', image: '/images/kitchen/plate.png' },
  { word: 'pot', image: '/images/kitchen/pot.png' },
  { word: 'kettle', image: '/images/kitchen/kettle.png' },
]

const REWARDS: RewardDef[] = [
  { id: 'panelita', name: 'Panelita de leche', image: '/images/rewards/panelita.png', lessonsRequired: 2, description: 'Complete 2 lessons (33%)', is3D: false },
  { id: 'trululu', name: 'Gomas Trululu', image: '/images/rewards/trululu.png', lessonsRequired: 4, description: 'Complete 4 lessons (66%)', is3D: true },
  { id: 'hotwheels', name: 'Carro Hotwheels', image: '/images/rewards/hotwheels.png', lessonsRequired: 6, description: 'Complete ALL lessons (100%)', is3D: true },
]

const LESSONS: LessonDef[] = [
  { id: 'flashcards', name: 'Learn the Words', icon: '📚', color: '#58CC02', bgColor: '#E5F9D0', description: 'Learn 10 kitchen words with pictures!', xpReward: 10 },
  { id: 'picture-match', name: 'Match the Picture', icon: '🖼️', color: '#1CB0F6', bgColor: '#D0EFFA', description: 'Match words to pictures!', xpReward: 80 },
  { id: 'listen-choose', name: 'Listen and Pick', icon: '👂', color: '#CE82FF', bgColor: '#F0D8FF', description: 'Listen and pick the right word!', xpReward: 80 },
  { id: 'spelling-challenge', name: 'Spell the Word', icon: '✏️', color: '#00CD9C', bgColor: '#CCF5EA', description: 'Spell the words you hear!', xpReward: 80 },
  { id: 'whats-missing', name: 'Fill the Blank', icon: '❓', color: '#FF86D0', bgColor: '#FFD8EE', description: 'Find the missing letter!', xpReward: 80 },
  { id: 'final-test', name: 'Show What You Know!', icon: '🏆', color: '#FFB700', bgColor: '#FFF0CC', description: 'Final test - prove your skills!', xpReward: 120 },
]

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCB77', '#9B59B6', '#58CC02', '#CE82FF', '#FF9600', '#FFC800']
const ENCOURAGEMENTS = ['Amazing! 🌟', 'Great job! 🎉', 'You rock! 🎸', 'Fantastic! ✨', 'Super! 🦸', 'Wow! 🎊', 'Brilliant! 💡', 'Awesome! 🚀', 'Nice one! 🎯', 'Perfect! 💯']

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

function spellAndSpeak(word: string, onComplete?: () => void): ReturnType<typeof setTimeout> | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  window.speechSynthesis.cancel()
  let delay = 0

  // Step 1: Say the complete word first
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'
    u.rate = 0.8
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  }, delay)
  delay += 1200

  // Step 2: Spell each letter, grouping consecutive duplicates as "double [letter]"
  const spellParts: string[] = []
  let i = 0
  while (i < word.length) {
    let count = 1
    while (i + count < word.length && word[i + count].toLowerCase() === word[i].toLowerCase()) {
      count++
    }
    if (count >= 2) {
      spellParts.push(`double ${word[i].toLowerCase()}`)
    } else {
      spellParts.push(word[i].toLowerCase())
    }
    i += count
  }

  spellParts.forEach((part) => {
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(part)
      u.lang = 'en-US'
      u.rate = 0.7
      u.pitch = 1.2
      window.speechSynthesis.speak(u)
    }, delay)
    delay += 800
  })
  delay += 500

  // Step 3: Say the complete word again at the end
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'
    u.rate = 0.8
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  }, delay)
  delay += 1200

  return onComplete ? setTimeout(onComplete, delay) : null
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
    return { xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '' }
  }
  try {
    const stored = localStorage.getItem('kitchen-vocab-progress')
    if (stored) return JSON.parse(stored) as ProgressData
  } catch { /* ignore */ }
  return { xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '' }
}

function saveProgress(progress: ProgressData) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('kitchen-vocab-progress', JSON.stringify(progress)) } catch { /* ignore */ }
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
  return Array.from({ length: 60 }, (_, i) => ({
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

// ============ REWARD CELEBRATION COMPONENT ============
function RewardCelebration({ reward, onDismiss }: { reward: RewardDef; onDismiss: () => void }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      y: 10 + Math.random() * 50,
      delay: Math.random() * 2,
      size: 10 + Math.random() * 15,
    })), []
  )

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onDismiss}>
      {showConfetti && <ConfettiEffect />}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute animate-sparkle pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-reward-bounce" onClick={(e) => e.stopPropagation()}>
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">YOU EARNED A REWARD!</h2>
        <div className="animate-reward-glow rounded-2xl p-4 mb-4">
          <img src={reward.image} alt={reward.name} className="w-40 h-40 object-contain mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-duo-gold mb-2">{reward.name}</h3>
        {reward.is3D && (
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-2">🎮 3D Image</span>
        )}
        <p className="text-lg text-gray-600 mb-4 font-semibold">Ask Mom or Dad for your prize! 🎁</p>
        <Button
          onClick={onDismiss}
          className="duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg px-8 py-5 rounded-2xl"
          size="lg"
        >
          Claim your prize! 🌟
        </Button>
      </div>
    </div>
  )
}

// ============ MASCOT COMPONENT ============
function Mascot({ size = 48 }: { size?: number }) {
  return (
    <div className="select-none animate-float" style={{ fontSize: `${size}px`, lineHeight: 1 }}>
      🦉
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
  const isCompleted = (id: string): boolean => progress.completedLessons.includes(id)
  const totalLessons = LESSONS.length
  const completedCount = progress.completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length
  const overallProgress = (completedCount / totalLessons) * 100

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦉</span>
            <span className="font-bold text-lg text-gray-800">Kitchen Vocab</span>
          </div>
          <div className="flex items-center gap-3">
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
            <Mascot size={56} />
            <h1 className="text-2xl font-bold text-gray-800 mt-2">
              {overallProgress === 100 ? 'You did it! All done! 🎉' : "Let's learn Kitchen Words!"}
            </h1>
            <p className="text-gray-500 mt-1">Kitchen Vocabulary for Kids</p>
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

          {/* Rewards Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              🎁 Rewards
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {REWARDS.map((reward) => {
                const isUnlocked = progress.unlockedRewards.includes(reward.id)
                const lessonsCompleted = progress.completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length
                const rewardProgress = Math.min((lessonsCompleted / reward.lessonsRequired) * 100, 100)
                return (
                  <Card
                    key={reward.id}
                    className={`border-0 shadow-md overflow-hidden ${isUnlocked ? 'animate-reward-glow' : ''}`}
                  >
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <div className={`relative w-20 h-20 mb-2 ${!isUnlocked ? 'reward-locked' : ''}`}>
                        <img
                          src={reward.image}
                          alt={reward.name}
                          className="w-full h-full object-contain"
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl">🔒</span>
                          </div>
                        )}
                        {isUnlocked && (
                          <div className="absolute -top-1 -right-1 text-lg animate-float-star">⭐</div>
                        )}
                      </div>
                      <p className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-duo-gold' : 'text-gray-400'}`}>
                        {reward.name}
                      </p>
                      {!isUnlocked && (
                        <div className="w-full mt-1.5">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-duo-orange rounded-full h-1.5 transition-all"
                              style={{ width: `${rewardProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{lessonsCompleted}/{reward.lessonsRequired} lessons</p>
                        </div>
                      )}
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-duo-green mt-1">✅ Claimed!</span>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Lesson Path */}
          <div className="flex flex-col items-center">
            {LESSONS.map((lesson, index) => {
              const completed = isCompleted(lesson.id)
              return (
                <div key={lesson.id} className="flex flex-col items-center w-full">
                  {index > 0 && (
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: isCompleted(LESSONS[index - 1].id) ? lesson.color : '#E0E0E0' }} />
                  )}
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    className="w-full max-w-xs mb-2 transition-all duration-200 lesson-card-hover cursor-pointer"
                  >
                    <Card
                      className={`border-0 shadow-md overflow-hidden ${completed ? 'ring-2' : ''}`}
                      style={{ backgroundColor: lesson.bgColor, ...(completed ? { ringColor: lesson.color } : {}) }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: lesson.color }}>
                            {lesson.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-bold text-sm text-gray-800">{lesson.name}</h3>
                            <p className="text-xs mt-0.5 text-gray-600">{lesson.description}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            {completed && <span className="text-xl animate-pop-in">✅</span>}
                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${lesson.color}20`, color: lesson.color }}>
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col items-center justify-center p-6">
      {showConfetti && <ConfettiEffect />}
      <div className="text-center animate-bounce-custom"><Mascot size={64} /></div>
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
      <div className="text-center"><Mascot size={64} /></div>
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
  const total = KITCHEN_WORDS.length
  const currentWord = KITCHEN_WORDS[currentIndex]

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
      onComplete(10)
    }
  }, [currentIndex, total, onComplete])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setAnimClass('animate-slide-in-right')
      setTimeout(() => setAnimClass(''), 400)
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  useEffect(() => {
    const timer = setTimeout(() => speakWord(currentWord.word), 300)
    return () => clearTimeout(timer)
  }, [currentIndex, currentWord.word])

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Learn the Words" hearts={3} current={currentIndex + 1} total={total} onBack={onBack} />
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
function createPictureMatchRound(): { targetWord: KitchenWord; options: KitchenWord[] } {
  const shuffled = shuffleArray(KITCHEN_WORDS)
  const target = shuffled[0]
  const distractors = getRandomItems(KITCHEN_WORDS, 3, [target])
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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Match the Picture" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
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
function createListenRound(): { targetWord: KitchenWord; options: string[] } {
  const shuffled = shuffleArray(KITCHEN_WORDS)
  const target = shuffled[0]
  const distractors = getRandomItems(KITCHEN_WORDS.map((w) => w.word), 3, [target.word])
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
    timeoutRef.current = spellAndSpeak(roundData.targetWord.word, () => setIsSpelling(false))
  }, [roundData, isSpelling])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpelling(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = spellAndSpeak(roundData.targetWord.word, () => setIsSpelling(false))
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
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Listen and Pick" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
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

// ============ SPELLING CHALLENGE VIEW ============
function createSpellingRound(): { targetWord: KitchenWord; scrambledLetters: string[] } {
  const shuffled = shuffleArray(KITCHEN_WORDS)
  const target = shuffled[0]
  const letters = shuffleArray(target.word.split(''))
  return { targetWord: target, scrambledLetters: letters }
}

function SpellingChallengeView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [roundData, setRoundData] = useState(() => createSpellingRound())
  const [selectedLetters, setSelectedLetters] = useState<(string | null)[]>(() => Array(roundData.targetWord.word.length).fill(null))
  const [usedIndices, setUsedIndices] = useState<Set<number>>(() => new Set())
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const totalRounds = 8
  const targetWord = roundData.targetWord.word

  const advanceRound = useCallback(() => {
    const newRoundData = createSpellingRound()
    setRoundData(newRoundData)
    setSelectedLetters(Array(newRoundData.targetWord.word.length).fill(null))
    setUsedIndices(new Set())
    setFeedback(null)
    setAnimClass('animate-slide-up')
    setTimeout(() => setAnimClass(''), 400)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => speakWord(roundData.targetWord.word), 300)
    return () => clearTimeout(timer)
  }, [roundData.targetWord.word])

  const handleLetterTap = useCallback((letter: string, index: number) => {
    if (feedback || usedIndices.has(index)) return

    const newUsedIndices = new Set(usedIndices)
    newUsedIndices.add(index)
    setUsedIndices(newUsedIndices)

    const firstEmpty = selectedLetters.findIndex((l) => l === null)
    if (firstEmpty === -1) return

    const newSelected = [...selectedLetters]
    newSelected[firstEmpty] = letter
    setSelectedLetters(newSelected)

    const wordSoFar = newSelected.filter((l) => l !== null).join('')
    if (wordSoFar.length === targetWord.length) {
      if (wordSoFar === targetWord) {
        setFeedback('correct')
        const newXp = xpEarned + 10
        setXpEarned(newXp)
        speakWord(targetWord)
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
          setTimeout(() => {
            setSelectedLetters(Array(targetWord.length).fill(null))
            setUsedIndices(new Set())
            setFeedback(null)
            speakWord(targetWord)
          }, 1200)
        }
      }
    }
  }, [feedback, usedIndices, selectedLetters, targetWord, xpEarned, hearts, round, totalRounds, onComplete, onGameOver, advanceRound])

  const handleRemoveLetter = useCallback((slotIndex: number) => {
    if (feedback) return
    if (selectedLetters[slotIndex] === null) return

    const newSelected = [...selectedLetters]
    newSelected[slotIndex] = null
    setSelectedLetters(newSelected)
    setUsedIndices((prev) => {
      const newSet = new Set<number>()
      const remaining = newSelected.filter((l) => l !== null)
      const letterCounts: Record<string, number> = {}
      remaining.forEach((l) => {
        if (l) letterCounts[l] = (letterCounts[l] || 0) + 1
      })
      roundData.scrambledLetters.forEach((letter, idx) => {
        if (letterCounts[letter] && letterCounts[letter] > 0) {
          newSet.add(idx)
          letterCounts[letter]--
        }
      })
      return newSet
    })
  }, [feedback, selectedLetters, roundData.scrambledLetters])

  const handleHearWord = useCallback(() => {
    speakWord(targetWord)
  }, [targetWord])

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Spell the Word" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <div className="text-center mb-4">
            <Card className="border-0 shadow-md inline-block">
              <CardContent className="p-4 flex flex-col items-center">
                <img src={roundData.targetWord.image} alt={targetWord} className="w-32 h-32 object-contain" />
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleHearWord} className="w-full duo-button bg-duo-blue hover:bg-duo-blue/90 text-white font-bold text-base py-4 rounded-2xl mb-4">
            🔊 Hear the word
          </Button>

          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {selectedLetters.map((letter, i) => (
              <button
                key={i}
                onClick={() => handleRemoveLetter(i)}
                className={`spelling-slot ${letter !== null ? 'filled' : ''} ${feedback === 'wrong' && letter !== null ? 'wrong' : ''} ${feedback === 'correct' && letter !== null ? 'animate-slot-fill' : ''}`}
                disabled={feedback !== null}
              >
                {letter !== null ? letter.toUpperCase() : ''}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {roundData.scrambledLetters.map((letter, i) => (
              <button
                key={i}
                onClick={() => handleLetterTap(letter, i)}
                disabled={usedIndices.has(i) || feedback !== null}
                className={`w-12 h-12 rounded-xl font-bold text-xl flex items-center justify-center letter-tile
                  ${usedIndices.has(i)
                    ? 'bg-gray-200 text-gray-400 opacity-30 pointer-events-none'
                    : 'bg-white text-gray-800 border-2 border-gray-300 shadow-md hover:border-duo-teal hover:shadow-lg'
                  }`}
              >
                {letter.toUpperCase()}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
              {feedback === 'correct' ? randomEncouragement() : `It was "${targetWord.toUpperCase()}"! Try again 💪`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ WHAT'S MISSING VIEW ============
function createMissingRound(): { targetWord: KitchenWord; displayWord: string; missingIndex: number; missingLetter: string; options: string[] } {
  const shuffled = shuffleArray(KITCHEN_WORDS)
  const target = shuffled[0]
  const word = target.word

  const possibleIndices = word.length > 1 ? Array.from({ length: word.length }, (_, i) => i).slice(1) : [0]
  const missingIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)]
  const missingLetter = word[missingIndex]
  const displayWord = word.substring(0, missingIndex) + '_' + word.substring(missingIndex + 1)

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const wrongOptions = getRandomItems(
    alphabet.split('').filter((l) => l !== missingLetter),
    3
  )
  const options = shuffleArray([missingLetter, ...wrongOptions])

  return { targetWord: target, displayWord, missingIndex, missingLetter, options }
}

function WhatsMissingView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [roundData, setRoundData] = useState(() => createMissingRound())
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    setRoundData(createMissingRound())
    setSelected(null)
    setFeedback(null)
    setAnimClass('animate-slide-up')
    setTimeout(() => setAnimClass(''), 400)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => speakWord(roundData.targetWord.word), 300)
    return () => clearTimeout(timer)
  }, [roundData.targetWord.word])

  const handleSelect = useCallback((letter: string) => {
    if (feedback || !roundData) return
    setSelected(letter)

    if (letter === roundData.missingLetter) {
      setFeedback('correct')
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      speakWord(roundData.targetWord.word)
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

  const renderDisplayWord = () => {
    return roundData.displayWord.split('').map((char, i) => (
      <span
        key={i}
        className={`inline-block w-10 h-12 leading-[48px] text-center text-2xl font-bold border-b-4 mx-0.5
          ${char === '_'
            ? feedback === 'correct'
              ? 'bg-duo-green/20 border-duo-green rounded-lg'
              : 'border-duo-pink bg-pink-50 rounded-lg'
            : 'border-gray-300'
          }`}
      >
        {char === '_' ? (
          feedback === 'correct' ? roundData.missingLetter.toUpperCase() : (
            feedback === 'wrong' ? roundData.missingLetter.toUpperCase() : '?'
          )
        ) : char.toUpperCase()}
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Fill the Blank" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <div className="text-center mb-4">
            <Card className="border-0 shadow-md inline-block">
              <CardContent className="p-4 flex flex-col items-center">
                <img src={roundData.targetWord.image} alt={roundData.targetWord.word} className="w-28 h-28 object-contain" />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mb-6 flex-wrap">
            {renderDisplayWord()}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {roundData.options.map((letter) => {
              const isCorrect = letter === roundData.missingLetter
              const isSelected = letter === selected
              let btnClass = 'w-full aspect-square rounded-2xl text-2xl font-bold flex items-center justify-center transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white animate-pulse-grow shadow-lg'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white animate-shake'
              else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
              else btnClass += ' bg-white text-gray-800 border-2 border-gray-200 shadow-md hover:border-duo-pink'
              return (
                <button key={letter} className={btnClass} onClick={() => handleSelect(letter)}>
                  {letter.toUpperCase()}
                </button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-4 text-duo-blue font-bold"
            onClick={() => speakWord(roundData.targetWord.word)}
          >
            🔊 Hear the word
          </Button>

          {feedback && (
            <div className={`mt-4 text-center font-bold text-lg animate-slide-up ${feedback === 'correct' ? 'text-duo-green' : 'text-duo-red'}`}>
              {feedback === 'correct' ? randomEncouragement() : 'Not quite! Try again 💪'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ FINAL TEST - PICTURE MATCH SUB-COMPONENT ============
function FinalPictureMatch({ targetWord, options, onAnswer }: {
  targetWord: KitchenWord; options: KitchenWord[]
  onAnswer: (correct: boolean) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  // Reset state when question changes
  useEffect(() => {
    setSelected(null)
    setFeedback(null)
  }, [targetWord.word])

  const handleSelect = (word: string) => {
    if (feedback) return
    setSelected(word)
    const correct = word === targetWord.word
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) speakWord(word)
    setTimeout(() => onAnswer(correct), correct ? 1200 : 800)
  }

  return (
    <>
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Find: <span className="text-duo-blue">{targetWord.word.toUpperCase()}</span></h2>
        <Button variant="ghost" size="sm" className="mt-1 text-duo-blue" onClick={() => speakWord(targetWord.word)}>🔊 Hear again</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((option) => {
          const isCorrect = option.word === targetWord.word
          const isSelectedOpt = option.word === selected
          let cardClass = 'border-0 shadow-md cursor-pointer transition-all duration-200'
          if (feedback === 'correct' && isCorrect) cardClass += ' ring-4 ring-duo-green bg-green-50'
          else if (feedback === 'wrong' && isSelectedOpt && !isCorrect) cardClass += ' ring-4 ring-duo-red bg-red-50'
          return (
            <Card key={option.word} className={cardClass} onClick={() => handleSelect(option.word)}>
              <CardContent className="p-3 flex flex-col items-center">
                <img src={option.image} alt={option.word} className="w-24 h-24 object-contain" />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

// ============ FINAL TEST - LISTEN CHOOSE SUB-COMPONENT ============
function FinalListenChoose({ targetWord, options, onAnswer }: {
  targetWord: KitchenWord; options: string[]
  onAnswer: (correct: boolean) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  // Reset state when question changes
  useEffect(() => {
    setSelected(null)
    setFeedback(null)
  }, [targetWord.word])

  useEffect(() => {
    const timer = setTimeout(() => spellAndSpeak(targetWord.word), 500)
    return () => clearTimeout(timer)
  }, [targetWord.word])

  const handleSelect = (word: string) => {
    if (feedback) return
    setSelected(word)
    const correct = word === targetWord.word
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) speakWord(word)
    setTimeout(() => onAnswer(correct), correct ? 1200 : 800)
  }

  return (
    <>
      <div className="mb-4 text-center">
        <button
          onClick={() => spellAndSpeak(targetWord.word)}
          className="w-20 h-20 rounded-full bg-duo-purple text-white flex items-center justify-center text-3xl shadow-lg mx-auto clickable-image"
        >🔊</button>
        <p className="text-sm text-gray-500 mt-2">Tap to hear the word!</p>
      </div>
      <div className="w-full space-y-3">
        {options.map((option) => {
          const isCorrect = option === targetWord.word
          const isSelectedOpt = option === selected
          let btnClass = 'w-full duo-button text-lg font-bold py-5 rounded-2xl transition-all'
          if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white'
          else if (feedback === 'wrong' && isSelectedOpt && !isCorrect) btnClass += ' bg-duo-red text-white'
          else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
          else btnClass += ' bg-white text-gray-800 border-2 border-gray-200 hover:border-duo-purple'
          return (
            <button key={option} className={btnClass} onClick={() => handleSelect(option)}>
              {option.toUpperCase()}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ============ FINAL TEST - SPELLING SUB-COMPONENT ============
function FinalSpelling({ targetWord, scrambledLetters, onAnswer }: {
  targetWord: KitchenWord; scrambledLetters: string[]
  onAnswer: (correct: boolean) => void
}) {
  const [selectedLetters, setSelectedLetters] = useState<(string | null)[]>(() => Array(targetWord.word.length).fill(null))
  const [usedIndices, setUsedIndices] = useState<Set<number>>(() => new Set())
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const word = targetWord.word

  // Reset state when question changes
  useEffect(() => {
    setSelectedLetters(Array(word.length).fill(null))
    setUsedIndices(new Set())
    setFeedback(null)
  }, [word])

  useEffect(() => {
    const timer = setTimeout(() => speakWord(word), 300)
    return () => clearTimeout(timer)
  }, [word])

  const handleLetterTap = (letter: string, index: number) => {
    if (feedback || usedIndices.has(index)) return
    const newUsedIndices = new Set(usedIndices)
    newUsedIndices.add(index)
    setUsedIndices(newUsedIndices)

    const firstEmpty = selectedLetters.findIndex((l) => l === null)
    if (firstEmpty === -1) return

    const newSelected = [...selectedLetters]
    newSelected[firstEmpty] = letter
    setSelectedLetters(newSelected)

    const wordSoFar = newSelected.filter((l) => l !== null).join('')
    if (wordSoFar.length === word.length) {
      const correct = wordSoFar === word
      setFeedback(correct ? 'correct' : 'wrong')
      if (correct) speakWord(word)
      setTimeout(() => onAnswer(correct), correct ? 1200 : 800)
    }
  }

  const handleRemoveLetter = (slotIndex: number) => {
    if (feedback || selectedLetters[slotIndex] === null) return
    const newSelected = [...selectedLetters]
    newSelected[slotIndex] = null
    setSelectedLetters(newSelected)
    setUsedIndices((prev) => {
      const newSet = new Set<number>()
      const remaining = newSelected.filter((l) => l !== null)
      const letterCounts: Record<string, number> = {}
      remaining.forEach((l) => {
        if (l) letterCounts[l] = (letterCounts[l] || 0) + 1
      })
      scrambledLetters.forEach((letter, idx) => {
        if (letterCounts[letter] && letterCounts[letter] > 0) {
          newSet.add(idx)
          letterCounts[letter]--
        }
      })
      return newSet
    })
  }

  return (
    <>
      <div className="text-center mb-3">
        <img src={targetWord.image} alt={word} className="w-24 h-24 object-contain mx-auto" />
      </div>
      <Button onClick={() => speakWord(word)} className="w-full duo-button bg-duo-blue hover:bg-duo-blue/90 text-white font-bold text-base py-3 rounded-2xl mb-3">
        🔊 Hear the word
      </Button>
      <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
        {selectedLetters.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleRemoveLetter(i)}
            className={`spelling-slot ${letter !== null ? 'filled' : ''} ${feedback === 'wrong' && letter !== null ? 'wrong' : ''}`}
            disabled={feedback !== null}
          >
            {letter !== null ? letter.toUpperCase() : ''}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {scrambledLetters.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleLetterTap(letter, i)}
            disabled={usedIndices.has(i) || feedback !== null}
            className={`w-11 h-11 rounded-xl font-bold text-lg flex items-center justify-center letter-tile
              ${usedIndices.has(i)
                ? 'bg-gray-200 text-gray-400 opacity-30'
                : 'bg-white text-gray-800 border-2 border-gray-300 shadow-md'
              }`}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>
    </>
  )
}

// ============ FINAL TEST - WHATS MISSING SUB-COMPONENT ============
function FinalWhatsMissing({ targetWord, displayWord, missingLetter, options, onAnswer }: {
  targetWord: KitchenWord; displayWord: string; missingLetter: string; options: string[]
  onAnswer: (correct: boolean) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  // Reset state when question changes
  useEffect(() => {
    setSelected(null)
    setFeedback(null)
  }, [targetWord.word])

  useEffect(() => {
    const timer = setTimeout(() => speakWord(targetWord.word), 300)
    return () => clearTimeout(timer)
  }, [targetWord.word])

  const handleSelect = (letter: string) => {
    if (feedback) return
    setSelected(letter)
    const correct = letter === missingLetter
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) speakWord(targetWord.word)
    setTimeout(() => onAnswer(correct), correct ? 1200 : 800)
  }

  return (
    <>
      <div className="text-center mb-3">
        <img src={targetWord.image} alt={targetWord.word} className="w-24 h-24 object-contain mx-auto" />
      </div>
      <div className="flex justify-center mb-4 flex-wrap">
        {displayWord.split('').map((char, i) => (
          <span
            key={i}
            className={`inline-block w-9 h-11 leading-[44px] text-center text-xl font-bold border-b-4 mx-0.5
              ${char === '_'
                ? feedback === 'correct'
                  ? 'bg-duo-green/20 border-duo-green rounded-lg'
                  : 'border-duo-pink bg-pink-50 rounded-lg'
                : 'border-gray-300'
              }`}
          >
            {char === '_' ? (feedback ? missingLetter.toUpperCase() : '?') : char.toUpperCase()}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {options.map((letter) => {
          const isCorrect = letter === missingLetter
          const isSelectedOpt = letter === selected
          let btnClass = 'w-full aspect-square rounded-2xl text-xl font-bold flex items-center justify-center transition-all'
          if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white'
          else if (feedback === 'wrong' && isSelectedOpt && !isCorrect) btnClass += ' bg-duo-red text-white'
          else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
          else btnClass += ' bg-white text-gray-800 border-2 border-gray-200 shadow-md'
          return (
            <button key={letter} className={btnClass} onClick={() => handleSelect(letter)}>
              {letter.toUpperCase()}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ============ FINAL TEST VIEW ============
type FinalTestQuestionType = 'picture-match' | 'listen-choose' | 'spelling' | 'whats-missing'

interface FinalTestQuestion {
  type: FinalTestQuestionType
  targetWord: KitchenWord
  pictureOptions?: KitchenWord[]
  wordOptions?: string[]
  scrambledLetters?: string[]
  displayWord?: string
  missingLetter?: string
  letterOptions?: string[]
}

function createFinalTestQuestions(): FinalTestQuestion[] {
  const questions: FinalTestQuestion[] = []

  for (let i = 0; i < 3; i++) {
    const pm = createPictureMatchRound()
    questions.push({ type: 'picture-match', targetWord: pm.targetWord, pictureOptions: pm.options })
  }

  for (let i = 0; i < 3; i++) {
    const lc = createListenRound()
    questions.push({ type: 'listen-choose', targetWord: lc.targetWord, wordOptions: lc.options })
  }

  for (let i = 0; i < 3; i++) {
    const sp = createSpellingRound()
    questions.push({ type: 'spelling', targetWord: sp.targetWord, scrambledLetters: sp.scrambledLetters })
  }

  for (let i = 0; i < 3; i++) {
    const wm = createMissingRound()
    questions.push({ type: 'whats-missing', targetWord: wm.targetWord, displayWord: wm.displayWord, missingLetter: wm.missingLetter, letterOptions: wm.options })
  }

  return shuffleArray(questions)
}

function FinalTestView({ onComplete, onGameOver, onBack }: { onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [questions] = useState(() => createFinalTestQuestions())
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const totalRounds = 12

  const currentQuestion = questions[round]

  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) {
      const newXp = xpEarned + 10
      setXpEarned(newXp)
      setTimeout(() => {
        if (round + 1 >= totalRounds) onComplete(newXp)
        else {
          setRound((prev) => prev + 1)
          setAnimClass('animate-slide-up')
          setTimeout(() => setAnimClass(''), 400)
        }
      }, 200)
    } else {
      const newHearts = hearts - 1
      setHearts(newHearts)
      if (newHearts <= 0) {
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => {
          setRound((prev) => prev + 1)
          setAnimClass('animate-slide-up')
          setTimeout(() => setAnimClass(''), 400)
        }, 800)
      }
    }
  }, [xpEarned, hearts, round, totalRounds, onComplete, onGameOver])

  if (!currentQuestion) return null

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'picture-match':
        return (
          <FinalPictureMatch
            targetWord={currentQuestion.targetWord}
            options={currentQuestion.pictureOptions!}
            onAnswer={handleAnswer}
          />
        )
      case 'listen-choose':
        return (
          <FinalListenChoose
            targetWord={currentQuestion.targetWord}
            options={currentQuestion.wordOptions!}
            onAnswer={handleAnswer}
          />
        )
      case 'spelling':
        return (
          <FinalSpelling
            targetWord={currentQuestion.targetWord}
            scrambledLetters={currentQuestion.scrambledLetters!}
            onAnswer={handleAnswer}
          />
        )
      case 'whats-missing':
        return (
          <FinalWhatsMissing
            targetWord={currentQuestion.targetWord}
            displayWord={currentQuestion.displayWord!}
            missingLetter={currentQuestion.missingLetter!}
            options={currentQuestion.letterOptions!}
            onAnswer={handleAnswer}
          />
        )
    }
  }

  const questionLabel = currentQuestion.type === 'picture-match' ? '🖼️ Picture Match' :
    currentQuestion.type === 'listen-choose' ? '👂 Listen & Pick' :
    currentQuestion.type === 'spelling' ? '✏️ Spelling' : '❓ Fill the Blank'

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <div className="px-4 pt-4">
        <LessonHeader title="Show What You Know!" hearts={hearts} current={round + 1} total={totalRounds} onBack={onBack} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className={`w-full max-w-sm ${animClass}`}>
          <div className="text-center mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-duo-gold/20 text-duo-gold">
              {questionLabel}
            </span>
          </div>
          {renderQuestion()}
        </div>
      </div>
    </div>
  )
}

// ============ MAIN APP ============
export default function KitchenVocabApp() {
  const [view, setView] = useState<ViewType>('dashboard')
  const [progress, setProgress] = useState<ProgressData>({
    xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: ''
  })
  const [currentLessonId, setCurrentLessonId] = useState<LessonViewType>('flashcards')
  const [pendingReward, setPendingReward] = useState<RewardDef | null>(null)
  const [lastXpEarned, setLastXpEarned] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load progress from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const loaded = loadProgress()
    const today = getTodayString()
    const yesterday = getYesterdayString()
    if (loaded.lastPlayedDate === today) {
      // Same day, keep streak
    } else if (loaded.lastPlayedDate === yesterday) {
      loaded.streak += 1
    } else if (loaded.lastPlayedDate) {
      loaded.streak = 1
    } else {
      loaded.streak = 1
    }
    loaded.lastPlayedDate = today
    saveProgress(loaded)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate: loading initial data from external store (localStorage) after hydration
    setProgress(loaded)
    setIsHydrated(true)
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      saveProgress(progress)
    }
  }, [progress, isHydrated])

  // Check for reward unlocks
  const checkRewards = useCallback((updatedProgress: ProgressData): RewardDef | null => {
    const lessonsCompleted = updatedProgress.completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length
    for (const reward of REWARDS) {
      if (!updatedProgress.unlockedRewards.includes(reward.id) && lessonsCompleted >= reward.lessonsRequired) {
        return reward
      }
    }
    return null
  }, [])

  const handleSelectLesson = useCallback((id: LessonViewType) => {
    setCurrentLessonId(id)
    setView(id)
  }, [])

  const handleLessonComplete = useCallback((xpEarned: number) => {
    setLastXpEarned(xpEarned)
    setProgress((prev) => {
      const newCompleted = prev.completedLessons.includes(currentLessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, currentLessonId]
      const updated = {
        ...prev,
        xp: prev.xp + xpEarned,
        completedLessons: newCompleted,
        lastPlayedDate: getTodayString(),
      }
      const reward = checkRewards(updated)
      if (reward) {
        const withReward = {
          ...updated,
          unlockedRewards: [...updated.unlockedRewards, reward.id],
        }
        setTimeout(() => setPendingReward(reward), 500)
        return withReward
      }
      return updated
    })
    setView('lesson-complete')
  }, [currentLessonId, checkRewards])

  const handleGameOver = useCallback((xpEarned: number) => {
    setLastXpEarned(xpEarned)
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      lastPlayedDate: getTodayString(),
    }))
    setView('game-over')
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard')
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const handleRetry = useCallback(() => {
    setView(currentLessonId)
  }, [currentLessonId])

  const handleContinue = useCallback(() => {
    setView('dashboard')
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const getLessonName = (id: LessonViewType): string => {
    const lesson = LESSONS.find((l) => l.id === id)
    return lesson ? lesson.name : ''
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-float">🦉</div>
          <p className="text-gray-500 mt-4 font-bold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {view === 'dashboard' && (
        <Dashboard progress={progress} onSelectLesson={handleSelectLesson} />
      )}
      {view === 'flashcards' && (
        <FlashcardView onComplete={handleLessonComplete} onBack={handleBackToDashboard} />
      )}
      {view === 'picture-match' && (
        <PictureMatchView onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'listen-choose' && (
        <ListenChooseView onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'spelling-challenge' && (
        <SpellingChallengeView onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'whats-missing' && (
        <WhatsMissingView onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'final-test' && (
        <FinalTestView onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'lesson-complete' && (
        <LessonCompleteView
          xpEarned={lastXpEarned}
          lessonName={getLessonName(currentLessonId)}
          onContinue={handleContinue}
        />
      )}
      {view === 'game-over' && (
        <GameOverView
          xpEarned={lastXpEarned}
          lessonName={getLessonName(currentLessonId)}
          onRetry={handleRetry}
          onBack={handleBackToDashboard}
        />
      )}

      {/* Reward Celebration Overlay */}
      {pendingReward && (
        <RewardCelebration
          reward={pendingReward}
          onDismiss={() => setPendingReward(null)}
        />
      )}
    </div>
  )
}
