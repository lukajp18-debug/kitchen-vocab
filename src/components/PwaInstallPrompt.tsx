'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useI18n } from './I18nProvider'

export function PwaInstallPrompt() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'select' | 'android' | 'iphone'>('select')

  // Don't show PWA prompt on landing or auth pages
  const isPublicRoute = pathname === '/landing' || pathname.startsWith('/auth')

  useEffect(() => {
    if (isPublicRoute) return
    // Check if the prompt has already been shown
    const shown = localStorage.getItem('pwaPromptShown')
    if (!shown) {
      setIsOpen(true)
    }

    const handleOpen = () => {
      setStep('select')
      setIsOpen(true)
    }
    window.addEventListener('open-pwa-prompt', handleOpen)
    return () => {
      window.removeEventListener('open-pwa-prompt', handleOpen)
    }
  }, [isPublicRoute])

  const handleClose = () => {
    localStorage.setItem('pwaPromptShown', 'true')
    setIsOpen(false)
  }

  if (isPublicRoute) return null
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-indigo-100 overflow-hidden animate-scale-up">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white text-center relative">
          <h2 className="text-2xl font-black tracking-tight">{t.pwaTitle}</h2>
          <p className="text-indigo-100 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
            {t.pwaDesc}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {step === 'select' && (
            <div className="space-y-6 text-center py-4">
              <h3 className="text-lg font-extrabold text-slate-800">{t.pwaQuestion}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                {/* Android Button */}
                <button
                  onClick={() => setStep('android')}
                  className="p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <span className="text-4xl group-hover:animate-bounce-subtle">🤖</span>
                  <span className="font-extrabold text-sm text-slate-700">{t.androidBtn}</span>
                </button>

                {/* iPhone Button */}
                <button
                  onClick={() => setStep('iphone')}
                  className="p-5 rounded-2xl border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-50/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:scale-105 active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <span className="text-4xl group-hover:animate-bounce-subtle">🍎</span>
                  <span className="font-extrabold text-sm text-slate-700">{t.iphoneBtn}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'android' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                <span>{t.androidTitle}</span>
              </h3>

              {/* Steps Checklist */}
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">1</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.androidStep1Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.androidStep1Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">2</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.androidStep2Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.androidStep2Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">3</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.androidStep3Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.androidStep3Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">4</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.androidStep4Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.androidStep4Desc}</p>
                  </div>
                </div>
              </div>

              {/* WebView Trap Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 mt-4 text-[11px]">
                <h4 className="font-black text-amber-900 flex items-center gap-1.5">
                  <span>{t.webviewTrapTitle}</span>
                </h4>
                <p className="text-amber-800 mt-1 leading-relaxed">{t.webviewTrapDesc}</p>
              </div>
            </div>
          )}

          {step === 'iphone' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-purple-900 flex items-center gap-2">
                <span>{t.iphoneTitle}</span>
              </h3>

              {/* Steps Checklist */}
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700 text-xs">1</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.iphoneStep1Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.iphoneStep1Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700 text-xs">2</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.iphoneStep2Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.iphoneStep2Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700 text-xs">3</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.iphoneStep3Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.iphoneStep3Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700 text-xs">4</div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.iphoneStep4Title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.iphoneStep4Desc}</p>
                  </div>
                </div>
              </div>

              {/* WebView Trap Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 mt-4 text-[11px]">
                <h4 className="font-black text-amber-900 flex items-center gap-1.5">
                  <span>{t.webviewTrapTitle}</span>
                </h4>
                <p className="text-amber-800 mt-1 leading-relaxed">{t.webviewTrapDesc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-4">
          {step !== 'select' ? (
            <button
              onClick={() => setStep('select')}
              className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
            >
              {t.back}
            </button>
          ) : (
            <div />
          )}

          {step !== 'select' ? (
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
            >
              {t.continueBtn}
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs transition-all active:scale-95 cursor-pointer mx-auto sm:mx-0"
            >
              {t.continueBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
