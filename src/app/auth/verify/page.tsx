'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { sendEmailVerification, signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'

export default function VerifyEmailPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const user = auth.currentUser
  const { t } = useI18n()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const checkVerification = setInterval(async () => {
      await user.reload()
      if (user.emailVerified) {
        clearInterval(checkVerification)
        router.push('/onboarding')
      }
    }, 3000)

    return () => clearInterval(checkVerification)
  }, [user, router])

  const handleResend = async () => {
    if (!user) return
    setLoading(true)
    setMessage('')
    try {
      await sendEmailVerification(user)
      setMessage('Verification email sent! Check your inbox.')
    } catch (error: any) {
      setMessage(error.message || 'Error sending email. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/auth')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-float">✉️</div>
        <h1 className="text-3xl font-bold text-gray-800">{t.checkEmailTitle}</h1>
      </div>

      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">{t.sentLinkTo}</h2>
          <p className="text-duo-blue font-bold text-lg mb-6">{user.email}</p>
          
          <p className="text-gray-600 mb-6">
            {t.checkEmailDesc}
          </p>

          <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 font-bold p-4 rounded-xl text-sm mb-8 text-left shadow-sm">
            {t.checkSpamWarning}
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm font-medium mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              disabled={loading}
              className="w-full duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold py-6 rounded-2xl"
            >
              {loading ? t.pleaseWait : t.resendEmail}
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full font-bold py-6 rounded-2xl text-gray-500 hover:text-gray-700"
            >
              {t.signOutDifferentEmail}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
