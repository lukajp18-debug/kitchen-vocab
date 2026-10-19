// Spoken English for the lessons: say a word, spell it letter by letter, or read a sentence.
//
// Everything goes through one queue so a new request always cancels the previous one,
// including its pending timers. (The old per-view code left letter timers running, so
// leaving a lesson mid-spelling kept reading letters on the next screen.)
//
// While a word is being spelled, `useSpeechView()` tells the UI which letter is being
// said so `SpellStrip` can light it up in sync with the voice.
import { useSyncExternalStore } from 'react'

export type SpeechView = {
  word: string | null // lower-case word being said/spelled, null for free text
  index: number // index of the letter being spelled, -1 otherwise
  phase: 'idle' | 'word' | 'spelling'
}

const IDLE: SpeechView = { word: null, index: -1, phase: 'idle' }
let view: SpeechView = IDLE
const listeners = new Set<() => void>()

function setView(next: SpeechView) {
  view = next
  listeners.forEach((l) => l())
}

export function useSpeechView(): SpeechView {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => view,
    () => IDLE,
  )
}

// ---------- voices ----------
// Letter names written the way a text-to-speech voice reads them correctly. A bare "a" or
// "i" is read as a word or a sound, "R" as "ar" and so on, so each letter gets a spelling
// of its name.
const LETTER_NAMES: Record<string, string> = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye',
  j: 'jay', k: 'kay', l: 'ell', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'are',
  s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee',
}

const VOICE_PREFERENCE = [/Google US English/i, /Samantha|Ava|Allison|Susan/i, /Aria|Jenny|Ana\b|Natural/i, /Zira|Hazel|Female/i]
let voice: SpeechSynthesisVoice | null = null

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth()
  if (!s) return null
  if (voice) return voice
  const all = s.getVoices()
  if (all.length === 0) return null
  const us = all.filter((v) => /^en[-_]US$/i.test(v.lang))
  const en = all.filter((v) => /^en[-_]/i.test(v.lang))
  for (const re of VOICE_PREFERENCE) {
    const hit = us.find((v) => re.test(v.name)) ?? en.find((v) => re.test(v.name))
    if (hit) return (voice = hit)
  }
  return (voice = us[0] ?? en[0] ?? null)
}

export function currentVoiceName(): string | null {
  return pickVoice()?.name ?? null
}

let hooked = false
function hookVoices() {
  const s = synth()
  if (!s || hooked) return
  hooked = true
  // Voices load asynchronously (Chrome, Android): choose again once they arrive.
  s.addEventListener?.('voiceschanged', () => { voice = null })
}

// iOS/Safari only start speaking after a tap. The first tap on the page "unlocks" it
// with a silent utterance so lessons that start speaking on their own can do it.
let primed = false
export function primeSpeech() {
  const s = synth()
  if (!s || primed) return
  primed = true
  hookVoices()
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    s.speak(u)
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', primeSpeech, { once: true, capture: true })
}

// ---------- queue ----------
let runId = 0
let timers: ReturnType<typeof setTimeout>[] = []

function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms))
}

// Cancels whatever is being said and everything still scheduled.
function begin(): { id: number; hadSpeech: boolean } {
  runId += 1
  timers.forEach(clearTimeout)
  timers = []
  const s = synth()
  const hadSpeech = !!s && (s.speaking || s.pending)
  if (s) s.cancel()
  return { id: runId, hadSpeech }
}

export function stopSpeech() {
  begin()
  setView(IDLE)
}

// Says one utterance and calls `done` when it ends. Some browsers never fire `onend`
// (no voice installed, autoplay blocked), so a timer moves the sequence along anyway.
function say(text: string, id: number, opts: { rate: number; pitch: number; fallbackMs: number }, done: () => void) {
  const s = synth()
  let finished = false
  const finish = () => {
    if (finished || id !== runId) return
    finished = true
    done()
  }
  later(finish, opts.fallbackMs)
  if (!s) return
  hookVoices()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  const v = pickVoice()
  if (v) u.voice = v
  u.rate = opts.rate
  u.pitch = opts.pitch
  u.onend = finish
  u.onerror = finish
  s.speak(u)
}

export type PlayMode =
  | 'word' // the word once
  | 'spell' // the word, then its letters
  | 'full' // the word, its letters, the word again (audio-only exercises)
  | 'letters' // only the letters

const LETTER_GAP_MS = 200
const WORD_GAP_MS = 420

// Plays a word as described by `mode`. `onDone` runs when it finishes without being cancelled.
export function playWord(word: string, mode: PlayMode = 'spell', onDone?: () => void) {
  const lower = word.toLowerCase()
  const { id, hadSpeech } = begin()
  const steps: Array<{ kind: 'word' } | { kind: 'letter'; index: number }> = []
  if (mode !== 'letters') steps.push({ kind: 'word' })
  if (mode !== 'word') {
    for (let i = 0; i < lower.length; i++) if (LETTER_NAMES[lower[i]]) steps.push({ kind: 'letter', index: i })
  }
  if (mode === 'full') steps.push({ kind: 'word' })

  const next = (n: number) => {
    if (id !== runId) return
    if (n >= steps.length) {
      setView(IDLE)
      onDone?.()
      return
    }
    const step = steps[n]
    const after = (gap: number) => () => later(() => next(n + 1), gap)
    if (step.kind === 'word') {
      setView({ word: lower, index: -1, phase: 'word' })
      say(word, id, { rate: 0.8, pitch: 1.05, fallbackMs: 900 + word.length * 140 }, after(WORD_GAP_MS))
    } else {
      setView({ word: lower, index: step.index, phase: 'spelling' })
      say(LETTER_NAMES[lower[step.index]], id, { rate: 0.85, pitch: 1, fallbackMs: 1000 }, after(LETTER_GAP_MS))
    }
  }
  // Chrome can drop an utterance queued in the same tick as cancel().
  if (hadSpeech) later(() => next(0), 90)
  else next(0)
}

// Reads free text (a question, a sentence) once.
export function speakText(text: string, onDone?: () => void) {
  const { id, hadSpeech } = begin()
  const go = () => {
    setView({ word: null, index: -1, phase: 'word' })
    say(text, id, { rate: 0.85, pitch: 1.05, fallbackMs: 1200 + text.length * 120 }, () => {
      setView(IDLE)
      onDone?.()
    })
  }
  if (hadSpeech) later(go, 90)
  else go()
}
