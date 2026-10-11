'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Dino } from '@/components/kid/Dino'
import { TopicsSkeleton } from '@/components/kid/Skeletons'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const PUBLIC_PATHS = ['/landing', '/auth', '/auth/pending', '/auth/verify']
const ADMIN_EMAIL  = 'santragoj@gmail.com'

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

      // Admin → always send to /admin
      if (user.email === ADMIN_EMAIL && !pathname.startsWith('/admin')) {
        router.replace('/admin')
        return
      }

      // Approved user — only redirect away from landing, not from /auth
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
    if (pathname === '/') return <TopicsSkeleton />
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <Dino size={120} mood="idle" />
      </div>
    )
  }

  return <>{children}</>
}
