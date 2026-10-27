'use client'

import { useSpeechView } from '@/lib/speech'

// One tile per letter. While the voice spells `word`, the tile of the letter being said
// lights up and bounces, so the student hears and sees each letter at the same time.
// With `reveal={false}` the letters stay hidden (dots) until the lesson reveals them,
// for exercises where seeing the word would give the answer away.
//
// The tiles shrink with the length of the word so even "neighborhood" fits on one row
// of a phone (a lone last letter wrapping to a second line looks broken).
const SIZES = {
  md: [
    { max: 8, tile: 'w-9 h-11 text-xl', gap: 'gap-1.5' },
    { max: 10, tile: 'w-7 h-10 text-lg', gap: 'gap-1' },
    { max: Infinity, tile: 'w-6 h-9 text-base', gap: 'gap-0.5' },
  ],
  lg: [
    { max: 6, tile: 'w-11 h-14 text-3xl', gap: 'gap-1.5' },
    { max: 8, tile: 'w-9 h-12 text-2xl', gap: 'gap-1.5' },
    { max: 10, tile: 'w-7 h-10 text-xl', gap: 'gap-1' },
    { max: Infinity, tile: 'w-6 h-9 text-lg', gap: 'gap-0.5' },
  ],
} as const

export function SpellStrip({ word, reveal = true, size = 'md', className = '' }: {
  word: string
  reveal?: boolean
  size?: keyof typeof SIZES
  className?: string
}) {
  const sv = useSpeechView()
  const lower = word.toLowerCase()
  const mine = sv.word === lower
  const active = mine && sv.phase === 'spelling' ? sv.index : -1
  const span = sv.span
  const saying = mine && sv.phase === 'word'
  const step = SIZES[size].find((s) => word.length <= s.max)!

  return (
    <div
      className={`flex flex-nowrap justify-center ${step.gap} ${className}`}
      role="img"
      aria-label={reveal ? word.split('').join(' ') : ''}
    >
      {word.split('').map((ch, i) => {
        if (!/[a-z]/i.test(ch)) return <span key={i} className="w-3 shrink-0" aria-hidden="true" />
        const isActive = active >= 0 && i >= active && i < active + span
        const spoken = mine && sv.phase === 'spelling' && i < active
        let cls = `${step.tile} shrink-0 rounded-lg border-2 font-black flex items-center justify-center uppercase transition-[transform,background-color,border-color,color,box-shadow] duration-150 `
        if (isActive) cls += 'bg-brand text-white border-brand scale-110 -translate-y-1 shadow-lg z-10'
        else if (spoken) cls += 'bg-brand-soft text-ink border-brand/40'
        else cls += `bg-surface text-ink border-line ${saying ? 'animate-pulse' : ''}`
        return (
          <span key={i} className={cls} aria-hidden="true">
            {reveal ? ch : isActive || spoken ? '•' : ''}
          </span>
        )
      })}
    </div>
  )
}
