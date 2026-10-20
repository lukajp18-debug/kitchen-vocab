'use client'

import { useRef, useState } from 'react'
import type { LessonDef } from '@/types/vocab'
import { lessonName } from '@/lib/lessonText'
import { useI18n } from '@/components/I18nProvider'

// Zigzag offsets (px) so the lessons read as a winding path, not a list.
const OFFSETS = [0, 56, 72, 56, 0, -56, -72, -56]

// Lesson path: round, raised nodes in a zigzag. Completed lessons are solid with a
// check; the first unfinished one pulses as "start here". The lessons go in order: the ones
// after it are locked until it is done (finished lessons can always be played again).
export function LessonPath({ lessons, isCompleted, onSelect }: {
  lessons: LessonDef[]; isCompleted: (id: string) => boolean; onSelect: (id: string) => void
}) {
  const { t, lang } = useI18n()
  const nextId = lessons.find((l) => !isCompleted(l.id))?.id
  const [nudge, setNudge] = useState<string | null>(null)
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tapLocked = (id: string) => {
    setNudge(id)
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current)
    nudgeTimer.current = setTimeout(() => setNudge(null), 2200)
  }

  return (
    <div className="flex flex-col items-center gap-12 pt-10 pb-4">
      {lessons.map((lesson, i) => {
        const done = isCompleted(lesson.id)
        const isNext = lesson.id === nextId
        const locked = !done && !isNext
        const solid = done || isNext
        return (
          <div key={lesson.id} className="flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}>
            <div className="relative">
              {isNext && (
                <>
                  <span className="absolute inset-0 rounded-full animate-node-ping" style={{ backgroundColor: lesson.color }} />
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-surface border-2 border-line px-3 py-1 text-xs font-black text-brand shadow-sm animate-bounce-subtle">
                    {t.study.startHere}
                  </span>
                </>
              )}
              {nudge === lesson.id && (
                <span role="status" className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-surface border-2 border-line px-3 py-1 text-xs font-black text-ink shadow-md z-10">
                  {t.study.lockedLesson}
                </span>
              )}
              <button
                onClick={() => (locked ? tapLocked(lesson.id) : onSelect(lesson.id))}
                aria-label={lessonName(lesson, lang)}
                aria-disabled={locked}
                className={`lesson-node relative w-20 h-20 rounded-full flex items-center justify-center text-3xl ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  '--node': lesson.color,
                  backgroundColor: solid ? lesson.color : `color-mix(in srgb, ${lesson.color} 22%, var(--surface))`,
                } as React.CSSProperties}
              >
                <span className={solid ? '' : 'opacity-40 grayscale'}>{lesson.icon}</span>
                {locked && (
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface text-sm flex items-center justify-center border-2 border-line">🔒</span>
                )}
                {done && (
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-go text-white text-sm font-black flex items-center justify-center border-2 border-surface animate-pop-in">✓</span>
                )}
              </button>
            </div>
            <p className="mt-2 max-w-[150px] text-center text-sm font-black text-gray-800 leading-tight">{lessonName(lesson, lang)}</p>
            <span className="mt-1 text-xs font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${lesson.color}22`, color: lesson.color }}>
              +{lesson.xpReward} XP
            </span>
          </div>
        )
      })}
    </div>
  )
}
