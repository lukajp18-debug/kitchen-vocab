'use client'

// Quick check of how the device pronounces the lesson audio: the alphabet (as the lessons
// say each letter), the newest week's words spelled out, and a question read aloud.
// Open /voice-test on the phone or tablet Luca uses.
import { useEffect, useState } from 'react'
import { SpellStrip } from '@/components/kid/SpellStrip'
import { recordedVoiceName, playWord, speakText, stopSpeech } from '@/lib/speech'

const WORDS = ['burrow', 'liter', 'lungs', 'sentence', 'den', 'street', 'strong', 'gills', 'hard', 'dinner', 'oxygen', 't shirt', 'tick', 'cross', 'hive']
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export default function VoiceTestPage() {
  const [voice, setVoice] = useState<string | null>(null)
  const [shown, setShown] = useState<string>('burrow')

  useEffect(() => {
    recordedVoiceName().then(setVoice)
    return () => { stopSpeech() }
  }, [])

  const btn = 'px-3 py-2 rounded-xl border-2 border-line bg-surface text-ink font-bold text-sm active:scale-95'

  return (
    <main className="min-h-screen bg-app text-ink px-4 pt-6 pb-28">
      <div className="mx-auto max-w-lg space-y-6">
        <header>
          <h1 className="text-2xl font-black">Prueba de voz</h1>
          <p className="text-sm text-ink-soft">
            Voz grabada (la misma en todos los dispositivos): <b>{voice ?? 'cargando…'}</b>
          </p>
        </header>

        <section>
          <h2 className="font-black mb-2">Abecedario (con la voz grabada)</h2>
          <div className="grid grid-cols-6 gap-2">
            {ALPHABET.map((l) => (
              <button key={l} className={btn} onClick={() => playWord(l, 'letters')}>{l.toUpperCase()}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-black mb-2">Palabras de la Semana 7 (palabra, letras, palabra; las letras dobles dicen "double")</h2>
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
