'use client'

// "Dino", the app mascot. Pure SVG + CSS animations (see .dino-* in globals.css),
// so it stays crisp at any size and looks the same on every phone.
export type DinoMood = 'idle' | 'happy' | 'thinking' | 'cheer' | 'celebrate'

const GREEN = '#3DBE29'
const GREEN_DARK = '#2E9420'
const BELLY = '#C9F2B8'
const SUN = '#FFC23D'
const INK = '#2B2A45'
const CHEEK = '#FF7A6B'

function Eyes({ mood }: { mood: DinoMood }) {
  // Happy-closed eyes ("^ ^") for joyful moods.
  if (mood === 'happy' || mood === 'celebrate') {
    return (
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M68 102 q12 -14 24 0" />
        <path d="M108 102 q12 -14 24 0" />
      </g>
    )
  }
  // Pupils look up-right while thinking; centered otherwise.
  const dx = mood === 'thinking' ? 4 : 2
  const dy = mood === 'thinking' ? -5 : 2
  return (
    <g>
      <circle cx="80" cy="100" r="16" fill="#fff" />
      <circle cx="120" cy="100" r="16" fill="#fff" />
      <g className="dino-blink">
        <circle cx={80 + dx} cy={100 + dy} r="8.5" fill={INK} />
        <circle cx={120 + dx} cy={100 + dy} r="8.5" fill={INK} />
        <circle cx={83 + dx} cy={97 + dy} r="3" fill="#fff" />
        <circle cx={123 + dx} cy={97 + dy} r="3" fill="#fff" />
      </g>
      {mood === 'cheer' && (
        <g stroke={INK} strokeWidth="4" strokeLinecap="round">
          <path d="M66 80 l18 -4" />
          <path d="M134 80 l-18 -4" />
        </g>
      )}
    </g>
  )
}

function Mouth({ mood }: { mood: DinoMood }) {
  if (mood === 'happy' || mood === 'celebrate') {
    return (
      <g>
        <path d="M82 120 q18 26 36 0 Z" fill={INK} />
        <path d="M91 130 q9 7 18 0 q-9 -5 -18 0 Z" fill={CHEEK} />
      </g>
    )
  }
  if (mood === 'thinking') return <ellipse cx="104" cy="128" rx="5" ry="6" fill={INK} />
  return <path d="M86 122 q14 13 28 0" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
}

function Arms({ mood }: { mood: DinoMood }) {
  const arm = { stroke: GREEN, strokeWidth: 13, strokeLinecap: 'round' as const, fill: 'none' }
  if (mood === 'celebrate') {
    return (
      <g>
        <path className="dino-wave-l" d="M56 122 q-18 -14 -16 -38" {...arm} />
        <path className="dino-wave-r" d="M144 122 q18 -14 16 -38" {...arm} />
      </g>
    )
  }
  if (mood === 'cheer') {
    return (
      <g>
        <path d="M54 134 q-14 6 -16 18" {...arm} />
        <path className="dino-pump" d="M146 124 q20 -8 18 -32" {...arm} />
        <circle className="dino-pump" cx="164" cy="88" r="9" fill={GREEN} />
      </g>
    )
  }
  if (mood === 'thinking') {
    return (
      <g>
        <path d="M54 134 q-14 6 -16 18" {...arm} />
        <path d="M146 136 q-6 -12 -26 -6" {...arm} />
      </g>
    )
  }
  if (mood === 'happy') {
    return (
      <g>
        <path d="M54 134 q-14 6 -16 18" {...arm} />
        <path className="dino-wave-r" d="M146 124 q18 -10 18 -30" {...arm} />
      </g>
    )
  }
  return (
    <g>
      <path d="M54 134 q-14 6 -16 18" {...arm} />
      <path d="M146 134 q14 6 16 18" {...arm} />
    </g>
  )
}

function Extras({ mood }: { mood: DinoMood }) {
  if (mood === 'thinking') {
    return (
      <g fill="#D9D4F5">
        <circle className="dino-dot dino-dot-1" cx="150" cy="62" r="5" />
        <circle className="dino-dot dino-dot-2" cx="164" cy="46" r="7" />
        <circle className="dino-dot dino-dot-3" cx="182" cy="26" r="10" />
      </g>
    )
  }
  if (mood === 'celebrate') {
    return (
      <g fill={SUN}>
        <path className="dino-star dino-star-1" d="M28 40 l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1 Z" />
        <path className="dino-star dino-star-2" d="M168 30 l3 7 l8 1 l-6 5 l2 8 l-7 -5 l-7 5 l2 -8 l-6 -5 l8 -1 Z" />
        <path className="dino-star dino-star-3" d="M178 110 l2 5 l6 1 l-5 3 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -3 l6 -1 Z" />
      </g>
    )
  }
  return null
}

export function Dino({ mood = 'idle', size = 120, className = '' }: { mood?: DinoMood; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`dino dino-${mood} overflow-visible select-none ${className}`}
      aria-hidden="true"
    >
      <ellipse className="dino-shadow" cx="100" cy="190" rx="50" ry="7" fill="#000" opacity="0.08" />
      <g className="dino-body">
        <path d="M146 156 q44 2 50 -34 q-16 28 -50 20 Z" fill={GREEN} />
        <path d="M68 64 l9 -17 l9 17 Z M90 56 l10 -19 l10 19 Z M114 62 l9 -16 l8 17 Z" fill={SUN} />
        <ellipse cx="100" cy="122" rx="54" ry="66" fill={GREEN} />
        <ellipse cx="100" cy="146" rx="33" ry="38" fill={BELLY} />
        <circle cx="62" cy="120" r="8" fill={CHEEK} opacity="0.45" />
        <circle cx="138" cy="120" r="8" fill={CHEEK} opacity="0.45" />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        <Arms mood={mood} />
        <rect x="70" y="178" width="22" height="13" rx="6" fill={GREEN_DARK} />
        <rect x="108" y="178" width="22" height="13" rx="6" fill={GREEN_DARK} />
      </g>
      <Extras mood={mood} />
    </svg>
  )
}
