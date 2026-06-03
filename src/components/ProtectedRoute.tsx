'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const PUBLIC_PATHS = ['/landing', '/auth', '/auth/pending', '/auth/verify']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return

    const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true'
    const guestOnboardingDone = typeof window !== 'undefined' && localStorage.getItem('guestOnboardingComplete') === 'true'
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

    // ── Guest ────────────────────────────────────────────────────────────────
    if (isGuest) {
      if (!guestOnboardingDone && pathname !== '/onboarding') {
        router.replace('/onboarding')
      } else {
        setReady(true)
      }
      return
    }

    // ── Not logged in ────────────────────────────────────────────────────────
    if (!user) {
      if (!isPublic && pathname !== '/onboarding') {
        router.replace('/landing')
      } else {
        setReady(true)
      }
      return
    }

    // ── Logged in → check Firestore ──────────────────────────────────────────
    getDoc(doc(db, 'users', user.uid)).then(async (snap) => {
      if (!snap.exists()) {
        // Session exists but no Firestore doc (deleted user) → sign out cleanly
        await signOut(auth)
        router.replace('/auth')
        return
      }

      const data = snap.data()

      if (data?.pendingApproval) {
        if (pathname !== '/auth/pending') router.replace('/auth/pending')
        setReady(true)
        return
      }

      // Approved user — only redirect away from landing, not from /auth
      // (auth page handles its own redirects after login)
      if (pathname === '/landing') {
        router.replace('/')
        return
      }

      setReady(true)
    }).catch(() => {
      // Firestore unavailable — allow access to avoid blocking the user
      setReady(true)
    })
  }, [user, loading, pathname, router])

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-6xl animate-bounce-custom">🦉</div>
      </div>
    )
  }

  return <>{children}</>
}
