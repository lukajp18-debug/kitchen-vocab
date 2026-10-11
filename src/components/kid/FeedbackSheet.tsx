'use client'

import { useEffect, useMemo } from 'react'
import { useI18n } from '@/components/I18nProvider'
import { Dino } from './Dino'
import { playCorrect, playWrong } from '@/lib/sound'

// Answer feedback that slides up from the bottom: green with a happy Dino when the
// answer is right, soft coral with an encouraging Dino when it is not. It only
// presents the state the lesson already has (and plays the matching sound); it never
// changes lesson flow or timing.
export function FeedbackSheet({ feedback, message }: { feedback: 'correct' | 'wrong' | null; message?: string }) {
  const { t } = useI18n()
  const tx = t.study

  const praise = useMemo(
    () => tx.encouragements[Math.floor(Math.random() * tx.encouragements.length)],
    // A new phrase each time a correct answer appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feedback, tx]
  )

  useEffect(() => {
    if (feedback === 'correct') playCorrect()
    else if (feedback === 'wrong') playWrong()
  }, [feedback])

  if (!feedback) return null
  const correct = feedback === 'correct'
  const text = message ?? (correct ? praise : tx.tryAgain)

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none animate-sheet-up" role="status" aria-live="polite">
      <div
        className={`mx-auto max-w-lg rounded-t-[28px] border-t-4 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center gap-3 shadow-[0_-8px_30px_rgb(43_42_69/0.12)] ${
          correct ? 'bg-green-100 border-go' : 'bg-orange-50 border-oops'
        }`}
      >
        <Dino size={72} mood={correct ? 'happy' : 'cheer'} className="shrink-0 -mt-8" />
        <p className={`text-xl font-black leading-tight ${correct ? 'text-green-700' : 'text-orange-700'}`}>{text}</p>
      </div>
    </div>
  )
}
