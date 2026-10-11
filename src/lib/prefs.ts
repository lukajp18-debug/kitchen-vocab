// Per-device preferences that are not part of the user's progress.

const SOUND_KEY = 'soundOn'

export function getSoundOn(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(SOUND_KEY) !== 'false'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'true' : 'false')
  } catch {}
  window.dispatchEvent(new Event('sound-pref-change'))
}
