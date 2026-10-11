'use client'

import { useI18n } from '@/components/I18nProvider'
import { levelInfo } from '@/lib/level'

// Header chips: streak with a live flame, and XP with the level and a mini progress bar.
export function StatChips({ streak, xp }: { streak: number; xp: number }) {
  const { t } = useI18n()
  const lvl = levelInfo(xp)
  return (
    <>
      <div className="flex items-center gap-1 bg-orange-100 px-2.5 h-11 rounded-full shrink-0" title={t.study.streakDays(streak)}>
        <span className={`text-lg inline-block ${streak > 0 ? 'animate-flame' : 'grayscale opacity-60'}`}>🔥</span>
        <span className="font-black text-orange-600">{streak}</span>
      </div>
      <div className="flex flex-col justify-center bg-yellow-100 px-2.5 h-11 rounded-full shrink-0" title={t.study.toNextLevel(lvl.toNext)}>
        <div className="flex items-center gap-1 leading-none">
          <span className="text-sm">⭐</span>
          <span className="font-black text-yellow-600 text-sm">{xp}</span>
          <span className="hidden sm:inline text-[12px] font-extrabold text-brand ml-0.5">{t.study.levelShort(lvl.level)}</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-yellow-200 overflow-hidden">
          <div className="h-full rounded-full bg-sun transition-[width] duration-700" style={{ width: `${lvl.pct}%` }} />
        </div>
      </div>
    </>
  )
}
