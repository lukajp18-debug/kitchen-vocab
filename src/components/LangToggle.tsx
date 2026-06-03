'use client'

import { useI18n } from './I18nProvider'
import { usePathname } from 'next/navigation'

export function LangToggle() {
  const { lang, toggleLang } = useI18n()
  const pathname = usePathname()

  // Hide only on landing — it has its own inline toggle
  if (pathname === '/landing') return null

  return (
    <div
      onClick={toggleLang}
      className="fixed z-[9999] flex items-center p-1 bg-white shadow-xl border-2 border-indigo-400/30 rounded-full select-none cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
      style={{ top: '12px', right: '12px' }}
      title="Click to change language / Click para cambiar idioma"
    >
      <div className="relative flex items-center gap-0.5">
        {/* Sliding Pill */}
        <div
          className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg transition-all duration-300 ease-out"
          style={{
            left: lang === 'en' ? '0px' : '74px',
            width: '74px',
            height: '100%',
          }}
        />

        {/* English option */}
        <div className={`relative z-10 flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide transition-colors duration-300 w-[74px] ${
          lang === 'en' ? 'text-white' : 'text-slate-600'
        }`}>
          <span className="text-xs">🇺🇸</span>
          <span>EN</span>
        </div>

        {/* Spanish option */}
        <div className={`relative z-10 flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide transition-colors duration-300 w-[74px] ${
          lang === 'es' ? 'text-white' : 'text-slate-600'
        }`}>
          <span className="text-xs">🇪🇸</span>
          <span>ES</span>
        </div>
      </div>
    </div>
  )
}
