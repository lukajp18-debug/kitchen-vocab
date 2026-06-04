'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  // Read ?mode=register from URL client-side (avoids Next.js static rendering issues)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'register') setIsLogin(false)
  }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Admin → skip all checks and go directly to admin panel
        if (user.email === 'santragoj@gmail.com') {
          router.push('/admin')
          return
        }

        // Read user status via server API (bypasses Firestore client rules)
        const res = await fetch(`/api/user-status?uid=${user.uid}`)
        const status = await res.json()

        if (!status.exists) {
          router.push('/onboarding')
          return
        }

        if (status.pendingApproval) {
          router.push('/auth/pending')
          return
        }

        if (!status.onboardingComplete) {
          router.push('/onboarding')
        } else {
          router.push('/')
        }

      } else {
        if (!studentName.trim()) {
          throw new Error(t.studentNameRequired)
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        const approvalToken = crypto.randomUUID()

        // Write via server-side API to bypass Firestore client rules
        const regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, studentName, email, approvalToken }),
        })
        if (!regRes.ok) {
          const err = await regRes.json()
          throw new Error(err.error || 'Error creating account')
        }

        // Admin → go directly to admin panel, no pending screen
        if (email.toLowerCase() === 'santragoj@gmail.com') {
          router.push('/admin')
          return
        }

        // Notificar al admin (Telegram + email) con enlace de aprobación
        const appUrl = window.location.origin
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName, parentEmail: email, approvalToken, appUrl }),
        }).catch(err => console.error('Notify error:', err))

        router.push(`/auth/pending?token=${approvalToken}`)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 relative">
<div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce-custom">🦉</div>
        <h1 className="text-3xl font-bold text-gray-800">Study App</h1>
        <p className="text-gray-500 mt-2">{t.appTagline}</p>
      </div>

      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? t.welcomeBack : t.createAccount}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.studentName}</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 bg-gray-100 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none"
                  placeholder="e.g. Luka"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.parentEmail}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-100 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none"
                placeholder="parent@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 bg-gray-100 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full duo-button bg-duo-green hover:bg-duo-green-dark text-white font-bold text-lg py-6 rounded-2xl mt-6"
            >
              {loading ? t.pleaseWait : isLogin ? t.login : t.signUp}
            </Button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold">{t.or}</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Button
            type="button"
            onClick={() => {
              localStorage.setItem('guestMode', 'true')
              router.push('/')
            }}
            variant="outline"
            className="w-full font-bold py-6 rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-base"
          >
            {t.guestModeBtn}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-duo-blue font-bold mt-1 hover:underline"
            >
              {isLogin ? t.registerCall : t.loginCall}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
