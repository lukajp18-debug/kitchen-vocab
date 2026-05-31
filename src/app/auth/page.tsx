'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/I18nProvider'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLangHint, setShowLangHint] = useState(true)
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
        
        if (!user.emailVerified) {
          router.push('/auth/verify')
          return
        }
        
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists() || !userDoc.data().onboardingComplete) {
           router.push('/onboarding')
        } else {
           router.push('/')
        }
        
      } else {
        if (!studentName.trim()) {
          throw new Error("Please enter the student's name")
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        
        await setDoc(doc(db, 'users', user.uid), {
          studentName,
          email,
          createdAt: new Date().toISOString(),
          onboardingComplete: false
        })

        await sendEmailVerification(user)

        // Enviar notificación a Telegram en segundo plano (no bloqueante)
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName, parentEmail: email })
        }).catch(err => console.error('Telegram API error:', err))
        
        router.push('/auth/verify')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 relative">
      {/* Eye-catching language toggle hint callout */}
      {showLangHint && (
        <div className="fixed top-20 right-4 z-40 max-w-[260px] p-4 bg-gradient-to-br from-amber-400 to-yellow-300 border-2 border-amber-500 rounded-2xl shadow-xl animate-bounce-subtle text-amber-950">
          <div className="absolute -top-3.5 right-12 text-amber-500 font-bold text-sm">▲</div>
          <button 
            onClick={() => setShowLangHint(false)}
            className="absolute top-1.5 right-1.5 font-bold text-amber-900 hover:text-amber-950 text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full bg-white/50"
          >
            ✕
          </button>
          <p className="font-extrabold text-xs pr-3">✨ {t.langHintTitle}</p>
          <p className="text-[10px] font-semibold mt-1 opacity-95 leading-tight">{t.langHintDesc}</p>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce-custom">🦉</div>
        <h1 className="text-3xl font-bold text-gray-800">Kitchen Vocab</h1>
        <p className="text-gray-500 mt-2">Learn kitchen words and earn rewards!</p>
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
                  className="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none"
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
                className="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none"
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
                  className="w-full p-3 pr-12 bg-gray-100 rounded-xl border-2 border-transparent focus:border-duo-blue focus:bg-white transition-colors outline-none"
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
