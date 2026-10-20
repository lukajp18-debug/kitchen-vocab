// Tiny sound effects synthesized with Web Audio (no audio files), plus haptics.
// Everything respects the "Sounds" switch in Settings.
import { getSoundOn } from './prefs'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Shared with the lesson voice (src/lib/speech.ts) so the whole app uses one AudioContext.
export const getAudioContext = audio

// One soft bell-like note: sine + quiet octave, quick attack, smooth decay.
function note(ac: AudioContext, freq: number, start: number, duration: number, volume: number) {
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  gain.connect(ac.destination)
  for (const [mult, type, level] of [[1, 'sine', 1], [2, 'triangle', 0.25]] as const) {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq * mult, start)
    g.gain.value = level
    osc.connect(g).connect(gain)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  }
}

function play(notes: [freq: number, offset: number, duration: number][], volume = 0.18) {
  if (!getSoundOn()) return
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + 0.01
  for (const [f, off, dur] of notes) note(ac, f, t0 + off, dur, volume)
}

function vibrate(pattern: number | number[]) {
  if (!getSoundOn()) return
  // Browsers block vibration until the user has tapped the page at least once.
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  if (activation && !activation.hasBeenActive) return
  try {
    navigator.vibrate?.(pattern)
  } catch {}
}

// Rising major arpeggio (C6 E6 G6).
export function playCorrect() {
  play([[1046.5, 0, 0.25], [1318.5, 0.08, 0.25], [1568, 0.16, 0.4]])
  vibrate(15)
}

// Gentle two-note "hmm" (A4 -> F4), quiet and low: a nudge, not a buzzer.
export function playWrong() {
  play([[440, 0, 0.22], [349.2, 0.14, 0.32]], 0.12)
  vibrate([30, 40, 30])
}

// Short fanfare for finishing a lesson (C E G C').
export function playComplete() {
  play([[523.3, 0, 0.2], [659.3, 0.12, 0.2], [784, 0.24, 0.2], [1046.5, 0.36, 0.6]], 0.2)
  vibrate([20, 60, 40])
}

// Sparkly run for rewards and level-ups.
export function playReward() {
  play([[784, 0, 0.18], [987.8, 0.07, 0.18], [1174.7, 0.14, 0.18], [1568, 0.21, 0.5], [2093, 0.3, 0.5]], 0.16)
  vibrate([20, 50, 20, 50, 40])
}
