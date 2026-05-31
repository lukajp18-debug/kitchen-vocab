'use client'

import { useState } from 'react'
import { useI18n } from './I18nProvider'

export function HelpButton() {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        title={t.helpBtn}
        aria-label={t.helpBtn}
      >
        <span className="text-xl animate-bounce-subtle">💡</span>
      </button>

      {/* Instructions Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top header styling */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white relative">
              <h2 className="text-2xl font-black tracking-tight">{t.instructionsTitle}</h2>
              <p className="text-indigo-100 text-sm font-medium mt-1">{t.instructionsDesc}</p>
              
              {/* Close icon on top-right of modal */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:scale-110 transition-all text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
                className="px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold hover:bg-indigo-100 transition-all text-xs text-center cursor-pointer hover:scale-105 active:scale-95"
              >
                {t.installPwaHelpBtn}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-xs text-center cursor-pointer"
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
