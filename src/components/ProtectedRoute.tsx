'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [userStatus, setUserStatus] = useState<'loading' | 'pending' | 'approved' | 'guest' | 'unauth'>('loading')

  useEffect(() => {
    if (loading) return

    const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true'
    const guestOnboardingComplete = typeof window !== 'undefined' && localStorage.getItem('guestOnboardingComplete') === 'true'

    if (isGuest) {
      setUserStatus('guest')
      if (!guestOnboardingComplete && pathname !== '/onboarding') {
        router.replace('/onboarding')
      }
      return
    }

    if (!user) {
      setUserStatus('unauth')
      const isAuthRoute = pathname.startsWith('/auth')
      const isLandingRoute = pathname === '/landing'
      if (!isAuthRoute && !isLandingRoute) {
        router.replace('/landing')
      }
      return
    }

    // Authenticated user — check approval status in Firestore
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      const data = snap.data()
      if (data?.pendingApproval) {
        setUserStatus('pending')
        if (pathname !== '/auth/pending') {
          router.replace('/auth/pending')
        }
      } else {
        setUserStatus('approved')
        // Approved user visiting auth pages → send to app
        if (pathname.startsWith('/auth')) {
          router.replace('/')
        }
      }
    }).catch(() => {
      // If Firestore fails, assume approved to not block the user
      setUserStatus('approved')
    })
  }, [user, loading, router, pathname])

  if (loading || userStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-6xl animate-bounce-custom">🦉</div>
      </div>
    )
  }

  return <>{children}</>
}
