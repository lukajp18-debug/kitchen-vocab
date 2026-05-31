'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/I18nProvider'
import { useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const { lang, toggleLang } = useI18n()
  const [hovered, setHovered] = useState<'register' | 'guest' | null>(null)

  const content = {
    en: {
      tagline: 'The fun way to build vocabulary!',
      subtitle: 'Interactive lessons, games, and rewards designed for kids. Learn new words every week.',
      feature1Title: '📚 Weekly Topics',
      feature1Desc: 'New vocabulary themes every week — kitchen, vacation, animals and more.',
      feature2Title: '🎮 Fun Mini-Games',
      feature2Desc: 'Flashcards, picture matching, spelling challenges and more to keep learning exciting.',
      feature3Title: '🏆 Real Rewards',
      feature3Desc: 'Parents set custom prizes. Kids earn them by completing lessons.',
      whyRegisterTitle: 'Why create an account?',
      whyRegister1: '✅ Progress is saved — pick up exactly where you left off.',
      whyRegister2: '✅ Works across devices — phone, tablet or computer.',
      whyRegister3: '✅ Parents control the rewards and track progress.',
      registerBtn: 'Create Free Account',
      loginBtn: 'Log in',
      guestBtn: 'Try without registering',
      langBtn: '🇪🇸 Español',
      appName: 'Vocab App',
    },
    es: {
      tagline: '¡La forma divertida de aprender vocabulario!',
      subtitle: 'Lecciones interactivas, juegos y premios diseñados para niños. Aprende palabras nuevas cada semana.',
      feature1Title: '📚 Temas Semanales',
      feature1Desc: 'Nuevos temas de vocabulario cada semana — cocina, vacaciones, animales y más.',
      feature2Title: '🎮 Mini-Juegos Divertidos',
      feature2Desc: 'Tarjetas, emparejar imágenes, deletrear palabras y más para que el aprendizaje sea emocionante.',
      feature3Title: '🏆 Premios Reales',
      feature3Desc: 'Los padres configuran premios personalizados. Los niños los ganan completando lecciones.',
      whyRegisterTitle: '¿Por qué crear una cuenta?',
      whyRegister1: '✅ El progreso se guarda — retoma exactamente donde lo dejaste.',
      whyRegister2: '✅ Funciona en cualquier dispositivo — celular, tablet o computadora.',
      whyRegister3: '✅ Los padres controlan los premios y siguen el progreso.',
      registerBtn: 'Crear Cuenta Gratis',
      loginBtn: 'Iniciar Sesión',
      guestBtn: 'Probar sin registrarse',
      langBtn: '🇺🇸 English',
      appName: 'Vocab App',
    },
  }

  const c = content[lang]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🦉</span>
          <span className="text-xl font-black tracking-tight text-white">{c.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-bold border border-white/20 backdrop-blur-sm"
          >
            {c.langBtn}
          </button>
          <button
            onClick={() => router.push('/auth')}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-bold border border-white/20 backdrop-blur-sm"
          >
            {c.loginBtn}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 py-10 flex-1">
        <div className="relative mb-6">
          <div className="text-8xl animate-bounce-custom">🦉</div>
          <div className="absolute -top-2 -right-4 text-3xl animate-float-star">⭐</div>
          <div className="absolute -bottom-2 -left-4 text-2xl animate-float-star" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        <h1 className="text-4xl font-black leading-tight max-w-lg mb-3 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
          {c.tagline}
        </h1>
        <p className="text-white/70 text-base max-w-sm leading-relaxed mb-10">
          {c.subtitle}
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-4 max-w-md w-full mb-10">
          {[
            { title: c.feature1Title, desc: c.feature1Desc },
            { title: c.feature2Title, desc: c.feature2Desc },
            { title: c.feature3Title, desc: c.feature3Desc },
          ].map((feat, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              <p className="font-bold text-base text-white mb-1">{feat.title}</p>
              <p className="text-white/60 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Register Box */}
        <div className="bg-white/5 border border-yellow-400/30 rounded-2xl px-6 py-5 max-w-md w-full mb-10 text-left backdrop-blur-sm">
          <p className="font-black text-yellow-300 text-base mb-3">{c.whyRegisterTitle}</p>
          <p className="text-white/80 text-sm mb-2">{c.whyRegister1}</p>
          <p className="text-white/80 text-sm mb-2">{c.whyRegister2}</p>
          <p className="text-white/80 text-sm">{c.whyRegister3}</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            id="landing-register-btn"
            onMouseEnter={() => setHovered('register')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => { localStorage.removeItem('guestMode'); router.push('/auth') }}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-200 shadow-2xl
              ${hovered === 'register'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 scale-105 shadow-yellow-400/30'
                : 'bg-gradient-to-r from-yellow-300 to-orange-400 text-gray-900'
              }`}
          >
            🚀 {c.registerBtn}
          </button>

          <button
            id="landing-guest-btn"
            onMouseEnter={() => setHovered('guest')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              localStorage.setItem('guestMode', 'true')
              router.push('/')
            }}
            className="w-full py-4 rounded-2xl font-bold text-base border-2 border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
          >
            {c.guestBtn}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-white/30 text-xs px-4">
        © 2025 Vocab App · Built for curious kids 🌍
      </div>
    </div>
  )
}
