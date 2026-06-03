'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { markOnboardingComplete } from '@/lib/rewards-storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'

export default function OnboardingPage() {
  const [isGuest, setIsGuest] = useState(false)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const user = auth.currentUser
  const { t } = useI18n()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsGuest(localStorage.getItem('guestMode') === 'true')
      setReady(true)
    }
  }, [])

  const handleStart = async () => {
    setSaving(true)
    try {
      if (isGuest) {
        localStorage.setItem('guestOnboardingComplete', 'true')
        router.replace('/')
      } else if (user) {
        await markOnboardingComplete(user.uid)
        router.replace('/')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Fallback: Proceed to home page so user is not stuck on the loading page
      router.replace('/')
    }
  }

  if (!ready) return null
  if (!user && !isGuest) return null

  if (saving) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
        <div className="text-6xl animate-bounce-custom mb-6">🚀</div>
        <h2 className="text-2xl font-bold text-gray-800 animate-pulse">{t.savingAdventure}</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-lg overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-6">🦉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{t.welcomeTitle}</h1>
            <p className="text-gray-600 mb-6 text-lg">{t.welcomeDesc}</p>
            <Button
              onClick={handleStart}
              className="w-full duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg py-6 rounded-2xl"
            >
              {t.welcomeStartBtn}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
