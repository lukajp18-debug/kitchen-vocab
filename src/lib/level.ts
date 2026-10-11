// Player level derived from total XP. Display only: nothing here is stored.
export const XP_PER_LEVEL = 150

export function levelInfo(xp: number) {
  const safe = Math.max(0, xp)
  const level = 1 + Math.floor(safe / XP_PER_LEVEL)
  const intoLevel = safe % XP_PER_LEVEL
  return {
    level,
    intoLevel,
    pct: (intoLevel / XP_PER_LEVEL) * 100,
    toNext: XP_PER_LEVEL - intoLevel,
  }
}
