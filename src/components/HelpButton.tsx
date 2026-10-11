'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useI18n } from './I18nProvider'
import { getSoundOn, setSoundOn } from '@/lib/prefs'

// Two-option segmented control used for language, theme and sound.
function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`min-h-12 px-3 rounded-xl text-sm font-extrabold transition-all duration-150 cursor-pointer ${
            value === o.value ? 'bg-brand text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Floating settings button (language, theme, sound) that also holds the app instructions.
export function HelpButton() {
  const { t, lang, toggleLang } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [sound, setSound] = useState(true)

  useEffect(() => { setSound(getSoundOn()) }, [isOpen])

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-brand text-white shadow-xl hover:shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        title={t.settingsBtn}
        aria-label={t.settingsBtn}
      >
        <span className="text-2xl">⚙️</span>
      </button>

      {/* Instructions Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-line overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top header styling */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white relative">
              <h2 className="text-2xl font-black tracking-tight">⚙️ {t.settingsTitle}</h2>
              
              {/* Close icon on top-right of modal */}
              <button 
                onClick={() => setIsOpen(false)}
                aria-label={t.close}
                className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Settings */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">🌎 {t.settingsLanguage}</p>
                  <Segmented value={lang} onChange={(v) => { if (v !== lang) toggleLang() }} options={[{ value: 'es', label: '🇪🇸 Español' }, { value: 'en', label: '🇺🇸 English' }]} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">🎨 {t.settingsTheme}</p>
                  <Segmented value={resolvedTheme === 'dark' ? 'dark' : 'light'} onChange={setTheme} options={[{ value: 'light', label: `☀️ ${t.themeLight}` }, { value: 'dark', label: `🌙 ${t.themeDark}` }]} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">🔊 {t.settingsSound}</p>
                  <Segmented value={sound ? 'on' : 'off'} onChange={(v) => { setSound(v === 'on'); setSoundOn(v === 'on') }} options={[{ value: 'on', label: `🔊 ${t.soundOn}` }, { value: 'off', label: `🔇 ${t.soundOff}` }]} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-lg font-black text-slate-800">💡 {t.howToUseTitle}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{t.instructionsDesc}</p>
              </div>

              {/* Step 1 */}
              <div className="flex gap-4 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-indigo-900">{t.step1Title}</h3>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{t.step1Desc}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-900">{t.step2Title}</h3>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{t.step2Desc}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-3 rounded-2xl bg-purple-50/50 border border-purple-100/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                  3
                </div>
                <div>
                  <h3 className="font-extrabold text-purple-900">{t.step3Title}</h3>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{t.step3Desc}</p>
                </div>
              </div>

              {/* Parent Zone */}
              <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800">{t.parentZoneTitle}</h3>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{t.parentZoneDesc}</p>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={() => {
                  setIsOpen(false)
                  window.dispatchEvent(new Event('open-pwa-prompt'))
                }}
                className="px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold hover:bg-indigo-100 transition-all text-sm text-center cursor-pointer hover:scale-105 active:scale-95 min-h-12"
              >
                {t.installPwaHelpBtn}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 min-h-12 rounded-full bg-brand text-white font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-all text-sm text-center cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
