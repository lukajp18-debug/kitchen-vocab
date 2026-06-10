// Pure reward helpers — no browser or Firebase APIs, fully unit-testable.

export interface RewardConfig {
  id: string
  name: string
  imageUrl: string // base64 data URL (no Firebase Storage dependency)
  lessonsRequired: number
}

/**
 * Scale (width, height) down so the longest side is at most `maxSize`,
 * preserving aspect ratio. Returns integer dimensions. Never upscales.
 */
export function computeResizeDimensions(
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 }
  const longest = Math.max(width, height)
  if (longest <= maxSize) return { width: Math.round(width), height: Math.round(height) }
  const scale = maxSize / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/**
 * Build the reward config array from prize name/image pairs. Distributes the
 * unlock thresholds evenly across `totalLessons` (e.g. 3 prizes over 6 lessons
 * unlock at 2, 4, 6). Always requires at least 1 lesson.
 */
export function buildRewardConfigs(
  prizes: Array<{ name: string; imageUrl: string }>,
  totalLessons = 6
): RewardConfig[] {
  const n = prizes.length
  return prizes.map((p, i) => ({
    id: `real_${i}`,
    name: p.name.trim(),
    imageUrl: p.imageUrl,
    lessonsRequired: Math.max(1, Math.ceil(((i + 1) / n) * totalLessons)),
  }))
}
