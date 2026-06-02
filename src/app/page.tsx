'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Leaderboard } from '@/components/Leaderboard'
import { useI18n } from '@/components/I18nProvider'

import { WordDef, RewardDef, LessonDef, TopicDef } from '@/types/vocab'
import { TOPICS, LESSONS, CONFETTI_COLORS, ENCOURAGEMENTS } from '@/data/topics'

// ============ GUEST BANNER ============
function GuestBanner() {
  const router = useRouter()
  const { t } = useI18n()
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    setIsGuest(typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true')
  }, [])

  if (!isGuest) return null

  return (
    <div className="mx-4 mt-3 mb-1 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-4 py-3 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">🔒</span>
          <p className="text-xs font-bold leading-tight">{t.guestBannerText}</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('guestMode'); router.push('/auth') }}
          className="shrink-0 bg-white text-indigo-700 font-black text-xs px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-all whitespace-nowrap"
        >
          {t.guestBannerBtn}
        </button>
      </div>
    </div>
  )
}

// ============ TYPES ============
type ViewType =
  | 'topic-selection'
  | 'dashboard'
  | 'flashcards'
  | 'picture-match'
  | 'listen-choose'
  | 'spelling-challenge'
  | 'whats-missing'
  | 'final-test'
  | 'lesson-complete'
  | 'game-over'

type LessonViewType = Exclude<ViewType, 'topic-selection' | 'dashboard' | 'lesson-complete' | 'game-over'>

interface ProgressData {
  xp: number
  streak: number
  completedLessons: string[]
  unlockedRewards: string[]
  lastPlayedDate: string
}

function normalizeProgress(progress: ProgressData): ProgressData {
  const completedLessons = progress.completedLessons.map((id) => {
    if (!id.includes(':')) {
      return `kitchen:${id}`
    }
    return id
  })
  const unlockedRewards = progress.unlockedRewards.map((id) => {
    if (!id.includes(':')) {
      return `kitchen:${id}`
    }
    return id
  })
  return {
    ...progress,
    completedLessons,
    unlockedRewards,
  }
}

// ============ VIRTUAL REWARD BADGES PER TOPIC ============
const VIRTUAL_REWARD_INFO: Record<string, { emoji: string; name: string; nameEs: string }[]> = {
  kitchen: [
    { emoji: '🥉', name: 'Kitchen Apprentice', nameEs: 'Aprendiz de Cocina' },
    { emoji: '🥈', name: 'Sous Chef', nameEs: 'Cocinero Asistente' },
    { emoji: '🏆', name: 'Master Chef', nameEs: 'Maestro de Cocina' },
  ],
  vacation: [
    { emoji: '🥉', name: 'Beach Traveler', nameEs: 'Viajero de Playa' },
    { emoji: '🥈', name: 'Beach Explorer', nameEs: 'Explorador de Playa' },
    { emoji: '🏆', name: 'Summer Legend', nameEs: 'Leyenda del Verano' },
  ],
}

function getStoredRewardType(topicId: string): 'virtual' | 'real' {
  if (typeof window === 'undefined') return 'real'
  const saved = localStorage.getItem(`rewardsType_${topicId}`)
  return saved === 'virtual' ? 'virtual' : 'real'
}

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

// API-based progress functions (SQLite via Prisma)
async function loadProgressFromDB(studentName: string): Promise<ProgressData & { isNew?: boolean }> {
  try {
    const res = await fetch(`/api/progress?name=${encodeURIComponent(studentName)}`)
    if (!res.ok) throw new Error('Failed to load')
    return await res.json()
  } catch {
    return { xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '', isNew: true }
  }
}

async function saveProgressToDB(studentName: string, progress: ProgressData) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: studentName, ...progress }),
    })
  } catch { /* ignore */ }
}

// localStorage for progress - with defensive protection against overwriting with empty data
function loadProgressLocal(): ProgressData {
  if (typeof window === 'undefined') {
    return { xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '' }
  }
  try {
    const stored = localStorage.getItem('kitchen-vocab-progress')
    if (stored) return JSON.parse(stored) as ProgressData
  } catch { /* ignore */ }
  return { xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '' }
}

function saveProgressLocal(progress: ProgressData) {
  if (typeof window === 'undefined') return
  try {
    // Defensive: never overwrite existing progress with empty/zero data
    const existing = localStorage.getItem('kitchen-vocab-progress')
    if (existing) {
      const existingData = JSON.parse(existing) as ProgressData
      // If new progress has zero XP but existing has progress, don't overwrite
      if (progress.xp === 0 && existingData.xp > 0) {
        return
      }
    }
    localStorage.setItem('kitchen-vocab-progress', JSON.stringify(progress))
  } catch { /* ignore */ }
}

// Force save - used when we're certain the data is correct (e.g., after loading from DB)
function forceSaveProgressLocal(progress: ProgressData) {
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
function Dashboard({
  progress,
  activeTopic,
  onSelectLesson,
  studentName,
  onSwitchStudent,
  onBackToTopics,
  rewardType = 'real',
}: {
  progress: ProgressData
  activeTopic: TopicDef
  onSelectLesson: (id: LessonViewType) => void
  studentName: string
  onSwitchStudent: () => void
  onBackToTopics: () => void
  rewardType?: 'virtual' | 'real'
}) {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState<'lessons' | 'leaderboard'>('lessons')
  const isCompleted = (id: string): boolean => progress.completedLessons.includes(`${activeTopic.id}:${id}`)
  const totalLessons = LESSONS.length
  const completedCount = progress.completedLessons.filter((id) => id.startsWith(`${activeTopic.id}:`)).length
  const overallProgress = (completedCount / totalLessons) * 100

  return (

    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeTopic.icon}</span>
            <div>
              <span className="font-bold text-lg text-gray-800">{activeTopic.displayName}</span>
              <p className="text-xs text-gray-400 -mt-0.5">Hi, {studentName}! 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBackToTopics} className="text-xs font-bold text-duo-blue hover:text-duo-blue/80 underline shrink-0">← Themes</button>
            <button onClick={onSwitchStudent} className="text-xs text-gray-400 hover:text-gray-600 underline" title="Switch student">Switch</button>
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-orange-600">{progress.streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-yellow-600">{progress.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Banner */}
      <GuestBanner />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Welcome */}
          <div className="text-center mb-6">
            <Mascot size={56} />
            <h1 className="text-2xl font-bold text-gray-800 mt-2">
              {overallProgress === 100 ? 'You did it! All done! 🎉' : `Let's learn ${activeTopic.displayName}!`}
            </h1>
            <p className="text-gray-500 mt-1">{activeTopic.name}</p>
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

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'lessons'
                  ? 'bg-gradient-to-r from-duo-green to-emerald-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {lang === 'es' ? '📚 LECCIONES' : '📚 LESSONS'}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {lang === 'es' ? '🏆 LIGA DE COCINA' : '🏆 KITCHEN LEAGUE'}
            </button>
          </div>

          {activeTab === 'lessons' ? (
            <>
              {/* Rewards Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    {rewardType === 'virtual' ? '🌟 Virtual Badges' : '🎁 Rewards'}
                  </h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    rewardType === 'virtual'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {rewardType === 'virtual' ? (lang === 'es' ? 'Virtual' : 'Virtual') : (lang === 'es' ? 'Reales' : 'Real')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {rewardType === 'virtual'
                    ? activeTopic.rewards.map((reward, idx) => {
                        const virtualInfo = VIRTUAL_REWARD_INFO[activeTopic.id]?.[idx]
                        const isUnlocked = progress.unlockedRewards.includes(`${activeTopic.id}:${reward.id}`)
                        const lessonsCompleted = completedCount
                        const rewardProgress = Math.min((lessonsCompleted / reward.lessonsRequired) * 100, 100)
                        return (
                          <Card
                            key={reward.id}
                            className={`border-0 shadow-md overflow-hidden ${isUnlocked ? 'animate-reward-glow' : ''}`}
                          >
                            <CardContent className="p-3 flex flex-col items-center text-center">
                              <div className={`relative w-20 h-20 mb-2 flex items-center justify-center rounded-2xl ${
                                isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-amber-100' : 'bg-gray-100'
                              }`}>
                                <span className={`text-4xl transition-all ${!isUnlocked ? 'grayscale opacity-30' : ''}`}>
                                  {virtualInfo?.emoji || '🏅'}
                                </span>
                                {!isUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl">🔒</span>
                                  </div>
                                )}
                                {isUnlocked && (
                                  <div className="absolute -top-1 -right-1 text-lg animate-float-star">⭐</div>
                                )}
                              </div>
                              <p className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-duo-gold' : 'text-gray-400'}`}>
                                {lang === 'es' ? virtualInfo?.nameEs : virtualInfo?.name}
                              </p>
                              {!isUnlocked && (
                                <div className="w-full mt-1.5">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-duo-orange rounded-full h-1.5 transition-all" style={{ width: `${rewardProgress}%` }} />
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{lessonsCompleted}/{reward.lessonsRequired} lessons</p>
                                </div>
                              )}
                              {isUnlocked && (
                                <span className="text-[10px] font-bold text-duo-green mt-1">✅ Earned!</span>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })
                    : activeTopic.rewards.map((reward) => {
                        const isUnlocked = progress.unlockedRewards.includes(`${activeTopic.id}:${reward.id}`)
                        const lessonsCompleted = completedCount
                        const rewardProgress = Math.min((lessonsCompleted / reward.lessonsRequired) * 100, 100)
                        return (
                          <Card
                            key={reward.id}
                            className={`border-0 shadow-md overflow-hidden ${isUnlocked ? 'animate-reward-glow' : ''}`}
                          >
                            <CardContent className="p-3 flex flex-col items-center text-center">
                              <div className={`relative w-20 h-20 mb-2 ${!isUnlocked ? 'reward-locked' : ''}`}>
                                <img src={reward.image} alt={reward.name} className="w-full h-full object-contain" />
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
                                    <div className="bg-duo-orange rounded-full h-1.5 transition-all" style={{ width: `${rewardProgress}%` }} />
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
                      })
                  }
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
                        onClick={() => onSelectLesson(lesson.id as LessonViewType)}
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
            </>
          ) : (
            <Leaderboard
              studentName={studentName}
              userXp={progress.xp}
              topicId={activeTopic.id}
              topicName={activeTopic.name}
              topicIcon={activeTopic.icon}
            />
          )}

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
function FlashcardView({ words, onComplete, onBack }: { words: WordDef[]; onComplete: (xp: number) => void; onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animClass, setAnimClass] = useState('')
  const total = words.length
  const currentWord = words[currentIndex]

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
function createPictureMatchRound(words: WordDef[]): { targetWord: WordDef; options: WordDef[] } {
  const shuffled = shuffleArray(words)
  const target = shuffled[0]
  const distractors = getRandomItems(words, 3, [target])
  const options = shuffleArray([target, ...distractors])
  return { targetWord: target, options }
}

function PictureMatchView({ words, onComplete, onGameOver, onBack }: { words: WordDef[]; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [roundData, setRoundData] = useState(() => createPictureMatchRound(words))
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    setRoundData(createPictureMatchRound(words))
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
function createListenRound(words: WordDef[]): { targetWord: WordDef; options: string[] } {
  const shuffled = shuffleArray(words)
  const target = shuffled[0]
  const distractors = getRandomItems(words.map((w) => w.word), 3, [target.word])
  const options = shuffleArray([target.word, ...distractors])
  return { targetWord: target, options }
}

function ListenChooseView({ words, onComplete, onGameOver, onBack }: { words: WordDef[]; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [roundData, setRoundData] = useState(() => createListenRound(words))
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const [isSpelling, setIsSpelling] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0) // Track wrong attempts per word
  const [showHint, setShowHint] = useState(false) // Show spelling hint
  const [learningMode, setLearningMode] = useState(false) // Auto-spell repeatedly after 3 misses
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spellingLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    // Stop any repeating spelling loop
    if (spellingLoopRef.current) {
      clearInterval(spellingLoopRef.current)
      spellingLoopRef.current = null
    }
    setRoundData(createListenRound(words))
    setSelected(null)
    setFeedback(null)
    setIsSpelling(false)
    setWrongAttempts(0)
    setShowHint(false)
    setLearningMode(false)
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
      const newWrongAttempts = wrongAttempts + 1
      setWrongAttempts(newWrongAttempts)

      // After 2 wrong attempts, show hint and spell once
      if (newWrongAttempts >= 2 && !showHint) {
        setShowHint(true)
        setTimeout(() => {
          spellAndSpeak(roundData.targetWord.word)
        }, 1200)
      }

      // After 3 wrong attempts, enter learning mode: spell the word REPEATEDLY
      if (newWrongAttempts >= 3 && !learningMode) {
        setLearningMode(true)
        // Start repeating the spelling every 5 seconds until the user gets it right
        setTimeout(() => {
          spellAndSpeak(roundData.targetWord.word)
          if (spellingLoopRef.current) clearInterval(spellingLoopRef.current)
          spellingLoopRef.current = setInterval(() => {
            spellAndSpeak(roundData.targetWord.word)
          }, 6000)
        }, 1500)
      }

      setHearts(newHearts)
      if (newHearts <= 0) {
        // Stop spelling loop on game over
        if (spellingLoopRef.current) {
          clearInterval(spellingLoopRef.current)
          spellingLoopRef.current = null
        }
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1000)
      }
    }
  }, [feedback, roundData, hearts, xpEarned, round, totalRounds, onComplete, onGameOver, advanceRound, wrongAttempts, showHint, learningMode])

  // Cleanup spelling loop on unmount
  useEffect(() => {
    return () => {
      if (spellingLoopRef.current) {
        clearInterval(spellingLoopRef.current)
        spellingLoopRef.current = null
      }
    }
  }, [])

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
          {learningMode && (
            <div className="mt-2 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-4 py-2 animate-slide-up">
              <p className="text-sm font-bold text-yellow-700">📚 Learning mode! Listen carefully to the spelling...</p>
              <p className="text-2xl font-black text-yellow-800 mt-1 tracking-widest">{roundData.targetWord.word.toUpperCase()}</p>
            </div>
          )}
          {showHint && !learningMode && (
            <div className="mt-2 bg-purple-50 border-2 border-duo-purple/30 rounded-xl px-4 py-2 animate-slide-up">
              <p className="text-sm font-bold text-duo-purple">💡 Hint: {roundData.targetWord.word.toUpperCase().split('').join(' - ')}</p>
            </div>
          )}
        </div>
        <div className={`w-full max-w-sm space-y-3 ${animClass}`}>
          {roundData.options.map((option) => {
            const isCorrect = option === roundData.targetWord.word
            const isSelected = option === selected
            let btnClass = 'w-full duo-button text-lg font-bold py-5 rounded-2xl transition-all'
            if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white animate-pulse-grow'
            else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white animate-shake'
            else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
            else if (learningMode && isCorrect && !feedback) btnClass += ' bg-duo-green/20 text-duo-green border-2 border-duo-green animate-pulse'
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
function createSpellingRound(words: WordDef[]): { targetWord: WordDef; scrambledLetters: string[] } {
  const shuffled = shuffleArray(words)
  const target = shuffled[0]
  const letters = shuffleArray(target.word.split(''))
  return { targetWord: target, scrambledLetters: letters }
}

function SpellingChallengeView({ words, onComplete, onGameOver, onBack }: { words: WordDef[]; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [roundData, setRoundData] = useState(() => createSpellingRound(words))
  const [selectedLetters, setSelectedLetters] = useState<(string | null)[]>(() => Array(roundData.targetWord.word.length).fill(null))
  const [usedIndices, setUsedIndices] = useState<Set<number>>(() => new Set())
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [learningMode, setLearningMode] = useState(false)
  const spellingLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalRounds = 8
  const targetWord = roundData.targetWord.word

  const advanceRound = useCallback(() => {
    if (spellingLoopRef.current) {
      clearInterval(spellingLoopRef.current)
      spellingLoopRef.current = null
    }
    const newRoundData = createSpellingRound(words)
    setRoundData(newRoundData)
    setSelectedLetters(Array(newRoundData.targetWord.word.length).fill(null))
    setUsedIndices(new Set())
    setFeedback(null)
    setWrongAttempts(0)
    setShowHint(false)
    setLearningMode(false)
    setAnimClass('animate-slide-up')
    setTimeout(() => setAnimClass(''), 400)
  }, [words])

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
        const newWrongAttempts = wrongAttempts + 1
        setWrongAttempts(newWrongAttempts)

        // After 2 wrong attempts, spell the word and show hint
        if (newWrongAttempts >= 2 && !showHint) {
          setShowHint(true)
          setTimeout(() => {
            spellAndSpeak(targetWord)
          }, 1200)
        }

        // After 3 wrong attempts, enter learning mode: spell REPEATEDLY
        if (newWrongAttempts >= 3 && !learningMode) {
          setLearningMode(true)
          setTimeout(() => {
            spellAndSpeak(targetWord)
            if (spellingLoopRef.current) clearInterval(spellingLoopRef.current)
            spellingLoopRef.current = setInterval(() => {
              spellAndSpeak(targetWord)
            }, 6000)
          }, 1500)
        }

        setHearts(newHearts)
        if (newHearts <= 0) {
          if (spellingLoopRef.current) {
            clearInterval(spellingLoopRef.current)
            spellingLoopRef.current = null
          }
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
    const letterToRemove = selectedLetters[slotIndex]
    if (letterToRemove === null) return

    const newSelected = [...selectedLetters]
    newSelected[slotIndex] = null
    setSelectedLetters(newSelected)
    
    setUsedIndices((prev) => {
      const newUsedIndices = new Set(prev)
      // Remover el índice más reciente que coincida con esta letra para mantener consistencia visual
      for (const idx of Array.from(newUsedIndices).reverse()) {
        if (roundData.scrambledLetters[idx] === letterToRemove) {
          newUsedIndices.delete(idx)
          break
        }
      }
      return newUsedIndices
    })
  }, [feedback, selectedLetters, roundData.scrambledLetters])

  const handleHearWord = useCallback(() => {
    speakWord(targetWord)
  }, [targetWord])

  // Cleanup spelling loop on unmount
  useEffect(() => {
    return () => {
      if (spellingLoopRef.current) {
        clearInterval(spellingLoopRef.current)
        spellingLoopRef.current = null
      }
    }
  }, [])

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

          <Button onClick={handleHearWord} className="w-full duo-button bg-duo-blue hover:bg-duo-blue/90 text-white font-bold text-base py-4 rounded-2xl mb-2">
            🔊 Hear the word
          </Button>

          {learningMode && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-4 py-2 text-center animate-slide-up">
              <p className="text-sm font-bold text-yellow-700">📚 Learning mode! Listen and spell along...</p>
              <p className="text-2xl font-black text-yellow-800 mt-1 tracking-widest">{targetWord.toUpperCase()}</p>
            </div>
          )}

          {showHint && !learningMode && (
            <div className="mb-4 bg-blue-50 border-2 border-duo-blue/30 rounded-xl px-4 py-2 text-center animate-slide-up">
              <p className="text-sm font-bold text-duo-blue">💡 Hint: {targetWord.toUpperCase().split('').join(' - ')}</p>
            </div>
          )}

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
function createMissingRound(words: WordDef[]): { targetWord: WordDef; displayWord: string; missingIndex: number; missingLetter: string; options: string[] } {
  const shuffled = shuffleArray(words)
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

function WhatsMissingView({ words, onComplete, onGameOver, onBack }: { words: WordDef[]; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [roundData, setRoundData] = useState(() => createMissingRound(words))
  const [animClass, setAnimClass] = useState('animate-slide-up')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [learningMode, setLearningMode] = useState(false)
  const spellingLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalRounds = 8

  const advanceRound = useCallback(() => {
    if (spellingLoopRef.current) {
      clearInterval(spellingLoopRef.current)
      spellingLoopRef.current = null
    }
    setRoundData(createMissingRound(words))
    setSelected(null)
    setFeedback(null)
    setWrongAttempts(0)
    setShowHint(false)
    setLearningMode(false)
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
      const newWrongAttempts = wrongAttempts + 1
      setWrongAttempts(newWrongAttempts)

      // After 2 wrong attempts, spell the word to help
      if (newWrongAttempts >= 2 && !showHint) {
        setShowHint(true)
        setTimeout(() => {
          spellAndSpeak(roundData.targetWord.word)
        }, 1200)
      }

      // After 3 wrong attempts, enter learning mode: spell REPEATEDLY
      if (newWrongAttempts >= 3 && !learningMode) {
        setLearningMode(true)
        setTimeout(() => {
          spellAndSpeak(roundData.targetWord.word)
          if (spellingLoopRef.current) clearInterval(spellingLoopRef.current)
          spellingLoopRef.current = setInterval(() => {
            spellAndSpeak(roundData.targetWord.word)
          }, 6000)
        }, 1500)
      }

      setHearts(newHearts)
      if (newHearts <= 0) {
        if (spellingLoopRef.current) {
          clearInterval(spellingLoopRef.current)
          spellingLoopRef.current = null
        }
        setTimeout(() => onGameOver(xpEarned), 800)
      } else {
        setTimeout(() => { setSelected(null); setFeedback(null) }, 1000)
      }
    }
  }, [feedback, roundData, hearts, xpEarned, round, totalRounds, onComplete, onGameOver, advanceRound, wrongAttempts, showHint, learningMode])

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

          <div className="flex justify-center mb-2 flex-wrap">
            {renderDisplayWord()}
          </div>

          {learningMode && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-4 py-2 text-center animate-slide-up">
              <p className="text-sm font-bold text-yellow-700">📚 Learning mode! Listen carefully...</p>
              <p className="text-2xl font-black text-yellow-800 mt-1 tracking-widest">{roundData.targetWord.word.toUpperCase()}</p>
            </div>
          )}

          {showHint && !learningMode && (
            <div className="mb-4 bg-pink-50 border-2 border-duo-pink/30 rounded-xl px-4 py-2 text-center animate-slide-up">
              <p className="text-sm font-bold text-duo-pink">💡 Hint: {roundData.targetWord.word.toUpperCase().split('').join(' - ')}</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            {roundData.options.map((letter) => {
              const isCorrect = letter === roundData.missingLetter
              const isSelected = letter === selected
              let btnClass = 'w-full aspect-square rounded-2xl text-2xl font-bold flex items-center justify-center transition-all'
              if (feedback === 'correct' && isCorrect) btnClass += ' bg-duo-green text-white animate-pulse-grow shadow-lg'
              else if (feedback === 'wrong' && isSelected && !isCorrect) btnClass += ' bg-duo-red text-white animate-shake'
              else if (feedback && !isCorrect) btnClass += ' bg-gray-100 text-gray-400'
              else if (learningMode && isCorrect && !feedback) btnClass += ' bg-duo-green/20 text-duo-green border-2 border-duo-green animate-pulse'
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

// Cleanup spelling loops when WhatsMissingView unmounts
// (Handled inside the component via useRef)

// ============ FINAL TEST - PICTURE MATCH SUB-COMPONENT ============
function FinalPictureMatch({ targetWord, options, onAnswer }: {
  targetWord: WordDef; options: WordDef[]
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
  targetWord: WordDef; options: string[]
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
  targetWord: WordDef; scrambledLetters: string[]
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
  targetWord: WordDef; displayWord: string; missingLetter: string; options: string[]
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
  targetWord: WordDef
  pictureOptions?: WordDef[]
  wordOptions?: string[]
  scrambledLetters?: string[]
  displayWord?: string
  missingLetter?: string
  letterOptions?: string[]
}

function createFinalTestQuestions(words: WordDef[]): FinalTestQuestion[] {
  const questions: FinalTestQuestion[] = []

  for (let i = 0; i < 3; i++) {
    const pm = createPictureMatchRound(words)
    questions.push({ type: 'picture-match', targetWord: pm.targetWord, pictureOptions: pm.options })
  }

  for (let i = 0; i < 3; i++) {
    const lc = createListenRound(words)
    questions.push({ type: 'listen-choose', targetWord: lc.targetWord, wordOptions: lc.options })
  }

  for (let i = 0; i < 3; i++) {
    const sp = createSpellingRound(words)
    questions.push({ type: 'spelling', targetWord: sp.targetWord, scrambledLetters: sp.scrambledLetters })
  }

  for (let i = 0; i < 3; i++) {
    const wm = createMissingRound(words)
    questions.push({ type: 'whats-missing', targetWord: wm.targetWord, displayWord: wm.displayWord, missingLetter: wm.missingLetter, letterOptions: wm.options })
  }

  return shuffleArray(questions)
}

function FinalTestView({ words, onComplete, onGameOver, onBack }: { words: WordDef[]; onComplete: (xp: number) => void; onGameOver: (xp: number) => void; onBack: () => void }) {
  const [questions] = useState(() => createFinalTestQuestions(words))
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

// ============ REWARD STYLE MODAL ============
function RewardStyleModal({
  topicId,
  onSelect,
  onCancel,
}: {
  topicId: string
  onSelect: (type: 'virtual' | 'real') => void
  onCancel: () => void
}) {
  const { t, lang } = useI18n()
  const topic = TOPICS.find((tp) => tp.id === topicId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full animate-reward-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-5xl mb-3">{topic?.icon || '📚'}</div>
          <h2 className="text-2xl font-black text-gray-800 leading-tight">
            {lang === 'es' ? '¿Cómo quieres tus premios?' : 'How do you want your prizes?'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {lang === 'es'
              ? 'Elige el tipo de recompensas para este tema'
              : 'Choose the reward style for this topic'}
          </p>
        </div>

        {/* Virtual Option */}
        <button onClick={() => onSelect('virtual')} className="w-full mb-3 group">
          <div className="relative overflow-hidden border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl p-5 flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <div className="flex flex-col items-center shrink-0 w-14">
              <span className="text-4xl">🌟</span>
              <div className="flex gap-0.5 mt-1">
                <span className="text-base">🥉</span>
                <span className="text-base">🥈</span>
                <span className="text-base">🏆</span>
              </div>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-black text-lg text-indigo-700 leading-tight">
                {lang === 'es' ? t.virtualRewardsTitle : 'Virtual Badges'}
              </h3>
              <p className="text-sm text-indigo-400 mt-0.5">
                {lang === 'es'
                  ? 'Medallas digitales que ganas dentro de la app'
                  : 'Digital medals you earn inside the app'}
              </p>
            </div>
            <span className="text-indigo-300 group-hover:text-indigo-600 text-2xl transition-colors">→</span>
          </div>
        </button>

        {/* Real Option */}
        <button onClick={() => onSelect('real')} className="w-full group">
          <div className="relative overflow-hidden border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-5 flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <div className="flex flex-col items-center shrink-0 w-14">
              <span className="text-4xl">🎁</span>
              <span className="text-xs font-bold text-emerald-600 mt-1">{lang === 'es' ? 'REALES' : 'REAL'}</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-black text-lg text-emerald-700 leading-tight">
                {lang === 'es' ? t.realRewardsTitle : 'Real Prizes'}
              </h3>
              <p className="text-sm text-emerald-400 mt-0.5">
                {lang === 'es'
                  ? 'Premios físicos que papá y mamá dan en casa'
                  : 'Physical prizes from Mom & Dad at home'}
              </p>
            </div>
            <span className="text-emerald-300 group-hover:text-emerald-600 text-2xl transition-colors">→</span>
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="mt-5 w-full text-center text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors py-1"
        >
          {lang === 'es' ? 'Cancelar' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}

// ============ TOPIC SELECTION VIEW ============
function TopicSelectionView({
  progress,
  studentName,
  onSelectTopic,
  onSwitchStudent
}: {
  progress: ProgressData
  studentName: string
  onSelectTopic: (topicId: string) => void
  onSwitchStudent: () => void
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦉</span>
            <div>
              <span className="font-bold text-lg text-gray-800">Study App</span>
              <p className="text-xs text-gray-400 -mt-0.5">Hi, {studentName}! 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSwitchStudent} className="text-xs text-gray-400 hover:text-gray-600 underline shrink-0">Switch</button>
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-orange-600">{progress.streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-yellow-600">{progress.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Banner */}
      <GuestBanner />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <span className="text-5xl animate-float block mb-2">📚</span>
            <h1 className="text-2xl font-black text-gray-800">Elige un Tema para Practicar</h1>
            <p className="text-gray-500 mt-1">¡Aprende y gana recompensas reales!</p>
          </div>

          <div className="space-y-4">
            {TOPICS.map((topic) => {
              const completedCount = progress.completedLessons.filter((id) => id.startsWith(`${topic.id}:`)).length
              const overallProgress = (completedCount / LESSONS.length) * 100

              return (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className="w-full text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all" style={{ borderLeft: `8px solid ${topic.color}` }}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: topic.bgColor }}>
                        {topic.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{topic.displayName}</h3>
                        <p className="text-xs text-gray-500">{topic.name}</p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, backgroundColor: topic.color }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 shrink-0">{completedCount}/{LESSONS.length}</span>
                        </div>
                      </div>
                      <div className="text-2xl text-gray-300">→</div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ MAIN APP ============
export default function KitchenVocabApp() {
  const [studentName, setStudentName] = useState<string>('')
  const [nameInput, setNameInput] = useState('')
  const [activeTopicId, setActiveTopicId] = useState<string>('kitchen')
  const [view, setView] = useState<ViewType>('topic-selection')
  const [progress, setProgress] = useState<ProgressData>({
    xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: ''
  })
  const [currentLessonId, setCurrentLessonId] = useState<LessonViewType>('flashcards')
  const [pendingReward, setPendingReward] = useState<RewardDef | null>(null)
  const [lastXpEarned, setLastXpEarned] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [welcomeBack, setWelcomeBack] = useState(false)
  const [rewardModalTopicId, setRewardModalTopicId] = useState<string | null>(null)

  const activeTopic = useMemo(() => {
    return TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0]
  }, [activeTopicId])

  // Check if student name is saved in localStorage on mount
  useEffect(() => {
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('kitchen-vocab-student') : ''
    if (savedName) {
      setStudentName(savedName)
      setNameInput(savedName)
      // Load progress: localStorage is primary (reliable), API is secondary
      const localProgress = loadProgressLocal()
      loadProgressFromDB(savedName).then((dbProgress) => {
        // Pick the one with MORE progress (more XP = more saved data)
        // Also check completedLessons length as a secondary indicator
        const dbIsBetter = dbProgress.xp > localProgress.xp ||
          (dbProgress.xp === localProgress.xp && dbProgress.completedLessons.length > localProgress.completedLessons.length)
        const bestProgress = normalizeProgress(dbIsBetter ? dbProgress : localProgress)

        const today = getTodayString()
        const yesterday = getYesterdayString()
        if (bestProgress.lastPlayedDate === today) {
          // Same day, keep streak
        } else if (bestProgress.lastPlayedDate === yesterday) {
          bestProgress.streak += 1
        } else if (bestProgress.lastPlayedDate) {
          bestProgress.streak = 1
        } else {
          bestProgress.streak = 1
        }
        bestProgress.lastPlayedDate = today
        if (bestProgress.xp > 0) setWelcomeBack(true)
        setProgress(bestProgress)
        // Force save the best version to both storages (bypass defensive check for initial sync)
        forceSaveProgressLocal(bestProgress)
        saveProgressToDB(savedName, bestProgress)
        setIsHydrated(true)
      }).catch(() => {
        // API failed (e.g., DB not configured yet), use localStorage only
        const today = getTodayString()
        const yesterday = getYesterdayString()
        const bestProgress = normalizeProgress(localProgress)
        if (bestProgress.lastPlayedDate === today) {
          // Same day, keep streak
        } else if (bestProgress.lastPlayedDate === yesterday) {
          bestProgress.streak += 1
        } else if (bestProgress.lastPlayedDate) {
          bestProgress.streak = 1
        } else {
          bestProgress.streak = 1
        }
        bestProgress.lastPlayedDate = today
        if (bestProgress.xp > 0) setWelcomeBack(true)
        setProgress(bestProgress)
        forceSaveProgressLocal(bestProgress)
        setIsHydrated(true)
      })
    } else {
      setIsHydrated(true) // Show name entry screen
    }
  }, [])

  // Save progress when page is hidden or about to close (critical for mobile!)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isHydrated && studentName) {
        // Use the latest progress from localStorage (state might be stale in this handler)
        const currentLocal = loadProgressLocal()
        saveProgressToDB(studentName, currentLocal)
      }
    }
    const handleBeforeUnload = () => {
      if (isHydrated && studentName) {
        const currentLocal = loadProgressLocal()
        saveProgressToDB(studentName, currentLocal)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isHydrated, studentName])

  // Save progress to DB + localStorage whenever it changes
  useEffect(() => {
    if (isHydrated && studentName) {
      saveProgressToDB(studentName, progress)
      saveProgressLocal(progress)
    }
  }, [progress, isHydrated, studentName])

  const handleNameSubmit = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setIsLoading(true)
    localStorage.setItem('kitchen-vocab-student', trimmed)
    setStudentName(trimmed)
    // Load progress: localStorage is primary, API is secondary
    const localProgress = loadProgressLocal()
    let bestProgress: ProgressData
    try {
      const dbProgress = await loadProgressFromDB(trimmed)
      bestProgress = normalizeProgress(dbProgress.xp > localProgress.xp ? dbProgress : localProgress)
    } catch {
      bestProgress = normalizeProgress(localProgress)
    }
    const today = getTodayString()
    const yesterday = getYesterdayString()
    if (bestProgress.lastPlayedDate === today) {
      // Same day, keep streak
    } else if (bestProgress.lastPlayedDate === yesterday) {
      bestProgress.streak += 1
    } else if (bestProgress.lastPlayedDate) {
      bestProgress.streak = 1
    } else {
      bestProgress.streak = 1
    }
    bestProgress.lastPlayedDate = today
    if (bestProgress.xp > 0) setWelcomeBack(true)
    setProgress(bestProgress)
    forceSaveProgressLocal(bestProgress)
    saveProgressToDB(trimmed, bestProgress)
    setIsLoading(false)
  }

  const handleSwitchStudent = () => {
    setStudentName('')
    setNameInput('')
    setWelcomeBack(false)
    localStorage.removeItem('kitchen-vocab-student')
    setProgress({ xp: 0, streak: 0, completedLessons: [], unlockedRewards: [], lastPlayedDate: '' })
    setView('topic-selection')
  }

  // Check for reward unlocks
  const checkRewards = useCallback((updatedProgress: ProgressData): RewardDef | null => {
    if (!activeTopicId) return null
    const activeT = TOPICS.find((t) => t.id === activeTopicId)
    if (!activeT) return null

    const lessonsCompleted = updatedProgress.completedLessons.filter((id) => 
      id.startsWith(`${activeTopicId}:`) && LESSONS.some((l) => `${activeTopicId}:${l.id}` === id)
    ).length

    for (const reward of activeT.rewards) {
      const scopedRewardId = `${activeTopicId}:${reward.id}`
      if (!updatedProgress.unlockedRewards.includes(scopedRewardId) && lessonsCompleted >= reward.lessonsRequired) {
        return reward
      }
    }
    return null
  }, [activeTopicId])

  const handleSelectLesson = useCallback((id: LessonViewType) => {
    setCurrentLessonId(id)
    setView(id)
  }, [])

  const handleLessonComplete = useCallback((xpEarned: number) => {
    setLastXpEarned(xpEarned)
    setProgress((prev) => {
      const scopedLessonId = `${activeTopicId}:${currentLessonId}`
      const newCompleted = prev.completedLessons.includes(scopedLessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, scopedLessonId]
      const updated = {
        ...prev,
        xp: prev.xp + xpEarned,
        completedLessons: newCompleted,
        lastPlayedDate: getTodayString(),
      }
      const reward = checkRewards(updated)
      if (reward) {
        const scopedRewardId = `${activeTopicId}:${reward.id}`
        const withReward = {
          ...updated,
          unlockedRewards: [...updated.unlockedRewards, scopedRewardId],
        }
        setTimeout(() => setPendingReward(reward), 500)
        return withReward
      }
      return updated
    })
    setView('lesson-complete')
  }, [currentLessonId, activeTopicId, checkRewards])

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

  const handleSelectTopic = useCallback((topicId: string) => {
    setActiveTopicId(topicId)
    const existing = typeof window !== 'undefined' ? localStorage.getItem(`rewardsType_${topicId}`) : null
    if (existing === 'virtual' || existing === 'real') {
      setView('dashboard')
    } else {
      setRewardModalTopicId(topicId)
    }
  }, [])

  const handleRewardTypeChosen = useCallback((type: 'virtual' | 'real') => {
    if (!rewardModalTopicId) return
    localStorage.setItem(`rewardsType_${rewardModalTopicId}`, type)
    setRewardModalTopicId(null)
    setView('dashboard')
  }, [rewardModalTopicId])

  // Name entry screen
  if (isHydrated && !studentName) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4 animate-float">🦉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Study App</h1>
          <p className="text-gray-500 mb-6">What&apos;s your name?</p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            placeholder="Type your name..."
            autoFocus
            className="w-full text-center text-2xl font-bold text-gray-900 placeholder:text-gray-400 py-4 px-6 rounded-2xl border-2 border-gray-200 focus:border-duo-green focus:outline-none transition-colors mb-4"
            disabled={isLoading}
          />
          <button
            onClick={handleNameSubmit}
            disabled={!nameInput.trim() || isLoading}
            className="w-full py-4 rounded-2xl font-bold text-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: nameInput.trim() ? '#58CC02' : '#D0D0D0' }}
          >
            {isLoading ? 'Loading...' : 'Let\'s go! 🚀'}
          </button>
        </div>
      </div>
    )
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
      {view === 'topic-selection' && (
        <TopicSelectionView progress={progress} studentName={studentName} onSelectTopic={handleSelectTopic} onSwitchStudent={handleSwitchStudent} />
      )}
      {view === 'dashboard' && (
        <Dashboard
          progress={progress}
          activeTopic={activeTopic}
          onSelectLesson={handleSelectLesson}
          studentName={studentName}
          onSwitchStudent={handleSwitchStudent}
          onBackToTopics={() => setView('topic-selection')}
          rewardType={getStoredRewardType(activeTopicId)}
        />
      )}
      {view === 'flashcards' && (
        <FlashcardView words={activeTopic.words} onComplete={handleLessonComplete} onBack={handleBackToDashboard} />
      )}
      {view === 'picture-match' && (
        <PictureMatchView words={activeTopic.words} onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'listen-choose' && (
        <ListenChooseView words={activeTopic.words} onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'spelling-challenge' && (
        <SpellingChallengeView words={activeTopic.words} onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'whats-missing' && (
        <WhatsMissingView words={activeTopic.words} onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
      )}
      {view === 'final-test' && (
        <FinalTestView words={activeTopic.words} onComplete={handleLessonComplete} onGameOver={handleGameOver} onBack={handleBackToDashboard} />
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

      {/* Reward Style Selection Modal */}
      {rewardModalTopicId && (
        <RewardStyleModal
          topicId={rewardModalTopicId}
          onSelect={handleRewardTypeChosen}
          onCancel={() => setRewardModalTopicId(null)}
        />
      )}
    </div>
  )
}
