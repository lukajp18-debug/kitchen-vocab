'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/I18nProvider'
import { Dino } from './Dino'
import { levelInfo } from '@/lib/level'
import { playComplete, playReward } from '@/lib/sound'

// Counts from `from` to `to` over `ms`, starting after `delay`.
function useCountUp(to: number, from = 0, ms = 900, delay = 300) {
  const [value, setValue] = useState(from)
  useEffect(() => {
    let raf = 0
    const timer = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / ms)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(Math.round(from + (to - from) * eased))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [to, from, ms, delay])
  return value
}

// End-of-lesson celebration: XP counting up, streak, and a level bar that fills.
// `totalXp` already includes `xpEarned` (progress is updated before this screen shows).
export function LessonComplete({ xpEarned, totalXp, streak, lessonName, onContinue, confetti }: {
  xpEarned: number; totalXp: number; streak: number; lessonName: string; onContinue: () => void; confetti?: React.ReactNode
}) {
  const { t } = useI18n()
  const tx = t.study
  const before = levelInfo(totalXp - xpEarned)
  const after = levelInfo(totalXp)
  const leveledUp = after.level > before.level
  const shownXp = useCountUp(xpEarned)
  const [barPct, setBarPct] = useState(leveledUp ? 0 : before.pct)
  const played = useRef(false)

  useEffect(() => {
    if (played.current) return
    played.current = true
    playComplete()
    const fill = setTimeout(() => setBarPct(after.pct), 700)
    const bonus = leveledUp ? setTimeout(() => playReward(), 1300) : undefined
    return () => { clearTimeout(fill); if (bonus) clearTimeout(bonus) }
  }, [after.pct, leveledUp])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-sky-50 flex flex-col items-center justify-center p-6">
      {confetti}
      <Dino size={150} mood="celebrate" className="mx-auto" />
      <h1 className="text-[26px] sm:text-3xl font-black text-gray-800 mt-2 text-center text-balance animate-slide-up">{tx.lessonComplete}</h1>
      <p className="text-lg font-bold text-gray-500 mt-1 animate-slide-up">{lessonName}</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-6">
        <div className="bg-surface rounded-[28px] border-2 border-yellow-200 border-b-[6px] p-4 text-center animate-pop-in">
          <div className="text-4xl font-black text-sun tabular-nums">+{shownXp}</div>
          <div className="text-sm font-extrabold text-gray-500 mt-1">{tx.xpEarned}</div>
        </div>
        <div className="bg-surface rounded-[28px] border-2 border-orange-200 border-b-[6px] p-4 text-center animate-pop-in">
          <div className="text-4xl font-black text-orange-500 tabular-nums"><span className="inline-block animate-flame">🔥</span>{streak}</div>
          <div className="text-sm font-extrabold text-gray-500 mt-1">{tx.streakDays(streak)}</div>
        </div>
      </div>

      <div className="w-full max-w-sm mt-3 bg-surface rounded-[28px] border-2 border-line border-b-[6px] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-brand">⭐ {tx.level(after.level)}</span>
          <span className="text-xs font-extrabold text-gray-500">{tx.toNextLevel(after.toNext)}</span>
        </div>
        <div className="h-4 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-sky transition-[width] duration-1000 ease-out"
            style={{ width: `${barPct}%` }}
          />
        </div>
        {leveledUp && (
          <p className="mt-3 text-center font-black text-brand animate-pop-in" style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}>
            {tx.levelUp(after.level)}
          </p>
        )}
      </div>

      <button
        onClick={onContinue}
        className="duo-button mt-8 w-full max-w-sm bg-go hover:brightness-105 text-white font-black text-xl py-4 rounded-2xl cursor-pointer"
      >
        {tx.continue}
      </button>
    </div>
  )
}
