'use client'

import { useI18n } from '@/components/I18nProvider'

// "📨 Enviado 3 oct 2026": when the teacher sent this material. Renders nothing if unknown.
export function SentDateChip({ date, className = '' }: { date?: string; className?: string }) {
  const { t, lang } = useI18n()
  if (!date) return null
  // Parse as UTC and format as UTC so the day never shifts with the device time zone.
  const text = new Date(`${date}T00:00:00Z`).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
  return (
    <span className={`font-bold rounded-full bg-sky-100 text-sky-700 ${className}`}>
      📨 {t.study.sentOn(text)}
    </span>
  )
}
