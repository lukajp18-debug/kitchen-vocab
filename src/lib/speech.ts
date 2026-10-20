// Spoken English for the lessons: say a word, spell it letter by letter, or read a sentence.
//
// The voice is a set of recordings (public/audio/en, made by scripts/build-audio.py with one
// English neural voice), so every phone and tablet says exactly the same thing and a letter
// is never read as another one. The browser's own voice (speechSynthesis) is only a fallback
// for a text that has no recording yet.
//
// Everything goes through one queue so a new request always cancels the previous one,
// including its pending timers. While a word is being spelled, `useSpeechView()` tells the UI
// which letter(s) are being said so `SpellStrip` can light them up in sync with the voice.
import { useSyncExternalStore } from 'react'
import { getAudioContext } from './sound'

export type SpeechView = {
  word: string | null // lower-case word being said/spelled, null for free text
  index: number // index of the first letter being spelled, -1 otherwise
  span: number // how many letters it covers ("double s" covers two)
  phase: 'idle' | 'word' | 'spelling'
}

const IDLE: SpeechView = { word: null, index: -1, span: 1, phase: 'idle' }
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

const norm = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ')

// ---------- recordings ----------
const BASE = '/audio/en/'
let files: Record<string, string> | null = null
let voiceLabel: string | null = null
let manifestLoad: Promise<void> | null = null
const buffers = new Map<string, Promise<AudioBuffer | null>>()

function loadManifest(): Promise<void> {
  if (!manifestLoad) {
    manifestLoad = fetch(`${BASE}manifest.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('manifest'))))
      .then((m: { voice: string; files: Record<string, string> }) => { files = m.files; voiceLabel = m.voice })
      .catch(() => { files = {} })
  }
  return manifestLoad
}

function loadBuffer(file: string): Promise<AudioBuffer | null> {
  let p = buffers.get(file)
  if (!p) {
    const ctx = getAudioContext()
    p = !ctx
      ? Promise.resolve(null)
      : fetch(BASE + file)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('audio'))))
          .then((data) => ctx.decodeAudioData(data))
          .catch(() => null)
    buffers.set(file, p)
  }
  return p
}

// Name of the recorded voice, for the /voice-test page.
export async function recordedVoiceName(): Promise<string | null> {
  await loadManifest()
  return voiceLabel
}

// Warms the cache so a spelled word has no gaps between letters.
function preloadLetters() {
  loadManifest().then(() => {
    Object.entries(files ?? {}).forEach(([key, file]) => { if (key.startsWith('letter:') || key === 'double') loadBuffer(file) })
  })
}

// Loads the recordings for some words before they are needed.
export function preloadWords(words: string[]) {
  loadManifest().then(() => words.forEach((w) => { const f = files?.[norm(w)]; if (f) loadBuffer(f) }))
}

// ---------- fallback voice ----------
// Only used when a text has no recording: the device's own English voice. Letter names are
// respelled the way most engines read them.
const LETTER_NAMES: Record<string, string> = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye',
  j: 'jay', k: 'kay', l: 'ell', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'are',
  s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee',
}

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

let voice: SpeechSynthesisVoice | null = null
function englishVoice(): SpeechSynthesisVoice | null {
  const s = synth()
  if (!s) return null
  if (voice) return voice
  const all = s.getVoices().filter((v) => /^en[-_]/i.test(v.lang))
  const us = all.filter((v) => /^en[-_]US$/i.test(v.lang))
  return (voice = us.find((v) => /Google US English|Samantha|Aria|Jenny/i.test(v.name)) ?? us[0] ?? all[0] ?? null)
}

// ---------- first tap ----------
// Browsers only let audio start after a tap. The first tap on the page unlocks the audio
// context (and Safari's speech) and starts loading the letters.
let primed = false
export function primeSpeech() {
  if (primed) return
  primed = true
  getAudioContext()
  preloadLetters()
  const s = synth()
  if (s) {
    try {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      s.speak(u)
    } catch { /* ignore */ }
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', primeSpeech, { once: true, capture: true })
}

// ---------- queue ----------
let runId = 0
let timers: ReturnType<typeof setTimeout>[] = []
let current: AudioBufferSourceNode | null = null

function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms))
}

// Cancels whatever is being said and everything still scheduled.
function begin(): number {
  runId += 1
  timers.forEach(clearTimeout)
  timers = []
  if (current) {
    try { current.onended = null; current.stop() } catch { /* already stopped */ }
    current = null
  }
  synth()?.cancel()
  return runId
}

export function stopSpeech() {
  begin()
  setView(IDLE)
}

// Plays one clip: the recording for `key` if there is one, otherwise `fallbackText` with the
// device voice. `done` runs when it ends (never if it was cancelled meanwhile).
function clip(key: string, fallbackText: string, id: number, done: () => void) {
  let finished = false
  const finish = () => {
    if (finished || id !== runId) return
    finished = true
    done()
  }
  const speakFallback = () => {
    if (id !== runId) return
    later(finish, 1000 + fallbackText.length * 140) // some browsers never report the end
    const s = synth()
    if (!s) return
    later(() => {
      const u = new SpeechSynthesisUtterance(fallbackText)
      u.lang = 'en-US'
      const v = englishVoice()
      if (v) u.voice = v
      u.rate = 0.8
      u.onend = finish
      u.onerror = finish
      s.speak(u)
    }, 90) // Chrome can drop an utterance queued in the same tick as cancel()
  }

  loadManifest().then(() => {
    if (id !== runId) return
    const file = files?.[key]
    if (!file) return speakFallback()
    loadBuffer(file).then((buf) => {
      if (id !== runId) return
      const ctx = getAudioContext()
      if (!buf || !ctx) return speakFallback()
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.onended = finish
      current = src
      later(finish, buf.duration * 1000 + 1500) // safety net if `ended` never arrives
      src.start()
    })
  })
}

export type PlayMode =
  | 'word' // the word once
  | 'spell' // the word, then its letters
  | 'full' // the word, its letters, the word again (audio-only exercises)
  | 'letters' // only the letters

const LETTER_GAP_MS = 130
const WORD_GAP_MS = 380

type Step =
  | { kind: 'word' }
  | { kind: 'letter'; index: number; letter: string; double: boolean }

// Letters of a word as spoken: "ss" is "double s" (one step covering both tiles).
function letterSteps(lower: string): Step[] {
  const steps: Step[] = []
  let i = 0
  while (i < lower.length) {
    const ch = lower[i]
    if (!LETTER_NAMES[ch]) { i += 1; continue }
    let run = 1
    while (lower[i + run] === ch) run += 1
    if (run === 2) {
      steps.push({ kind: 'letter', index: i, letter: ch, double: true })
      i += 2
    } else {
      steps.push({ kind: 'letter', index: i, letter: ch, double: false })
      i += 1
    }
  }
  return steps
}

// Plays a word as described by `mode`. `onDone` runs when it finishes without being cancelled.
export function playWord(word: string, mode: PlayMode = 'spell', onDone?: () => void) {
  const lower = word.toLowerCase()
  const id = begin()
  const steps: Step[] = []
  if (mode !== 'letters') steps.push({ kind: 'word' })
  if (mode !== 'word') steps.push(...letterSteps(lower))
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
      setView({ word: lower, index: -1, span: 1, phase: 'word' })
      clip(norm(word), word, id, after(WORD_GAP_MS))
    } else if (step.double) {
      setView({ word: lower, index: step.index, span: 2, phase: 'spelling' })
      clip('double', 'double', id, () => clip(`letter:${step.letter}`, LETTER_NAMES[step.letter], id, after(LETTER_GAP_MS)))
    } else {
      setView({ word: lower, index: step.index, span: 1, phase: 'spelling' })
      clip(`letter:${step.letter}`, LETTER_NAMES[step.letter], id, after(LETTER_GAP_MS))
    }
  }
  next(0)
}

// Reads free text (a question, a sentence) once.
export function speakText(text: string, onDone?: () => void) {
  const id = begin()
  setView({ word: null, index: -1, span: 1, phase: 'word' })
  clip(norm(text), text, id, () => {
    setView(IDLE)
    onDone?.()
  })
}
