import { computeResizeDimensions, buildRewardConfigs, RewardConfig } from './reward-utils'

// Re-export the pure helpers so existing import sites keep working.
export { computeResizeDimensions, buildRewardConfigs }
export type { RewardConfig }

// ============================================================
// Browser-only helpers
// ============================================================

/**
 * Read an image File, downscale it via canvas, and return a compressed JPEG
 * base64 data URL. Keeps payloads small enough to live inside a Firestore doc
 * (no Firebase Storage round-trip, which was hanging on Storage rules/CORS).
 */
export function fileToCompressedDataUrl(
  file: File,
  maxSize = 360,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not decode image'))
      img.onload = () => {
        const { width, height } = computeResizeDimensions(img.width, img.height, maxSize)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export async function markOnboardingComplete(uid: string) {
  const res = await fetch('/api/user-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, onboardingComplete: true }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to mark onboarding complete')
  }
}

/**
 * Saves the user's reward configuration for a specific topic.
 *
 * Writes go through the server API (Admin SDK) instead of the client Firestore
 * SDK: Firestore security rules deny direct client writes to user documents
 * (the same reason progress is saved via /api/progress), which surfaced as
 * "Missing or insufficient permissions".
 */
export async function saveUserRewardsConfig(
  uid: string,
  rewardsType: 'virtual' | 'real',
  rewards?: RewardConfig[]
) {
  if (!uid) throw new Error('Missing user id')
  const res = await fetch('/api/user-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid,
      rewardsType,
      customRewards: rewards || [],
      onboardingComplete: true,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to save rewards')
  }
}
