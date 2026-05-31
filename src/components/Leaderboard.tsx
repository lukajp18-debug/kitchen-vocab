'use client'

import { useEffect, useState, useMemo } from 'react'
import { useI18n } from './I18nProvider'

interface LeaderboardProps {
  studentName: string
  userXp: number
}

interface Competitor {
  name: string
  xp: number
  isUser: boolean
  avatar: string
}

// Pre-defined list of fun kitchen competitor names in Spanish and English
const COMPETITORS_POOL = [
  { es: '🧁 Súper Pastelero', en: '🧁 Super Baker', avatar: '🧁' },
  { es: '🍳 Mini Chef Veloz', en: '🍳 Speedy Mini Chef', avatar: '🍳' },
  { es: '🍪 Galletita Alegre', en: '🍪 Happy Cookie', avatar: '🍪' },
  { es: '🥗 Maestro de la Ensalada', en: '🥗 Salad Master', avatar: '🥗' },
  { es: '🍞 Amasador Experto', en: '🍞 Bread Maker', avatar: '🍞' },
  { es: '🍩 Donita Glaseada', en: '🍩 Glazed Donut', avatar: '🍩' },
  { es: '🍕 Maestro Pizzero', en: '🍕 Pizza Master', avatar: '🍕' },
  { es: '🥑 Aguacatito Súper', en: '🥑 Super Avocado', avatar: '🥑' },
  { es: '🧇 Rey del Waffle', en: '🧇 Waffle King', avatar: '🧇' },
]

export function Leaderboard({ studentName, userXp }: LeaderboardProps) {
  const { lang, t } = useI18n()
  const [competitors, setCompetitors] = useState<Competitor[]>([])

  useEffect(() => {
    // Unique key per student for persistent leaderboard bots
    const cacheKey = `kitchen-leaderboard-${studentName}`
    const cached = localStorage.getItem(cacheKey)

    let list: Competitor[] = []

    if (cached) {
      list = JSON.parse(cached)
    } else {
      // Initialize scores relative to the user's starting score (or 0)
      const baseUserXp = userXp || 0
      const initialBots = COMPETITORS_POOL.map((item, idx) => {
        // Distribute scores naturally around the user's score to make it competitive
        const multiplier = 9 - idx // 9, 8, 7...
        const botXp = baseUserXp + multiplier * 15 + Math.floor(Math.random() * 8)
        return {
          nameKey: idx, // Keep reference index to fetch translated name
          xp: botXp,
          isUser: false,
          avatar: item.avatar
        }
      })
      
      // Store raw structure in cache
      localStorage.setItem(cacheKey, JSON.stringify(initialBots))
      list = initialBots as any
    }

    // Adapt to Competitor list with translated names
    const processedList: Competitor[] = (list as any).map((bot: any) => {
      if (bot.isUser) return bot
      const poolItem = COMPETITORS_POOL[bot.nameKey] || COMPETITORS_POOL[0]
      return {
        name: lang === 'es' ? poolItem.es : poolItem.en,
        xp: bot.xp,
        isUser: false,
        avatar: bot.avatar
      }
    })

    // Add actual user
    processedList.push({
      name: `${studentName} (${lang === 'es' ? 'Tú' : 'You'}) 🌟`,
      xp: userXp,
      isUser: true,
      avatar: '🦉'
    })

    // Sort descending by XP
    processedList.sort((a, b) => b.xp - a.xp)

    setCompetitors(processedList)

    // Trigger dynamic simulation: update bots slightly if user xp changes
    // This creates the Duolingo dynamic simulation feel!
    const cacheKeyRaw = `kitchen-leaderboard-${studentName}`
    const rawCached = localStorage.getItem(cacheKeyRaw)
    if (rawCached) {
      const rawList = JSON.parse(rawCached)
      let updated = false
      const updatedList = rawList.map((bot: any) => {
        // If a bot is close to user score and we completed a lesson, let bots advance a little bit too
        if (Math.random() > 0.6) {
          bot.xp += Math.floor(Math.random() * 8) + 2
          updated = true
        }
        return bot
      })
      if (updated) {
        localStorage.setItem(cacheKeyRaw, JSON.stringify(updatedList))
      }
    }

  }, [studentName, userXp, lang])

  // Get user rank index
  const userRankIndex = competitors.findIndex(c => c.isUser)
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null

  return (
    <div className="w-full space-y-4">
      {/* Header Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-3xl animate-bounce-subtle">🏆</span>
        <div>
          <h4 className="font-extrabold text-sm text-indigo-900">
            {lang === 'es' ? '¡Liga de Cocina Activa!' : 'Active Kitchen League!'}
          </h4>
          <p className="text-[11px] text-indigo-700 mt-0.5 leading-tight">
            {lang === 'es' 
              ? 'Completa lecciones para ganar estrellas y subir de puesto. ¡Sana competencia!' 
              : 'Complete lessons to earn stars and climb the board. Healthy competition!'}
          </p>
        </div>
      </div>

      {/* Leaderboard Board Rows */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
        {competitors.slice(0, 10).map((competitor, index) => {
          const rank = index + 1
          let badge = `${rank}`
          if (rank === 1) badge = '🥇'
          else if (rank === 2) badge = '🥈'
          else if (rank === 3) badge = '🥉'

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3.5 transition-all duration-300 ${
                competitor.isUser 
                  ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-l-4 border-indigo-600 font-extrabold shadow-inner' 
                  : ''
              }`}
            >
              {/* Left Side: Rank + Avatar + Name */}
              <div className="flex items-center gap-3.5">
                <span className={`w-6 text-center text-sm font-black flex items-center justify-center ${
                  rank <= 3 ? 'text-lg' : 'text-slate-400'
                }`}>
                  {badge}
                </span>

                <span className="text-2xl w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-sm select-none">
                  {competitor.avatar}
                </span>

                <span className={`text-xs ${
                  competitor.isUser ? 'text-indigo-950 font-black' : 'text-slate-700 font-bold'
                }`}>
                  {competitor.name}
                </span>
              </div>

              {/* Right Side: Score */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 shrink-0">
                <span className="text-xs">⭐</span>
                <span className={`text-xs font-black ${
                  competitor.isUser ? 'text-indigo-600' : 'text-slate-600'
                }`}>
                  {competitor.xp}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* User Rank Indicator Summary */}
      {userRank && (
        <div className="text-center text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-full py-1.5 max-w-xs mx-auto animate-pulse-subtle">
          {lang === 'es' 
            ? `🎉 ¡Estás en el Puesto #${userRank} de la Liga!` 
            : `🎉 You are currently Rank #${userRank} in the League!`}
        </div>
      )}
    </div>
  )
}
