'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Allow testing in guest mode
    const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true'
    const guestOnboardingComplete = typeof window !== 'undefined' && localStorage.getItem('guestOnboardingComplete') === 'true'

    if (isGuest) {
      if (!guestOnboardingComplete && pathname !== '/onboarding') {
        router.replace('/onboarding')
      }
      return
    }

    const isAuthRoute = pathname.startsWith('/auth')
    const isLandingRoute = pathname === '/landing'

    // Public routes: /landing and /auth/*
    if (isLandingRoute) return

    if (!user && !isAuthRoute) {
      router.replace('/landing')
    } else if (user && isAuthRoute) {
      // If user is logged in but email is not verified, they should stay on /auth/verify or be sent there
      if (!user.emailVerified && pathname !== '/auth/verify') {
        router.replace('/auth/verify')
      } else if (user.emailVerified) {
        router.replace('/')
      }
    } else if (user && !user.emailVerified && pathname !== '/auth/verify') {
        router.replace('/auth/verify')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-6xl animate-bounce-custom">🦉</div>
      </div>
    )
  }

  // Prevent flash of protected content while redirecting
  const isGuest = typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true'
  const isAuthRoute = pathname.startsWith('/auth')
  const isLandingRoute = pathname === '/landing'
  if (!isLandingRoute && !isGuest && !user && !isAuthRoute) return null
  if (!isGuest && user && !user.emailVerified && !isAuthRoute) return null

  return <>{children}</>
}
