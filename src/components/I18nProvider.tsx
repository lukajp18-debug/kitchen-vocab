'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { en } from '@/lib/i18n/en'
import { es } from '@/lib/i18n/es'

type Lang = 'en' | 'es'
type Translations = typeof en

interface I18nContextType {
  lang: Lang
  t: Translations
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: en,
  toggleLang: () => {},
})

export const useI18n = () => useContext(I18nContext)

const dictionaries: Record<Lang, Translations> = { en, es }

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved && dictionaries[saved]) {
      setLang(saved)
    }
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'en' ? 'es' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  return (
    <I18nContext.Provider value={{ lang, t: dictionaries[lang], toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}
