import { useCallback, useEffect, useRef } from 'react'

// setTimeout that is cancelled when the view unmounts (e.g. the student taps ✕ while an
// answer is being celebrated), so a late timer can never finish or fail a lesson that is
// no longer on screen. Same signature as setTimeout, minus the handle.
export function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])
  return useCallback((fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }, [])
}
