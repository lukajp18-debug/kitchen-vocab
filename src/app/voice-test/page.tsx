'use client'

// Quick check of how the device pronounces the lesson audio: the alphabet (as the lessons
// say each letter), the Week 6 words spelled out, and a question read aloud.
// Open /voice-test on the phone or tablet Luca uses.
import { useEffect, useState } from 'react'
import { SpellStrip } from '@/components/kid/SpellStrip'
import { currentVoiceName, playWord, speakText, stopSpeech } from '@/lib/speech'

const WORDS = ['start', 'finish', 'friend', 'friendship', 'think', 'together', 'rules', 'class', 'guess', 'heavy', 'technology', 'after', 'before', 'neighborhood', 'neighbor']
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export default function VoiceTestPage() {
  const [voice, setVoice] = useState<string | null>(null)
  const [shown, setShown] = useState<string>('start')

  useEffect(() => {
    const update = () => setVoice(currentVoiceName())
    update()
    window.speechSynthesis?.addEventListener?.('voiceschanged', update)
    return () => { window.speechSynthesis?.removeEventListener?.('voiceschanged', update); stopSpeech() }
  }, [])

  const btn = 'px-3 py-2 rounded-xl border-2 border-line bg-surface text-ink font-bold text-sm active:scale-95'

  return (
    <main className="min-h-screen bg-app text-ink px-4 pt-6 pb-28">
      <div className="mx-auto max-w-lg space-y-6">
        <header>
          <h1 className="text-2xl font-black">Prueba de voz</h1>
          <p className="text-sm text-ink-soft">
            Voz del dispositivo: <b>{voice ?? 'no se encontró una voz en inglés (se usará la predeterminada)'}</b>
          </p>
        </header>

        <section>
          <h2 className="font-black mb-2">Abecedario (así dice las letras la app)</h2>
          <div className="grid grid-cols-6 gap-2">
            {ALPHABET.map((l) => (
              <button key={l} className={btn} onClick={() => playWord(l, 'letters')}>{l.toUpperCase()}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-black mb-2">Palabras de la Semana 6 (palabra, letras, palabra)</h2>
          <SpellStrip word={shown} size="lg" className="mb-3" />
          <div className="flex flex-wrap gap-2">
            {WORDS.map((w) => (
              <button key={w} className={btn} onClick={() => { setShown(w); playWord(w, 'full') }}>{w}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-black mb-2">Frase</h2>
          <button className={btn} onClick={() => speakText('What colour are your eyes?')}>What colour are your eyes?</button>
        </section>

        <button className={btn} onClick={stopSpeech}>⏹ Parar</button>
      </div>
    </main>
  )
}
